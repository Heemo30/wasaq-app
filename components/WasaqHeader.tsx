'use client'

import { ChevronRight, Bell, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface WasaqHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  unreadAlerts?: number
  showBrand?: boolean
}

export default function WasaqHeader({
  title,
  subtitle,
  backHref = '/home',
  unreadAlerts = 0,
  showBrand = false,
}: WasaqHeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-white border-b border-gray-100 shrink-0">
      <div className="h-0.5 bg-gradient-to-l from-wasaq-primary to-wasaq-primary/30" />

      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => router.push(backHref)}
          className="w-9 h-9 rounded-2xl bg-app-bg flex items-center justify-center text-app-text shrink-0 active:scale-95 transition-transform"
          aria-label="رجوع"
        >
          <ChevronRight size={20} strokeWidth={2.2} />
        </button>

        <div className="flex-1 min-w-0">
          {showBrand && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <ShieldCheck size={13} className="text-wasaq-primary shrink-0" />
              <span className="text-wasaq-primary text-[10px] font-bold tracking-wide">وسق</span>
            </div>
          )}
          <h1 className="text-app-text font-bold text-base leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-app-muted text-[11px] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        <Link
          href="/alerts"
          className="relative w-9 h-9 rounded-2xl bg-app-bg flex items-center justify-center shrink-0"
        >
          <Bell size={18} className="text-app-muted" />
          {unreadAlerts > 0 && (
            <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-wasaq-danger rounded-full flex items-center justify-center text-white text-[9px] font-bold">
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
