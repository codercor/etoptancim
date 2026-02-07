
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin access

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
    console.log('Checking tables...')

    const tables = ['profiles', 'orders', 'order_items']

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
        if (error && error.code === '42P01') { // undefined_table
            console.log(`Table '${table}' does NOT exist.`)
        } else if (error) {
            console.error(`Error checking table '${table}':`, error.message)
        } else {
            console.log(`Table '${table}' exists.`)
        }
    }
}

checkTables()
