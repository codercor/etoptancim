"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createCustomer } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Plus } from "lucide-react"

const initialState = {
    message: "",
    error: "",
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700">
            {pending ? "Oluşturuluyor..." : "Müşteri Oluştur"}
        </Button>
    )
}

export function CreateCustomerForm() {
    const [state, formAction] = useFormState(createCustomer, initialState)
    const [open, setOpen] = useState(false)

    // Close dialog on success
    //   if (state?.message && open) {
    //       // This might cause infinite loop if not careful, better to handle in useEffect
    //   }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Müşteri
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Müşteri bilgilerini giriniz. Telefon numarası giriş için kullanılacaktır.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="company_name" className="text-right text-slate-300">
                            Şirket
                        </Label>
                        <Input id="company_name" name="company_name" className="col-span-3 bg-slate-950 border-slate-700 text-white" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact_name" className="text-right text-slate-300">
                            Yetkili
                        </Label>
                        <Input id="contact_name" name="contact_name" className="col-span-3 bg-slate-950 border-slate-700 text-white" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right text-slate-300">
                            Telefon
                        </Label>
                        <Input id="phone" name="phone" type="tel" className="col-span-3 bg-slate-950 border-slate-700 text-white" placeholder="5551234567" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right text-slate-300">
                            Şifre
                        </Label>
                        <Input id="password" name="password" type="password" className="col-span-3 bg-slate-950 border-slate-700 text-white" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right text-slate-300">
                            Adres
                        </Label>
                        <Input id="address" name="address" className="col-span-3 bg-slate-950 border-slate-700 text-white" />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm text-center">{state.error}</p>
                    )}
                    {state?.message && (
                        <p className="text-green-500 text-sm text-center">{state.message}</p>
                    )}

                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
