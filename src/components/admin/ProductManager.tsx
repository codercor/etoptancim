"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, X, Copy, Check, Upload, Loader2 } from "lucide-react"

interface Category {
    id: string
    name: string
}

interface Product {
    id: string
    category_id: string
    product_code: string
    name: string
    price_usd: number | null
    box_quantity: number | null
    specs: Record<string, string>
    barcode: string | null
    image_urls: string[] | null
    is_active: boolean
    categories?: Category
}

interface ProductManagerProps {
    initialProducts: Product[]
    categories: Category[]
}

export function ProductManager({ initialProducts, categories }: ProductManagerProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [isOpen, setIsOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)
    const [filterCategory, setFilterCategory] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState("")

    // Form state
    const [formData, setFormData] = useState({
        category_id: "",
        product_code: "",
        name: "",
        price_usd: "",
        box_quantity: "",
        barcode: "",
        image_urls: "",
    })
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])

    const router = useRouter()
    const supabase = createClient()

    const resetForm = () => {
        setFormData({
            category_id: "",
            product_code: "",
            name: "",
            price_usd: "",
            box_quantity: "",
            barcode: "",
            image_urls: "",
        })
        setSpecs([])
        setEditingProduct(null)
    }

    const openEditDialog = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            category_id: product.category_id,
            product_code: product.product_code,
            name: product.name,
            price_usd: product.price_usd?.toString() || "",
            box_quantity: product.box_quantity?.toString() || "",
            barcode: product.barcode || "",
            image_urls: product.image_urls?.join("\n") || "",
        })
        setSpecs(
            Object.entries(product.specs || {}).map(([key, value]) => ({ key, value }))
        )
        setIsOpen(true)
    }

    const addSpec = () => {
        setSpecs([...specs, { key: "", value: "" }])
    }

    const removeSpec = (index: number) => {
        setSpecs(specs.filter((_, i) => i !== index))
    }

    const updateSpec = (index: number, field: "key" | "value", value: string) => {
        const newSpecs = [...specs]
        newSpecs[index][field] = value
        setSpecs(newSpecs)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        setUploading(true)
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('catalog-images')
            .upload(filePath, file)

        if (uploadError) {
            alert('Görsel yüklenirken hata oluştu: ' + uploadError.message)
            setUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('catalog-images')
            .getPublicUrl(filePath)

        const currentUrls = formData.image_urls ? formData.image_urls.split('\n') : []
        const newUrls = [...currentUrls, publicUrl].filter(url => url.trim()).join('\n')

        setFormData({ ...formData, image_urls: newUrls })
        setUploading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const specsObj = specs.reduce((acc, { key, value }) => {
            if (key.trim()) acc[key.trim()] = value.trim()
            return acc
        }, {} as Record<string, string>)

        const productData = {
            category_id: formData.category_id,
            product_code: formData.product_code,
            name: formData.name,
            price_usd: parseFloat(formData.price_usd) || null,
            box_quantity: parseInt(formData.box_quantity) || null,
            barcode: formData.barcode || null,
            image_urls: formData.image_urls.split("\n").filter(url => url.trim()),
            specs: specsObj,
            is_active: true,
        }

        if (editingProduct) {
            const { error } = await supabase
                .from("products")
                .update(productData)
                .eq("id", editingProduct.id)

            if (!error) {
                setProducts(products.map(p =>
                    p.id === editingProduct.id ? { ...p, ...productData } : p
                ))
            }
        } else {
            const { data, error } = await supabase
                .from("products")
                .insert(productData)
                .select("*, categories(name)")
                .single()

            if (!error && data) {
                setProducts([...products, data])
            }
        }

        setLoading(false)
        setIsOpen(false)
        resetForm()
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return

        const { error } = await supabase.from("products").delete().eq("id", id)

        if (!error) {
            setProducts(products.filter(p => p.id !== id))
            router.refresh()
        }
    }

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedCode(text)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const filteredProducts = products.filter(p => {
        const matchesCategory = filterCategory === "all" || p.category_id === filterCategory
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.product_code.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-8 lg:pt-0">
                <div>
                    <h1 className="text-3xl font-bold text-white">Ürünler</h1>
                    <p className="text-slate-400 mt-2">Katalog ürünlerinizi yönetin</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Ürün
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                    >
                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                            <SelectValue placeholder="Kategori seçin" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Ürün Kodu (SKU)</Label>
                                    <Input
                                        id="code"
                                        value={formData.product_code}
                                        onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                                        placeholder="S-130"
                                        required
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Ürün Adı</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="120W Super Charge Adaptör"
                                    required
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Fiyat (USD)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price_usd}
                                        onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                                        placeholder="10.50"
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="box">Koli Adeti</Label>
                                    <Input
                                        id="box"
                                        type="number"
                                        value={formData.box_quantity}
                                        onChange={(e) => setFormData({ ...formData, box_quantity: e.target.value })}
                                        placeholder="90"
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Barkod</Label>
                                    <Input
                                        id="barcode"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        placeholder="8699261146255"
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Teknik Özellikler</Label>
                                    <Button type="button" variant="ghost" size="sm" onClick={addSpec}>
                                        <Plus className="h-4 w-4 mr-1" /> Ekle
                                    </Button>
                                </div>
                                {specs.map((spec, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Özellik (örn: Watt)"
                                            value={spec.key}
                                            onChange={(e) => updateSpec(index, "key", e.target.value)}
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                        <Input
                                            placeholder="Değer (örn: 120W)"
                                            value={spec.value}
                                            onChange={(e) => updateSpec(index, "value", e.target.value)}
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image-upload">Görsel Yükle</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                                </div>
                                <p className="text-xs text-slate-500">
                                    Yüklenen görsel URL'si otomatik olarak aşağıya eklenecektir.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="images">Görsel URL'leri (manuel düzenlenebilir)</Label>
                                <Textarea
                                    id="images"
                                    value={formData.image_urls}
                                    onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
                                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                    rows={3}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => { setIsOpen(false); resetForm(); }}>
                                    İptal
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                    {loading ? "Kaydediliyor..." : "Kaydet"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="Ürün adı veya kodu ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-900 border-slate-800 max-w-sm text-white"
                />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 w-48 text-white">
                        <SelectValue placeholder="Kategori filtrele" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="all">Tüm Kategoriler</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-slate-800 overflow-hidden overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                            <TableHead className="text-slate-400">Kod</TableHead>
                            <TableHead className="text-slate-400">Ürün Adı</TableHead>
                            <TableHead className="text-slate-400">Kategori</TableHead>
                            <TableHead className="text-slate-400">Fiyat</TableHead>
                            <TableHead className="text-slate-400">Koli Adeti</TableHead>
                            <TableHead className="text-slate-400 text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow className="border-slate-800">
                                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                                    Ürün bulunamadı
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id} className="border-slate-800 hover:bg-slate-900">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-medium text-blue-400">
                                                {product.product_code}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(product.product_code)}
                                            >
                                                {copiedCode === product.product_code ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 text-slate-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">{product.name}</TableCell>
                                    <TableCell className="text-slate-400">
                                        {product.categories?.name || "-"}
                                    </TableCell>
                                    <TableCell className="text-green-400">
                                        ${product.price_usd?.toFixed(2) || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                            {product.box_quantity || "-"} adet
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(product)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(product.id)}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
