'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import MobileFrame from '@/components/MobileFrame'
import WasaqHeader from '@/components/WasaqHeader'
import CommitmentCard from '@/components/CommitmentCard'
import AddCommitmentModal from '@/components/AddCommitmentModal'
import { loadProfile, saveProfile, isAuthenticated } from '@/lib/storage'
import { calculateWasaq } from '@/lib/engine'
import { CustomerProfile, Commitment } from '@/lib/types'

export default function CommitmentsPage() {
  const router = useRouter()
  const [profile, setProfile]     = useState<CustomerProfile | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [safeDailySpend, setSafe] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/'); return }
    const p = loadProfile()
    setProfile(p)
    setSafe(calculateWasaq(p).safeDailySpend)
  }, [router])

  function handleAddCommitment(commitment: Commitment) {
    if (!profile) return
    const updated: CustomerProfile = {
      ...profile,
      commitments: [...profile.commitments, commitment],
    }
    saveProfile(updated)
    setProfile(updated)
    setSafe(calculateWasaq(updated).safeDailySpend)
    setShowModal(false)
  }

  if (!profile) {
    return (
      <MobileFrame>
        <div className="flex-1 flex items-center justify-center bg-app-bg">
          <div className="w-8 h-8 border-2 border-wasaq-primary/30 border-t-wasaq-primary rounded-full animate-spin" />
        </div>
      </MobileFrame>
    )
  }

  const total = profile.commitments.reduce((s, c) => s + c.amount, 0)
  const sorted = [...profile.commitments].sort((a, b) => a.dueInDays - b.dueInDays)
  const unread = profile.alerts.filter(a => !a.read).length

  return (
    <MobileFrame>
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <WasaqHeader
          title="الالتزامات"
          subtitle="المصاريف القادمة المرصودة"
          backHref="/wasaq"
          unreadAlerts={unread}
          showBrand
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-4 py-4 pb-6">

            {/* Add button */}
            <div className="px-4 flex items-center justify-between">
              <p className="text-app-muted text-xs">
                {profile.commitments.length} التزامات · مرتبة حسب الأقرب موعداً
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-wasaq-primary text-white text-xs font-bold active:scale-95 transition-transform"
              >
                <Plus size={14} />
                <span>أضف</span>
              </button>
            </div>

            {/* Summary card */}
            <div
              className="mx-4 rounded-3xl p-4"
              style={{ background: 'linear-gradient(135deg, #134E4A 0%, #0F766E 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1">إجمالي الالتزامات</p>
                  <p className="text-white font-black text-2xl num-en">
                    {total.toLocaleString('en')}
                    <span className="text-white/60 font-normal text-sm"> ريال</span>
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-white/60 text-xs mb-1">الأثر على الصرف اليومي</p>
                  {safeDailySpend !== null && (
                    <p className={`font-bold text-base num-en ${safeDailySpend <= 0 ? 'text-red-300' : 'text-green-300'}`}>
                      {safeDailySpend <= 0
                        ? 'تجاوزت الحد'
                        : `${Math.round(safeDailySpend).toLocaleString('en')} ريال/يوم`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Commitments list */}
            <div className="px-4 flex flex-col gap-2">
              {sorted.length === 0 ? (
                <div className="bg-app-card rounded-2xl p-8 flex flex-col items-center text-center">
                  <p className="text-app-muted text-sm">لا توجد التزامات مسجلة</p>
                  <p className="text-app-muted text-xs mt-1">اضغط أضف لإضافة التزام جديد</p>
                </div>
              ) : (
                sorted.map(c => <CommitmentCard key={c.id} commitment={c} />)
              )}
            </div>

            {/* Info note */}
            <div className="mx-4 bg-wasaq-soft rounded-2xl px-4 py-3">
              <p className="text-wasaq-primary text-xs leading-relaxed">
                <span className="font-bold">تنبيه: </span>
                الالتزامات المكتشفة تلقائياً تُستخدم لحساب صرفك الآمن في وسق. كلما كانت بياناتك أدق، كانت توصياتنا أفضل.
              </p>
            </div>

          </div>
        </div>

        {showModal && (
          <AddCommitmentModal
            onSave={handleAddCommitment}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </MobileFrame>
  )
}
