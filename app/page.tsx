'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import MobileFrame from '@/components/MobileFrame'
import { setAuthenticated } from '@/lib/storage'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!phone || !pin) return
    setLoading(true)
    setTimeout(() => {
      setAuthenticated(true)
      router.push('/home')
    }, 900)
  }

  return (
    <MobileFrame>
      <div
        className="flex flex-col flex-1 overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #2D1234 0%, #6B1E78 55%, #4a1560 100%)' }}
      >
        {/* Top decoration */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
          {/* Bank logo area */}
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
            >
              <span className="text-white font-black text-4xl">م</span>
            </div>
            <h1 className="text-white font-black text-2xl tracking-wide">مصرف الأفق</h1>
            <p className="text-white/50 text-sm mt-1">الخدمات المصرفية الرقمية</p>
          </div>

          {/* Card */}
          <div
            className="w-full rounded-3xl p-6"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <h2 className="text-white font-bold text-xl mb-1">تسجيل الدخول</h2>
            <p className="text-white/50 text-sm mb-6">أدخل رقم جوالك والرقم السري</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Phone */}
              <div>
                <label className="text-white/60 text-xs mb-2 block">رقم الجوال</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="
                    w-full px-4 py-3.5 rounded-2xl text-white placeholder-white/30
                    bg-white/10 border border-white/15 focus:border-white/40
                    outline-none transition-colors text-sm
                  "
                  dir="ltr"
                />
              </div>

              {/* PIN */}
              <div>
                <label className="text-white/60 text-xs mb-2 block">الرقم السري</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="••••••"
                    className="
                      w-full px-4 py-3.5 rounded-2xl text-white placeholder-white/30
                      bg-white/10 border border-white/15 focus:border-white/40
                      outline-none transition-colors text-sm
                    "
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(v => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !phone || !pin}
                className="
                  w-full py-4 rounded-2xl font-bold text-base transition-all duration-200
                  bg-white text-bank-primary
                  disabled:opacity-40 disabled:cursor-not-allowed
                  active:scale-[0.98]
                "
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-bank-primary/30 border-t-bank-primary rounded-full animate-spin" />
                    جارٍ الدخول...
                  </span>
                ) : (
                  'دخول'
                )}
              </button>
            </form>

            <p className="text-white/30 text-center text-xs mt-4">
              أي رقم جوال ورقم سري يعملان في هذا الديمو
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 text-white/30">
            <ShieldCheck size={14} />
            <span className="text-xs">مدعوم بـ وسق — محرك الإنفاق الآمن</span>
          </div>
        </div>
      </div>
    </MobileFrame>
  )
}
