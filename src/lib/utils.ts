import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function translateStatus(status: string) {
  switch (status) {
    case 'pending':
      return 'Sipariş Alındı'
    case 'payment_received':
      return 'Ödeme Alındı'
    case 'prepared':
      return 'Hazırlanıyor'
    case 'shipped':
      return 'Kargolandı'
    case 'delivered':
      return 'Teslim Edildi'
    case 'completed':
      return 'Tamamlandı'
    case 'cancelled':
      return 'İptal Edildi'
    default:
      return status
  }
}
