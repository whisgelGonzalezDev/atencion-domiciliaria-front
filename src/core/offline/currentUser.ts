export function currentUserId(): string | undefined {
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? (JSON.parse(raw) as { id?: string }).id : undefined
  } catch {
    return undefined
  }
}
