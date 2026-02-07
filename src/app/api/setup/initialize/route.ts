import { NextResponse } from 'next/server'
import { initializeAdmin } from '@/lib/setup-actions'
import type { SetupFormData } from '@/types/setup'

/**
 * POST /api/setup/initialize
 * Initialize the first admin user (only works if no admin exists)
 */
export async function POST(request: Request) {
    try {
        const body: SetupFormData = await request.json()

        // Validate request body
        if (!body.email || !body.password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Check password confirmation matches (client should do this too)
        if (body.confirmPassword && body.password !== body.confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'Passwords do not match' },
                { status: 400 }
            )
        }

        // Initialize admin
        const result = await initializeAdmin(
            body.email,
            body.password,
            body.companyName
        )

        if (!result.success) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error in setup initialize endpoint:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred during setup'
            },
            { status: 500 }
        )
    }
}
