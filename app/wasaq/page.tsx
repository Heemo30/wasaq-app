'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { List, CreditCard } from 'lucide-react'
import MobileFrame from '@/components/MobileFrame'
import WasaqHeader from '@/components/WasaqHeader'
import WasaqScore from '@/components/WasaqScore'
import { loadProfile, isAuthenticated } from '@/lib/storage'
import { calculateWasaq } from '@/lib/engine'
import { CustomerProfile, WasaqResult } from '@/lib/types'

export default function WasaqPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [wasaq, setWasaq]     = useState<WasaqResult | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/'); return }
    const p = loadProfile()
    setProfile(p)
    setWasaq(calculateWasaq(p))
  }, [router])

  if (!profile || !wasaq) {
    return (
      <MobileFrame>
        <div className="flex-1 flex items-center justify-center bg-app-bg">
          <div className="w-8 h-8 border-2 border-wasaq-primary/30 border-t-wasaq-primary rounded-full animate-spin" />
        </div>
      </MobileFrame>
    )
  }

  const safeAmountDisplay = wasaq.isOverLimit
    ? `- ${Math.abs(Math.round(wasaq.safeAmount)).toLocaleString('en')} ريال`
    : `${Math.round(wasaq.safeAmount).toLocaleString('en')} ريال`

  const unread = profile.alerts.filter(a => !a.read).length

  return (
    <MobileFrame>
      <div className="flex flex-col flex-1 overflow-hidden">
        <WasaqHeader
          title="وسق"
          subtitle="محرك الإنفاق الآمن"
          backHref="/home"
          unreadAlerts={unread}
          showBrand
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-4 py-4 pb-6">

            {/* Score card */}
            <WasaqScore result={wasaq} daysUntilSalary={profile.daysUntilSalary} />

            {/* Stats grid */}
            <div className="px-4 grid grid-cols-2 gap-3">
              <StatCard
                label="إجمالي الالتزامات"
                value={`${wasaq.commitmentsTotal.toLocaleString('en')} ريال`}
                sub={`${profile.commitments.length} التزامات`}
                accent="text-wasaq-danger"
              />
              <StatCard
                label="هامش الأمان"
                value={`${Math.round(wasaq.safetyBuffer).toLocaleString('en')} ريال`}
                sub="احتياطي طوارئ"
                accent="text-wasaq-warning"
              />
              <StatCard
                label="الأيام حتى الراتب"
                value={`${profile.daysUntilSalary} يوم`}
                sub={`راتب ${profile.salary.toLocaleString('en')} ريال`}
                accent="text-bank-primary"
              />
              <StatCard
                label="الرصيد الحالي"
                value={`${profile.currentBalance.toLocaleString('en')} ريال`}
                sub="ليس كله قابل للصرف"
                accent="text-app-text"
              />
            </div>

            {/* Calculation breakdown */}
            <div className="mx-4 bg-app-card rounded-3xl p-4">
              <p className="text-app-text font-bold text-sm mb-3">كيف حسب وسق صرفك الآمن؟</p>

              <div className="flex flex-col gap-2 text-sm">
                <BreakdownRow
                  label="الرصيد الحالي"
                  value={`${profile.currentBalance.toLocaleString('en')} ريال`}
                  color="text-app-text"
                />
                <BreakdownRow
                  label="الالتزامات القادمة"
                  value={`- ${wasaq.commitmentsTotal.toLocaleString('en')} ريال`}
                  color="text-wasaq-danger"
                />
                <BreakdownRow
                  label="هامش الأمان"
                  value={`- ${Math.round(wasaq.safetyBuffer).toLocaleString('en')} ريال`}
                  color="text-wasaq-warning"
                />

                <div className="border-t border-gray-100 pt-2 mt-1">
                  <BreakdownRow
                    label="المبلغ الآمن الإجمالي"
                    value={safeAmountDisplay}
                    color={wasaq.isOverLimit ? 'text-wasaq-danger font-bold' : 'text-wasaq-primary font-bold'}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-app-muted mt-1">
                  <span>÷ {profile.daysUntilSalary} يوماً</span>
                  <span className="text-app-muted">الأيام المتبقية</span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-2 mt-1">
                  <BreakdownRow
                    label="صرفك الآمن اليومي"
                    value={wasaq.isOverLimit ? 'تجاوزت الحد' : `${Math.round(wasaq.safeDailySpend).toLocaleString('en')} ريال/يوم`}
                    color={wasaq.isOverLimit ? 'text-wasaq-danger font-black' : 'text-wasaq-primary font-black'}
                  />
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="mx-4 bg-wasaq-soft rounded-3xl p-4">
              <p className="text-wasaq-dark font-bold text-sm mb-2">
                لماذا رصيدك لا يعكس قدرتك الفعلية على الصرف؟
              </p>
              <p className="text-wasaq-dark/70 text-xs leading-relaxed">
                رصيدك الظاهر يشمل مبالغ ستخرج قريباً لأقساط واشتراكات وفواتير. وسق يطرح كل هذه الالتزامات
                ويحتفظ بهامش أمان، ثم يحسب ما يمكنك صرفه فعلاً كل يوم حتى الراتب — لا أكثر ولا أقل.
              </p>
            </div>

            {/* Navigation links */}
            <div className="mx-4 flex flex-col gap-2">
              <Link
                href="/commitments"
                className="flex items-center justify-between bg-app-card rounded-2xl px-4 py-3.5 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-wasaq-soft flex items-center justify-center">
                    <List size={16} className="text-wasaq-primary" />
                  </div>
                  <div>
                    <p className="text-app-text font-semibold text-sm">الالتزامات</p>
                    <p className="text-app-muted text-xs">{profile.commitments.length} التزامات مسجلة</p>
                  </div>
                </div>
                <span className="text-app-muted text-lg">‹</span>
              </Link>

              <Link
                href="/simulator"
                className="flex items-center justify-between bg-app-card rounded-2xl px-4 py-3.5 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-wasaq-soft flex items-center justify-center">
                    <CreditCard size={16} className="text-wasaq-primary" />
                  </div>
                  <div>
                    <p className="text-app-text font-semibold text-sm">محاكي الدفع</p>
                    <p className="text-app-muted text-xs">اعرف الأثر قبل تنفيذ أي عملية</p>
                  </div>
                </div>
                <span className="text-app-muted text-lg">‹</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </MobileFrame>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="bg-app-card rounded-2xl p-3.5">
      <p className="text-app-muted text-[10px] mb-1">{label}</p>
      <p className={`font-bold text-base num-en leading-tight ${accent}`}>{value}</p>
      <p className="text-app-muted text-[10px] mt-0.5">{sub}</p>
    </div>
  )
}

function BreakdownRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-app-muted text-xs">{label}</span>
      <span className={`text-xs num-en ${color}`}>{value}</span>
    </div>
  )
}
