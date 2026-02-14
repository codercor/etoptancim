import { NextResponse } from 'next/server'
import { checkSetupRequired } from '@/lib/setup-actions'

/**
 * GET /api/setup/check
 * Public endpoint to check if initial setup is required
 */
export async function GET() {
    try {
        const setupRequired = await checkSetupRequired()

        return NextResponse.json({
            setupRequired
        })
    } catch (error) {
        console.error('Error in setup check endpoint:', error)
        return NextResponse.json(
            { setupRequired: true }, // Fail safe - show setup if check fails
            { status: 500 }
        )
    }
}
