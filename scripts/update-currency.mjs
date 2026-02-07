/**
 * Script to manually update exchange rate from Currency API
 * This bypasses RLS policies by using the service role key
 * 
 * Usage: node scripts/update-currency.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables from .env.local
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
    envContent.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('='))
)

const CURRENCY_API_URL = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json'
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables')
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
    process.exit(1)
}

async function main() {
    console.log('🔄 Fetching latest USD/TRY rate from Currency API...')

    // Fetch rate from Currency API
    const response = await fetch(CURRENCY_API_URL)
    const data = await response.json()
    const rate = data.usd.try

    if (!rate || typeof rate !== 'number') {
        throw new Error('Invalid rate from API')
    }

    console.log(`✅ Fetched rate: 1 USD = ${rate} TRY`)

    // Deactivate old rates
    console.log('🔄 Deactivating old exchange rates...')
    const deactivateResponse = await fetch(`${SUPABASE_URL}/rest/v1/exchange_rates?is_active=eq.true`, {
        method: 'PATCH',
        headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ is_active: false })
    })

    if (!deactivateResponse.ok) {
        const error = await deactivateResponse.text()
        console.error('⚠️  Deactivate response:', error)
    } else {
        console.log('✅ Old rates deactivated')
    }

    // Insert new rate
    console.log('🔄 Inserting new exchange rate...')
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/exchange_rates`, {
        method: 'POST',
        headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            base_currency: 'USD',
            target_currency: 'TRY',
            rate: rate,
            is_active: true,
            fetched_at: new Date().toISOString()
        })
    })

    if (!insertResponse.ok) {
        const error = await insertResponse.text()
        throw new Error(`Failed to insert rate: ${error}`)
    }

    const result = await insertResponse.json()
    console.log('✅ New rate inserted successfully!')
    console.log('📊 Result:', result)
    console.log(`\n🎉 Exchange rate updated: 1 USD = ${rate} TRY`)
}

main().catch(err => {
    console.error('❌ Error:', err.message)
    process.exit(1)
})
