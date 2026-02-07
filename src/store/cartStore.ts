import { create } from 'zustand'
import { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart } from '@/lib/cart-actions'

export interface CartItem {
    id: string // product id
    name: string
    price: number
    quantity: number
    image_url?: string
}

interface CartState {
    items: CartItem[]
    loading: boolean
    fetchCart: () => Promise<void>
    addItem: (product: { id: string; name: string; price: number; image_url?: string }) => Promise<void>
    removeItem: (productId: string) => Promise<void>
    updateQuantity: (productId: string, quantity: number) => Promise<void>
    clearCart: () => Promise<void>
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    loading: false,
    fetchCart: async () => {
        set({ loading: true })
        try {
            const items = await getCart()
            // @ts-ignore - Supabase types are inferred differently, mapping handled in action but TS might complain
            set({ items: items })
        } catch (error) {
            console.error("Failed to fetch cart:", error)
        } finally {
            set({ loading: false })
        }
    },
    addItem: async (product) => {
        // Optimistic update
        const currentItems = get().items
        set((state) => {
            const existingItem = state.items.find((item) => item.id === product.id)
            if (existingItem) {
                return {
                    items: state.items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
                }
            }
            return { items: [...state.items, { ...product, quantity: 1 }] }
        })

        try {
            await addToCart(product.id, 1) // Default to adding 1 for now
            // Optionally refetch to ensure sync
            // get().fetchCart()
        } catch (error) {
            console.error("Failed to add to cart:", error)
            set({ items: currentItems }) // Revert
            alert("Sepete eklenemedi. Lütfen tekrar deneyin.")
        }
    },
    removeItem: async (productId) => {
        const currentItems = get().items
        set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
        }))

        try {
            await removeFromCart(productId)
        } catch (error) {
            console.error("Failed to remove from cart:", error)
            set({ items: currentItems })
        }
    },
    updateQuantity: async (productId, quantity) => {
        const currentItems = get().items
        set((state) => ({
            items: state.items.map((item) =>
                item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
            ).filter((item) => item.quantity > 0)
        }))

        try {
            await updateCartItemQuantity(productId, quantity)
        } catch (error) {
            console.error("Failed to update cart:", error)
            set({ items: currentItems })
        }
    },
    clearCart: async () => {
        set({ items: [] })
        try {
            await clearCart()
        } catch (error) {
            console.error("Failed to clear cart:", error)
        }
    },
    totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
    },
    totalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
    }
}))
