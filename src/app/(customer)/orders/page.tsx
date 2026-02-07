import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default async function OrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500'
            case 'payment_received': return 'bg-blue-500'
            case 'prepared': return 'bg-purple-500'
            case 'shipped': return 'bg-orange-500'
            case 'delivered': return 'bg-green-500'
            case 'completed': return 'bg-green-700'
            case 'cancelled': return 'bg-red-500'
            default: return 'bg-slate-500'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Sipariş Alındı'
            case 'payment_received': return 'Ödeme Alındı'
            case 'prepared': return 'Hazırlanıyor'
            case 'shipped': return 'Kargolandı'
            case 'delivered': return 'Teslim Edildi'
            case 'completed': return 'Tamamlandı'
            case 'cancelled': return 'İptal Edildi'
            default: return status
        }
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-white">Sipariş Geçmişi</h1>

            <div className="space-y-4">
                {orders?.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`} className="block transition-transform hover:scale-[1.01]">
                        <Card className="bg-slate-900 border-slate-800 text-white hover:border-slate-700 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">
                                    Sipariş #{order.id.slice(0, 8)}
                                </CardTitle>
                                <Badge className={`${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                                    <span className="font-bold text-white text-lg">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {(!orders || orders.length === 0) && (
                    <p className="text-slate-400">Henüz bir siparişiniz bulunmuyor.</p>
                )}
            </div>
        </div>
    )
}
