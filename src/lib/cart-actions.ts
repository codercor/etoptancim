"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCart() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: cartItems } = await supabase
        .from("cart_items")
        .select("*, product:products(name, price_usd, image_urls)")
        .eq("user_id", user.id)

    if (!cartItems) return []

    return cartItems.map(item => ({
        id: item.product_id, // Map product_id to id for compatibility with store
        name: item.product.name,
        price: item.product.price_usd,
        quantity: item.quantity,
        image_url: item.product.image_urls?.[0],
        item_id: item.id // Keep the cart_item id for updates/deletes
    }))
}

export async function addToCart(productId: string, quantity: number = 1) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    // Check if item exists
    const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single()

    if (existingItem) {
        // Update quantity
        const { error } = await supabase
            .from("cart_items")
            .update({ quantity: existingItem.quantity + quantity })
            .eq("id", existingItem.id)

        if (error) throw error
    } else {
        // Insert new
        const { error } = await supabase
            .from("cart_items")
            .insert({
                user_id: user.id,
                product_id: productId,
                quantity: quantity
            })

        if (error) throw error
    }

    revalidatePath("/cart")
    revalidatePath("/")
}

export async function updateCartItemQuantity(productId: string, quantity: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    // We need to find the cart_item record for this product
    // Or we could pass item_id from the frontend if we had it mapped
    // Let's query by product_id + user_id to be safe

    if (quantity <= 0) {
        return removeFromCart(productId)
    }

    const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("user_id", user.id)
        .eq("product_id", productId)

    if (error) throw error
    revalidatePath("/cart")
}

export async function removeFromCart(productId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId)

    if (error) throw error
    revalidatePath("/cart")
}

export async function clearCart() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)

    if (error) throw error
    revalidatePath("/cart")
}

export async function placeOrder() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    // 1. Get cart items with product details for current price
    const { data: cartItems } = await supabase
        .from("cart_items")
        .select("*, product:products(price_usd)")
        .eq("user_id", user.id)

    if (!cartItems || cartItems.length === 0) {
        throw new Error("Cart is empty")
    }

    // 2. Calculate total
    const totalAmount = cartItems.reduce((sum, item) => {
        return sum + (item.quantity * (item.product?.price_usd || 0))
    }, 0)

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            user_id: user.id,
            total_amount: totalAmount,
            status: "pending"
        })
        .select()
        .single()

    if (orderError) throw orderError

    // 4. Create Order Items
    const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price_usd || 0 // Snapshot price
    }))

    const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems)

    if (itemsError) throw itemsError

    // 5. Clear Cart
    await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)

    revalidatePath("/cart")
    revalidatePath("/orders")

    // Return complete order details for confirmation page
    const orderItemsWithProducts = await supabase
        .from("order_items")
        .select("*, product:products(name, image_urls)")
        .eq("order_id", order.id)

    return {
        success: true,
        orderId: order.id,
        orderNumber: order.id.slice(0, 8).toUpperCase(),
        items: orderItemsWithProducts.data || [],
        total: totalAmount,
        status: order.status
    }
}
