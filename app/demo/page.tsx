'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Download, Edit2, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react'
import { loadProfile, saveProfile, resetProfile } from '@/lib/storage'
import { Commitment, CommitmentSource, CustomerProfile, Transaction } from '@/lib/types'

/* ─── Helpers ────────────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2, 10) }
function daysAgo(n: number) { return new Date(Date.now() - n * 86_400_000).toISOString() }
function hoursAgo(n: number) { return new Date(Date.now() - n * 3_600_000).toISOString() }
function toDateInput(iso: string) { return iso.slice(0, 10) }

const SOURCE_LABELS: Record<CommitmentSource, string> = {
  auto: 'تلقائي', recurring: 'متكرر', deferred: 'مؤجل', manual: 'يدوي',
}

/* ─── JSON validation ────────────────────────────────────────── */
function isValidProfile(obj: unknown): obj is CustomerProfile {
  if (!obj || typeof obj !== 'object') return false
  const p = obj as Record<string, unknown>
  return (
    typeof p.name === 'string' &&
    typeof p.salary === 'number' &&
    typeof p.currentBalance === 'number' &&
    typeof p.daysUntilSalary === 'number' &&
    Array.isArray(p.commitments) &&
    Array.isArray(p.transactions) &&
    Array.isArray(p.alerts)
  )
}

/* ─── Quick Scenarios ────────────────────────────────────────── */
// Scores (engine: cbrt(safeAmount/idealTotal)*100):
// S1 آمن  score≈100 | S2 انتبه score≈62 | S3 خطر score=0 | S4 انتبه score≈45

const SCENARIOS: {
  num: number; title: string; desc: string
  badge: string; badgeClass: string
  load: () => CustomerProfile
}[] = [
  {
    num: 1, title: 'عميل صحي', desc: 'رصيد عالٍ — قريب من الراتب',
    badge: 'آمن', badgeClass: 'bg-green-100 text-wasaq-safe border-green-300',
    load: () => ({
      name: 'خالد', phone: '0501234567',
      salary: 9000, currentBalance: 8500, daysUntilSalary: 4,
      commitments: [
        { id: uid(), name: 'فاتورة STC', amount: 230, dueInDays: 3, source: 'recurring' },
        { id: uid(), name: 'Netflix',    amount: 65,  dueInDays: 4, source: 'recurring' },
      ],
      transactions: [
        { id: uid(), merchant: 'Carrefour',  category: 'تسوق', amount: 320,  date: daysAgo(1),  type: 'debit'  },
        { id: uid(), merchant: 'مطعم البيك', category: 'مطاعم',amount: 75,   date: daysAgo(2),  type: 'debit'  },
        { id: uid(), merchant: 'الراتب',     category: 'راتب', amount: 9000, date: daysAgo(27), type: 'credit' },
      ],
      alerts: [
        { id: uid(), message: 'وسق: وضعك المالي ممتاز هذا الشهر — استمر!', type: 'info', timestamp: hoursAgo(1), read: false },
      ],
    }),
  },
  {
    num: 2, title: 'خطر متوسط', desc: 'التزامات قادمة قبل الراتب',
    badge: 'انتبه', badgeClass: 'bg-amber-100 text-wasaq-warning border-amber-300',
    load: () => ({
      name: 'خالد', phone: '0501234567',
      salary: 9000, currentBalance: 4000, daysUntilSalary: 13,
      commitments: [
        { id: uid(), name: 'قسط السيارة', amount: 1850, dueInDays: 5,  source: 'auto'      },
        { id: uid(), name: 'فاتورة STC',  amount: 230,  dueInDays: 8,  source: 'recurring' },
        { id: uid(), name: 'Netflix',      amount: 65,   dueInDays: 15, source: 'recurring' },
        { id: uid(), name: 'Apple iCloud', amount: 39,   dueInDays: 20, source: 'recurring' },
        { id: uid(), name: 'Tabby',        amount: 420,  dueInDays: 10, source: 'deferred'  },
      ],
      transactions: [
        { id: uid(), merchant: 'LuLu Hypermarket', category: 'تسوق',           amount: 245, date: daysAgo(1),  type: 'debit'  },
        { id: uid(), merchant: 'Noon',              category: 'تسوق إلكتروني', amount: 189, date: daysAgo(2),  type: 'debit'  },
        { id: uid(), merchant: 'مطعم البيك',        category: 'مطاعم',          amount: 87,  date: daysAgo(3),  type: 'debit'  },
        { id: uid(), merchant: 'الراتب',            category: 'راتب',           amount: 9000,date: daysAgo(17), type: 'credit' },
      ],
      alerts: [
        { id: uid(), message: 'وسق: صرفك الآمن اليومي 72 ريال',              type: 'info',    timestamp: hoursAgo(1), read: false },
        { id: uid(), message: 'لديك قسط سيارة بعد 5 أيام بقيمة 1,850 ريال', type: 'warning', timestamp: hoursAgo(3), read: false },
      ],
    }),
  },
  {
    num: 3, title: 'ضغط مالي', desc: 'تجاوز الحد الآمن — خطر',
    badge: 'خطر', badgeClass: 'bg-red-100 text-wasaq-danger border-red-300',
    load: () => ({
      name: 'خالد', phone: '0501234567',
      salary: 9000, currentBalance: 3200, daysUntilSalary: 22,
      commitments: [
        { id: uid(), name: 'قسط السيارة', amount: 1850, dueInDays: 4,  source: 'auto'      },
        { id: uid(), name: 'قسط شخصي',   amount: 900,  dueInDays: 7,  source: 'auto'      },
        { id: uid(), name: 'فاتورة STC',  amount: 230,  dueInDays: 8,  source: 'recurring' },
        { id: uid(), name: 'Tabby',        amount: 650,  dueInDays: 5,  source: 'deferred'  },
        { id: uid(), name: 'Netflix',      amount: 65,   dueInDays: 12, source: 'recurring' },
        { id: uid(), name: 'Apple iCloud', amount: 39,   dueInDays: 18, source: 'recurring' },
      ],
      transactions: [
        { id: uid(), merchant: 'Jarir',            category: 'تسوق',  amount: 1200, date: daysAgo(2), type: 'debit'  },
        { id: uid(), merchant: 'LuLu Hypermarket', category: 'تسوق',  amount: 380,  date: daysAgo(4), type: 'debit'  },
        { id: uid(), merchant: 'مطعم البيك',       category: 'مطاعم', amount: 95,   date: daysAgo(5), type: 'debit'  },
        { id: uid(), merchant: 'الراتب',           category: 'راتب',  amount: 9000, date: daysAgo(9), type: 'credit' },
      ],
      alerts: [
        { id: uid(), message: 'وسق: تجاوزت الحد الآمن — تجنب أي صرف حتى الراتب', type: 'danger',  timestamp: hoursAgo(1), read: false },
        { id: uid(), message: 'قسط السيارة يستحق خلال 4 أيام: 1,850 ريال',        type: 'warning', timestamp: hoursAgo(2), read: false },
        { id: uid(), message: 'Tabby: قسط 650 ريال يستحق خلال 5 أيام',            type: 'warning', timestamp: hoursAgo(4), read: false },
      ],
    }),
  },
  {
    num: 4, title: 'التزامات ثقيلة', desc: 'راتب أعلى — قروض واشتراكات كثيرة',
    badge: 'انتبه', badgeClass: 'bg-amber-100 text-wasaq-warning border-amber-300',
    load: () => ({
      name: 'خالد', phone: '0501234567',
      salary: 12000, currentBalance: 6000, daysUntilSalary: 10,
      commitments: [
        { id: uid(), name: 'قسط السيارة', amount: 2200, dueInDays: 3,  source: 'auto'      },
        { id: uid(), name: 'قسط شخصي',   amount: 1500, dueInDays: 6,  source: 'auto'      },
        { id: uid(), name: 'Tabby',        amount: 850,  dueInDays: 9,  source: 'deferred'  },
        { id: uid(), name: 'STC',          amount: 350,  dueInDays: 8,  source: 'recurring' },
        { id: uid(), name: 'Netflix',      amount: 65,   dueInDays: 12, source: 'recurring' },
        { id: uid(), name: 'Spotify',      amount: 29,   dueInDays: 15, source: 'recurring' },
        { id: uid(), name: 'Apple iCloud', amount: 39,   dueInDays: 20, source: 'recurring' },
      ],
      transactions: [
        { id: uid(), merchant: 'H&M',         category: 'تسوق',  amount: 850,   date: daysAgo(1),  type: 'debit'  },
        { id: uid(), merchant: 'Costa Coffee', category: 'مقاهي', amount: 95,    date: daysAgo(2),  type: 'debit'  },
        { id: uid(), merchant: 'Carrefour',    category: 'تسوق',  amount: 540,   date: daysAgo(3),  type: 'debit'  },
        { id: uid(), merchant: 'الراتب',       category: 'راتب',  amount: 12000, date: daysAgo(21), type: 'credit' },
      ],
      alerts: [
        { id: uid(), message: 'وسق: لديك 7 التزامات بإجمالي 5,033 ريال قبل الراتب', type: 'warning', timestamp: hoursAgo(1), read: false },
        { id: uid(), message: 'قسط السيارة يستحق خلال 3 أيام: 2,200 ريال',          type: 'danger',  timestamp: hoursAgo(2), read: false },
      ],
    }),
  },
]

/* ─── Types ──────────────────────────────────────────────────── */
type ModalState =
  | { kind: 'commitment';   editing?: Commitment }
  | { kind: 'subscription'; editing?: Commitment }
  | { kind: 'transaction';  editing?: Transaction }
  | null

/* ─── Page ───────────────────────────────────────────────────── */
export default function DemoPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [modal,   setModal]   = useState<ModalState>(null)
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setProfile(loadProfile()) }, [])

  function persist(p: CustomerProfile, msg = 'تم الحفظ') {
    saveProfile(p)
    setProfile(p)
    flash(msg)
  }

  function flash(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2500)
  }

  /* Customer */
  function saveCustomer(fields: { name: string; salary: number; currentBalance: number; daysUntilSalary: number }) {
    if (!profile) return
    persist({ ...profile, ...fields }, 'تم حفظ بيانات العميل')
  }

  /* Scenario */
  function applyScenario(load: () => CustomerProfile) {
    const p = load()
    persist(p, 'تم تطبيق السيناريو')
  }

  /* Commitment */
  function saveCommitment(c: Commitment) {
    if (!profile) return
    const exists = profile.commitments.some(x => x.id === c.id)
    const updated = exists
      ? profile.commitments.map(x => x.id === c.id ? c : x)
      : [...profile.commitments, c]
    persist({ ...profile, commitments: updated })
    setModal(null)
  }
  function deleteCommitment(id: string) {
    if (!profile) return
    persist({ ...profile, commitments: profile.commitments.filter(c => c.id !== id) }, 'تم الحذف')
  }

  /* Transaction */
  function saveTransaction(t: Transaction) {
    if (!profile) return
    const exists = profile.transactions.some(x => x.id === t.id)
    const updated = exists
      ? profile.transactions.map(x => x.id === t.id ? t : x)
      : [t, ...profile.transactions]
    persist({ ...profile, transactions: updated })
    setModal(null)
  }
  function deleteTransaction(id: string) {
    if (!profile) return
    persist({ ...profile, transactions: profile.transactions.filter(t => t.id !== id) }, 'تم الحذف')
  }

  /* Export */
  function handleExport() {
    if (!profile) return
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `wasaq-demo-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    flash('تم التصدير')
  }

  /* Import */
  function handleImportClick() { fileRef.current?.click() }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!isValidProfile(parsed)) { flash('JSON غير صالح — تحقق من البنية', false); return }
        persist(parsed, 'تم الاستيراد بنجاح')
      } catch { flash('خطأ في قراءة الملف', false) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  /* Reset */
  function handleReset() {
    resetProfile()
    const p = loadProfile()
    setProfile(p)
    flash('تم إعادة الضبط')
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wasaq-primary/30 border-t-wasaq-primary rounded-full animate-spin" />
      </div>
    )
  }

  const commitments   = profile.commitments.filter(c => c.source !== 'recurring')
  const subscriptions = profile.commitments.filter(c => c.source === 'recurring')

  return (
    <div dir="rtl" className="min-h-screen bg-app-bg">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-bold transition-all ${toast.ok ? 'bg-wasaq-primary' : 'bg-wasaq-danger'}`}>
          {toast.ok ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()}>
            {(modal.kind === 'commitment' || modal.kind === 'subscription') && (
              <CommitmentForm
                editing={modal.editing}
                forceSource={modal.kind === 'subscription' ? 'recurring' : undefined}
                onSave={saveCommitment}
                onClose={() => setModal(null)}
              />
            )}
            {modal.kind === 'transaction' && (
              <TransactionForm
                editing={modal.editing}
                onSave={saveTransaction}
                onClose={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}

      {/* Page */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-app-text font-black text-2xl">لوحة تحكم الديمو</h1>
            <p className="text-app-muted text-sm mt-0.5">وسق — للعرض التقديمي فقط · /demo</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleExport}       className="btn-admin btn-teal"><Download size={14} />تصدير JSON</button>
            <button onClick={handleImportClick}  className="btn-admin btn-outline"><Upload size={14} />استيراد JSON</button>
            <button disabled title="قريباً"     className="btn-admin btn-outline opacity-50 cursor-not-allowed">
              <Upload size={14} />استيراد CSV (قريباً)
            </button>
            <button onClick={handleReset}        className="btn-admin btn-danger"><RefreshCw size={14} />إعادة الضبط</button>
          </div>
        </div>

        {/* A: Customer */}
        <Card title="أ — بيانات العميل">
          <CustomerForm profile={profile} onSave={saveCustomer} />
        </Card>

        {/* E: Scenarios */}
        <Card title="ه — سيناريوهات سريعة">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SCENARIOS.map(s => (
              <button
                key={s.num}
                onClick={() => applyScenario(s.load)}
                className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:border-wasaq-primary/40 hover:shadow-sm transition-all text-right active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-app-muted text-xs font-bold">#{s.num}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badgeClass}`}>{s.badge}</span>
                </div>
                <p className="text-app-text font-bold text-sm leading-tight">{s.title}</p>
                <p className="text-app-muted text-[11px] leading-relaxed">{s.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* B: Commitments */}
        <Card
          title="ب — الالتزامات"
          action={<button onClick={() => setModal({ kind: 'commitment' })} className="btn-admin btn-teal text-xs"><Plus size={13} />أضف</button>}
        >
          {commitments.length === 0 ? (
            <EmptyRow text="لا توجد التزامات" />
          ) : (
            <TableRows
              headers={['الاسم', 'المبلغ (ريال)', 'موعد الاستحقاق', 'المصدر', '']}
              rows={commitments.map(c => ({
                id: c.id,
                cells: [
                  c.name,
                  c.amount.toLocaleString('en'),
                  `${c.dueInDays} يوم`,
                  SOURCE_LABELS[c.source],
                ],
                onEdit:   () => setModal({ kind: 'commitment', editing: c }),
                onDelete: () => deleteCommitment(c.id),
              }))}
            />
          )}
        </Card>

        {/* D: Subscriptions */}
        <Card
          title="د — الاشتراكات الشهرية"
          action={<button onClick={() => setModal({ kind: 'subscription' })} className="btn-admin btn-teal text-xs"><Plus size={13} />أضف</button>}
        >
          {subscriptions.length === 0 ? (
            <EmptyRow text="لا توجد اشتراكات" />
          ) : (
            <TableRows
              headers={['الاسم', 'المبلغ (ريال)', 'التكرار', '']}
              rows={subscriptions.map(c => ({
                id: c.id,
                cells: [
                  c.name,
                  c.amount.toLocaleString('en'),
                  <span key="m" className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-bold">شهري</span>,
                ],
                onEdit:   () => setModal({ kind: 'subscription', editing: c }),
                onDelete: () => deleteCommitment(c.id),
              }))}
            />
          )}
        </Card>

        {/* C: Transactions */}
        <Card
          title="ج — المعاملات"
          action={<button onClick={() => setModal({ kind: 'transaction' })} className="btn-admin btn-teal text-xs"><Plus size={13} />أضف</button>}
        >
          {profile.transactions.length === 0 ? (
            <EmptyRow text="لا توجد معاملات" />
          ) : (
            <TableRows
              headers={['التاجر', 'الفئة', 'المبلغ', 'النوع', 'التاريخ', '']}
              rows={profile.transactions.slice(0, 10).map(t => ({
                id: t.id,
                cells: [
                  t.merchant,
                  t.category,
                  t.amount.toLocaleString('en'),
                  <span key="type" className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${t.type === 'credit' ? 'bg-green-50 text-wasaq-safe border-green-200' : 'bg-gray-50 text-app-muted border-gray-200'}`}>
                    {t.type === 'credit' ? 'إيداع' : 'سحب'}
                  </span>,
                  toDateInput(t.date),
                ],
                onDelete: () => deleteTransaction(t.id),
              }))}
              hideEdit
            />
          )}
          {profile.transactions.length > 10 && (
            <p className="text-app-muted text-xs text-center pt-2">عرض أحدث 10 معاملات فقط</p>
          )}
        </Card>

        {/* Current state summary */}
        <Card title="الحالة الحالية في localStorage">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <StatCell label="الرصيد" value={`${profile.currentBalance.toLocaleString('en')} ر`} />
            <StatCell label="الراتب" value={`${profile.salary.toLocaleString('en')} ر`} />
            <StatCell label="حتى الراتب" value={`${profile.daysUntilSalary} يوم`} />
            <StatCell label="الالتزامات" value={`${profile.commitments.length} بند`} />
          </div>
        </Card>

      </div>

      {/* Inline styles for admin buttons */}
      <style jsx global>{`
        .btn-admin { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:12px; font-weight:700; font-size:12px; transition:all .15s; white-space:nowrap; }
        .btn-admin:active { transform:scale(.97); }
        .btn-teal { background:#0F766E; color:#fff; }
        .btn-teal:hover { background:#0d6560; }
        .btn-outline { background:#fff; color:#1E1B24; border:1.5px solid #e5e7eb; }
        .btn-outline:hover { border-color:#0F766E; color:#0F766E; }
        .btn-danger { background:#DC2626; color:#fff; }
        .btn-danger:hover { background:#b91c1c; }
      `}</style>
    </div>
  )
}

/* ─── Card wrapper ───────────────────────────────────────────── */
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-app-text font-bold text-sm">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-app-muted text-sm text-center py-4">{text}</p>
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-app-bg rounded-2xl p-3">
      <p className="text-app-muted text-[10px] mb-1">{label}</p>
      <p className="text-app-text font-bold text-sm">{value}</p>
    </div>
  )
}

/* ─── Table rows ─────────────────────────────────────────────── */
type TableRow = {
  id: string
  cells: (string | React.ReactNode)[]
  onEdit?:   () => void
  onDelete?: () => void
}

function TableRows({
  headers, rows, hideEdit = false,
}: { headers: string[]; rows: TableRow[]; hideEdit?: boolean }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[400px]">
        <thead>
          <tr className="border-b border-gray-100">
            {headers.map((h, i) => (
              <th key={i} className="text-right text-app-muted text-[11px] font-semibold pb-2 px-2 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-b border-gray-50 hover:bg-app-bg transition-colors">
              {row.cells.map((cell, i) => (
                <td key={i} className="py-2.5 px-2 text-app-text text-xs whitespace-nowrap">{cell}</td>
              ))}
              <td className="py-2.5 px-2">
                <div className="flex items-center gap-1">
                  {!hideEdit && row.onEdit && (
                    <button onClick={row.onEdit}   className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Edit2 size={13} /></button>
                  )}
                  {row.onDelete && (
                    <button onClick={row.onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-wasaq-danger transition-colors"><Trash2 size={13} /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Customer form ──────────────────────────────────────────── */
function CustomerForm({
  profile, onSave,
}: {
  profile: CustomerProfile
  onSave: (f: { name: string; salary: number; currentBalance: number; daysUntilSalary: number }) => void
}) {
  const [name,            setName]    = useState(profile.name)
  const [salary,          setSalary]  = useState(String(profile.salary))
  const [balance,         setBalance] = useState(String(profile.currentBalance))
  const [daysUntilSalary, setDays]    = useState(String(profile.daysUntilSalary))

  useEffect(() => {
    setName(profile.name)
    setSalary(String(profile.salary))
    setBalance(String(profile.currentBalance))
    setDays(String(profile.daysUntilSalary))
  }, [profile])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      name,
      salary:          Number(salary),
      currentBalance:  Number(balance),
      daysUntilSalary: Number(daysUntilSalary),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label="الاسم"            value={name}    onChange={setName}    type="text"   />
        <Field label="الراتب (ريال)"   value={salary}  onChange={setSalary}  type="number" />
        <Field label="الرصيد الحالي"   value={balance} onChange={setBalance} type="number" />
        <Field label="أيام حتى الراتب" value={daysUntilSalary} onChange={setDays} type="number" />
      </div>
      <button type="submit" className="btn-admin btn-teal">
        <Check size={14} />حفظ بيانات العميل
      </button>
    </form>
  )
}

/* ─── Commitment form (modal) ────────────────────────────────── */
function CommitmentForm({
  editing, forceSource, onSave, onClose,
}: {
  editing?:     Commitment
  forceSource?: CommitmentSource
  onSave:       (c: Commitment) => void
  onClose:      () => void
}) {
  const [name,      setName]   = useState(editing?.name ?? '')
  const [amount,    setAmount] = useState(String(editing?.amount ?? ''))
  const [dueInDays, setDays]   = useState(String(editing?.dueInDays ?? '30'))
  const [source,    setSource] = useState<CommitmentSource>(editing?.source ?? forceSource ?? 'manual')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !amount) return
    onSave({
      id:       editing?.id ?? uid(),
      name,
      amount:   Number(amount),
      dueInDays: Number(dueInDays),
      source:   forceSource ?? source,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-app-text font-bold text-base">{editing ? 'تعديل' : 'إضافة'} {forceSource === 'recurring' ? 'اشتراك' : 'التزام'}</h3>
        <button type="button" onClick={onClose} className="text-app-muted hover:text-app-text"><X size={18} /></button>
      </div>
      <div className="flex flex-col gap-3 mb-4">
        <Field label="الاسم"                value={name}      onChange={setName}   type="text"   />
        <Field label="المبلغ (ريال)"        value={amount}    onChange={setAmount} type="number" />
        <Field label="موعد الاستحقاق (أيام)" value={dueInDays} onChange={setDays} type="number" />
        {!forceSource && (
          <div>
            <label className="text-app-muted text-xs mb-1.5 block">المصدر</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value as CommitmentSource)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-wasaq-primary"
            >
              {(Object.keys(SOURCE_LABELS) as CommitmentSource[]).map(s => (
                <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-admin btn-teal flex-1 justify-center"><Check size={14} />حفظ</button>
        <button type="button" onClick={onClose} className="btn-admin btn-outline"><X size={14} />إلغاء</button>
      </div>
    </form>
  )
}

/* ─── Transaction form (modal) ───────────────────────────────── */
function TransactionForm({
  editing, onSave, onClose,
}: {
  editing?: Transaction
  onSave:   (t: Transaction) => void
  onClose:  () => void
}) {
  const [merchant, setMerchant] = useState(editing?.merchant ?? '')
  const [category, setCategory] = useState(editing?.category ?? '')
  const [amount,   setAmount]   = useState(String(editing?.amount ?? ''))
  const [type,     setType]     = useState<'debit' | 'credit'>(editing?.type ?? 'debit')
  const [date,     setDate]     = useState(editing ? toDateInput(editing.date) : toDateInput(new Date().toISOString()))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!merchant || !amount) return
    onSave({
      id:       editing?.id ?? uid(),
      merchant,
      category,
      amount:   Number(amount),
      type,
      date:     new Date(date).toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-app-text font-bold text-base">{editing ? 'تعديل' : 'إضافة'} معاملة</h3>
        <button type="button" onClick={onClose} className="text-app-muted hover:text-app-text"><X size={18} /></button>
      </div>
      <div className="flex flex-col gap-3 mb-4">
        <Field label="التاجر"       value={merchant} onChange={setMerchant} type="text" />
        <Field label="الفئة"        value={category} onChange={setCategory} type="text" />
        <Field label="المبلغ (ريال)" value={amount}  onChange={setAmount}   type="number" />
        <div>
          <label className="text-app-muted text-xs mb-1.5 block">النوع</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as 'debit' | 'credit')}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-wasaq-primary"
          >
            <option value="debit">سحب</option>
            <option value="credit">إيداع</option>
          </select>
        </div>
        <div>
          <label className="text-app-muted text-xs mb-1.5 block">التاريخ</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-wasaq-primary"
            dir="ltr"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-admin btn-teal flex-1 justify-center"><Check size={14} />حفظ</button>
        <button type="button" onClick={onClose} className="btn-admin btn-outline"><X size={14} />إلغاء</button>
      </div>
    </form>
  )
}

/* ─── Shared field ───────────────────────────────────────────── */
function Field({
  label, value, onChange, type,
}: {
  label: string; value: string; onChange: (v: string) => void; type: string
}) {
  return (
    <div>
      <label className="text-app-muted text-xs mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-app-bg text-app-text text-sm outline-none focus:border-wasaq-primary transition-colors"
        dir={type === 'number' ? 'ltr' : 'rtl'}
        required
      />
    </div>
  )
}
