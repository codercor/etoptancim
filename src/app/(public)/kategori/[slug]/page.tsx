import ProductsPage from "@/app/(public)/urunler/page"

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    // Verify category exists first to show 404 if not?
    // integrating with ProductsPage logic by mapping params to searchParams mock

    // Re-using the ProductsPage logic but injecting the category param
    const props = {
        searchParams: Promise.resolve({ category: slug })
    }

    return <ProductsPage {...props} />
}
