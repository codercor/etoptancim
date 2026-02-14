'use server'

import { createClient } from '@/lib/supabase/server'
import type { SetupResponse } from '@/types/setup'

/**
 * Check if initial setup is required (no admin exists)
 */
export async function checkSetupRequired(): Promise<boolean> {
    try {
        // Use service role to read profiles (bypasses RLS and ensures fresh data)
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Check if any admin exists in profiles table
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('role', 'admin')
            .limit(1)

        if (error) {
            console.error('Error checking setup status:', error)
            return true // Assume setup required on error to ensure we don't lock out users. 
            // If the DB is down or table missing, we should probably try to show setup or valid error.
            // Returning false bypasses setup and sends them to login/dashboard which will likely fail too.
        }

        // Setup required if no admin found
        const setupRequired = !data || data.length === 0
        console.log('[Setup Check] Admin count:', data?.length || 0, '- Setup required:', setupRequired)
        return setupRequired
    } catch (error) {
        console.error('Failed to check setup status:', error)
        return false
    }
}

/**
 * Check if setup is complete (admin exists)
 */
export async function isSetupComplete(): Promise<boolean> {
    const setupRequired = await checkSetupRequired()
    return !setupRequired
}

/**
 * Initialize the first admin user
 */
export async function initializeAdmin(
    email: string,
    password: string,
    companyName?: string
): Promise<SetupResponse> {
    try {
        // Use service role client to bypass RLS for initial admin creation
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Double-check no admin exists (prevent race conditions)
        const setupRequired = await checkSetupRequired()
        if (!setupRequired) {
            return {
                success: false,
                error: 'Admin user already exists. Setup has already been completed.'
            }
        }

        // Validate inputs
        if (!email || !password) {
            return {
                success: false,
                error: 'Email and password are required'
            }
        }

        if (password.length < 8) {
            return {
                success: false,
                error: 'Password must be at least 8 characters'
            }
        }

        // Create user via Supabase Auth using admin client
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email for first admin
            user_metadata: {
                company_name: companyName || '',
            }
        })

        let userId = authData.user?.id

        if (authError) {
            console.error('Auth signup error full object:', JSON.stringify(authError, null, 2))

            // If user already exists, we might be in a state where Auth user exists but Profile is missing
            // Try to recover by fetching the user and creating the profile
            if (authError.message?.includes('already registered') || JSON.stringify(authError).includes('already registered')) {
                console.log('User already exists, attempting to recover by fetching user details...')
                const { data: listUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
                const existingUser = listUsers?.users.find(u => u.email === email)

                if (existingUser) {
                    userId = existingUser.id
                    console.log('Found existing user ID:', userId)
                } else {
                    return {
                        success: false,
                        error: `User exists but could not be found: ${listError?.message}`
                    }
                }
            } else {
                return {
                    success: false,
                    error: authError.message || `Auth error: ${JSON.stringify(authError)}`
                }
            }
        }

        if (!userId) {
            console.error('Auth data missing user ID')
            return {
                success: false,
                error: 'Failed to obtain user ID for profile creation'
            }
        }

        // Create profile with admin role using service role (bypasses RLS)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                role: 'admin',
                contact_name: email.split('@')[0], // Use email prefix as initial name
                company_name: companyName || null,
                updated_at: new Date().toISOString(),
            })

        if (profileError) {
            console.error('Profile creation error full object:', JSON.stringify(profileError, null, 2))
            // User was created but profile failed - this is a partial failure
            return {
                success: false,
                error: `User created but profile setup failed: ${profileError.message || JSON.stringify(profileError)}`
            }
        }

        return {
            success: true,
            message: 'Admin account created successfully!'
        }
    } catch (error) {
        console.error('Setup initialization error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
    }
}
