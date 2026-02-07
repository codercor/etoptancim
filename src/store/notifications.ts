import { create } from 'zustand'

export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    is_read: boolean
    link?: string
    metadata?: any
    created_at: string
}

interface NotificationStore {
    notifications: Notification[]
    unreadCount: number
    setNotifications: (list: Notification[]) => void
    addNotification: (notification: Notification) => void
    markAsRead: (id: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unreadCount: 0,
    setNotifications: (list) => set({
        notifications: list,
        unreadCount: list.filter(n => !n.is_read).length
    }),
    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
    })),
    markAsRead: (id) => set((state) => {
        const updated = state.notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        )
        return {
            notifications: updated,
            unreadCount: updated.filter(n => !n.is_read).length
        }
    })
}))
