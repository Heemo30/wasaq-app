'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, FileText, CreditCard, MoreHorizontal, Wallet, RefreshCw } from 'lucide-react'
import MobileFrame from '@/components/MobileFrame'
import BankHeader from '@/components/BankHeader'
import BottomNav from '@/components/BottomNav'
import BalanceCard from '@/components/BalanceCard'
import WasaqWidget from '@/components/WasaqWidget'
import { loadProfile, resetProfile, isAuthenticated } from '@/lib/storage'
import { calculateWasaq } from '@/lib/engine'
import { formatDate } from '@/lib/format'
import { CustomerProfile, WasaqResult } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [wasaq, setWasaq] = useState<WasaqResult | null>(null)
  const [balanceHidden, setBalanceHidden] = useState(false)

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
          <div className="w-8 h-8 border-2 border-bank-primary/30 border-t-bank-primary rounded-full animate-spin" />
        </div>
      </MobileFrame>
    )
  }

  function handleResetDemo() {
    resetProfile()
    window.location.href = '/home'
  }

  const unread = profile.alerts.filter(a => !a.read).length
  const recentTx = profile.transactions.slice(0, 3)

  return (
    <MobileFrame>
      <div className="flex flex-col flex-1 overflow-hidden">
        <BankHeader unreadAlerts={unread} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-2">
          <div className="flex flex-col gap-5 py-4">

            {/* Balance card */}
            <BalanceCard
              name={profile.name}
              balance={profile.currentBalance}
              hidden={balanceHidden}
              onToggleHide={() => setBalanceHidden(v => !v)}
            />

            {/* Quick actions */}
            <div className="mx-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: <Send size={18} />,          label: 'تحويل'     },
                  { icon: <FileText size={18} />,      label: 'دفع فاتورة' },
                  { icon: <CreditCard size={18} />,    label: 'بطاقة'     },
                  { icon: <MoreHorizontal size={18} />, label: 'المزيد'   },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-app-card active:scale-95 transition-transform"
                    style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-bank-soft flex items-center justify-center text-bank-primary">
                      {icon}
                    </div>
                    <span className="text-app-text text-[11px] font-medium leading-tight text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accounts */}
            <div className="mx-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-app-text font-bold text-sm">حساباتي</p>
                <button className="text-bank-primary text-xs font-medium">عرض الكل</button>
              </div>
              <div className="flex flex-col gap-2">
                <div
                  className="bg-app-card rounded-2xl px-4 py-3.5 flex items-center gap-3"
                  style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
                >
                  <div className="w-10 h-10 rounded-2xl bg-bank-soft flex items-center justify-center">
                    <Wallet size={18} className="text-bank-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-app-text font-semibold text-sm">حساب جارٍ</p>
                    <p className="text-app-muted text-xs">•••• 4821</p>
                  </div>
                  <div className="text-left">
                    <p className="text-app-text font-bold text-sm num-en">
                      {balanceHidden ? '••••••' : profile.currentBalance.toLocaleString('en')}
                    </p>
                    <p className="text-app-muted text-[10px]">ريال</p>
                  </div>
                </div>

                <div
                  className="bg-app-card rounded-2xl px-4 py-3.5 flex items-center gap-3"
                  style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
                >
                  <div className="w-10 h-10 rounded-2xl bg-bank-soft flex items-center justify-center">
                    <CreditCard size={18} className="text-bank-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-app-text font-semibold text-sm">بطاقة ائتمانية</p>
                    <p className="text-app-muted text-xs">•••• 9214</p>
                  </div>
                  <div className="text-left">
                    <p className="text-wasaq-warning font-bold text-sm num-en">1,200</p>
                    <p className="text-app-muted text-[10px]">مستحقة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="mx-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-app-text font-bold text-sm">آخر المعاملات</p>
                <button className="text-bank-primary text-xs font-medium">عرض الكل</button>
              </div>
              <div className="flex flex-col gap-2">
                {recentTx.map(tx => (
                  <div
                    key={tx.id}
                    className="bg-app-card rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm shrink-0 ${
                      tx.type === 'credit' ? 'bg-green-50 text-wasaq-safe' : 'bg-gray-50 text-app-muted'
                    }`}>
                      {tx.type === 'credit' ? '↓' : '↑'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-app-text font-semibold text-sm truncate">{tx.merchant}</p>
                      <p className="text-app-muted text-xs">{tx.category} · {formatDate(tx.date)}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className={`font-bold text-sm num-en ${tx.type === 'credit' ? 'text-wasaq-safe' : 'text-app-text'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString('en')}
                      </p>
                      <p className="text-app-muted text-[10px] text-left">ريال</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wasaq widget — embedded feature card */}
            <WasaqWidget result={wasaq} daysUntilSalary={profile.daysUntilSalary} />

            {/* Reset demo */}
            <div className="mx-4 pb-2">
              <button
                onClick={handleResetDemo}
                className="w-full py-3 rounded-2xl border border-dashed border-gray-200 text-app-muted text-xs font-medium flex items-center justify-center gap-2 active:bg-gray-50 transition-colors"
              >
                <RefreshCw size={13} />
                إعادة ضبط الديمو
              </button>
            </div>

          </div>
        </div>

        <BottomNav />
      </div>
    </MobileFrame>
  )
}
