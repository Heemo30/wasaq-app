import type { ReactNode } from 'react'

export default function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center sm:p-6 p-0">
      <div
        className="
          relative flex flex-col overflow-hidden bg-app-bg
          w-full h-screen
          sm:w-[390px] sm:h-[844px] sm:rounded-[44px] sm:shadow-2xl sm:shadow-black/40
        "
        style={{ maxHeight: '100dvh' }}
      >
        <div className="hidden sm:flex items-center justify-between bg-bank-dark px-6 py-2 shrink-0">
          <span className="text-white/80 text-xs font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <span className="text-white/80 text-xs">●●●</span>
            <span className="text-white/80 text-xs">WiFi</span>
            <span className="text-white/80 text-xs">🔋</span>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
