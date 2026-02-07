"use client"

import Link from "next/link"
import { Search, Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useCartStore } from "@/store/cartStore"
import { User, LogOut, LayoutDashboard } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface NavbarProps {
    categories?: { id: string; name: string; slug: string }[]
}

export function Navbar({ categories = [] }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { totalItems, fetchCart } = useCartStore()
    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    // Check auth and fetch cart
    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)

            if (session?.user) {
                fetchCart()

                // Check if admin
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .single()

                if (profile?.role === "admin") {
                    setIsAdmin(true)
                }
            }
        }
        init()

    }, [fetchCart])

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-white">
                            Toptancim
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        <Link
                            href="/"
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            Ana Sayfa
                        </Link>
                        {categories.slice(0, 5).map((category) => (
                            <Link
                                key={category.id}
                                href={`/kategori/${category.slug}`}
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                {category.name}
                            </Link>
                        ))}
                        <Link
                            href="/urunler"
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            Tüm Ürünler
                        </Link>
                    </nav>

                    {/* Search & Cart */}
                    <div className="hidden md:flex items-center space-x-4">
                        <form action="/urunler" method="GET" className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="search"
                                name="q"
                                placeholder="Ürün ara..."
                                className="w-64 pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            />
                        </form>

                        {user && !isAdmin && (
                            <Link href="/cart">
                                <Button variant="ghost" size="icon" className="relative text-white hover:bg-slate-800">
                                    <ShoppingCart className="h-6 w-6" />
                                    {totalItems() > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-[10px] font-bold flex items-center justify-center">
                                            {totalItems()}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        )}
                        {/* Notification Bell */}
                        {user && (
                            <NotificationBell />
                        )}

                        {/* User Menu */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                                        <User className="h-6 w-6" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-white w-56">
                                    <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-800" />

                                    {isAdmin && (
                                        <Link href="/admin/dashboard">
                                            <DropdownMenuItem className="cursor-pointer focus:bg-slate-900 focus:text-white">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Admin Panel
                                            </DropdownMenuItem>
                                        </Link>
                                    )}

                                    <Link href="/dashboard">
                                        <DropdownMenuItem className="cursor-pointer focus:bg-slate-900 focus:text-white">
                                            <User className="mr-2 h-4 w-4" />
                                            Kullanıcı Paneli
                                        </DropdownMenuItem>
                                    </Link>

                                    <DropdownMenuSeparator className="bg-slate-800" />

                                    <DropdownMenuItem
                                        className="text-red-500 focus:text-red-400 focus:bg-slate-900 cursor-pointer"
                                        onClick={async () => {
                                            const supabase = createClient()
                                            await supabase.auth.signOut()
                                            window.location.href = "/"
                                        }}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Çıkış Yap
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="text-white hover:text-blue-400">
                                    Giriş Yap
                                </Button>
                            </Link>
                        )}


                    </div>

                    {/* Mobile Menu & Cart */}
                    <div className="lg:hidden flex items-center gap-4">
                        {user && !isAdmin && (
                            <Link href="/cart">
                                <Button variant="ghost" size="icon" className="relative text-white">
                                    <ShoppingCart className="h-6 w-6" />
                                    {totalItems() > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-[10px] font-bold flex items-center justify-center">
                                            {totalItems()}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        )}

                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-slate-950 border-slate-800 text-white w-[300px]">
                                <SheetTitle className="text-white mb-4">Menü</SheetTitle>
                                <div className="flex flex-col space-y-4 mt-8">
                                    <form action="/urunler" method="GET" className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            type="search"
                                            name="q"
                                            placeholder="Ara..."
                                            className="w-full pl-10 bg-slate-900 border-slate-700 text-white"
                                        />
                                    </form>
                                    <Link
                                        href="/"
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium text-slate-300 hover:text-white"
                                    >
                                        Ana Sayfa
                                    </Link>

                                    {user ? (
                                        <>
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setIsOpen(false)}
                                                className="text-lg font-medium text-slate-300 hover:text-white"
                                            >
                                                Hesabım
                                            </Link>
                                            {!isAdmin && (
                                                <div className="pt-4 border-t border-slate-800">
                                                    <Link href="/cart" onClick={() => setIsOpen(false)}>
                                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                                            Sepete Git
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="text-lg font-medium text-slate-300 hover:text-white"
                                        >
                                            Giriş Yap
                                        </Link>
                                    )}
                                    {isAdmin && (
                                        <Link
                                            href="/admin/dashboard"
                                            onClick={() => setIsOpen(false)}
                                            className="text-lg font-medium text-blue-400 hover:text-blue-300"
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    {user && (
                                        <button
                                            onClick={async () => {
                                                const supabase = createClient()
                                                await supabase.auth.signOut()
                                                window.location.href = "/"
                                            }}
                                            className="text-lg font-medium text-red-500 hover:text-red-400 text-left"
                                        >
                                            Çıkış Yap
                                        </button>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}
