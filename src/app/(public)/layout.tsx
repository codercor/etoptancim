import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import { createClient } from "@/lib/supabase/server"

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name")

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Navbar categories={categories || []} />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}
