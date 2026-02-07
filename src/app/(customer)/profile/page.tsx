import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile-form"
import { redirect } from "next/navigation"

export const metadata = {
    title: "Profilim - Toptancim",
}

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Profil Bilgilerim</h1>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-6">
                <ProfileForm initialData={profile || {}} />
            </div>
        </div>
    )
}
