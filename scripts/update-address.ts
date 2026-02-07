
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateAddress() {
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError)
        return
    }

    const adminUser = users.users.find(u => u.email === 'admin@sempaty.com')

    if (!adminUser) {
        console.error('Admin user not found')
        return
    }

    const { error } = await supabase
        .from('profiles')
        .update({ address: 'Örnek Mahallesi, Test Sokak No: 1, İstanbul' })
        .eq('id', adminUser.id)

    if (error) {
        console.error('Error updating address:', error)
    } else {
        console.log('Address updated successfully for admin user')
    }
}

updateAddress()
