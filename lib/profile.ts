export type LocalProfile = {
  id: string
  display_name: string
  bio: string
}

const STORAGE_KEY = 'campus-explorer-profile'

export function saveLocalProfile(profile: LocalProfile) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function getLocalProfile(): LocalProfile | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LocalProfile
  } catch {
    return null
  }
}

export function clearLocalProfile() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
