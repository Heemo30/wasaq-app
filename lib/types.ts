export type WasaqStatus = 'آمن' | 'انتبه' | 'خطر'

export type CommitmentSource = 'auto' | 'recurring' | 'deferred' | 'manual'

export interface Commitment {
  id: string
  name: string
  amount: number
  dueInDays: number
  source: CommitmentSource
}

export interface Transaction {
  id: string
  merchant: string
  category: string
  amount: number
  date: string
  type: 'debit' | 'credit'
}

export interface Alert {
  id: string
  message: string
  type: 'info' | 'warning' | 'danger' | 'success'
  timestamp: string
  read: boolean
}

export interface CustomerProfile {
  name: string
  phone: string
  salary: number
  currentBalance: number
  daysUntilSalary: number
  commitments: Commitment[]
  transactions: Transaction[]
  alerts: Alert[]
}

export interface WasaqResult {
  score: number
  status: WasaqStatus
  safeAmount: number
  safeDailySpend: number
  commitmentsTotal: number
  safetyBuffer: number
  isOverLimit: boolean
}
