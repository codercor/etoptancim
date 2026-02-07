'use client'

import { Button } from '@/components/ui/button'
import { useCurrencyStore } from '@/store/currencyStore'

export function CurrencySelector() {
    const { selectedCurrency, setCurrency } = useCurrencyStore()

    const toggleCurrency = () => {
        setCurrency(selectedCurrency === 'TRY' ? 'USD' : 'TRY')
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleCurrency}
            className="text-white hover:text-blue-400 hover:bg-slate-800 transition-colors"
            title="Para birimini değiştir"
        >
            {selectedCurrency === 'TRY' ? (
                <>
                    <span className="font-semibold">₺</span>
                    <span className="ml-1">TRY</span>
                </>
            ) : (
                <>
                    <span className="font-semibold">$</span>
                    <span className="ml-1">USD</span>
                </>
            )}
        </Button>
    )
}
