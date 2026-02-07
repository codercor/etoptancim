import { NextResponse } from 'next/server'
import { updateExchangeRate } from '@/lib/currency/exchange-rate'

/**
 * GET /api/currency/update
 * Cron job endpoint for automated daily exchange rate updates
 * Triggered by Vercel Cron at 10:00 AM Istanbul time (07:00 UTC)
 */
export async function GET(request: Request) {
    try {
        // Verify the request is from Vercel Cron (optional but recommended)
        const authHeader = request.headers.get('authorization')
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.log('Starting scheduled exchange rate update...')

        const result = await updateExchangeRate()

        if (result.success) {
            console.log(`Exchange rate updated successfully: ${result.rate}`)
            return NextResponse.json({
                success: true,
                rate: result.rate,
                timestamp: new Date().toISOString(),
            })
        } else {
            console.error(`Exchange rate update failed: ${result.error}`)
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
        console.error('Unexpected error in cron job:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        )
    }
}
