export type Currency = 'USD' | 'TRY'

export interface ExchangeRate {
    id: string
    base_currency: string
    target_currency: string
    rate: number
    fetched_at: string
    is_active: boolean
    created_at: string
}

export interface CurrencyConversionOptions {
    from: Currency
    to: Currency
    amount: number
}

export interface CurrencyFormatOptions {
    currency: Currency
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
}
