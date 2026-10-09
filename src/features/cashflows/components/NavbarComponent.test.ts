import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { logout } from '~/features/auth/api/authApi'
import { useUsersStore } from '~/features/users/states/usersStore'
import { getAccessToken, putAccessToken } from '~/helpers/apiHelper'
import { showConfirmDialog } from '~/helpers/toolsHelper'
import { Blank, createMockPinia, mockUser, renderWithProviders } from '~/test-utils'
import NavbarComponent from './NavbarComponent.vue'

vi.mock('~/features/auth/api/authApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showConfirmDialog: vi.fn(),
}))

const routes = [
  { path: '/', component: Blank },
  { path: '/auth/login', component: Blank },
]

beforeEach(() => vi.clearAllMocks())

describe('NavbarComponent', () => {
  it('menampilkan placeholder saat profil belum tersedia', async () => {
    await renderWithProviders(NavbarComponent, { routes })
    expect(screen.getByText('Memuat sesi...')).toBeInTheDocument()
  })

  it('menampilkan nama, username, dan status sesi pengguna aktif', async () => {
    const pinia = createMockPinia()
    useUsersStore(pinia).profile = mockUser
    await renderWithProviders(NavbarComponent, { pinia, routes })
    expect(screen.getByText('Delcom Testing')).toBeInTheDocument()
    expect(screen.getByText('@testing')).toBeInTheDocument()
    expect(screen.getByText('Sesi aktif')).toBeInTheDocument()
    expect(screen.queryByText('Memuat sesi...')).not.toBeInTheDocument()
  })

  it('mengirim event toggle-sidebar', async () => {
    const { emitted } = await renderWithProviders(NavbarComponent, { routes })
    await fireEvent.click(screen.getByRole('button', { name: 'Buka menu' }))
    expect(emitted()['toggle-sidebar']).toHaveLength(1)
  })

  it('keluar dari akun setelah dikonfirmasi', async () => {
    putAccessToken('tok')
    vi.mocked(showConfirmDialog).mockResolvedValue(true)
    vi.mocked(logout).mockResolvedValue()
    const pinia = createMockPinia()
    const { router } = await renderWithProviders(NavbarComponent, { pinia, routes })
    await fireEvent.click(screen.getByRole('button', { name: /Keluar/ }))
    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/auth/login'))
    expect(logout).toHaveBeenCalled()
    expect(getAccessToken()).toBeNull()
  })

  it('tidak keluar jika konfirmasi dibatalkan', async () => {
    putAccessToken('tok')
    vi.mocked(showConfirmDialog).mockResolvedValue(false)
    const { router } = await renderWithProviders(NavbarComponent, { routes })
    await fireEvent.click(screen.getByRole('button', { name: /Keluar/ }))
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled())
    expect(logout).not.toHaveBeenCalled()
    expect(getAccessToken()).toBe('tok')
    expect(router.currentRoute.value.fullPath).toBe('/')
  })
})
