'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Bell, ShieldCheck, CheckCircle2, AlertTriangle, AlertOctagon, CheckCheck } from 'lucide-react'
import MobileFrame from '@/components/MobileFrame'
import WasaqHeader from '@/components/WasaqHeader'
import { loadProfile, saveProfile, isAuthenticated } from '@/lib/storage'
import { formatTimeAgo } from '@/lib/format'
import { CustomerProfile, Alert } from '@/lib/types'

type BadgeConfig = { label: string; className: string; icon: ReactNode }

function getBadgeConfig(alert: Alert): BadgeConfig {
  const msg = alert.message
  if (msg.includes('صرفك الآمن') || msg.startsWith('وسق')) {
    return { label: 'وسق', className: 'bg-wasaq-soft text-wasaq-dark border-wasaq-primary/20', icon: <ShieldCheck size={14} /> }
  }
  if (alert.type === 'success') {
    return { label: 'عملية', className: 'bg-green-50 text-wasaq-safe border-green-200', icon: <CheckCircle2 size={14} /> }
  }
  if (alert.type === 'warning') {
    return { label: 'التزام', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle size={14} /> }
  }
  if (alert.type === 'danger') {
    return { label: 'تنبيه', className: 'bg-red-50 text-wasaq-danger border-red-200', icon: <AlertOctagon size={14} /> }
  }
  return { label: 'جديد', className: 'bg-gray-50 text-gray-600 border-gray-200', icon: <Bell size={14} /> }
}

function getAlertIconBg(alert: Alert): string {
  if (alert.message.includes('صرفك الآمن') || alert.message.startsWith('وسق')) return 'bg-wasaq-soft'
  if (alert.type === 'success') return 'bg-green-50'
  if (alert.type === 'warning') return 'bg-amber-50'
  if (alert.type === 'danger')  return 'bg-red-50'
  return 'bg-gray-50'
}

function getAlertIcon(alert: Alert): ReactNode {
  if (alert.message.includes('صرفك الآمن') || alert.message.startsWith('وسق'))
    return <ShieldCheck size={18} className="text-wasaq-primary" />
  if (alert.type === 'success') return <CheckCircle2 size={18} className="text-wasaq-safe" />
  if (alert.type === 'warning') return <AlertTriangle size={18} className="text-wasaq-warning" />
  if (alert.type === 'danger')  return <AlertOctagon size={18} className="text-wasaq-danger" />
  return <Bell size={18} className="text-app-muted" />
}

export default function AlertsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/'); return }
    setProfile(loadProfile())
  }, [router])

  function markAllRead() {
    if (!profile) return
    const updated = { ...profile, alerts: profile.alerts.map(a => ({ ...a, read: true })) }
    saveProfile(updated)
    setProfile(updated)
  }

  function markRead(id: string) {
    if (!profile) return
    const updated = { ...profile, alerts: profile.alerts.map(a => a.id === id ? { ...a, read: true } : a) }
    saveProfile(updated)
    setProfile(updated)
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

  const sorted    = [...profile.alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const unread    = sorted.filter(a => !a.read)
  const read      = sorted.filter(a => a.read)
  const unreadCount = unread.length

  return (
    <MobileFrame>
      <div className="flex flex-col flex-1 overflow-hidden">
        <WasaqHeader
          title="التنبيهات"
          subtitle={unreadCount > 0 ? `${unreadCount} غير مقروءة` : 'كل التنبيهات مقروءة'}
          backHref="/wasaq"
          unreadAlerts={unreadCount}
          showBrand
        />

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-4 py-4 pb-6">

            {/* Mark all read */}
            {unreadCount > 0 && (
              <div className="px-4 flex justify-end">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-wasaq-primary text-xs font-semibold"
                >
                  <CheckCheck size={14} />
                  <span>تعليم الكل مقروء</span>
                </button>
              </div>
            )}

            {/* Unread section */}
            {unread.length > 0 && (
              <div className="px-4 flex flex-col gap-2">
                <p className="text-app-muted text-xs font-semibold">غير مقروءة</p>
                {unread.map(alert => (
                  <AlertCard key={alert.id} alert={alert} onRead={() => markRead(alert.id)} />
                ))}
              </div>
            )}

            {/* Read section */}
            {read.length > 0 && (
              <div className="px-4 flex flex-col gap-2">
                <p className="text-app-muted text-xs font-semibold">
                  {unread.length > 0 ? 'مقروءة سابقاً' : 'جميع التنبيهات'}
                </p>
                {read.map(alert => (
                  <AlertCard key={alert.id} alert={alert} onRead={() => markRead(alert.id)} />
                ))}
              </div>
            )}

            {sorted.length === 0 && (
              <div className="mx-4 bg-app-card rounded-3xl p-10 flex flex-col items-center">
                <Bell size={32} className="text-gray-200 mb-3" />
                <p className="text-app-muted text-sm">لا توجد تنبيهات</p>
              </div>
            )}

            {/* Link to plan */}
            <div className="px-4">
              <Link
                href="/plan"
                className="flex items-center justify-between bg-wasaq-soft rounded-2xl px-4 py-3.5 active:bg-wasaq-soft/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-wasaq-primary/15 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-wasaq-primary" />
                  </div>
                  <div>
                    <p className="text-wasaq-dark font-semibold text-sm">عرض خطة وسق</p>
                    <p className="text-wasaq-primary/60 text-[10px]">توصيات مالية حتى الراتب</p>
                  </div>
                </div>
                <span className="text-wasaq-primary text-lg">‹</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </MobileFrame>
  )
}

function AlertCard({ alert, onRead }: { alert: Alert; onRead: () => void }) {
  const badge  = getBadgeConfig(alert)
  const iconBg = getAlertIconBg(alert)
  const icon   = getAlertIcon(alert)

  return (
    <button
      onClick={onRead}
      className={`w-full text-right rounded-2xl p-3.5 flex items-start gap-3 transition-colors active:scale-[0.99] ${
        alert.read
          ? 'bg-app-card'
          : 'bg-app-card border-r-4 border-wasaq-primary shadow-sm shadow-wasaq-primary/10'
      }`}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.className}`}>
            {badge.icon}
            {badge.label}
          </span>
          <span className="text-app-muted text-[10px]">{formatTimeAgo(alert.timestamp)}</span>
        </div>
        <p className={`text-sm leading-relaxed ${alert.read ? 'text-app-muted' : 'text-app-text font-medium'}`}>
          {alert.message}
        </p>
      </div>
      {!alert.read && (
        <div className="w-2 h-2 rounded-full bg-wasaq-primary mt-1 shrink-0" />
      )}
    </button>
  )
}
