import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ProductCard"
import { ArrowRight, Package } from "lucide-react"

export default async function HomePage() {
    const supabase = await createClient()

    // Fetch Featured Categories
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("name")
        .limit(6)

    // Fetch Newest Products
    const { data: latestProducts } = await supabase
        .from("products")
        .select("*, categories(slug)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8)

    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="relative h-[500px] flex items-center justify-center bg-slate-900 border-b border-slate-800 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>

                <div className="container relative z-10 px-4 text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                        Toptan <span className="text-blue-500">Dijital</span> Teknoloji
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Sempaty ile en yeni mobil aksesuarlara ve elektronik ürünlere toptan fiyatlarla ulaşın.
                        Hızlı sipariş, geniş stok ve güvenilir hizmet.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/urunler">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg">
                                Ürünleri İncele
                            </Button>
                        </Link>
                        <a
                            href="https://wa.me/905551234567"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button size="lg" variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800 h-12 px-8 text-lg">
                                Bize Ulaşın
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Kategoriler</h2>
                    <Link href="/urunler" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        Tümünü Gör <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories?.map((category) => (
                        <Link
                            key={category.id}
                            href={`/kategori/${category.slug}`}
                            className="group relative aspect-square bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors"
                        >
                            <div className="w-12 h-12 mb-3 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-colors">
                                <Package className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                            </div>
                            <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                                {category.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Latest Products */}
            <section className="container px-4">
                <h2 className="text-2xl font-bold text-white mb-8">Yeni Ürünler</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {latestProducts?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    )
}
