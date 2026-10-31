import { describe, expect, it } from 'vitest'
import { formatIdNumber, normalizeIdNumber } from './idNumber'

describe('normalizeIdNumber', () => {
  it.each([
    ['V-12.345.678', 'V12345678'],
    ['12345678', 'V12345678'],
    [' e 81234567 ', 'E81234567'],
    ['ab123456', 'AB123456'],
  ])('reads %s as %s', (raw, expected) => expect(normalizeIdNumber(raw)).toBe(expected))

  it.each(['', '1234', 'V-12', 'sin documento!'])('rejects %p', (raw) => expect(normalizeIdNumber(raw)).toBeNull())
})

describe('formatIdNumber', () => {
  it('adds the hyphen after the letter of a cédula and leaves other documents alone', () => {
    expect(formatIdNumber('V12345678')).toBe('V-12345678')
    expect(formatIdNumber('AB123456')).toBe('AB123456')
    expect(formatIdNumber(null)).toBe('')
  })
})
