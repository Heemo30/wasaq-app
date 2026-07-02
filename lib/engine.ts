import { CustomerProfile, WasaqResult, WasaqStatus } from './types'

export function calculateWasaq(profile: CustomerProfile): WasaqResult {
  const { salary, currentBalance, daysUntilSalary, commitments } = profile

  const safetyBuffer    = Math.max(300, salary * 0.05)
  const commitmentsTotal = commitments.reduce((sum, c) => sum + c.amount, 0)
  const safeAmount      = currentBalance - commitmentsTotal - safetyBuffer
  const isOverLimit     = safeAmount <= 0
  const safeDailySpend  = daysUntilSalary > 0 ? safeAmount / daysUntilSalary : 0

  // Cube-root scaling keeps "cautious" situations in the 55–70 band (انتبه)
  // and reserves 70+ (آمن) for genuinely healthy cash positions.
  const idealTotal = Math.max((salary / 30) * Math.max(daysUntilSalary, 1), 1)
  const safeRatio  = Math.max(0, safeAmount) / idealTotal
  const score      = Math.min(100, Math.round(Math.cbrt(safeRatio) * 100))

  let status: WasaqStatus
  if (score >= 70)      status = 'آمن'
  else if (score >= 35) status = 'انتبه'
  else                  status = 'خطر'

  return { score, status, safeAmount, safeDailySpend, commitmentsTotal, safetyBuffer, isOverLimit }
}
