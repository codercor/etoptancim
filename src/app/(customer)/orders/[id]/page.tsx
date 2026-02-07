
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, translateStatus } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { notFound } from "next/navigation"

interface OrderDetailPageProps {
    params: {
        id: string
    }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Lütfen giriş yapın.</div>
    }

    const { data: order, error } = await supabase
        .from("orders")
        .select(`
            *,
            order_items (
                id,
                quantity,
                price,
                products (
                    name,
                    image_urls,
                    product_code
                )
            ),
            profiles (
                company_name,
                contact_name,
                phone,
                address
            )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

    if (error || !order) {
        console.error("Error fetching order:", error)
        notFound()
    }

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

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 text-slate-50">
            <Link
                href="/orders"
                className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Siparişlerime Dön
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Sipariş Detayı
                        <span className="text-slate-500 text-lg font-normal">#{order.id.slice(0, 8)}</span>
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {new Date(order.created_at).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                </div>
                <Badge className={`${getStatusColor(order.status)} text-base px-4 py-1.5`}>
                    {translateStatus(order.status)}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-slate-900 border-slate-800 text-slate-50">
                        <CardHeader>
                            <CardTitle>Ürünler</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {order.order_items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-start">
                                    <div className="w-20 h-20 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.products?.image_urls?.[0] ? (
                                            <img
                                                src={item.products.image_urls[0]}
                                                alt={item.products.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                                                Görsel Yok
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-lg leading-tight mb-1">
                                            {item.products?.name}
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-2">
                                            Kod: {item.products?.product_code}
                                        </p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">
                                                {item.quantity} Adet x {formatCurrency(item.price)}
                                            </span>
                                            <span className="font-bold text-white text-base">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Separator className="bg-slate-800" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-slate-400 text-lg">Toplam Tutar</span>
                                <span className="text-2xl font-bold text-white">
                                    {formatCurrency(order.total_amount)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Note Section - Only if exists */}
                    {order.admin_notes && (
                        <Card className="bg-blue-950/20 border-blue-900/50 text-slate-50">
                            <CardHeader>
                                <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
                                    ℹ️ Mağaza Notu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {order.admin_notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Delivery Info */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800 text-slate-50">
                        <CardHeader>
                            <CardTitle>Teslimat Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Firma</p>
                                <p className="font-medium">{order.profiles?.company_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Teslim Alan</p>
                                <p className="font-medium">{order.profiles?.contact_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">İletişim</p>
                                <p className="font-medium">{order.profiles?.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Teslimat Adresi
                                </p>
                                <p className="font-medium whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                                    {order.profiles?.address || 'Adres bilgisi girilmemiş.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
