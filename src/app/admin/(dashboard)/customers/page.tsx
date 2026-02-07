import { createClient } from "@/lib/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CreateCustomerForm } from "@/components/admin/CreateCustomerForm"

export default async function AdminCustomersPage() {
    const supabase = await createClient()

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer")
        .order("created_at", { ascending: false })

    if (error) {
        console.error(error)
        return <div className="text-white">Error loading customers</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Müşteri Yönetimi</h1>
                <CreateCustomerForm />
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900/50">
                            <TableHead className="text-slate-400">Şirket Adı</TableHead>
                            <TableHead className="text-slate-400">Yetkili</TableHead>
                            <TableHead className="text-slate-400">Telefon</TableHead>
                            <TableHead className="text-slate-400">Adres</TableHead>
                            <TableHead className="text-slate-400">Kayıt Tarihi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profiles?.map((profile) => (
                            <TableRow key={profile.id} className="border-slate-800 hover:bg-slate-900/50">
                                <TableCell className="font-medium text-white">{profile.company_name}</TableCell>
                                <TableCell className="text-slate-300">{profile.contact_name}</TableCell>
                                <TableCell className="text-slate-300">{profile.phone}</TableCell>
                                <TableCell className="text-slate-300 truncate max-w-[200px]">{profile.address}</TableCell>
                                <TableCell className="text-slate-400">
                                    {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                                </TableCell>
                            </TableRow>
                        ))}
                        {profiles?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                                    Henüz kayıtlı müşteri bulunmuyor.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
