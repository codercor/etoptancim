"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatCurrency, translateStatus } from "@/lib/utils"
// We will import the server action. Next.js handles the bridging.
import { updateOrderStatus, updateOrderNotes } from "@/app/admin/(dashboard)/orders/[id]/actions"
import { useRouter } from "next/navigation"
import { Printer } from "lucide-react"

interface OrderDetailProps {
    order: {
        id: string
        created_at: string
        status: string
        total_amount: number
        admin_notes?: string
        profiles: {
            company_name: string
            contact_name: string
            phone: string
            address: string
        }
        order_items: {
            id: string
            quantity: number
            price: number
            products: {
                name: string
                image_urls: string[]
            }
        }[]
    }
}

export function AdminOrderDetails({ order }: OrderDetailProps) {
    const [updating, setUpdating] = useState(false)
    const router = useRouter()

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true)
        try {
            await updateOrderStatus(order.id, newStatus)
            // Router refresh is handled in the server action but we can do it here too just in case
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Hata oluştu")
        } finally {
            setUpdating(false)
        }
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        Sipariş #{order.id.slice(0, 8)}
                        <Badge className={`${getStatusColor(order.status)} text-base px-3 py-1`}>
                            {translateStatus(order.status)}
                        </Badge>
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {new Date(order.created_at).toLocaleString('tr-TR')}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.print()}
                        className="text-slate-400 hover:text-white"
                        title="Yazdır"
                    >
                        <Printer className="w-5 h-5" />
                    </Button>
                    <Select
                        defaultValue={order.status}
                        onValueChange={handleStatusChange}
                        disabled={updating}
                    >
                        <SelectTrigger className="w-[180px] bg-slate-950 border-slate-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Sipariş Alındı</SelectItem>
                            <SelectItem value="payment_received">Ödeme Alındı</SelectItem>
                            <SelectItem value="prepared">Hazırlanıyor</SelectItem>
                            <SelectItem value="shipped">Kargolandı</SelectItem>
                            <SelectItem value="delivered">Teslim Edildi</SelectItem>
                            <SelectItem value="completed">Tamamlandı</SelectItem>
                            <SelectItem value="cancelled">İptal Edildi</SelectItem>
                        </SelectContent>
                    </Select>

                    {order.status !== 'cancelled' && (
                        <Button
                            variant="destructive"
                            onClick={() => handleStatusChange('cancelled')}
                            disabled={updating}
                        >
                            Reddet / İptal Et
                        </Button>
                    )}
                </div>
            </div>

            {/* Print Header (Visible only on print) */}
            <div className="hidden print:block mb-8">
                <h1 className="text-2xl font-bold text-black mb-2">Sipariş Detayı - #{order.id.slice(0, 8)}</h1>
                <p className="text-gray-600">{new Date(order.created_at).toLocaleString('tr-TR')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-slate-900 border-slate-800 print:border print:border-gray-300 print:bg-white print:text-black">
                        <CardHeader>
                            <CardTitle className="text-white print:text-black">Ürünler</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800 print:border-gray-300 hover:bg-slate-900/50 print:hover:bg-transparent">
                                        <TableHead className="text-slate-400 print:text-gray-600">Ürün</TableHead>
                                        <TableHead className="text-slate-400 print:text-gray-600 text-center">Adet</TableHead>
                                        <TableHead className="text-slate-400 print:text-gray-600 text-right">Birim Fiyat</TableHead>
                                        <TableHead className="text-slate-400 print:text-gray-600 text-right">Toplam</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.order_items.map((item) => (
                                        <TableRow key={item.id} className="border-slate-800 print:border-gray-300 hover:bg-slate-900/50 print:hover:bg-transparent">
                                            <TableCell className="text-slate-300 print:text-black font-medium">
                                                <div className="flex items-center gap-3">
                                                    {item.products?.image_urls?.[0] && (
                                                        <img
                                                            src={item.products.image_urls[0]}
                                                            alt={item.products.name}
                                                            className="w-10 h-10 object-cover rounded print:hidden"
                                                        />
                                                    )}
                                                    <span>{item.products?.name || "Silinmiş Ürün"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300 print:text-black text-center">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-slate-300 print:text-black text-right">
                                                {formatCurrency(item.price)}
                                            </TableCell>
                                            <TableCell className="text-white print:text-black font-bold text-right">
                                                {formatCurrency(item.price * item.quantity)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-end mt-6 pt-4 border-t border-slate-800 print:border-gray-300">
                                <div className="text-right">
                                    <p className="text-slate-400 print:text-gray-600">Genel Toplam</p>
                                    <p className="text-2xl font-bold text-white print:text-black">{formatCurrency(order.total_amount)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Customer Info & Notes */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800 print:border print:border-gray-300 print:bg-white print:text-black">
                        <CardHeader>
                            <CardTitle className="text-white print:text-black">Müşteri Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500 print:text-gray-600">Firma Adı</p>
                                <p className="text-white print:text-black font-medium">{order.profiles?.company_name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 print:text-gray-600">Yetkili Kişi</p>
                                <p className="text-white print:text-black font-medium">{order.profiles?.contact_name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 print:text-gray-600">Telefon</p>
                                <p className="text-white print:text-black font-medium">{order.profiles?.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 print:text-gray-600">Adres</p>
                                <p className="text-white print:text-black font-medium whitespace-pre-wrap">{order.profiles?.address || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 print:hidden">
                        <CardHeader>
                            <CardTitle className="text-white">Admin Notları</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <AdminNotesEditor orderId={order.id} initialNotes={order.admin_notes || ""} />
                        </CardContent>
                    </Card>

                    {/* Notes for Print */}
                    {order.admin_notes && (
                        <Card className="hidden print:block border border-gray-300 bg-white text-black">
                            <CardHeader>
                                <CardTitle className="text-black">Notlar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{order.admin_notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

function AdminNotesEditor({ orderId, initialNotes }: { orderId: string, initialNotes: string }) {
    const [notes, setNotes] = useState(initialNotes)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateOrderNotes(orderId, notes)
            router.refresh()
            // Optional: Show toast
        } catch (error) {
            console.error(error)
            alert("Notlar kaydedilemedi")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-2">
            <textarea
                className="w-full h-32 bg-slate-800 border-slate-700 rounded-md p-3 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sipariş ile ilgili notlar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
            <Button
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={saving}
            >
                {saving ? "Kaydediliyor..." : "Notu Kaydet"}
            </Button>
        </div>
    )
}
