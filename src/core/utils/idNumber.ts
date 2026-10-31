/**
 * Mirrors the backend's canonical form so the form can warn before sending:
 * separators dropped, uppercase, bare digits read as a Venezuelan cédula ("V").
 * Passports and other alphanumeric documents pass through.
 */
export function normalizeIdNumber(raw: string): string | null {
  const compact = raw.replace(/[\s.\-_]/g, '').toUpperCase()
  if (/^\d+$/.test(compact)) return compact.length >= 5 && compact.length <= 19 ? `V${compact}` : null
  return /^[A-Z0-9]{5,20}$/.test(compact) ? compact : null
}

/** "V12345678" -> "V-12345678" for display; anything else is shown as stored. */
export function formatIdNumber(canonical: string | null | undefined): string {
  if (!canonical) return ''
  const match = /^([A-Z])(\d{5,})$/.exec(canonical)
  return match ? `${match[1]}-${match[2]}` : canonical
}
