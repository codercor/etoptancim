"use client"

import { useCartStore } from "@/store/cartStore"
import { useCurrencyStore } from "@/store/currencyStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { placeOrder } from "@/lib/cart-actions"

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore()
    const { formatPrice } = useCurrencyStore()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCheckout = async () => {
        setLoading(true)
        try {
            const orderResult = await placeOrder()

            // Store order data in sessionStorage for success page
            sessionStorage.setItem('lastOrder', JSON.stringify(orderResult))

            // Navigate immediately with replace (doesn't add to history)
            // This prevents the empty cart screen from showing
            router.replace("/cart/success")

            // Clear local cart state after navigation starts
            // The database cart is already cleared by placeOrder()
            setTimeout(() => clearCart(), 100)
        } catch (error) {
            console.error("Checkout failed:", error)
            alert("Sipariş oluşturulurken bir hata oluştu.")
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto py-16 px-4 text-center space-y-4">
                <h1 className="text-2xl font-bold text-white">Sepetiniz Boş</h1>
                <p className="text-slate-400">Sepetinizde henüz ürün bulunmamaktadır.</p>
                <Link href="/urunler">
                    <Button>Ürünlere Göz At</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-white mb-8">Sepetim</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <Card key={item.id} className="bg-slate-900 border-slate-800">
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="h-20 w-20 bg-slate-800 rounded-md flex-shrink-0 flex items-center justify-center">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover rounded-md" />
                                    ) : (
                                        <span className="text-xs text-slate-500">No Image</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-white truncate">{item.name}</h3>
                                    <p className="text-blue-400 font-bold">{formatPrice(item.price)}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center text-white">{item.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-400 hover:bg-red-950/20"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div>
                    <Card className="bg-slate-900 border-slate-800 sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-white">Sipariş Özeti</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-slate-300">
                                <span>Ara Toplam</span>
                                <span>{formatPrice(totalPrice())}</span>
                            </div>
                            <Separator className="bg-slate-800" />
                            <div className="flex justify-between font-bold text-white text-lg">
                                <span>Toplam</span>
                                <span>{formatPrice(totalPrice())}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleCheckout} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Siparişi Gönder
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
