"use server"

import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Admin Client with Service Role Key
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CreateCustomerState = {
    message?: string
    error?: string
}

export async function createCustomer(prevState: CreateCustomerState, formData: FormData): Promise<CreateCustomerState> {
    const supabase = await createServerClient()

    // 1. Check if current user is admin
    // This is a double check effectively, as the page should also be protected
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        return { error: "Unauthorized: Admin access required" }
    }

    // 2. Extract Data
    const company_name = formData.get("company_name") as string
    const contact_name = formData.get("contact_name") as string
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string
    const address = formData.get("address") as string

    if (!phone || !password || !company_name) {
        return { error: "Missing required fields" }
    }

    // 3. Create User in Auth
    const email = `${phone}@toptancim.com`

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
            company_name,
            contact_name,
            phone
        }
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: "Failed to create user" }
    }

    // 4. Create Profile
    // We use supabaseAdmin here to bypass RLS for initial insert if needed, 
    // though our RLS allows admins to insert.
    const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
            id: authData.user.id,
            company_name,
            contact_name,
            phone,
            address,
            role: "customer"
        })

    if (profileError) {
        // If profile creation fails, we might want to delete the auth user or just return error
        console.error("Profile creation failed:", profileError)
        // Attempt cleanup? For now just return error
        return { error: "User created but profile failed: " + profileError.message }
    }

    revalidatePath("/admin/customers")
    return { message: "Customer created successfully" }
}
