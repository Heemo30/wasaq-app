import type { ReactNode } from 'react'
import { Commitment, CommitmentSource } from '@/lib/types'
import { SOURCE_LABELS } from '@/lib/messages'
import { Search, RefreshCw, CreditCard, Pencil } from 'lucide-react'

interface CommitmentCardProps {
  commitment: Commitment
}

const SOURCE_ICON: Record<CommitmentSource, ReactNode> = {
  auto:      <Search    size={16} />,
  recurring: <RefreshCw size={16} />,
  deferred:  <CreditCard size={16} />,
  manual:    <Pencil   size={16} />,
}

const SOURCE_STYLE: Record<CommitmentSource, string> = {
  auto:      'bg-bank-soft text-bank-primary border-bank-primary/20',
  recurring: 'bg-wasaq-soft text-wasaq-dark border-wasaq-primary/20',
  deferred:  'bg-amber-50 text-amber-700 border-amber-200',
  manual:    'bg-gray-50 text-gray-600 border-gray-200',
}

const ICON_BG: Record<CommitmentSource, string> = {
  auto:      'bg-bank-soft text-bank-primary',
  recurring: 'bg-wasaq-soft text-wasaq-primary',
  deferred:  'bg-amber-50 text-amber-600',
  manual:    'bg-gray-50 text-gray-500',
}

export default function CommitmentCard({ commitment }: CommitmentCardProps) {
  const { name, amount, dueInDays, source } = commitment

  const dueLabel =
    dueInDays === 0 ? 'اليوم' :
    dueInDays === 1 ? 'غداً' :
    `بعد ${dueInDays} أيام`

  const dueUrgent = dueInDays <= 3

  return (
    <div className="bg-app-card rounded-2xl px-4 py-3.5 flex items-center gap-3">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${ICON_BG[source]}`}>
        {SOURCE_ICON[source]}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <p className="text-app-text font-semibold text-sm truncate">{name}</p>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${SOURCE_STYLE[source]}`}>
            {SOURCE_LABELS[source]}
          </span>
        </div>
        <p className={`text-xs font-medium ${dueUrgent ? 'text-wasaq-danger' : 'text-app-muted'}`}>
          {dueLabel}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-left">
        <p className="text-app-text font-bold text-base num-en">
          {amount.toLocaleString('en')}
        </p>
        <p className="text-app-muted text-[10px] text-left">ريال</p>
      </div>
    </div>
  )
}
