import { fireEvent, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMe } from '~/features/users/api/userApi'
import { putAccessToken } from '~/helpers/apiHelper'
import { Blank, mockUser, renderWithProviders, RouterRoot, textStub } from '~/test-utils'
import CashFlowLayout from './CashFlowLayout.vue'

vi.mock('~/features/users/api/userApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
}))

const routes = [
  {
    path: '/',
    component: CashFlowLayout,
    children: [
      { path: '', component: textStub('isi dashboard') },
      { path: 'users', component: Blank },
      { path: 'profile', component: Blank },
    ],
  },
  { path: '/auth/login', component: Blank },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getMe).mockResolvedValue(mockUser)
})

describe('CashFlowLayout', () => {
  it('mengarahkan ke halaman login jika belum ada token', async () => {
    const { router } = await renderWithProviders(RouterRoot, { route: '/', routes })
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/auth/login')
    expect(getMe).not.toHaveBeenCalled()
    expect(screen.queryByText('isi dashboard')).not.toBeInTheDocument()
  })

  it('tetap memiliki landmark main dan heading saat belum login', async () => {
    // Rute login ditempatkan di bawah layout yang sama agar layout tidak dilepas saat dialihkan.
    const sameLayoutRoutes = [
      {
        path: '/',
        component: CashFlowLayout,
        children: [
          { path: '', component: textStub('isi dashboard') },
          { path: 'auth/login', component: Blank },
        ],
      },
    ]
    await renderWithProviders(RouterRoot, { route: '/', routes: sameLayoutRoutes })
    await flushPromises()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mengalihkan ke halaman login')
    expect(screen.queryByText('isi dashboard')).not.toBeInTheDocument()
  })

  it('menampilkan navbar, sidebar, dan konten saat sudah login', async () => {
    putAccessToken('tok')
    await renderWithProviders(RouterRoot, { route: '/', routes })
    await flushPromises()
    expect(getMe).toHaveBeenCalledTimes(1)
    expect(screen.getByText('isi dashboard')).toBeInTheDocument()
    expect(screen.getByText('Delcom Testing')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Direktori Pengguna' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('membuka dan menutup sidebar pada tampilan mobile', async () => {
    putAccessToken('tok')
    await renderWithProviders(RouterRoot, { route: '/', routes })
    await flushPromises()
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Buka menu' }))
    expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument()
    await fireEvent.click(screen.getByTestId('sidebar-backdrop'))
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument()
  })
})