
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetAdmin() {
    const email = 'admin@sempaty.com'
    const password = 'admin123'

    console.log(`Resetting password for ${email}...`)

    // Check if user exists (by trying to get user by email - not directly possible with admin api in one go without listing, 
    // but listUsers is available)

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError)
        return
    }

    const user = users.find(u => u.email === email)

    if (user) {
        const { error } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: password, user_metadata: { role: 'admin' } }
        )
        if (error) {
            console.error('Error updating user:', error)
        } else {
            console.log('Password updated successfully!')
            await ensureAdminProfile(supabase, user.id)
        }
    } else {
        const { error, data } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        })
        if (error) {
            console.error('Error creating user:', error)
            return
        } else {
            console.log('User created successfully!', data.user.id)
            const userId = data.user.id
            await ensureAdminProfile(supabase, userId)
        }
    }
}

async function ensureAdminProfile(supabase: any, userId: string) {
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        role: 'admin',
        company_name: 'Sempaty',
        contact_name: 'Admin',
        phone: '5550000000'
    })

    if (profileError) {
        console.error('Error updating admin profile:', profileError)
    } else {
        console.log('Admin profile updated successfully!')
    }
}

resetAdmin()
