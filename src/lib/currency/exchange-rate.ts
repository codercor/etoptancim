'use server'

import { createClient } from '@/lib/supabase/server'
import type { ExchangeRate } from '@/types/currency'
import { isValidRate } from './converter'

const EXCHANGE_RATE_API_URL = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json'

/**
 * Fetch latest USD/TRY exchange rate from Currency API
 */
export async function fetchLatestRate(): Promise<number> {
    try {
        const response = await fetch(EXCHANGE_RATE_API_URL, {
            next: { revalidate: 0 } // Don't cache, always fetch fresh
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        // New API returns: { "date": "2026-02-07", "usd": { "try": 43.61244666, ... } }
        const rate = data.usd?.try

        if (!rate || typeof rate !== 'number') {
            throw new Error('Invalid rate data from API')
        }

        // Validate rate is reasonable
        if (!isValidRate(rate)) {
            throw new Error(`Rate ${rate} is outside valid bounds (20-50)`)
        }

        return rate
    } catch (error) {
        console.error('Failed to fetch exchange rate:', error)
        throw error
    }
}

/**
 * Get current active exchange rate from database
 */
export async function getCurrentRate(): Promise<ExchangeRate | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('exchange_rates')
            .select('*')
            .eq('base_currency', 'USD')
            .eq('target_currency', 'TRY')
            .eq('is_active', true)
            .order('fetched_at', { ascending: false })
            .limit(1)
            .single()

        if (error) {
            console.error('Error fetching current rate:', error)
            return null
        }

        return data
    } catch (error) {
        console.error('Failed to get current rate:', error)
        return null
    }
}

/**
 * Save new exchange rate to database and deactivate old rates
 */
export async function saveNewRate(rate: number): Promise<void> {
    try {
        const supabase = await createClient()

        // First, deactivate all existing active rates
        await supabase
            .from('exchange_rates')
            .update({ is_active: false })
            .eq('base_currency', 'USD')
            .eq('target_currency', 'TRY')
            .eq('is_active', true)

        // Insert new rate
        const { error } = await supabase
            .from('exchange_rates')
            .insert({
                base_currency: 'USD',
                target_currency: 'TRY',
                rate,
                is_active: true,
                fetched_at: new Date().toISOString()
            })

        if (error) {
            throw new Error(`Failed to save rate: ${error.message}`)
        }

        console.log(`Successfully saved new exchange rate: ${rate}`)
    } catch (error) {
        console.error('Failed to save new rate:', error)
        throw error
    }
}

/**
 * Fetch and save latest exchange rate
 * Used by cron job and manual refresh
 */
export async function updateExchangeRate(): Promise<{ success: boolean; rate?: number; error?: string }> {
    try {
        const rate = await withRetry(fetchLatestRate, 3)
        await saveNewRate(rate)

        return { success: true, rate }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Failed to update exchange rate:', message)
        return { success: false, error: message }
    }
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error')

            if (i < maxRetries - 1) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = baseDelay * Math.pow(2, i)
                console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    throw lastError || new Error('All retries failed')
}
