'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency } from '@/types/currency'
import { convertAndFormat, usdToTry } from '@/lib/currency/converter'

interface CurrencyState {
    selectedCurrency: Currency
    exchangeRate: number
    lastUpdated: string | null

    // Actions
    setCurrency: (currency: Currency) => void
    setExchangeRate: (rate: number, updatedAt: string) => void
    fetchExchangeRate: () => Promise<void>
    convertPrice: (usdPrice: number) => number
    formatPrice: (usdPrice: number) => string
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            selectedCurrency: 'TRY', // Default to TRY as required
            exchangeRate: 34.50, // Default fallback rate
            lastUpdated: null,

            setCurrency: (currency: Currency) => {
                set({ selectedCurrency: currency })
            },

            setExchangeRate: (rate: number, updatedAt: string) => {
                set({ exchangeRate: rate, lastUpdated: updatedAt })
            },

            fetchExchangeRate: async () => {
                try {
                    const response = await fetch('/api/currency/current')

                    if (!response.ok) {
                        console.error('Failed to fetch exchange rate')
                        return
                    }

                    const data = await response.json()

                    if (data.rate) {
                        set({
                            exchangeRate: data.rate,
                            lastUpdated: data.updatedAt
                        })
                    }
                } catch (error) {
                    console.error('Error fetching exchange rate:', error)
                    // Keep using the existing fallback rate
                }
            },

            convertPrice: (usdPrice: number): number => {
                const { selectedCurrency, exchangeRate } = get()

                if (selectedCurrency === 'USD') {
                    return usdPrice
                }

                return usdToTry(usdPrice, exchangeRate)
            },

            formatPrice: (usdPrice: number): string => {
                const { selectedCurrency, exchangeRate } = get()
                return convertAndFormat(usdPrice, selectedCurrency, exchangeRate)
            }
        }),
        {
            name: 'currency-storage', // localStorage key
            partialize: (state) => ({
                selectedCurrency: state.selectedCurrency, // Only persist currency selection
            }),
        }
    )
)
