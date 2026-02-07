"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogIn } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useCurrencyStore } from "@/store/currencyStore"

interface Product {
    id: string
    product_code: string
    name: string
    price_usd: number | null
    box_quantity: number | null
    image_urls: string[]
    categories?: { slug: string }
}

export function ProductCard({ product }: { product: Product }) {
    const { addItem } = useCartStore()
    const { formatPrice } = useCurrencyStore()
    const imageUrl = product.image_urls?.[0] || "/placeholder-product.jpg"

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check initial auth state
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            setIsAuthenticated(!!session)
        }
        checkAuth()
    }, [])

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation
        if (!isAuthenticated) {
            router.push("/login")
            return
        }

        if (product.price_usd === null) return

        addItem({
            id: product.id,
            name: product.name,
            price: product.price_usd,
            image_url: imageUrl
        })
        // Feedback
        toast.success("Ürün sepete eklendi", {
            description: `${product.name} sepetinize eklendi.`,
            action: {
                label: "Sepete Git",
                onClick: () => router.push("/sepet")
            },
        })
    }

    return (
        <div className="group block bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 relative">
            <Link href={`/urun/${product.product_code.toLowerCase()}`}>
                {/* Image */}
                <div className="relative aspect-square bg-slate-800 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                        <span className="text-4xl">📦</span>
                    </div>
                    {product.image_urls?.[0] && (
                        <Image
                            src={product.image_urls[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    )}
                    {/* Box Quantity Badge */}
                    {product.box_quantity && (
                        <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                            Koli: {product.box_quantity} adet
                        </Badge>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                    <p className="text-xs font-mono text-blue-400 uppercase tracking-wider">
                        {product.product_code}
                    </p>
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                    {product.price_usd && (
                        <p className="text-lg font-bold text-green-400">
                            {formatPrice(product.price_usd)}
                        </p>
                    )}
                </div>
            </Link>

            {/* Add to Cart Button */}
            <div className="absolute bottom-4 right-4 z-10">
                <Button size="icon" className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={handleAddToCart}>
                    {isAuthenticated ? <ShoppingCart className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    )
}
