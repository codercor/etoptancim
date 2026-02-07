'use client'

import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { useCurrencyStore } from '@/store/currencyStore'
import { Loader2 } from 'lucide-react'

export function ExchangeRateDisplay() {
    const { exchangeRate, lastUpdated, fetchExchangeRate } = useCurrencyStore()

    useEffect(() => {
        // Fetch exchange rate on mount
        fetchExchangeRate()

        // Refresh every 30 minutes while app is open
        const interval = setInterval(() => {
            fetchExchangeRate()
        }, 30 * 60 * 1000)

        return () => clearInterval(interval)
    }, [fetchExchangeRate])

    // Check if rate is stale (> 24 hours)
    const isStale = lastUpdated
        ? new Date().getTime() - new Date(lastUpdated).getTime() > 24 * 60 * 60 * 1000
        : false

    if (!exchangeRate) {
        return (
            <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Yükleniyor...
            </Badge>
        )
    }

    return (
        <Badge
            variant="outline"
            className={`text-xs ${isStale
                    ? 'border-yellow-600 text-yellow-400'
                    : 'border-green-600 text-green-400'
                }`}
            title={lastUpdated ? `Son güncelleme: ${new Date(lastUpdated).toLocaleString('tr-TR')}` : undefined}
        >
            1 $ = {exchangeRate.toFixed(2)} ₺
        </Badge>
    )
}
