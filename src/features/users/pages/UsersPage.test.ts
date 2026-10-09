import { screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDeferred, mockUser, renderWithProviders } from '~/test-utils'
import { getUsers } from '../api/userApi'
import UsersPage from './UsersPage.vue'

vi.mock('../api/userApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
}))

beforeEach(() => vi.clearAllMocks())

describe('UsersPage', () => {
  it('menampilkan status memuat lalu daftar pengguna', async () => {
    const deferred = createDeferred<(typeof mockUser)[]>()
    vi.mocked(getUsers).mockReturnValue(deferred.promise)
    await renderWithProviders(UsersPage)
    expect(screen.getByText('Memuat pengguna...')).toBeInTheDocument()

    deferred.resolve([mockUser, { ...mockUser, id: 2, name: 'Abdullah', email: 'ab@delcom.org', photo: 'http://127.0.0.1:8000/a.png' }])
    await flushPromises()
    expect(screen.getByText('Delcom Testing')).toBeInTheDocument()
    expect(screen.getByText('Abdullah')).toBeInTheDocument()
    expect(screen.getByText('ab@delcom.org')).toBeInTheDocument()
    expect(screen.getAllByText(/Bergabung 5 Oktober 2024/)).toHaveLength(2)
    expect(screen.getByAltText('Foto Abdullah')).toBeInTheDocument()
  })

  it('menampilkan pesan kosong bila tidak ada pengguna', async () => {
    vi.mocked(getUsers).mockResolvedValue([])
    await renderWithProviders(UsersPage)
    await flushPromises()
    expect(screen.getByText('Belum ada pengguna.')).toBeInTheDocument()
  })
})
