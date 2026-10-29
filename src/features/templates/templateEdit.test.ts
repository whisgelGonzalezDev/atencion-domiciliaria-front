import { describe, expect, it } from 'vitest'
import { DEFAULT_TEMPLATES } from '../requests/pdf/template/defaults'
import { BINDINGS } from '../requests/pdf/template/bindings'
import type { DocumentDefinition } from '../requests/pdf/template/types'
import { moveItem, newField, newSection, removeAt, validateTemplate, widthForSource } from './templateEdit'

describe('moveItem', () => {
  it('swaps with the neighbour and leaves the original untouched', () => {
    const list = ['a', 'b', 'c']
    expect(moveItem(list, 1, -1)).toEqual(['b', 'a', 'c'])
    expect(moveItem(list, 1, 1)).toEqual(['a', 'c', 'b'])
    expect(list).toEqual(['a', 'b', 'c'])
  })

  it('does nothing at the edges', () => {
    const list = ['a', 'b']
    expect(moveItem(list, 0, -1)).toBe(list)
    expect(moveItem(list, 1, 1)).toBe(list)
  })
})

describe('field helpers', () => {
  it('removes by index', () => expect(removeAt([1, 2, 3], 1)).toEqual([1, 3]))

  it('gives long sources full width and short ones a third by default', () => {
    expect(newField('record.diagnosis').width).toBe('full')
    expect(newField('patient.age').width).toBe('third')
  })

  it('forces full width when the source becomes a long text, keeping the choice otherwise', () => {
    expect(widthForSource('record.recipeText', 'third')).toBe('full')
    expect(widthForSource('patient.age', 'half')).toBe('half')
  })

  it('uses the catalog label for a new field and unique ids', () => {
    const a = newField('vitals.bp')
    expect(a.label).toBe(BINDINGS['vitals.bp'].label)
    expect(newField().id).not.toBe(newField().id)
  })
})

describe('validateTemplate', () => {
  const base: DocumentDefinition = DEFAULT_TEMPLATES.recipe

  it('accepts every built-in template', () => {
    for (const def of Object.values(DEFAULT_TEMPLATES)) expect(validateTemplate(def)).toBeNull()
  })

  it('rejects a blank title, no blocks, an empty section and an empty signature block', () => {
    expect(validateTemplate({ ...base, header: { ...base.header, title: ' ' } })).toMatch(/título/)
    expect(validateTemplate({ ...base, blocks: [] })).toMatch(/al menos una sección/)
    expect(validateTemplate({ ...base, blocks: [{ ...newSection(), fields: [] }] })).toMatch(/no tiene campos/)
    expect(validateTemplate({ ...base, blocks: [{ type: 'signatures', id: 's', items: [] }] })).toMatch(/firmantes/)
  })
})
