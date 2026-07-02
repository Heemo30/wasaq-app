import { WasaqResult } from '@/lib/types'
import { getStatusBg, getStatusMessage } from '@/lib/messages'

interface WasaqScoreProps {
  result: WasaqResult
  daysUntilSalary: number
}

const STATUS_COLOR: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  'آمن':   { border: 'border-wasaq-safe',    bg: 'bg-green-50',  text: 'text-wasaq-safe',    ring: '#16A34A' },
  'انتبه': { border: 'border-wasaq-warning',  bg: 'bg-amber-50',  text: 'text-wasaq-warning',  ring: '#D97706' },
  'خطر':   { border: 'border-wasaq-danger',   bg: 'bg-red-50',    text: 'text-wasaq-danger',   ring: '#DC2626' },
}

export default function WasaqScore({ result, daysUntilSalary }: WasaqScoreProps) {
  const { score, status, isOverLimit } = result
  const colors = STATUS_COLOR[status]
  const message = getStatusMessage(status)
  const statusBadge = getStatusBg(status)

  // Arc progress (SVG circle — simple, no library)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const progress = isOverLimit ? 0 : (score / 100)
  const dashOffset = circumference * (1 - progress)

  return (
    <div className={`mx-4 rounded-3xl p-5 ${colors.bg} border-2 ${colors.border}`}>
      {/* Title */}
      <p className={`text-xs font-semibold mb-4 ${colors.text}`}>مؤشر وسق</p>

      <div className="flex items-center gap-5">
        {/* Score arc */}
        <div className="relative shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
            {/* Background ring */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-black/8"
            />
            {/* Progress ring */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={colors.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          {/* Score number centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-black text-3xl leading-none num-en ${colors.text}`}>{score}</span>
            <span className="text-app-muted text-xs mt-0.5">من 100</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Status badge */}
          <span className={`self-start flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${statusBadge}`}>
            {status === 'آمن' ? '✓' : status === 'انتبه' ? '!' : '✕'}
            {status}
          </span>

          {/* Daily spend */}
          <div>
            <p className="text-app-muted text-[10px] mb-0.5">الصرف الآمن اليومي</p>
            {isOverLimit ? (
              <p className="text-wasaq-danger font-bold text-sm">تجاوزت الحد الآمن</p>
            ) : (
              <p className={`font-black text-xl leading-tight ${colors.text}`}>
                {Math.round(result.safeDailySpend).toLocaleString('en')}
                <span className="font-normal text-sm text-app-muted"> ريال/يوم</span>
              </p>
            )}
          </div>

          {/* Days */}
          <p className="text-app-muted text-xs">
            <span className={`font-bold ${colors.text} num-en`}>{daysUntilSalary}</span>
            {' '}يوماً حتى الراتب
          </p>
        </div>
      </div>

      {/* Message */}
      <p className="text-app-muted text-xs mt-4 pt-4 border-t border-black/8 leading-relaxed">
        {message}
      </p>
    </div>
  )
}
