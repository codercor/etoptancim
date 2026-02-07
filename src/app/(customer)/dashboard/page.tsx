import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, Package } from "lucide-react"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single()

    // Fetch recent orders
    const { data: recentOrders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5)

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Hoşgeldiniz, {profile?.contact_name}</h1>
                <p className="text-slate-400">{profile?.company_name} Yönetim Paneli</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Toplam Sipariş</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentOrders?.length || 0}</div>
                    </CardContent>
                </Card>

                {/* Add more stats later */}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Hızlı İşlemler</h2>
                <div className="flex gap-4">
                    <Link href="/urunler">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Package className="mr-2 h-4 w-4" />
                            Ürün Kataloğu
                        </Button>
                    </Link>
                    <Link href="/orders">
                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Sipariş Geçmişi
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
