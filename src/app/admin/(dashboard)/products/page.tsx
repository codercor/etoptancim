import { createClient } from "@/lib/supabase/server"
import { ProductManager } from "@/components/admin/ProductManager"

export default async function ProductsPage() {
    const supabase = await createClient()

    const { data: products } = await supabase
        .from("products")
        .select("*, categories(id, name)")
        .order("product_code")

    const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .order("name")

    return (
        <ProductManager
            initialProducts={products || []}
            categories={categories || []}
        />
    )
}
