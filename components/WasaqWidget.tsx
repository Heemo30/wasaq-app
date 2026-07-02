import Link from 'next/link'
import { ShieldCheck, ChevronLeft, TrendingDown, TrendingUp } from 'lucide-react'
import { WasaqResult } from '@/lib/types'
import { getStatusMessage } from '@/lib/messages'

interface WasaqWidgetProps {
  result: WasaqResult
  daysUntilSalary: number
}

const STATUS_STYLES = {
  'آمن':   { badge: 'bg-green-50 text-wasaq-safe border-green-200',   icon: <TrendingUp  size={12} /> },
  'انتبه': { badge: 'bg-amber-50 text-wasaq-warning border-amber-200', icon: <TrendingDown size={12} /> },
  'خطر':   { badge: 'bg-red-50 text-wasaq-danger border-red-200',      icon: <TrendingDown size={12} /> },
} as const

export default function WasaqWidget({ result, daysUntilSalary }: WasaqWidgetProps) {
  const { status, isOverLimit } = result
  const style = STATUS_STYLES[status]
  const message = getStatusMessage(status)

  return (
    <div className="mx-4">
      <div
        className="bg-app-card rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRight: '3px solid #0F766E' }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-wasaq-soft flex items-center justify-center">
              <ShieldCheck size={14} className="text-wasaq-primary" />
            </div>
            <span className="text-wasaq-primary font-bold text-sm">وسق</span>
            <span className="text-app-muted text-[11px]">— الإنفاق الآمن</span>
          </div>
          <Link
            href="/wasaq"
            className="flex items-center gap-0.5 text-wasaq-primary text-xs font-semibold active:opacity-70 transition-opacity"
          >
            <span>عرض التفاصيل</span>
            <ChevronLeft size={14} />
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-gray-100" />

        {/* Body */}
        <div className="px-4 pb-4 pt-3">
          <div className="flex items-end justify-between">
            {/* Left: value */}
            <div>
              <p className="text-app-muted text-[11px] mb-1">صرفك الآمن اليومي</p>
              {isOverLimit ? (
                <p className="text-wasaq-danger font-black text-xl leading-tight">تجاوزت الحد</p>
              ) : (
                <p className="text-app-text font-black text-2xl leading-tight num-en">
                  {Math.round(result.safeDailySpend).toLocaleString('en')}
                  <span className="text-app-muted font-normal text-sm"> ريال</span>
                </p>
              )}
              <p className="text-app-muted text-[11px] mt-1.5 leading-relaxed">{message}</p>
            </div>

            {/* Right: status + days */}
            <div className="flex flex-col items-end gap-2 shrink-0 mr-1">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                {style.icon}
                {status}
              </span>
              <span className="text-app-muted text-[10px]">
                <span className="font-semibold text-app-text num-en">{daysUntilSalary}</span> يوم للراتب
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
