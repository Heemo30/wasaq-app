import { WasaqResult } from './types'

export function formatSAR(amount: number): string {
  return `${Math.abs(Math.round(amount)).toLocaleString('en')} ريال`
}

export function formatSafeDailySpend(result: WasaqResult): string {
  if (result.isOverLimit) return 'تجاوزت حد الصرف الآمن'
  return `${Math.round(result.safeDailySpend).toLocaleString('en')} ريال / يوم`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  return `منذ ${diffDays} أيام`
}
