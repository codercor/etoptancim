import { NextResponse } from 'next/server'
import { getCurrentRate, updateExchangeRate } from '@/lib/currency/exchange-rate'

/**
 * GET /api/currency/current
 * Public endpoint to get the current active exchange rate
 */
export async function GET() {
    try {
        let rateData = await getCurrentRate()

        if (!rateData) {
            // Attempt to fetch fresh rate if none exists
            console.log('No active rate found, attempting to fetch fresh rate...')
            const updateResult = await updateExchangeRate()

            if (updateResult.success) {
                // Fetch the newly saved rate
                rateData = await getCurrentRate()
            }
        }

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
