import { Eye, EyeOff } from 'lucide-react'

interface BalanceCardProps {
  name: string
  balance: number
  hidden?: boolean
  onToggleHide?: () => void
}

export default function BalanceCard({ name, balance, hidden = false, onToggleHide }: BalanceCardProps) {
  return (
    <div
      className="mx-4 rounded-3xl p-5 text-white shrink-0"
      style={{
        background: 'linear-gradient(135deg, #6B1E78 0%, #2D1234 100%)',
        boxShadow: '0 8px 32px rgba(107,30,120,0.35)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/60 text-xs mb-0.5">مرحباً</p>
          <p className="text-white font-bold text-lg leading-tight">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-[10px] mb-0.5">حساب جارٍ</p>
          <p className="text-white/80 text-xs">•••• 4821</p>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-white/60 text-xs mb-1">الرصيد المتاح</p>
        <div className="flex items-center gap-2">
          {hidden ? (
            <span className="text-white font-bold text-3xl tracking-wider">••••••</span>
          ) : (
            <span className="text-white font-bold text-3xl num-en">
              {balance.toLocaleString('en')}
            </span>
          )}
          <span className="text-white/70 text-base font-medium">ريال</span>
          <button onClick={onToggleHide} className="mr-auto text-white/60 hover:text-white transition-colors">
            {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-3">
        <span>مصرف الأفق</span>
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded-full bg-white/20" />
          <div className="w-6 h-6 rounded-full bg-white/10 -mr-2" />
        </div>
      </div>
    </div>
  )
}
