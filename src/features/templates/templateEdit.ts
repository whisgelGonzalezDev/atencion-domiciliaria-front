import type {
  DocumentDefinition, SectionBlock, SignaturesBlock, TemplateBlock, TemplateField,
} from '../requests/pdf/template/types'
import { BINDINGS } from '../requests/pdf/template/bindings'

const uid = () => crypto.randomUUID().slice(0, 8)

/** Returns a copy with the item at `index` moved by `delta` positions (clamped); same array if nothing moves. */
export function moveItem<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list
  const next = [...list]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export const removeAt = <T,>(list: T[], index: number): T[] => list.filter((_, i) => i !== index)

export const replaceAt = <T,>(list: T[], index: number, item: T): T[] => list.map((x, i) => (i === index ? item : x))

export function newField(source = 'patient.name'): TemplateField {
  const binding = BINDINGS[source]
  return { id: uid(), label: binding?.label ?? 'Campo', source, width: binding?.kind === 'long' ? 'full' : 'third' }
}

export const newSection = (): SectionBlock => ({ type: 'section', id: uid(), title: 'Nueva sección', fields: [newField()] })

export const newSignatures = (): SignaturesBlock => ({
  type: 'signatures', id: uid(), spaceBefore: 10,
  items: [{ label: 'Firma del médico', who: 'doctor' }],
})

/**
 * What a field's width becomes when its source changes: a long text bound to a
 * short slot would be cut visually, so long sources go full width.
 */
export function widthForSource(source: string, current: TemplateField['width']): TemplateField['width'] {
  return BINDINGS[source]?.kind === 'long' ? 'full' : current
}

/** Problems that would make the saved template useless; the editor blocks saving until none remain. */
export function validateTemplate(definition: DocumentDefinition): string | null {
  if (!definition.header.title.trim()) return 'El documento necesita un título'
  if (definition.blocks.length === 0) return 'Agrega al menos una sección'
  for (const block of definition.blocks) {
    if (block.type === 'section' && block.fields.length === 0) {
      return `La sección "${block.title || 'sin título'}" no tiene campos`
    }
    if (block.type === 'signatures' && block.items.length === 0) return 'Un bloque de firmas no tiene firmantes'
  }
  return null
}

export const isSection = (b: TemplateBlock): b is SectionBlock => b.type === 'section'
