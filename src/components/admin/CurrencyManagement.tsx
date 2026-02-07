'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, TrendingUp, History, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function CurrencyManagement() {
    const [currentRate, setCurrentRate] = useState<number | null>(null)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchCurrentRate()
    }, [])

    const fetchCurrentRate = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/currency/current')
            if (response.ok) {
                const data = await response.json()
                setCurrentRate(data.rate)
                setLastUpdated(data.updatedAt)
            }
        } catch (error) {
            console.error('Failed to fetch rate:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            const response = await fetch('/api/admin/currency/refresh', {
                method: 'POST',
            })

            if (response.ok) {
                const data = await response.json()
                setCurrentRate(data.rate)
                setLastUpdated(data.timestamp)
                toast.success('Kur başarıyla güncellendi!', {
                    description: `Yeni kur: 1 USD = ${data.rate.toFixed(2)} TRY`
                })
            } else {
                const error = await response.json()
                toast.error('Kur güncellenemedi', {
                    description: error.error || 'Bir hata oluştu'
                })
            }
        } catch (error) {
            console.error('Failed to refresh rate:', error)
            toast.error('Kur güncellenemedi', {
                description: 'Ağ hatası oluştu'
            })
        } finally {
            setRefreshing(false)
        }
    }

    const getTimeUntilNextUpdate = () => {
        const now = new Date()
        const next10AM = new Date()
        next10AM.setHours(10, 0, 0, 0)

        if (now.getHours() >= 10) {
            next10AM.setDate(next10AM.getDate() + 1)
        }

        const diff = next10AM.getTime() - now.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        return `${hours} saat ${minutes} dakika`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Döviz Kuru Yönetimi</h2>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {refreshing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'hidden' : ''}`} />
                    Şimdi Güncelle
                </Button>
            </div>

            {/* Current Rate Card */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        Güncel Kur
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : currentRate ? (
                        <>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-blue-400">
                                    {currentRate.toFixed(2)}
                                </span>
                                <span className="text-xl text-slate-400">TRY</span>
                                <span className="text-sm text-slate-500 ml-2">/ 1 USD</span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Son Güncelleme:</span>
                                <span className="text-white">
                                    {lastUpdated
                                        ? new Date(lastUpdated).toLocaleString('tr-TR')
                                        : 'Bilinmiyor'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Sonraki Otomatik Güncelleme:</span>
                                <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                                    {getTimeUntilNextUpdate()} sonra (10:00)
                                </Badge>
                            </div>

                            <div className="p-3 bg-blue-950/20 border border-blue-900/50 rounded-lg">
                                <p className="text-xs text-slate-300">
                                    <strong>Not:</strong> Kur otomatik olarak her gün saat 10:00'da güncellenir.
                                    Acil durumlarda "Şimdi Güncelle" butonunu kullanabilirsiniz.
                                </p>
                            </div>
                        </>
                    ) : (
                        <p className="text-slate-400 text-center py-8">
                            Kur bilgisi yüklenemedi
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-400" />
                        Kur Sistemi Bilgileri
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">✓</span>
                        <div>
                            <p className="text-white font-medium">Otomatik Güncellemeler</p>
                            <p className="text-slate-400">Her gün saat 10:00'da (UTC+3) Currency API'den güncellenir</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">✓</span>
                        <div>
                            <p className="text-white font-medium">Manuel Güncelleme</p>
                            <p className="text-slate-400">Admin panelinden istediğiniz zaman kuru yenileyebilirsiniz</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">✓</span>
                        <div>
                            <p className="text-white font-medium">Müşteri Deneyimi</p>
                            <p className="text-slate-400">Müşteriler fiyatları TRY veya USD olarak görebilir</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-green-500 font-bold">✓</span>
                        <div>
                            <p className="text-white font-medium">Veri Kaynağı</p>
                            <p className="text-slate-400">Currency API (ücretsiz servis) kullanılmaktadır</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
