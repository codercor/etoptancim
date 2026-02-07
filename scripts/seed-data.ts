
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

async function seedData() {
    console.log('Seeding data...')

    // 1. Create a user/profile
    const { data: { users } } = await supabase.auth.admin.listUsers()
    let userId = users.find(u => u.email === 'user@example.com')?.id

    if (!userId) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: 'user@example.com',
            password: 'password123',
            email_confirm: true
        })
        if (error) {
            console.error('Error creating user:', error)
            return
        }
        userId = data.user.id
    }

    // Update profile
    await supabase.from('profiles').upsert({
        id: userId,
        company_name: 'Test Şirketi',
        contact_name: 'Ahmet Yılmaz',
        phone: '5551234567',
        role: 'customer'
    })

    // 1.5 Create a category
    const { data: category, error: catError } = await supabase.from('categories').insert({
        name: 'Test Kategori',
        slug: 'test-kategori'
    }).select().single()

    if (catError) {
        console.error('Error creating category:', catError)
        return
    }

    // 2. Create a product
    const { data: product, error: prodError } = await supabase.from('products').insert({
        name: 'Test Ürünü',
        product_code: 'TEST-001',
        category_id: category.id,
        price_usd: 100.00,
        box_quantity: 10,
        image_urls: ['https://via.placeholder.com/150']
    }).select().single()

    if (prodError) {
        console.error('Error creating product:', prodError)
        return
    }

    // 3. Create an order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: userId,
        status: 'pending',
        total_amount: 200.00,
        admin_notes: 'Initial note'
    }).select().single()

    if (orderError) {
        console.error('Error creating order:', orderError)
        return
    }

    // 4. Create order items
    await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        quantity: 2,
        price: 100.00
    })

    console.log('Seed data created successfully!')
}

seedData()
