"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Pencil, Trash2 } from "lucide-react"

interface Category {
    id: string
    name: string
    slug: string
    image_url: string | null
}

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
    const [categories, setCategories] = useState<Category[]>(initialCategories)
    const [isOpen, setIsOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
    }

    const handleNameChange = (value: string) => {
        setName(value)
        if (!editingCategory) {
            setSlug(generateSlug(value))
        }
    }

    const resetForm = () => {
        setName("")
        setSlug("")
        setImageUrl("")
        setEditingCategory(null)
    }

    const openEditDialog = (category: Category) => {
        setEditingCategory(category)
        setName(category.name)
        setSlug(category.slug)
        setImageUrl(category.image_url || "")
        setIsOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const categoryData = {
            name,
            slug,
            image_url: imageUrl || null,
        }

        if (editingCategory) {
            const { error } = await supabase
                .from("categories")
                .update(categoryData)
                .eq("id", editingCategory.id)

            if (!error) {
                setCategories(categories.map(c =>
                    c.id === editingCategory.id ? { ...c, ...categoryData } : c
                ))
            }
        } else {
            const { data, error } = await supabase
                .from("categories")
                .insert(categoryData)
                .select()
                .single()

            if (!error && data) {
                setCategories([...categories, data])
            }
        }

        setLoading(false)
        setIsOpen(false)
        resetForm()
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) return

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", id)

        if (!error) {
            setCategories(categories.filter(c => c.id !== id))
            router.refresh()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pt-8 lg:pt-0">
                <div>
                    <h1 className="text-3xl font-bold text-white">Kategoriler</h1>
                    <p className="text-slate-400 mt-2">Ürün kategorilerinizi yönetin</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Kategori
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Kategori Adı</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Ev Şarj Aleti"
                                    required
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="ev-sarj-aleti"
                                    required
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Görsel URL (Opsiyonel)</Label>
                                <Input
                                    id="image"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://..."
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

            <div className="rounded-lg border border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                            <TableHead className="text-slate-400">Ad</TableHead>
                            <TableHead className="text-slate-400">Slug</TableHead>
                            <TableHead className="text-slate-400 text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow className="border-slate-800">
                                <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                                    Henüz kategori eklenmemiş
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id} className="border-slate-800 hover:bg-slate-900">
                                    <TableCell className="font-medium text-white">{category.name}</TableCell>
                                    <TableCell className="text-slate-400">{category.slug}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(category)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(category.id)}
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
