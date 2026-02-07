import type { Currency } from '@/types/currency'

/**
 * Convert USD amount to TRY using the provided exchange rate
 */
export function usdToTry(usdAmount: number, rate: number): number {
    return usdAmount * rate
}

/**
 * Convert TRY amount to USD using the provided exchange rate
 */
export function tryToUsd(tryAmount: number, rate: number): number {
    return tryAmount / rate
}

/**
 * Format currency amount with proper symbol and locale
 */
export function formatCurrency(amount: number, currency: Currency): string {
    const locale = currency === 'TRY' ? 'tr-TR' : 'en-US'
    const currencyCode = currency

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

/**
 * Convert and format a USD price to the selected currency
 */
export function convertAndFormat(
    usdPrice: number,
    targetCurrency: Currency,
    exchangeRate: number
): string {
    if (targetCurrency === 'USD') {
        return formatCurrency(usdPrice, 'USD')
    }

    const tryAmount = usdToTry(usdPrice, exchangeRate)
    return formatCurrency(tryAmount, 'TRY')
}

/**
 * Batch convert array of USD prices to TRY
 */
export function convertPrices(usdPrices: number[], rate: number): number[] {
    return usdPrices.map(price => usdToTry(price, rate))
}

/**
 * Validate exchange rate is within reasonable bounds
 */
export function isValidRate(rate: number): boolean {
    // USD/TRY rate should be between 20 and 50 (reasonable bounds as of 2026)
    return rate >= 20 && rate <= 50
}
