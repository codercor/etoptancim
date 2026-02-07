#!/usr/bin/env node

/**
 * Reset database script for testing setup wizard
 * Deletes all admin profiles and auth users
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local')
try {
    const envFile = readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/)
        if (match) {
            const key = match[1].trim()
            const value = match[2].trim()
            process.env[key] = value
        }
    })
} catch (error) {
    console.error('⚠️  Could not load .env.local:', error.message)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!')
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function resetDatabase() {
    console.log('🔄 Starting database reset...\n')

    try {
        // 1. Get all users from auth
        console.log('📋 Fetching all users...')
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
            console.error('❌ Error listing users:', listError)
            return
        }

        console.log(`Found ${users?.length || 0} users`)

        // 2. Delete all users from auth
        if (users && users.length > 0) {
            console.log('\n🗑️  Deleting auth users...')
            for (const user of users) {
                const { error } = await supabase.auth.admin.deleteUser(user.id)
                if (error) {
                    console.error(`❌ Failed to delete user ${user.email}:`, error.message)
                } else {
                    console.log(`✅ Deleted user: ${user.email}`)
                }
            }
        }

        // 3. Delete all admin profiles (cascade should handle this, but let's be explicit)
        console.log('\n🗑️  Deleting admin profiles...')
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .delete()
            .eq('role', 'admin')
            .select()

        if (profilesError) {
            console.error('❌ Error deleting profiles:', profilesError)
        } else {
            console.log(`✅ Deleted ${profiles?.length || 0} admin profiles`)
        }

        // 4. Verify reset
        console.log('\n✅ Verification:')
        const { data: remainingAdmins } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')

        console.log(`Admin count: ${remainingAdmins?.length || 0}`)

        if (!remainingAdmins || remainingAdmins.length === 0) {
            console.log('\n🎉 Database reset successful!')
            console.log('You can now test the setup wizard at http://localhost:3000/setup')
        } else {
            console.log('\n⚠️  Warning: Some admins may still exist')
        }

    } catch (error) {
        console.error('\n❌ Unexpected error:', error)
        process.exit(1)
    }
}

resetDatabase()
