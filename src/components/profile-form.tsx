"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFormStatus } from "react-dom"
import { updateProfile } from "@/lib/profile-actions"
import { useState } from "react"
import { toast } from "sonner" // Assuming sonner is used, or alert

interface ProfileFormProps {
    initialData: {
        company_name?: string
        contact_name?: string
        phone?: string
        address?: string
    }
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button disabled={pending} type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            {pending ? "Güncelleniyor..." : "Bilgileri Güncelle"}
        </Button>
    )
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [message, setMessage] = useState<string | null>(null)

    async function clientAction(formData: FormData) {
        const result = await updateProfile(formData)
        if (result.error) {
            setMessage(result.error)
            // toast.error(result.error)
        } else {
            setMessage(result.success || "Başarılı!")
            // toast.success(result.success)
        }
    }

    return (
        <form action={clientAction} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Firma Adı</label>
                <Input
                    name="company_name"
                    defaultValue={initialData.company_name}
                    className="bg-slate-900 border-slate-700 text-white"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Yetkili Kişi</label>
                <Input
                    name="contact_name"
                    defaultValue={initialData.contact_name}
                    className="bg-slate-900 border-slate-700 text-white"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Telefon (Değiştirilemez)</label>
                <Input
                    name="phone"
                    defaultValue={initialData.phone}
                    disabled
                    className="bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Adres</label>
                <textarea
                    name="address"
                    defaultValue={initialData.address}
                    rows={4}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            {message && (
                <div className={`p-3 rounded text-sm ${message.includes("hata") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                    {message}
                </div>
            )}

            <SubmitButton />
        </form>
    )
}
