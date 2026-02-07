"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Oturum açmanız gerekiyor." }
    }

    const company_name = formData.get("company_name") as string
    const contact_name = formData.get("contact_name") as string
    const address = formData.get("address") as string

    // Validate if needed

    const { error } = await supabase
        .from("profiles")
        .update({
            company_name,
            contact_name,
            address,
            updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

    if (error) {
        return { error: "Profil güncellenirken bir hata oluştu: " + error.message }
    }

    revalidatePath("/profile")
    revalidatePath("/dashboard")
    return { success: "Profil başarıyla güncellendi." }
}
