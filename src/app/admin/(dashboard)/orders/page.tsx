import { createClient } from "@/lib/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
// We need a client component for status updates or use server actions in a form. 
// For simplicity, I'll fetch data here and maybe make a client component for the row actions?
// Or just make the whole page a server component and use a separate client component for the table/actions.

import { AdminOrderTable } from "@/components/admin/AdminOrderTable"

export default async function AdminOrdersPage() {
    const supabase = await createClient()

    // Fetch orders with user profiles
    const { data: orders, error } = await supabase
        .from("orders")
        .select("*, profiles(company_name, contact_name, phone)")
        .order("created_at", { ascending: false })

    if (error) {
        console.error(error)
        return <div className="text-white">Error loading orders</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Sipariş Yönetimi</h1>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900">
                <AdminOrderTable orders={orders || []} />
            </div>
        </div>
    )
}
