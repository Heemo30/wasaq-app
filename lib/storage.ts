import { CustomerProfile } from './types'
import { defaultProfile } from './data'

const PROFILE_KEY = 'wasaq_profile'
const AUTH_KEY = 'wasaq_auth'

export function loadProfile(): CustomerProfile {
  if (typeof window === 'undefined') return defaultProfile
  try {
    const stored = localStorage.getItem(PROFILE_KEY)
    if (!stored) return defaultProfile
    return { ...defaultProfile, ...JSON.parse(stored) }
  } catch {
    return defaultProfile
  }
}

export function saveProfile(profile: CustomerProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function resetProfile(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PROFILE_KEY)
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(AUTH_KEY) === 'true'
}

export function setAuthenticated(value: boolean): void {
  if (typeof window === 'undefined') return
  if (value) {
    localStorage.setItem(AUTH_KEY, 'true')
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}
