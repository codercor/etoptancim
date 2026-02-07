import { createClient } from "@/lib/supabase/server"
import { CategoryManager } from "@/components/admin/CategoryManager"

export default async function CategoriesPage() {
    const supabase = await createClient()

    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("name")

    return <CategoryManager initialCategories={categories || []} />
}
