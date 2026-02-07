
import { createClient } from "@/lib/supabase/server"
import { AdminOrderDetails } from "@/components/admin/AdminOrderDetails"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: order, error } = await supabase
        .from("orders")
        .select(`
            *,
            profiles(company_name, contact_name, phone, address),
            order_items(
                id,
                quantity,
                price,
                products(name, image_urls)
            )
        `)
        .eq("id", id)
        .single()

    if (error || !order) {
        console.error(error)
        return <div className="text-white p-8">Sipariş bulunamadı.</div>
    }

    return (
        <div className="space-y-6">
            <Link
                href="/admin/orders"
                className="inline-flex items-center text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Siparişlere Dön
            </Link>

            <AdminOrderDetails order={order} />
        </div>
    )
}
