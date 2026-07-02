'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck, CheckCircle2, RefreshCw, ClipboardList } from 'lucide-react'
import MobileFrame from '@/components/MobileFrame'
import WasaqHeader from '@/components/WasaqHeader'
import { loadProfile, saveProfile, resetProfile, isAuthenticated } from '@/lib/storage'
import { calculateWasaq } from '@/lib/engine'
import { getStatusBg } from '@/lib/messages'
import { CustomerProfile, WasaqResult, WasaqStatus } from '@/lib/types'

interface ImpactResult {
  balanceBefore: number
  balanceAfter:  number
  scoreBefore:   number
  scoreAfter:    number
  statusBefore:  WasaqStatus
  statusAfter:   WasaqStatus
  dailyBefore:   number
  dailyAfter:    number
  isOverAfter:   boolean
}

type PaymentState = 'idle' | 'processing' | 'done'

export default function SimulatorPage() {
  const router = useRouter()
  const [profile,      setProfile]      = useState<CustomerProfile | null>(null)
  const [wasaqBefore,  setWasaqBefore]  = useState<WasaqResult | null>(null)
  const [merchant,     setMerchant]     = useState('Jarir')
  const [category,     setCategory]     = useState('تسوق')
  const [amount,       setAmount]       = useState('1200')
  const [impact,       setImpact]       = useState<ImpactResult | null>(null)
  const [paymentState, setPaymentState] = useState<PaymentState>('idle')
  const [wasaqAfter,   setWasaqAfter]   = useState<WasaqResult | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/'); return }
    const p = loadProfile()
    setProfile(p)
    setWasaqBefore(calculateWasaq(p))
  }, [router])

  function handleCheckImpact() {
    if (!profile || !wasaqBefore) return
    const amtNum = Number(amount)
    if (!amtNum || amtNum <= 0) return
    const hypothetical = { ...profile, currentBalance: profile.currentBalance - amtNum }
    const wasaqHypo = calculateWasaq(hypothetical)
    setImpact({
      balanceBefore: profile.currentBalance,
      balanceAfter:  hypothetical.currentBalance,
      scoreBefore:   wasaqBefore.score,
      scoreAfter:    wasaqHypo.score,
      statusBefore:  wasaqBefore.status,
      statusAfter:   wasaqHypo.status,
      dailyBefore:   wasaqBefore.safeDailySpend,
      dailyAfter:    wasaqHypo.safeDailySpend,
      isOverAfter:   wasaqHypo.isOverLimit,
    })
    setWasaqAfter(wasaqHypo)
  }

  function handleExecutePayment() {
    if (!profile || !wasaqBefore) return
    const amtNum = Number(amount)
    if (!amtNum || amtNum <= 0) return

    setPaymentState('processing')

    setTimeout(() => {
      const hypo   = { ...profile, currentBalance: profile.currentBalance - amtNum }
      const result = calculateWasaq(hypo)

      const alertMsg = result.isOverLimit
        ? `تمت عملية ${amtNum.toLocaleString('en')} ريال لدى ${merchant}. صرفك الآمن الآن تجاوز الحد حتى الراتب القادم.`
        : `تمت عملية ${amtNum.toLocaleString('en')} ريال لدى ${merchant}. صرفك الآمن الآن ${Math.round(result.safeDailySpend)} ريال/يوم.`

      const updated: CustomerProfile = {
        ...hypo,
        transactions: [
          {
            id:       `t_${Date.now()}`,
            merchant,
            category,
            amount:   amtNum,
            date:     new Date().toISOString(),
            type:     'debit',
          },
          ...profile.transactions,
        ],
        alerts: [
          {
            id:        `a_${Date.now()}`,
            message:   alertMsg,
            type:      result.isOverLimit ? 'danger' : 'warning',
            timestamp: new Date().toISOString(),
            read:      false,
          },
          ...profile.alerts,
        ],
      }

      saveProfile(updated)
      setProfile(updated)
      setWasaqAfter(result)
      setPaymentState('done')
    }, 900)
  }

  function handleReset() {
    setImpact(null)
    setPaymentState('idle')
    setAmount('1200')
    setMerchant('Jarir')
    setCategory('تسوق')
    setWasaqAfter(null)
  }

  function handleResetDemo() {
    resetProfile()
    window.location.href = '/home'
  }

  if (!profile || !wasaqBefore) {
    return (
      <MobileFrame>
        <div className="flex-1 flex items-center justify-center bg-app-bg">
          <div className="w-8 h-8 border-2 border-wasaq-primary/30 border-t-wasaq-primary rounded-full animate-spin" />
        </div>
      </MobileFrame>
    )
  }

  const unread = profile.alerts.filter(a => !a.read).length

  return (
    <MobileFrame>
      <div className="flex flex-col flex-1 overflow-hidden">
        <WasaqHeader
          title="محاكي الدفع"
          subtitle="اعرف أثر العملية قبل تنفيذها"
          backHref="/wasaq"
          unreadAlerts={unread}
          showBrand
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-4 py-4 pb-6">

            {/* DONE STATE */}
            {paymentState === 'done' && wasaqAfter && (
              <DoneScreen
                merchant={merchant}
                amount={Number(amount)}
                balanceAfter={profile.currentBalance}
                wasaqAfter={wasaqAfter}
                onReset={handleReset}
                onResetDemo={handleResetDemo}
              />
            )}

            {/* FORM + IMPACT */}
            {paymentState !== 'done' && (
              <>
                {/* Current balance banner */}
                <div className="mx-4 bg-app-card rounded-2xl px-4 py-3 flex items-center justify-between">
                  <span className="text-app-muted text-xs">رصيدك الحالي</span>
                  <span className="text-app-text font-bold text-base num-en">
                    {profile.currentBalance.toLocaleString('en')} <span className="text-app-muted font-normal text-xs">ريال</span>
                  </span>
                </div>

                {/* Form card */}
                <div className="mx-4 bg-app-card rounded-3xl p-4 flex flex-col gap-4">
                  <p className="text-app-text font-bold text-sm">تفاصيل العملية</p>

                  <div>
                    <label className="text-app-muted text-xs mb-1.5 block">التاجر</label>
                    <input
                      type="text"
                      value={merchant}
                      onChange={e => { setMerchant(e.target.value); setImpact(null) }}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-wasaq-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-app-muted text-xs mb-1.5 block">الفئة</label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => { setCategory(e.target.value); setImpact(null) }}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-wasaq-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-app-muted text-xs mb-1.5 block">المبلغ (ريال)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => { setAmount(e.target.value); setImpact(null) }}
                      min="1"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-wasaq-primary transition-colors"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleCheckImpact}
                      disabled={!merchant || Number(amount) <= 0}
                      className="flex-1 py-3.5 rounded-2xl border-2 border-wasaq-primary text-wasaq-primary font-bold text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
                    >
                      فحص الأثر
                    </button>
                    <button
                      onClick={handleExecutePayment}
                      disabled={!merchant || Number(amount) <= 0 || paymentState === 'processing'}
                      className="flex-1 py-3.5 rounded-2xl bg-wasaq-primary text-white font-bold text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
                    >
                      {paymentState === 'processing' ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          جارٍ...
                        </span>
                      ) : 'تنفيذ الدفع'}
                    </button>
                  </div>

                  <p className="text-app-muted text-[10px] text-center leading-relaxed">
                    «تنفيذ الدفع» يحدّث الرصيد في هذا الديمو فقط — لا تتم معاملة مالية حقيقية.
                  </p>
                </div>

                {impact && <ImpactCard impact={impact} />}
              </>
            )}

          </div>
        </div>
      </div>
    </MobileFrame>
  )
}

function ImpactCard({ impact }: { impact: ImpactResult }) {
  return (
    <div className="mx-4 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200">
      <div className="bg-gray-50 px-4 py-3">
        <p className="text-app-text font-bold text-sm">أثر العملية المتوقع</p>
        <p className="text-app-muted text-[10px] mt-0.5">
          عملية محاكاة — لن يتأثر رصيدك حتى تضغط «تنفيذ الدفع»
        </p>
      </div>

      <div className="bg-app-card">
        <div className="grid grid-cols-3 border-b border-gray-100 px-4 py-2">
          <span className="text-app-muted text-[10px]" />
          <span className="text-app-muted text-[10px] text-center font-semibold">قبل العملية</span>
          <span className="text-app-muted text-[10px] text-center font-semibold">بعد العملية</span>
        </div>

        <CompareRow
          label="الرصيد"
          before={`${impact.balanceBefore.toLocaleString('en')} ريال`}
          after={`${impact.balanceAfter.toLocaleString('en')} ريال`}
          afterClass={impact.balanceAfter < 0 ? 'text-wasaq-danger' : 'text-app-text'}
        />
        <CompareRow
          label="الصرف اليومي"
          before={impact.dailyBefore <= 0 ? 'تجاوز الحد' : `${Math.round(impact.dailyBefore)} ر/يوم`}
          after={impact.isOverAfter ? 'تجاوز الحد' : `${Math.round(impact.dailyAfter)} ر/يوم`}
          afterClass={impact.isOverAfter ? 'text-wasaq-danger font-bold' : 'text-app-text'}
        />

        <div className="grid grid-cols-3 items-center px-4 py-3 border-t border-gray-100">
          <span className="text-app-muted text-xs">الحالة</span>
          <div className="flex justify-center">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBg(impact.statusBefore)}`}>
              {impact.statusBefore}
            </span>
          </div>
          <div className="flex justify-center">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBg(impact.statusAfter)}`}>
              {impact.statusAfter}
            </span>
          </div>
        </div>
      </div>

      {impact.isOverAfter ? (
        <div className="bg-red-50 px-4 py-3 border-t border-red-100">
          <p className="text-wasaq-danger text-xs font-semibold leading-relaxed">
            هذه العملية ستضع وضعك المالي تحت ضغط — ستتجاوز الحد الآمن حتى الراتب القادم.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 px-4 py-3 border-t border-amber-100">
          <p className="text-amber-700 text-xs leading-relaxed">
            هذه العملية ستخفض صرفك الآمن اليومي إلى {Math.round(impact.dailyAfter)} ريال.
          </p>
        </div>
      )}
    </div>
  )
}

function CompareRow({ label, before, after, afterClass = 'text-app-text' }: {
  label: string; before: string; after: string; afterClass?: string
}) {
  return (
    <div className="grid grid-cols-3 items-center px-4 py-3 border-t border-gray-50">
      <span className="text-app-muted text-xs">{label}</span>
      <span className="text-center text-xs text-app-text num-en">{before}</span>
      <span className={`text-center text-xs num-en ${afterClass}`}>{after}</span>
    </div>
  )
}

function DoneScreen({
  merchant, amount, balanceAfter, wasaqAfter, onReset, onResetDemo
}: {
  merchant: string
  amount: number
  balanceAfter: number
  wasaqAfter: WasaqResult
  onReset: () => void
  onResetDemo: () => void
}) {
  return (
    <div className="px-4 flex flex-col gap-4">
      <div className="flex flex-col items-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <CheckCircle2 size={32} className="text-wasaq-safe" />
        </div>
        <p className="text-app-text font-black text-xl">تمت العملية</p>
        <p className="text-app-muted text-sm mt-1">
          {amount.toLocaleString('en')} ريال — {merchant}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-app-muted text-xs font-medium">الإشعارات الواردة</p>

        <MockNotification
          appName="مصرف الأفق"
          appColor="bg-bank-dark"
          appLetter="م"
          message={`تمت معاملة ${amount.toLocaleString('en')} ريال بنجاح`}
          sub={`التاجر: ${merchant}`}
        />

        <MockNotification
          appName="وسق"
          appColor="bg-wasaq-dark"
          isShield
          message={wasaqAfter.isOverLimit
            ? 'تجاوزت الحد الآمن — تجنب أي صرف إضافي حتى الراتب'
            : `صرفك الآمن الآن ${Math.round(wasaqAfter.safeDailySpend)} ريال/يوم`}
          sub={`الحالة: ${wasaqAfter.status}`}
          urgent={wasaqAfter.status === 'خطر'}
        />
      </div>

      <div className="bg-app-card rounded-3xl p-4">
        <p className="text-app-muted text-xs mb-3">وضعك المالي بعد العملية</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-app-muted text-[10px]">الرصيد الجديد</p>
            <p className="text-app-text font-bold text-lg num-en">
              {balanceAfter.toLocaleString('en')} <span className="text-app-muted font-normal text-xs">ريال</span>
            </p>
          </div>
          <div className="text-left">
            <p className="text-app-muted text-[10px]">الصرف الآمن</p>
            <p className={`font-bold text-base num-en ${wasaqAfter.isOverLimit ? 'text-wasaq-danger' : 'text-wasaq-primary'}`}>
              {wasaqAfter.isOverLimit ? 'تجاوز الحد' : `${Math.round(wasaqAfter.safeDailySpend)} ر/يوم`}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusBg(wasaqAfter.status)}`}>
            {wasaqAfter.status}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/alerts"
          className="flex-1 flex items-center justify-center gap-1.5 py-4 rounded-2xl bg-bank-primary text-white font-bold text-sm"
        >
          <span>التنبيهات</span>
          <ChevronLeft size={16} />
        </Link>
        <Link
          href="/plan"
          className="flex-1 flex items-center justify-center gap-1.5 py-4 rounded-2xl bg-wasaq-primary text-white font-bold text-sm"
        >
          <ClipboardList size={16} />
          <span>الخطة</span>
        </Link>
      </div>

      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-gray-200 text-app-muted font-semibold text-sm"
      >
        <RefreshCw size={16} />
        <span>محاكاة جديدة</span>
      </button>

      <button
        onClick={onResetDemo}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-dashed border-gray-200 text-app-muted text-xs font-medium"
      >
        <RefreshCw size={13} />
        إعادة ضبط الديمو
      </button>
    </div>
  )
}

function MockNotification({
  appName, appColor, appLetter, isShield, message, sub, urgent = false
}: {
  appName: string
  appColor: string
  appLetter?: string
  isShield?: boolean
  message: string
  sub?: string
  urgent?: boolean
}) {
  return (
    <div className={`rounded-2xl p-3.5 flex items-start gap-3 ${urgent ? 'bg-red-50 border border-red-100' : 'bg-gray-900'}`}>
      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${appColor}`}>
        {isShield
          ? <ShieldCheck size={18} className="text-white" />
          : <span className="text-white font-bold text-sm">{appLetter}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-bold ${urgent ? 'text-wasaq-danger' : 'text-white'}`}>{appName}</span>
          <span className={`text-[10px] ${urgent ? 'text-red-400' : 'text-gray-400'}`}>الآن</span>
        </div>
        <p className={`text-xs leading-relaxed ${urgent ? 'text-red-800' : 'text-gray-200'}`}>{message}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${urgent ? 'text-red-400' : 'text-gray-500'}`}>{sub}</p>}
      </div>
    </div>
  )
}
