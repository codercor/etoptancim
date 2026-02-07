"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCurrencyStore } from "@/store/currencyStore"

export default function OrderSuccessPage() {
    const router = useRouter()
    const { formatPrice, selectedCurrency, exchangeRate } = useCurrencyStore()
    const [orderData, setOrderData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get order data from sessionStorage (set by cart page)
        const storedData = sessionStorage.getItem('lastOrder')
        if (storedData) {
            setOrderData(JSON.parse(storedData))
            sessionStorage.removeItem('lastOrder') // Clean up
        }
        setLoading(false)
    }, [])

    if (loading) {
        return (
            <div className="container mx-auto py-16 px-4 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (!orderData) {
        return (
            <div className="container mx-auto py-16 px-4 text-center">
                <p className="text-slate-400">Sipariş bilgisi bulunamadı.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Success Header */}
            <div className="text-center mb-8 space-y-4">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-white">Siparişiniz Alındı!</h1>
                <p className="text-slate-400">
                    Siparişiniz başarıyla oluşturuldu ve işleme alınacaktır.
                </p>
            </div>

            {/* Order Info Card */}
            <Card className="bg-slate-900 border-slate-800 mb-6">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Sipariş Detayları
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-500">Sipariş Numarası</p>
                            <p className="text-white font-mono font-bold text-lg">
                                #{orderData.orderNumber}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">Durum</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400 border border-yellow-800">
                                Sipariş Alındı
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-slate-900 border-slate-800 mb-6">
                <CardHeader>
                    <CardTitle className="text-white">Sipariş Edilen Ürünler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {orderData.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 py-3 border-b border-slate-800 last:border-0">
                            <div className="h-16 w-16 bg-slate-800 rounded-md shrink-0 flex items-center justify-center overflow-hidden">
                                {item.product?.image_urls?.[0] ? (
                                    <img
                                        src={item.product.image_urls[0]}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Package className="h-6 w-6 text-slate-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">
                                    {item.product?.name || "Ürün"}
                                </h4>
                                <p className="text-sm text-slate-500">
                                    Miktar: {item.quantity} adet
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-bold">
                                    {formatPrice(item.price * item.quantity)}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {formatPrice(item.price)} / adet
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                        <span className="text-lg font-semibold text-white">Toplam Tutar</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-blue-400 block">
                                {formatPrice(orderData.total)}
                            </span>
                            {selectedCurrency === 'TRY' && (
                                <span className="text-sm text-slate-400">
                                    ≈ ${(orderData.total / exchangeRate).toFixed(2)} USD
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/orders" className="flex-1 sm:flex-initial">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Siparişlerime Git
                    </Button>
                </Link>
                <Link href="/urunler" className="flex-1 sm:flex-initial">
                    <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-900 hover:text-white">
                        Alışverişe Devam Et
                    </Button>
                </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-950/20 border border-blue-900/50 rounded-lg">
                <p className="text-sm text-slate-300 text-center">
                    <strong>Not:</strong> Siparişinizin durumunu "Siparişlerim" sayfasından takip edebilirsiniz.
                </p>
            </div>
        </div>
    )
}
