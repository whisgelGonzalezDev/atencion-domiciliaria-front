import type { MedicationEntry } from '@/core/api/types'

const key = (text: string) => text.toLowerCase().replace(/[\s.;,]+$/g, '').replace(/\s+/g, ' ').trim()

/** One récipe line becomes one medication; bullets and numbering the doctor typed are dropped. */
export function recipeLines(recipeText: string): string[] {
  return recipeText
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
}

/**
 * Adds the ficha's récipe to the history's "Medicación actual" without
 * touching what is already there. Lines already present (ignoring case and
 * trailing punctuation) are skipped, so pressing the button twice, or after
 * the doctor already typed one, never duplicates a medication.
 */
export function addRecipeToMedications(
  current: MedicationEntry[],
  recipeText: string,
): { next: MedicationEntry[]; added: number } {
  const known = new Set(current.map((m) => key(m.name ?? '')))
  const fresh: MedicationEntry[] = []
  for (const line of recipeLines(recipeText)) {
    const k = key(line)
    if (known.has(k)) continue
    known.add(k)
    fresh.push({ name: line })
  }
  return { next: [...current, ...fresh], added: fresh.length }
}
