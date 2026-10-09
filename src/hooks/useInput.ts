import { ref, type Ref } from 'vue'

/**
 * Composable untuk two-way binding input form.
 * Mengembalikan [value, onChange, reset].
 *
 * Contoh: <input :value="email" @input="onEmail" />
 */
export function useInput(initialValue: string): readonly [Ref<string>, (event: Event) => void, () => void] {
  const value = ref(initialValue)

  const onChange = (event: Event): void => {
    value.value = (event.target as HTMLInputElement).value
  }

  const reset = (): void => {
    value.value = initialValue
  }

  return [value, onChange, reset] as const
}
