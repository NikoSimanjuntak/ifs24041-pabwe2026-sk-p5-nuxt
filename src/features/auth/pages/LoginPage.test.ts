import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/helpers/apiHelper'
import { showErrorDialog } from '~/helpers/toolsHelper'
import { Blank, createDeferred, renderWithProviders, RouterRoot } from '~/test-utils'
import { login } from '../api/authApi'
import LoginPage from './LoginPage.vue'

vi.mock('../api/authApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
}))

const routes = [
  { path: '/auth/login', component: LoginPage },
  { path: '/auth/register', component: Blank },
  { path: '/', component: Blank },
]

const fillAndSubmit = async () => {
  await fireEvent.update(screen.getByLabelText('Email'), 'testing@delcom.org')
  await fireEvent.update(screen.getByLabelText('Kata Sandi'), '123456')
  await fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
}

beforeEach(() => vi.clearAllMocks())

describe('LoginPage', () => {
  it('menampilkan formulir dan tautan registrasi', async () => {
    await renderWithProviders(RouterRoot, { route: '/auth/login', routes })
    expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Daftar sekarang' })).toHaveAttribute('href', '/auth/register')
  })

  it('berhasil login lalu menuju beranda', async () => {
    vi.mocked(login).mockResolvedValue({ token: 'tok', user: {} as never })
    const { router } = await renderWithProviders(RouterRoot, { route: '/auth/login', routes })
    await fillAndSubmit()
    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/'))
    expect(login).toHaveBeenCalledWith({ email: 'testing@delcom.org', password: '123456' })
  })

  it('tetap di halaman login dan menampilkan error saat gagal', async () => {
    vi.mocked(login).mockRejectedValue(new ApiError('Kredensial akun tidak ditemukan', null, 401))
    const { router } = await renderWithProviders(RouterRoot, { route: '/auth/login', routes })
    await fillAndSubmit()
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Kredensial akun tidak ditemukan')
    expect(router.currentRoute.value.fullPath).toBe('/auth/login')
  })

  it('menampilkan status loading selama proses login', async () => {
    const deferred = createDeferred<{ token: string; user: never }>()
    vi.mocked(login).mockReturnValue(deferred.promise)
    await renderWithProviders(RouterRoot, { route: '/auth/login', routes })
    await fillAndSubmit()
    const button = await screen.findByRole('button', { name: 'Memproses...' })
    expect(button).toBeDisabled()
    deferred.resolve({ token: 't', user: {} as never })
    await flushPromises()
  })
})
