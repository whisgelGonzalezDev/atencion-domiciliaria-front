import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prefetchForOffline, type PrefetchApi } from './prefetch'
import type { MedRequest } from '@/core/api/types'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
})

const req = (id: string, state: string) => ({ id, state, patient: { id: `p-${id}` } }) as unknown as MedRequest

function fakeApi(requests: MedRequest[]) {
  const warmed: string[] = []
  const api: PrefetchApi = {
    listAssigned: vi.fn().mockResolvedValue(requests),
    warm: (r) => { warmed.push(r.id); return [Promise.resolve(), Promise.reject(new Error('one call fails'))] },
  }
  return { api, warmed }
}

describe('prefetchForOffline', () => {
  beforeEach(() => store.clear())

  it('warms only open requests and survives individual failures', async () => {
    const { api, warmed } = fakeApi([req('a', 'pending'), req('b', 'done'), req('c', 'attending'), req('d', 'cancelled')])

    const count = await prefetchForOffline('u1', api)

    expect(count).toBe(2)
    expect(warmed.sort()).toEqual(['a', 'c'])
  })

  it('does not run again within the minimum interval, but does after it', async () => {
    const { api } = fakeApi([req('a', 'pending')])
    let t = 1_000_000

    expect(await prefetchForOffline('u1', api, () => t)).toBe(1)
    t += 60_000
    expect(await prefetchForOffline('u1', api, () => t)).toBe(0)
    t += 11 * 60_000
    expect(await prefetchForOffline('u1', api, () => t)).toBe(1)
  })

  it('keeps the schedule independent per user and gives up quietly when the list cannot load', async () => {
    const failing: PrefetchApi = { listAssigned: vi.fn().mockRejectedValue(new Error('offline')), warm: () => [] }
    expect(await prefetchForOffline('u1', failing)).toBe(0)

    // A failed list must not burn the interval: the next attempt is allowed.
    const { api } = fakeApi([req('a', 'pending')])
    expect(await prefetchForOffline('u1', api)).toBe(1)
    expect(await prefetchForOffline('u2', api)).toBe(1)
  })
})
