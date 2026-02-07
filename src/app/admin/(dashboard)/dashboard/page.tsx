import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FolderTree, DollarSign } from "lucide-react"

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch stats
    const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })

    const { count: categoryCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true })

    const { data: products } = await supabase
        .from("products")
        .select("price_usd")

    const totalValue = products?.reduce((sum, p) => sum + (Number(p.price_usd) || 0), 0) || 0

    const stats = [
        {
            title: "Toplam Ürün",
            value: productCount || 0,
            icon: Package,
            color: "text-blue-500",
        },
        {
            title: "Kategoriler",
            value: categoryCount || 0,
            icon: FolderTree,
            color: "text-green-500",
        },
        {
            title: "Toplam Değer (USD)",
            value: `$${totalValue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "text-yellow-500",
        },
    ]

    return (
        <div className="space-y-8">
            <div className="pt-8 lg:pt-0">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-2">Sempaty Katalog Yönetim Paneli</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title} className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Hoş Geldiniz!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-400">
                        Sempaty Dijital Katalog yönetim paneline hoş geldiniz. Sol menüden kategorilerinizi
                        ve ürünlerinizi yönetebilirsiniz.
                    </p>
                    <ul className="mt-4 space-y-2 text-slate-300">
                        <li>• <strong>Kategoriler:</strong> Ürünlerinizi gruplandırın</li>
                        <li>• <strong>Ürünler:</strong> Stok kodu, fiyat, koli adeti ve teknik özellikler ekleyin</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
