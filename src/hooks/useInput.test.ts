import { describe, expect, it } from 'vitest'
import { useInput } from './useInput'

describe('useInput', () => {
  it('menyimpan nilai awal', () => {
    const [value] = useInput('awal')
    expect(value.value).toBe('awal')
  })

  it('memperbarui nilai dari event input', () => {
    const [value, onChange] = useInput('')
    onChange({ target: { value: 'baru' } } as unknown as Event)
    expect(value.value).toBe('baru')
  })

  it('mengembalikan nilai ke awal saat reset', () => {
    const [value, onChange, reset] = useInput('awal')
    onChange({ target: { value: 'baru' } } as unknown as Event)
    reset()
    expect(value.value).toBe('awal')
  })
})
