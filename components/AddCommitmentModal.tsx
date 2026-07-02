'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Commitment, CommitmentSource } from '@/lib/types'
import { SOURCE_LABELS } from '@/lib/messages'

interface AddCommitmentModalProps {
  onSave: (commitment: Commitment) => void
  onClose: () => void
}

const SOURCES: CommitmentSource[] = ['manual', 'recurring', 'deferred', 'auto']

export default function AddCommitmentModal({ onSave, onClose }: AddCommitmentModalProps) {
  const [name, setName]         = useState('')
  const [amount, setAmount]     = useState('')
  const [dueInDays, setDue]     = useState('7')
  const [source, setSource]     = useState<CommitmentSource>('manual')

  const isValid = name.trim().length > 0 && Number(amount) > 0 && Number(dueInDays) >= 0

  function handleSave() {
    if (!isValid) return
    const commitment: Commitment = {
      id:        `c_${Date.now()}`,
      name:      name.trim(),
      amount:    Number(amount),
      dueInDays: Number(dueInDays),
      source,
    }
    onSave(commitment)
  }

  return (
    /* Overlay */
    <div
      className="absolute inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Sheet */}
      <div className="w-full bg-app-card rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-app-text font-bold text-base">إضافة التزام جديد</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-app-muted"
          >
            <X size={16} />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="text-app-muted text-xs mb-1.5 block">اسم الالتزام</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="مثال: قسط السيارة"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-bank-primary transition-colors"
          />
        </div>

        {/* Amount + Days row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-app-muted text-xs mb-1.5 block">المبلغ (ريال)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-bank-primary transition-colors"
              dir="ltr"
            />
          </div>
          <div className="flex-1">
            <label className="text-app-muted text-xs mb-1.5 block">بعد كم يوم</label>
            <input
              type="number"
              value={dueInDays}
              onChange={e => setDue(e.target.value)}
              placeholder="7"
              min="0"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-bank-primary transition-colors"
              dir="ltr"
            />
          </div>
        </div>

        {/* Source selector */}
        <div>
          <label className="text-app-muted text-xs mb-2 block">نوع الالتزام</label>
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={`px-3 py-2.5 rounded-2xl border text-xs font-medium text-right transition-colors ${
                  source === s
                    ? 'border-bank-primary bg-bank-soft text-bank-primary'
                    : 'border-gray-200 bg-app-bg text-app-muted'
                }`}
              >
                {SOURCE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="w-full py-4 rounded-2xl bg-bank-primary text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          حفظ الالتزام
        </button>
      </div>
    </div>
  )
}
