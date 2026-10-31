import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OfflineQueuedError } from '@/core/utils/apiClient'

const getById = vi.fn()
const resolve = vi.fn()
const upload = vi.fn()
const buildDocument = vi.fn()

vi.mock('@/core/api/requests.api', () => ({ requestsApi: { getById: (...a: unknown[]) => getById(...a) } }))
vi.mock('@/core/api/document-templates.api', () => ({ documentTemplatesApi: { resolve: (...a: unknown[]) => resolve(...a) } }))
vi.mock('@/core/api/files.api', () => ({ filesApi: { uploadForRequest: (...a: unknown[]) => upload(...a) } }))
vi.mock('@/features/requests/pdf/template/render', () => ({ buildDocument: (...a: unknown[]) => buildDocument(...a) }))

import { attachRecipeToRequest } from './attachRecipe'

const request = (recipeText: string, entity: { id: string } | null = null) => ({
  id: 'req-1', requestingEntity: entity, serviceRecord: { recipeText },
})

beforeEach(() => {
  vi.clearAllMocks()
  resolve.mockResolvedValue({ recipe: null, report: null, interconsulta: null })
  buildDocument.mockResolvedValue({ output: () => new Blob(['%PDF-fake'], { type: 'application/pdf' }) })
  upload.mockResolvedValue({ id: 'att-1' })
})

describe('attachRecipeToRequest', () => {
  it('does nothing when the ficha has no récipe', async () => {
    getById.mockResolvedValue(request('  \n '))
    expect(await attachRecipeToRequest('req-1', null)).toBe('no-recipe')
    expect(buildDocument).not.toHaveBeenCalled()
    expect(upload).not.toHaveBeenCalled()
  })

  it('uploads recipe-<id>.pdf replacing the earlier one', async () => {
    getById.mockResolvedValue(request('Paracetamol'))
    expect(await attachRecipeToRequest('req-1', null)).toBe('attached')

    const [requestId, file, options] = upload.mock.calls[0] as [string, File, { replace: boolean }]
    expect(requestId).toBe('req-1')
    expect(file.name).toBe('recipe-req-1.pdf')
    expect(file.type).toBe('application/pdf')
    expect(options).toEqual({ replace: true })
  })

  it("draws it with the requesting entity's template when there is one", async () => {
    const custom = { version: 1, header: { title: 'RECETA DE LA ASEGURADORA' }, blocks: [{}] }
    getById.mockResolvedValue(request('Paracetamol', { id: 'ent-1' }))
    resolve.mockResolvedValue({ recipe: custom })

    await attachRecipeToRequest('req-1', null)

    expect(resolve).toHaveBeenCalledWith('ent-1')
    expect(buildDocument.mock.calls[0][0]).toBe(custom)
  })

  it('falls back to the built-in layout when templates cannot be fetched', async () => {
    getById.mockResolvedValue(request('Paracetamol'))
    resolve.mockRejectedValue(new Error('offline'))

    expect(await attachRecipeToRequest('req-1', null)).toBe('attached')
    expect((buildDocument.mock.calls[0][0] as { header: { title: string } }).header.title).toBe('RÉCIPE')
  })

  it('reports an upload that was queued offline instead of failing', async () => {
    getById.mockResolvedValue(request('Paracetamol'))
    upload.mockRejectedValue(new OfflineQueuedError())
    expect(await attachRecipeToRequest('req-1', null)).toBe('queued')
  })

  it('lets a real upload error reach the caller', async () => {
    getById.mockResolvedValue(request('Paracetamol'))
    upload.mockRejectedValue(new Error('403'))
    await expect(attachRecipeToRequest('req-1', null)).rejects.toThrow('403')
  })
})
