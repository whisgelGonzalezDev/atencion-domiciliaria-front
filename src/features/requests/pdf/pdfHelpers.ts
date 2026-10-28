import type { jsPDF } from 'jspdf'

export const MARGIN = 16
export const PAGE_WIDTH = 210
export const PAGE_HEIGHT = 297
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

export async function loadLogoDataUrl(logoUrl: string | null | undefined): Promise<string | null> {
  if (!logoUrl) return null
  try {
    const res = await fetch(logoUrl)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3 ? normalized.split('').map(c => c + c).join('') : normalized
  const num = parseInt(full, 16)
  if (Number.isNaN(num)) return [24, 24, 27]
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

/** Starts a new page and resets the cursor to the top margin if `needed` mm won't fit before PAGE_HEIGHT. */
export function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage()
    return MARGIN
  }
  return y
}

interface HeaderOptions {
  clinicName: string
  logoDataUrl: string | null
  accentRgb: [number, number, number]
  title: string
  subtitle?: string
}

/** Draws the clinic branding + document title and returns the y cursor just below the divider. */
export function drawHeader(doc: jsPDF, { clinicName, logoDataUrl, accentRgb, title, subtitle }: HeaderOptions): number {
  let y = MARGIN

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', MARGIN, y, 20, 20)
    } catch {
      // Unsupported image format: fall back to text-only branding.
    }
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(24, 24, 27)
  doc.text(clinicName, logoDataUrl ? MARGIN + 24 : MARGIN, y + 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...accentRgb)
  doc.text(title, PAGE_WIDTH - MARGIN, y + 8, { align: 'right' })

  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(113, 113, 122)
    doc.text(subtitle, PAGE_WIDTH - MARGIN, y + 13, { align: 'right' })
  }

  y += 24
  doc.setDrawColor(...accentRgb)
  doc.setLineWidth(0.6)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  doc.setTextColor(24, 24, 27)
  return y + 7
}

export function addSectionTitle(doc: jsPDF, y: number, text: string, accentRgb: [number, number, number]): number {
  y = ensureSpace(doc, y, 10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...accentRgb)
  doc.text(text.toUpperCase(), MARGIN, y)
  doc.setDrawColor(228, 228, 231)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y + 1.5, PAGE_WIDTH - MARGIN, y + 1.5)
  doc.setTextColor(24, 24, 27)
  return y + 7
}

/** Label + wrapped value text. Falls back to an italic placeholder when `value` is empty. */
export function addLabelValue(doc: jsPDF, y: number, label: string, value: string, opts: { placeholder?: string } = {}): number {
  const text = value.trim() || opts.placeholder || 'No registrado'
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH) as string[]
  y = ensureSpace(doc, y, 5 + lines.length * 4.2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(113, 113, 122)
  doc.text(`${label}:`, MARGIN, y)
  y += 4.3

  const hasValue = value.trim().length > 0
  doc.setFont('helvetica', hasValue ? 'normal' : 'italic')
  doc.setFontSize(9.5)
  doc.setTextColor(hasValue ? 24 : 161, hasValue ? 24 : 161, hasValue ? 27 : 161)
  for (const line of lines) {
    y = ensureSpace(doc, y, 4.2)
    doc.text(line, MARGIN, y)
    y += 4.2
  }
  doc.setTextColor(24, 24, 27)
  return y + 2.5
}

/** Up to three short label/value pairs on one row (for compact demographic fields). */
export function addLabelValueRow(doc: jsPDF, y: number, pairs: { label: string; value: string }[]): number {
  y = ensureSpace(doc, y, 9)
  const colWidth = CONTENT_WIDTH / pairs.length
  pairs.forEach((p, i) => {
    const x = MARGIN + i * colWidth
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(113, 113, 122)
    doc.text(`${p.label}:`, x, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(24, 24, 27)
    doc.text(p.value.trim() || '—', x, y + 4.3)
  })
  return y + 9
}

export function addSignatureRow(doc: jsPDF, y: number, signatures: { label: string; dataUrl: string | null; signedAt: string | null }[]): number {
  const needed = 28
  y = ensureSpace(doc, y, needed)
  const colWidth = CONTENT_WIDTH / signatures.length
  signatures.forEach((s, i) => {
    const x = MARGIN + i * colWidth
    if (s.dataUrl) {
      try { doc.addImage(s.dataUrl, 'PNG', x, y, colWidth - 10, 16) } catch { /* unsupported format */ }
    }
    doc.setDrawColor(161, 161, 170)
    doc.setLineWidth(0.3)
    doc.line(x, y + 18, x + colWidth - 10, y + 18)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(113, 113, 122)
    doc.text(s.label, x, y + 22)
    if (s.signedAt) {
      doc.setFontSize(7)
      doc.text(new Date(s.signedAt).toLocaleString('es', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), x, y + 25.5)
    }
  })
  doc.setTextColor(24, 24, 27)
  return y + needed + 2
}
