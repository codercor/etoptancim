import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Package, ShoppingCart, User, LogOut, Home } from "lucide-react"

export default async function CustomerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Check if user has a profile and is a customer/admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // Optional: Redirect if not a valid profile or role check?
    // For now, let registered users in.

    return (
        <div className="flex h-screen bg-slate-950 text-slate-50">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <Package className="h-6 w-6 text-blue-500" />
                        <span>Toptancim</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <Home className="h-5 w-5" />
                        <span>Panel</span>
                    </Link>
                    <Link href="/urunler" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <Package className="h-5 w-5" />
                        <span>Ürünler</span>
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <ShoppingCart className="h-5 w-5" />
                        <span>Siparişlerim</span>
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <User className="h-5 w-5" />
                        <span>Profilim</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{profile?.contact_name || user.email}</p>
                            <p className="text-xs text-slate-500 truncate">{profile?.company_name || 'Şirket'}</p>
                        </div>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center gap-3 px-4 py-2 mt-2 text-sm text-red-400 hover:bg-red-950/20 rounded-lg transition-colors">
                            <LogOut className="h-4 w-4" />
                            <span>Çıkış Yap</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}
