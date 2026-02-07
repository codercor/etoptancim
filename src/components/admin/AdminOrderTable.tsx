"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, translateStatus } from "@/lib/utils"
import Link from "next/link"

interface Order {
    id: string
    status: string
    total_amount: number
    created_at: string
    profiles: {
        company_name: string
        contact_name: string
    } | null
}

export function AdminOrderTable({ orders }: { orders: Order[] }) {

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
        <Table>
            <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                    <TableHead className="text-slate-400">Sipariş No</TableHead>
                    <TableHead className="text-slate-400">Müşteri</TableHead>
                    <TableHead className="text-slate-400">Tarih</TableHead>
                    <TableHead className="text-slate-400">Tutar</TableHead>
                    <TableHead className="text-slate-400">Durum</TableHead>
                    <TableHead className="text-slate-400">İşlemler</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id} className="border-slate-800 hover:bg-slate-900/50">
                        <TableCell className="font-mono text-slate-300">
                            {order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="text-white font-medium">
                                    {order.profiles?.company_name || "Bilinmiyor"}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {order.profiles?.contact_name}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="text-white font-bold">
                            {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell>
                            <Badge className={`${getStatusColor(order.status)} hover:${getStatusColor(order.status)}`}>
                                {translateStatus(order.status)}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Link href={`/admin/orders/${order.id}`}>
                                <Button variant="outline" size="sm" className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                    Detay
                                </Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
                {orders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                            Henüz sipariş bulunmuyor.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
