import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-slate-950">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-bold text-white">
                            Sempaty
                        </Link>
                        <p className="text-slate-400 text-sm">
                            Mobil aksesuar ve elektronik ürünlerde güvenilir toptan tedarikçiniz.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Hızlı Linkler</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Ana Sayfa
                                </Link>
                            </li>
                            <li>
                                <Link href="/urunler" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Tüm Ürünler
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">Kategoriler</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/kategori/ev-sarj-aleti" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Ev Şarj Aleti
                                </Link>
                            </li>
                            <li>
                                <Link href="/kategori/kablo" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Kablolar
                                </Link>
                            </li>
                            <li>
                                <Link href="/kategori/powerbank" className="text-slate-400 hover:text-white text-sm transition-colors">
                                    Powerbank
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold">İletişim</h3>
                        <ul className="space-y-2">
                            <li className="text-slate-400 text-sm">
                                WhatsApp: +90 555 123 45 67
                            </li>
                            <li className="text-slate-400 text-sm">
                                Email: info@sempaty.com
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800">
                    <p className="text-center text-slate-500 text-sm">
                        © 2026 Sempaty. Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        </footer>
    )
}
