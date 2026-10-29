import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { classifyStatus } from './classify'
import {
  discardAction,
  enqueueAction,
  flushQueue,
  getQueueSnapshot,
  retryAction,
  subscribeSynced,
  type QueuedAction,
  type ReplayOutcome,
} from './queue'

const base = { method: 'PATCH' as const, endpoint: '/x', description: 'x' }
const ok = async (): Promise<ReplayOutcome> => ({ kind: 'ok' })

async function clearAll() {
  for (const a of getQueueSnapshot().actions) await discardAction(a.id)
  await flushQueue(ok)
}

describe('classifyStatus', () => {
  it.each([200, 204])('treats %i as ok', (s) => expect(classifyStatus(s, '').kind).toBe('ok'))
  it('treats 401 as an expired session', () => expect(classifyStatus(401, '').kind).toBe('auth'))
  it.each([408, 429, 500, 502, 503, 504])('keeps the action queued on %i (retry later)', (s) =>
    expect(classifyStatus(s, '').kind).toBe('offline'))
  it.each([400, 403, 404, 409, 422])('parks the action as rejected on %i', (s) =>
    expect(classifyStatus(s, 'nope')).toEqual({ kind: 'rejected', message: 'nope' }))
})

describe('offline queue', () => {
  beforeEach(clearAll)

  it('collapses actions that share a key into the latest one', async () => {
    await enqueueAction({ ...base, key: 'sr:1', body: 'v1' })
    await enqueueAction({ ...base, key: 'sr:1', body: 'v2' })
    await enqueueAction({ ...base, key: 'sr:2', body: 'other' })

    const bodies = getQueueSnapshot().actions.map((a) => a.body).sort()
    expect(bodies).toEqual(['other', 'v2'])
  })

  it('keeps actions without a key separate', async () => {
    await enqueueAction({ ...base, body: 'a' })
    await enqueueAction({ ...base, body: 'b' })
    expect(getQueueSnapshot().actions).toHaveLength(2)
  })

  it('replays in order and removes what the server accepted', async () => {
    await enqueueAction({ ...base, body: 'first' })
    await new Promise((r) => setTimeout(r, 2))
    await enqueueAction({ ...base, body: 'second' })
    const seen: string[] = []

    const result = await flushQueue(async (a) => { seen.push(a.body!); return { kind: 'ok' } })

    expect(seen).toEqual(['first', 'second'])
    expect(result.synced).toBe(2)
    expect(getQueueSnapshot().actions).toHaveLength(0)
  })

  it('notifies subscribers about each synced action', async () => {
    await enqueueAction({ ...base, key: 'sr:9', body: 'v' })
    const listener = vi.fn()
    const off = subscribeSynced(listener)

    await flushQueue(ok)
    off()

    expect(listener).toHaveBeenCalledTimes(1)
    expect((listener.mock.calls[0][0] as QueuedAction).key).toBe('sr:9')
  })

  it('stops at the first offline outcome and loses nothing', async () => {
    await enqueueAction({ ...base, body: 'a' })
    await new Promise((r) => setTimeout(r, 2))
    await enqueueAction({ ...base, body: 'b' })

    const result = await flushQueue(async () => ({ kind: 'offline' }))

    expect(result.synced).toBe(0)
    expect(getQueueSnapshot().actions).toHaveLength(2)
  })

  it('keeps everything and flags an expired session on 401', async () => {
    await enqueueAction({ ...base, body: 'a' })

    const result = await flushQueue(async () => ({ kind: 'auth' }))

    expect(result.authExpired).toBe(true)
    expect(getQueueSnapshot().actions).toHaveLength(1)
    expect(getQueueSnapshot().authExpired).toBe(true)
  })

  it('parks a refused action as failed, keeps going, and lets the user retry it', async () => {
    await enqueueAction({ ...base, body: 'bad' })
    await new Promise((r) => setTimeout(r, 2))
    await enqueueAction({ ...base, body: 'good' })

    const result = await flushQueue(async (a) =>
      a.body === 'bad' ? { kind: 'rejected', message: 'validación' } : { kind: 'ok' })

    expect(result).toMatchObject({ synced: 1, failed: 1 })
    const [failed] = getQueueSnapshot().actions
    expect(failed).toMatchObject({ body: 'bad', status: 'failed', lastError: 'validación' })

    await flushQueue(ok)
    expect(getQueueSnapshot().actions).toHaveLength(1)

    await retryAction(failed.id)
    expect(getQueueSnapshot().actions[0].status).toBeUndefined()
    await flushQueue(ok)
    expect(getQueueSnapshot().actions).toHaveLength(0)
  })

  it('keeps an uploaded file queued until the server accepts it', async () => {
    const blob = new Blob(['photo-bytes'], { type: 'image/png' })
    await enqueueAction({ method: 'POST', endpoint: '/up', description: 'foto', file: { blob, name: 'a.png', field: 'file' } })

    await flushQueue(async () => ({ kind: 'offline' }))
    const [kept] = getQueueSnapshot().actions
    expect(kept.file?.name).toBe('a.png')
    expect(await kept.file!.blob.text()).toBe('photo-bytes')

    await flushQueue(ok)
    expect(getQueueSnapshot().actions).toHaveLength(0)
  })

  it('never replays another user’s actions', async () => {
    await enqueueAction({ ...base, body: 'mine', userId: 'u1' })
    await enqueueAction({ ...base, body: 'theirs', userId: 'u2' })
    const seen: string[] = []

    await flushQueue(async (a) => { seen.push(a.body!); return { kind: 'ok' } }, 'u1')

    expect(seen).toEqual(['mine'])
    expect(getQueueSnapshot().actions.map((a) => a.body)).toEqual(['theirs'])
  })
})
