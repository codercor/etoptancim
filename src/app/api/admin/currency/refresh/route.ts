import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateExchangeRate } from '@/lib/currency/exchange-rate'

/**
 * POST /api/admin/currency/refresh
 * Admin-only endpoint for manual exchange rate refresh
 */
export async function POST() {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized - no session' },
                { status: 401 }
            )
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden - admin access required' },
                { status: 403 }
            )
        }

        // Perform the rate update
        console.log('Admin-initiated exchange rate refresh...')
        const result = await updateExchangeRate()

        if (result.success) {
            return NextResponse.json({
                success: true,
                rate: result.rate,
                timestamp: new Date().toISOString(),
                message: 'Exchange rate updated successfully'
            })
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Error in admin currency refresh:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
