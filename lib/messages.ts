import { WasaqStatus } from './types'

export function getStatusMessage(status: WasaqStatus): string {
  const map: Record<WasaqStatus, string> = {
    'آمن':   'وضعك المالي جيد حتى الراتب، استمر بحكمة',
    'انتبه': 'انتبه للمصاريف — لديك التزامات قادمة قريباً',
    'خطر':   'ضغط مالي شديد — تجنب أي صرف إضافي حتى الراتب',
  }
  return map[status]
}

export function getStatusColor(status: WasaqStatus): string {
  const map: Record<WasaqStatus, string> = {
    'آمن':   'text-wasaq-safe',
    'انتبه': 'text-wasaq-warning',
    'خطر':   'text-wasaq-danger',
  }
  return map[status]
}

export function getStatusBg(status: WasaqStatus): string {
  const map: Record<WasaqStatus, string> = {
    'آمن':   'bg-green-50 text-wasaq-safe border-green-200',
    'انتبه': 'bg-amber-50 text-wasaq-warning border-amber-200',
    'خطر':   'bg-red-50 text-wasaq-danger border-red-200',
  }
  return map[status]
}

export function getAlertAfterPayment(amount: number, safeDailySpend: number, isOverLimit: boolean): string {
  const spendText = isOverLimit
    ? 'تجاوزت حد الصرف الآمن'
    : `${Math.round(safeDailySpend)} ريال يومياً`
  return `تمت عملية ${amount.toLocaleString('en')} ريال. صرفك الآمن الآن ${spendText} حتى الراتب.`
}

export const EMERGENCY_PLAN = [
  'أوقف التسوق غير الضروري فوراً',
  'تجنب أي عملية كبيرة حتى موعد الراتب',
  'راجع اشتراكاتك المتكررة وأوقف غير الضروري',
  'استخدم ما تبقى للمصاريف الأساسية فقط',
  'تابع تنبيهات وسق يومياً حتى الراتب',
]

export const WARNING_PLAN = [
  'لا تتجاوز الصرف الآمن اليومي الموصى به',
  'خفف مصاريف المطاعم والكافيهات هذا الأسبوع',
  'راجع اشتراكاتك وقيّم ما يمكن إيقافه',
  'افحص أثر أي عملية كبيرة قبل تنفيذها',
]

export const SOURCE_LABELS: Record<string, string> = {
  auto:      'مكتشف تلقائياً',
  recurring: 'اشتراك متكرر',
  deferred:  'شراء آجل',
  manual:    'مضاف يدوياً',
}
