import { describe, expect, it } from 'vitest'
import { addRecipeToMedications, recipeLines } from './recipeToMedications'

describe('recipeLines', () => {
  it('splits by line and drops bullets, numbering and blanks', () => {
    expect(recipeLines('- Paracetamol 500 mg c/8h\n\n2) Ibuprofeno 400 mg\n• Loratadina 10 mg')).toEqual([
      'Paracetamol 500 mg c/8h', 'Ibuprofeno 400 mg', 'Loratadina 10 mg',
    ])
  })

  it('is empty for blank text', () => expect(recipeLines('  \n ')).toEqual([]))
})

describe('addRecipeToMedications', () => {
  it('appends each line after the existing medications without changing them', () => {
    const current = [{ name: 'Losartán', dose: '50mg', frequency: 'Cada 12h' }]
    const { next, added } = addRecipeToMedications(current, 'Paracetamol 500 mg\nAmoxicilina 500 mg')
    expect(added).toBe(2)
    expect(next).toEqual([...current, { name: 'Paracetamol 500 mg' }, { name: 'Amoxicilina 500 mg' }])
  })

  it('does not duplicate: same line twice in the récipe, or already in the history in another case', () => {
    const current = [{ name: 'paracetamol 500 mg.' }]
    const { next, added } = addRecipeToMedications(current, 'Paracetamol 500 mg\nParacetamol 500 mg  \nIbuprofeno')
    expect(added).toBe(1)
    expect(next.map((m) => m.name)).toEqual(['paracetamol 500 mg.', 'Ibuprofeno'])
  })

  it('pressing it twice adds nothing the second time', () => {
    const once = addRecipeToMedications([], 'A\nB')
    expect(addRecipeToMedications(once.next, 'A\nB')).toEqual({ next: once.next, added: 0 })
  })

  it('leaves the list alone for an empty récipe', () => {
    const current = [{ name: 'X' }]
    expect(addRecipeToMedications(current, '')).toEqual({ next: current, added: 0 })
  })
})
