import { describe, expect, it, vi } from 'vitest'
import type { MedRequest, ServiceRecord } from '@/core/api/types'

const calls: unknown[][] = []
vi.mock('jspdf', () => ({
  jsPDF: class {
    constructor() {
      return new Proxy({}, {
        get: (_t, name: string) => name === 'then' ? undefined : name === 'splitTextToSize'
          ? (text: string) => text.split('\n')
          : (...args: unknown[]) => { calls.push([name, ...args]) },
      })
    }
  },
}))

import { emptyServiceRecord } from '../../emptyServiceRecord'
import { renderDocument } from './render'
import { BINDINGS } from './bindings'
import { DEFAULT_TEMPLATES } from './defaults'
import { DOC_TYPES, type DocumentDefinition } from './types'

const request = { id: 'r1', patient: { name: 'Ana', age: 30, phone: '1' }, address: 'x', symptoms: 'y', doctor: null } as unknown as MedRequest
const record: ServiceRecord = { ...emptyServiceRecord(), recipeText: 'Reposo' }

const texts = () => calls.filter((c) => c[0] === 'text').map((c) => c[1])
const render = async (def: DocumentDefinition) => { calls.length = 0; await renderDocument('recipe', def, request, record, null) }

describe('default templates', () => {
  it('only bind to fields that exist in the catalog', () => {
    for (const type of DOC_TYPES) {
      for (const block of DEFAULT_TEMPLATES[type].blocks) {
        if (block.type !== 'section') continue
        for (const field of block.fields) expect(BINDINGS[field.source], `${type}/${field.id}`).toBeDefined()
      }
    }
  })
})

describe('renderDocument', () => {
  it('draws a custom template: its own title, fields in order, and a placeholder for empty values', async () => {
    await render({
      version: 1,
      header: { title: 'ORDEN', showLogo: false, showClinicName: false },
      blocks: [{
        type: 'section', id: 's', title: 'Datos',
        fields: [
          { id: 'a', label: 'Paciente', source: 'patient.name', width: 'full' },
          { id: 'b', label: 'Récipe', source: 'record.recipeText', width: 'full' },
          { id: 'c', label: 'Indicaciones', source: 'record.indicationsText', width: 'full', placeholder: 'Sin indicaciones' },
        ],
      }],
    })

    const drawn = texts()
    expect(drawn).toContain('ORDEN')
    expect(drawn).toContain('DATOS')
    expect(drawn.indexOf('Ana')).toBeLessThan(drawn.indexOf('Reposo'))
    expect(drawn).toContain('Sin indicaciones')
  })

  it('packs short fields into rows by width and keeps full-width ones apart', async () => {
    await render({
      version: 1,
      header: { title: 'T', showLogo: false, showClinicName: false },
      blocks: [{
        type: 'section', id: 's',
        fields: [
          { id: '1', label: 'A', source: 'patient.name', width: 'half' },
          { id: '2', label: 'B', source: 'patient.phone', width: 'half' },
          { id: '3', label: 'C', source: 'patient.age', width: 'half' },
        ],
      }],
    })

    // Three half-width fields -> a row of two (columns at 16 and 16 + 178/2) and a row of one.
    const labelXs = calls.filter((c) => c[0] === 'text' && String(c[1]).endsWith(':')).map((c) => c[2])
    expect(labelXs).toEqual([16, 105, 16])
  })

  it('prints empty for an unknown binding instead of failing', async () => {
    await expect(render({
      version: 1,
      header: { title: 'T', showLogo: false, showClinicName: false },
      blocks: [{ type: 'section', id: 's', fields: [{ id: 'x', label: 'Dato', source: 'does.not.exist', width: 'full' }] }],
    })).resolves.toBeUndefined()
    expect(texts()).toContain('No registrado')
  })
})
