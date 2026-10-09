import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/helpers/apiHelper'
import { showErrorDialog, showSuccessDialog } from '~/helpers/toolsHelper'
import { Blank, createDeferred, renderWithProviders, RouterRoot } from '~/test-utils'
import { register } from '../api/authApi'
import RegisterPage from './RegisterPage.vue'

vi.mock('../api/authApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const routes = [
  { path: '/auth/register', component: RegisterPage },
  { path: '/auth/login', component: Blank },
]

const fillAndSubmit = async () => {
  await fireEvent.update(screen.getByLabelText('Nama Lengkap'), 'Delcom Testing')
  await fireEvent.update(screen.getByLabelText('Email'), 'testing@delcom.org')
  await fireEvent.update(screen.getByLabelText('Kata Sandi'), '123456')
  await fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
}

beforeEach(() => vi.clearAllMocks())

describe('RegisterPage', () => {
  it('menampilkan formulir dan tautan ke login', async () => {
    await renderWithProviders(RouterRoot, { route: '/auth/register', routes })
    expect(screen.getByRole('heading', { name: 'Buat Akun' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/auth/login')
  })

  it('berhasil mendaftar lalu menuju halaman login', async () => {
    vi.mocked(register).mockResolvedValue('ok')
    const { router } = await renderWithProviders(RouterRoot, { route: '/auth/register', routes })
    await fillAndSubmit()
    await waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/auth/login'))
    expect(register).toHaveBeenCalledWith({ name: 'Delcom Testing', email: 'testing@delcom.org', password: '123456' })
    expect(showSuccessDialog).toHaveBeenCalled()
  })

  it('menampilkan error saat registrasi gagal', async () => {
    vi.mocked(register).mockRejectedValue(new ApiError('Data tidak valid', null, 422))
    const { router } = await renderWithProviders(RouterRoot, { route: '/auth/register', routes })
    await fillAndSubmit()
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Data tidak valid')
    expect(showSuccessDialog).not.toHaveBeenCalled()
    expect(router.currentRoute.value.fullPath).toBe('/auth/register')
  })

  it('menampilkan status loading', async () => {
    const deferred = createDeferred<string>()
    vi.mocked(register).mockReturnValue(deferred.promise)
    await renderWithProviders(RouterRoot, { route: '/auth/register', routes })
    await fillAndSubmit()
    expect(await screen.findByRole('button', { name: 'Memproses...' })).toBeDisabled()
    deferred.resolve('ok')
    await flushPromises()
  })
})
