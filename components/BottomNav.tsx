'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Landmark, CreditCard, ArrowLeftRight, MoreHorizontal } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home', label: 'الرئيسية',  icon: Home            },
  { href: '#',     label: 'الحسابات',  icon: Landmark        },
  { href: '#',     label: 'البطاقات',  icon: CreditCard      },
  { href: '#',     label: 'التحويلات', icon: ArrowLeftRight  },
  { href: '#',     label: 'المزيد',    icon: MoreHorizontal  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="shrink-0 bg-app-card border-t border-gray-100 px-1 pb-4 pt-2">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href !== '#' && pathname === href
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-colors min-w-0 ${
                active ? 'text-bank-primary' : 'text-app-muted'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-bank-soft' : ''}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-medium truncate max-w-[52px] text-center ${active ? 'font-semibold text-bank-primary' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
