
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const INITIAL_CATEGORIES = [
    {
        name: 'Ev Şarj Aleti',
        slug: 'ev-sarj-aleti',
        image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=400'
    },
    {
        name: 'Araç Şarj Aleti',
        slug: 'arac-sarj-aleti',
        image_url: 'https://images.unsplash.com/photo-1622979135228-44a1da6299b9?auto=format&fit=crop&q=80&w=400'
    },
    {
        name: 'Şarj ve Data Kablosu',
        slug: 'sarj-ve-data-kablosu',
        image_url: 'https://images.unsplash.com/photo-1544866092-1935c5ef2a8f?auto=format&fit=crop&q=80&w=400'
    }
]

const INITIAL_PRODUCTS = [
    {
        category_slug: 'ev-sarj-aleti',
        product_code: 'S-130',
        name: '120W Super Charge Adaptör',
        price_usd: 10.50,
        box_quantity: 90,
        barcode: '8699261146255',
        image_urls: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800'],
        specs: {
            'Watt': '120W',
            'Port': '1x Type-C',
            'Teknoloji': 'GaN'
        }
    },
    {
        category_slug: 'ev-sarj-aleti',
        product_code: 'S-150',
        name: '65W GaN Hızlı Şarj Aleti',
        price_usd: 18.00,
        box_quantity: 60,
        barcode: '8699261146256',
        image_urls: ['https://images.unsplash.com/photo-1585338447937-7082f8fc763d?auto=format&fit=crop&q=80&w=800'],
        specs: {
            'Watt': '65W',
            'Port': '2x Type-C, 1x USB-A',
            'Teknoloji': 'GaN Pro'
        }
    },
    {
        category_slug: 'arac-sarj-aleti',
        product_code: 'C-20',
        name: 'Metal Gövde Hızlı Araç Şarjı',
        price_usd: 4.50,
        box_quantity: 240,
        barcode: '8699261146260',
        image_urls: ['https://images.unsplash.com/photo-1622979135228-44a1da6299b9?auto=format&fit=crop&q=80&w=800'],
        specs: {
            'Watt': '30W',
            'Giriş': '12V-24V',
            'Malzeme': 'Alüminyum'
        }
    },
    {
        category_slug: 'sarj-ve-data-kablosu',
        product_code: 'DK-100',
        name: 'Type-C to Lightning PD Kablo',
        price_usd: 2.25,
        box_quantity: 500,
        barcode: '8699261146270',
        image_urls: ['https://images.unsplash.com/photo-1544866092-1935c5ef2a8f?auto=format&fit=crop&q=80&w=800'],
        specs: {
            'Uzunluk': '1.2 Metre',
            'Akım': '3A',
            'Malzeme': 'Örgülü'
        }
    }
]

async function seed() {
    console.log('🌱 Starting seed...')

    // 1. Create Admin User
    const adminEmail = 'admin@sempaty.com'
    const adminPassword = 'admin123456(strong)' // Change this!

    console.log('Creating admin user...')
    // Check if user exists first to avoid error
    // Note: listUsers requires pagination, for simplicity we just try create and catch error
    // or delete prior. For local seed, we can just try to create.

    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
    })

    let adminId = user.user?.id

    if (userError) {
        if (userError.message.includes('already has been registered')) {
            console.log('Admin user already exists.')
            // Try to set adminId if we can, but we can't query auth.users easily here without admin rights on client... 
            // actually we initialized with serviceRoleKey so we HAVE admin rights.
            const { data: users } = await supabase.auth.admin.listUsers()
            const existingUser = users.users.find(u => u.email === adminEmail)
            if (existingUser) {
                adminId = existingUser.id
                console.log('Found existing admin ID:', adminId)
            }
        } else {
            console.error('Error creating admin:', userError)
        }
    } else {
        console.log('Admin user created:', user.user?.id)
        adminId = user.user?.id
    }

    // 2. Add to public.profiles table
    if (adminId) {
        console.log('Upserting admin profile...')
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: adminId,
                role: 'admin',
                company_name: 'Sempaty Teknoloji',
                contact_name: 'Admin User',
                phone: '5555555555' // Add a dummy phone for admin just in case
            })
        // onConflict id is default for upsert

        if (profileError) {
            console.error('Error adding to profiles table:', profileError)
        } else {
            console.log('Admin profile updated/created.')
        }
    }

    // 3. Create Categories
    console.log('Creating categories...')
    const categoryMap = new Map()

    for (const cat of INITIAL_CATEGORIES) {
        const { data, error } = await supabase
            .from('categories')
            .upsert(cat, { onConflict: 'slug' })
            .select()
            .single()

        if (error) {
            console.error(`Error creating category ${cat.name}:`, error)
        } else {
            categoryMap.set(cat.slug, data.id)
        }
    }

    // 4. Create Products
    console.log('Creating products...')
    for (const prod of INITIAL_PRODUCTS) {
        const categoryId = categoryMap.get(prod.category_slug)
        if (!categoryId) {
            console.warn(`Category not found for product ${prod.product_code}`)
            continue
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { category_slug, ...productData } = prod

        const { error } = await supabase
            .from('products')
            .upsert({
                ...productData,
                category_id: categoryId
            }, { onConflict: 'product_code' })

        if (error) {
            console.error(`Error creating product ${prod.product_code}:`, error)
        }
    }

    console.log('✅ Seed completed!')
    console.log(`\nAdmin Credentials:\nEmail: ${adminEmail}\nPassword: ${adminPassword}`)
}

seed().catch(err => {
    console.error('Seed failed:', err)
    process.exit(1)
})
