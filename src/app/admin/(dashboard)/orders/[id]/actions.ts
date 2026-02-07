"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)

    if (error) {
        throw new Error("Sipariş durumu güncellenemedi")
    }

    // Send Notification
    // We need to fetch the user_id first to send notification
    const { data: order } = await supabase
        .from("orders")
        .select("user_id, id")
        .eq("id", orderId)
        .single()

    if (order && order.user_id) {
        const { error: notifError } = await supabase
            .from("notifications")
            .insert({
                user_id: order.user_id,
                title: "Sipariş Durumu Güncellendi",
                message: `Sipariş #${order.id.slice(0, 8)} durumunuz "${translateStatusToTurkish(status)}" olarak güncellendi.`,
                link: `/orders`,
                is_read: false
            })

        if (notifError) console.error("Notification error:", notifError)
    }

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)

    return { success: true }
}

export async function updateOrderNotes(orderId: string, notes: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("orders")
        .update({ admin_notes: notes })
        .eq("id", orderId)

    if (error) {
        throw new Error("Notlar güncellenemedi")
    }

    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
}

function translateStatusToTurkish(status: string) {
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
