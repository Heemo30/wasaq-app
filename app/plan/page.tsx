'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertOctagon, AlertTriangle, CheckCircle2,
  ShieldCheck, CreditCard, Bell, RefreshCw,
} from 'lucide-react'
import MobileFrame from '@/components/MobileFrame'
import WasaqHeader from '@/components/WasaqHeader'
import { loadProfile, resetProfile, isAuthenticated } from '@/lib/storage'
import { calculateWasaq } from '@/lib/engine'
import { EMERGENCY_PLAN, WARNING_PLAN } from '@/lib/messages'
import { CustomerProfile, WasaqResult, WasaqStatus } from '@/lib/types'

const STATUS_CONFIG: Record<WasaqStatus, {
  title: string; subtitle: string; steps: string[]
  headerBg: string; titleColor: string; stepBg: string
  stepNumClass: string; icon: ReactNode
}> = {
  'خطر': {
    title:        'خطة طوارئ حتى الراتب',
    subtitle:     'وسق يرصد ضغطاً مالياً شديداً — تصرف فوراً',
    steps:        EMERGENCY_PLAN,
    headerBg:     'bg-red-50 border-red-100',
    titleColor:   'text-wasaq-danger',
    stepBg:       'bg-red-50 border-red-100',
    stepNumClass: 'bg-wasaq-danger text-white',
    icon:         <AlertOctagon size={30} className="text-wasaq-danger" />,
  },
  'انتبه': {
    title:        'خطة الأسبوع القادم',
    subtitle:     'تصرف بحذر للوصول إلى الراتب بأمان',
    steps:        WARNING_PLAN,
    headerBg:     'bg-amber-50 border-amber-100',
    titleColor:   'text-wasaq-warning',
    stepBg:       'bg-amber-50 border-amber-100',
    stepNumClass: 'bg-wasaq-warning text-white',
    icon:         <AlertTriangle size={30} className="text-wasaq-warning" />,
  },
  'آمن': {
    title:        'وضعك المالي جيد',
    subtitle:     'استمر بنفس الوتيرة حتى موعد الراتب',
    steps:        WARNING_PLAN,
    headerBg:     'bg-green-50 border-green-100',
    titleColor:   'text-wasaq-safe',
    stepBg:       'bg-green-50 border-green-100',
    stepNumClass: 'bg-wasaq-safe text-white',
    icon:         <CheckCircle2 size={30} className="text-wasaq-safe" />,
  },
}

export default function PlanPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [wasaq,   setWasaq]   = useState<WasaqResult | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/'); return }
    const p = loadProfile()
    setProfile(p)
    setWasaq(calculateWasaq(p))
  }, [router])

  function handleResetDemo() {
    resetProfile()
    window.location.href = '/home'
  }

  if (!profile || !wasaq) {
    return (
      <MobileFrame>
        <div className="flex-1 flex items-center justify-center bg-app-bg">
          <div className="w-8 h-8 border-2 border-wasaq-primary/30 border-t-wasaq-primary rounded-full animate-spin" />
        </div>
      </MobileFrame>
    )
  }

  const cfg    = STATUS_CONFIG[wasaq.status]
  const unread = profile.alerts.filter(a => !a.read).length

  return (
    <MobileFrame>
      <div className="flex flex-col flex-1 overflow-hidden">
        <WasaqHeader
          title="خطة وسق"
          subtitle={cfg.title}
          backHref="/wasaq"
          unreadAlerts={unread}
          showBrand
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-4 py-4 pb-6">

            {/* Header card */}
            <div className={`mx-4 rounded-3xl p-5 border ${cfg.headerBg}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center shrink-0">
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-app-muted text-xs mb-0.5">خطة وسق</p>
                  <h1 className={`font-black text-lg leading-tight ${cfg.titleColor}`}>
                    {cfg.title}
                  </h1>
                  <p className="text-app-muted text-xs mt-1 leading-relaxed">{cfg.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-black/8">
                <MiniStat
                  label="نقاط وسق"
                  value={String(wasaq.score)}
                  unit="/100"
                  color={cfg.titleColor}
                />
                <MiniStat
                  label="صرف يومي"
                  value={wasaq.isOverLimit ? '---' : String(Math.round(wasaq.safeDailySpend))}
                  unit={wasaq.isOverLimit ? 'تجاوز' : 'ريال'}
                  color={cfg.titleColor}
                />
                <MiniStat
                  label="حتى الراتب"
                  value={String(profile.daysUntilSalary)}
                  unit="يوم"
                  color={cfg.titleColor}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="mx-4 bg-app-card rounded-3xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-wasaq-primary" />
                <p className="text-app-text font-bold text-sm">الخطوات الموصى بها</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {cfg.steps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-2xl p-3.5 border ${cfg.stepBg}`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${cfg.stepNumClass}`}>
                      {i + 1}
                    </div>
                    <p className="text-app-text text-sm leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-links */}
            <div className="px-4 flex flex-col gap-2">
              <Link
                href="/simulator"
                className="flex items-center justify-between bg-app-card rounded-2xl px-4 py-3.5 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-wasaq-soft flex items-center justify-center">
                    <CreditCard size={16} className="text-wasaq-primary" />
                  </div>
                  <div>
                    <p className="text-app-text font-semibold text-sm">محاكاة عملية دفع</p>
                    <p className="text-app-muted text-[10px]">اعرف أثر العملية قبل تنفيذها</p>
                  </div>
                </div>
                <span className="text-app-muted text-lg">‹</span>
              </Link>

              <Link
                href="/alerts"
                className="flex items-center justify-between bg-app-card rounded-2xl px-4 py-3.5 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-wasaq-soft flex items-center justify-center">
                    <Bell size={16} className="text-wasaq-primary" />
                  </div>
                  <div>
                    <p className="text-app-text font-semibold text-sm">عرض التنبيهات</p>
                    <p className="text-app-muted text-[10px]">آخر تنبيهات وسق</p>
                  </div>
                </div>
                <span className="text-app-muted text-lg">‹</span>
              </Link>
            </div>

            {/* Reset demo */}
            <div className="mx-4">
              <button
                onClick={handleResetDemo}
                className="w-full py-3.5 rounded-2xl border border-dashed border-gray-300 text-app-muted text-sm font-medium flex items-center justify-center gap-2 active:bg-gray-50 transition-colors"
              >
                <RefreshCw size={15} />
                إعادة ضبط الديمو
              </button>
              <p className="text-center text-app-muted text-[10px] mt-1.5">
                يعيد بيانات خالد الأصلية ويوجهك للرئيسية
              </p>
            </div>

          </div>
        </div>
      </div>
    </MobileFrame>
  )
}

function MiniStat({ label, value, unit, color }: {
  label: string; value: string; unit: string; color: string
}) {
  return (
    <div className="text-center">
      <p className="text-app-muted text-[10px] mb-0.5">{label}</p>
      <p className={`font-black text-xl leading-tight num-en ${color}`}>{value}</p>
      <p className="text-app-muted text-[10px]">{unit}</p>
    </div>
  )
}
