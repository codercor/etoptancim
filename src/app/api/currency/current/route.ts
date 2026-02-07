import { NextResponse } from 'next/server'
import { getCurrentRate } from '@/lib/currency/exchange-rate'

/**
 * GET /api/currency/current
 * Public endpoint to get the current active exchange rate
 */
export async function GET() {
    try {
        const rateData = await getCurrentRate()

        if (!rateData) {
            return NextResponse.json(
                { error: 'No exchange rate available' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            rate: parseFloat(rateData.rate.toString()),
            base: rateData.base_currency,
            target: rateData.target_currency,
            updatedAt: rateData.fetched_at,
        })
    } catch (error) {
        console.error('Error fetching current rate:', error)
        return NextResponse.json(
            { error: 'Failed to fetch exchange rate' },
            { status: 500 }
        )
    }
}
