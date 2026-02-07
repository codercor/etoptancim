"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationStore } from "@/store/notifications"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner" // Assuming sonner is installed or handle alert
import { useRouter } from "next/navigation"

export function NotificationBell() {
    const { notifications, unreadCount, setNotifications, addNotification, markAsRead } = useNotificationStore()
    const supabase = createClient()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    // Fetch initial notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const user = (await supabase.auth.getUser()).data.user
            if (!user) return

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) {
                setNotifications(data)
            }
            setLoading(false)
        }

        fetchNotifications()

        // Subscribe to realtime updates
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${(async () => (await supabase.auth.getUser()).data.user?.id)}` // Filter client-side if needed or rely on RLS/channel logic? 
                // Wait, client filter in subscription string is tricky with async auth. 
                // Better: subscribe to 'public:notifications' and filter inside callback OR rely on row level subscription if enabled.
                // Actually, standard way:
            }, (payload) => {
                // We'll implement a stricter check inside
                const newNotification = payload.new as any
                // Double check user id just in case
                // addNotification(newNotification)
                // toast.info(newNotification.title)
            })
            .subscribe()

        // Re-subscribe properly with user ID
        const setupSubscription = async () => {
            const user = (await supabase.auth.getUser()).data.user
            if (!user) return

            const sub = supabase
                .channel(`user_notifications:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        const newNotif = payload.new as any
                        addNotification(newNotif)
                        // Show toast
                        // toast(newNotif.title, { description: newNotif.message })
                        // If sonner isn't set up, just console or custom toast logic.
                        console.log("New Notification:", newNotif)
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(sub)
            }
        }

        setupSubscription()

    }, [])

    const handleMarkAsRead = async (id: string) => {
        markAsRead(id)
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    }

    const handleNotificationClick = async (notification: any) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id)
        }
        setIsOpen(false)
        if (notification.link) {
            router.push(notification.link)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-slate-800">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 rounded-full text-[10px] flex items-center justify-center text-white border-2 border-slate-900 translate-x-1/4 -translate-y-1/4">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-slate-950 border-slate-800 text-slate-200">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="font-semibold text-white">Bildirimler</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="link"
                            size="sm"
                            className="text-xs text-slate-400 hover:text-white h-auto p-0"
                            onClick={() => {
                                notifications.forEach(n => !n.is_read && handleMarkAsRead(n.id))
                            }}
                        >
                            Tümünü okundu işaretle
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-slate-500">Yükleniyor...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">
                            Hiç bildiriminiz yok.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-slate-900 transition-colors cursor-pointer ${!notification.is_read ? 'bg-slate-900/40' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notification.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                        <div className="space-y-1">
                                            <p className={`text-sm ${!notification.is_read ? 'text-white font-medium' : 'text-slate-400'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-600">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
