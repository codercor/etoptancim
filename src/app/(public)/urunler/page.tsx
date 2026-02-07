import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/ProductCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string }>
}) {
    const params = await searchParams
    const query = params.q
    const categorySlug = params.category

    const supabase = await createClient()

    let dbQuery = supabase
        .from("products")
        .select("*, categories!inner(slug, name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,product_code.ilike.%${query}%`)
    }

    if (categorySlug) {
        dbQuery = dbQuery.eq("categories.slug", categorySlug)
    }

    const { data: products } = await dbQuery

    const { data: categories } = await supabase
        .from("categories")
        .select("name, slug")
        .order("name")

    return (
        <div className="container px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-white">
                    {categorySlug
                        ? categories?.find(c => c.slug === categorySlug)?.name
                        : query ? `"${query}" için sonuçlar` : "Tüm Ürünler"}
                </h1>


            </div>

            {products?.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <p className="text-lg">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {products?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}
