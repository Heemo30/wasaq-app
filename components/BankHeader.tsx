'use client'

import { Bell, User } from 'lucide-react'
import Link from 'next/link'

interface BankHeaderProps {
  unreadAlerts?: number
}

export default function BankHeader({ unreadAlerts = 0 }: BankHeaderProps) {
  return (
    <header className="bg-bank-dark shrink-0 px-5 pt-4 pb-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">م</span>
          </div>
          <div>
            <p className="text-white/60 text-[10px] leading-none">مصرف</p>
            <p className="text-white font-bold text-sm leading-tight">الأفق</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/alerts" className="relative">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <Bell size={18} className="text-white" />
            </div>
            {unreadAlerts > 0 && (
              <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-wasaq-danger rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                {unreadAlerts}
              </span>
            )}
          </Link>
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}
