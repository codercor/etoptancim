import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { ArrowLeft, MessageCircle, Copy, Check } from "lucide-react"

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ product_code: string }>
}) {
    const { product_code } = await params
    const decodedCode = decodeURIComponent(product_code).toUpperCase()

    const supabase = await createClient()

    const { data: product } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("product_code", decodedCode)
        .single()

    if (!product) {
        notFound()
    }

    const whatsappMessage = `Merhaba, ${product.product_code} kodlu ${product.name} ürününden sipariş vermek istiyorum.`
    const whatsappUrl = `https://wa.me/905551234567?text=${encodeURIComponent(whatsappMessage)}`

    return (
        <div className="container px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
                <Link href="/urunler" className="hover:text-white flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Tüm Ürünler
                </Link>
                <span>/</span>
                <Link href={`/kategori/${product.categories?.slug}`} className="hover:text-white">
                    {product.categories?.name}
                </Link>
                <span>/</span>
                <span className="text-white truncate max-w-[200px]">{product.product_code}</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Left: Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-square bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                        {product.image_urls?.[0] ? (
                            <Image
                                src={product.image_urls[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                                <span className="text-6xl">📦</span>
                            </div>
                        )}
                        {product.box_quantity && (
                            <Badge className="absolute top-4 right-4 bg-blue-600 text-lg py-1 px-3">
                                Koli: {product.box_quantity} Adet
                            </Badge>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {product.image_urls?.map((url: string, i: number) => (
                            <div key={i} className="relative aspect-square bg-slate-900 rounded-lg border border-slate-800 overflow-hidden cursor-pointer hover:border-blue-500">
                                <Image src={url} alt={`${product.name} - ${i + 1}`} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-blue-400 font-bold text-lg">{product.product_code}</span>
                            <Badge variant="outline" className="border-slate-700 text-slate-400">Toptan Satış</Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{product.name}</h1>
                        {product.price_usd && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-green-400">${product.price_usd.toFixed(2)}</span>
                                <span className="text-slate-500 text-sm">/ parça (KDV Hariç)</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                WhatsApp ile Sipariş Ver
                            </Button>
                        </a>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Teknik Özellikler</h3>
                        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                            <Table>
                                <TableBody>
                                    {product.barcode && (
                                        <TableRow className="border-slate-800">
                                            <TableCell className="font-medium text-slate-400">Barkod (EAN)</TableCell>
                                            <TableCell className="text-white font-mono">{product.barcode}</TableCell>
                                        </TableRow>
                                    )}
                                    {Object.entries(product.specs || {}).map(([key, value]) => (
                                        <TableRow key={key} className="border-slate-800">
                                            <TableCell className="font-medium text-slate-400">{key}</TableCell>
                                            <TableCell className="text-white">{(value as string)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
