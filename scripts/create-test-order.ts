
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

async function createTestOrder() {
    // get admin user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    const adminUser = users?.find(u => u.email === 'admin@sempaty.com')

    if (!adminUser) {
        console.error('Admin user not found')
        return
    }

    // get a product
    const { data: product } = await supabase.from('products').select('*').limit(1).single()

    if (!product) {
        console.error('No products found')
        return
    }

    // create order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: adminUser.id,
        status: 'pending',
        total_amount: product.price_usd * 2,
        admin_notes: 'This is a test note for the customer to see.'
    }).select().single()

    if (orderError) {
        console.error('Error creating order:', orderError)
        return
    }

    // create order item
    const { error: itemError } = await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        quantity: 2,
        price: product.price_usd
    })

    if (itemError) {
        console.error('Error creating order item:', itemError)
    } else {
        console.log('Test order created successfully for admin user with ID:', order.id)
    }
}

createTestOrder()
