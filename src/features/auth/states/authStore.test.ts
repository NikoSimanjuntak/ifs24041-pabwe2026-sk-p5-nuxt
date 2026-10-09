import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, getAccessToken, putAccessToken } from '~/helpers/apiHelper'
import { showErrorDialog } from '~/helpers/toolsHelper'
import { createMockPinia } from '~/test-utils'
import { login, logout, register } from '../api/authApi'
import { useAuthStore } from './authStore'

vi.mock('../api/authApi')
vi.mock('~/helpers/toolsHelper', () => ({ showErrorDialog: vi.fn() }))

const user = { id: 1, name: 'A', email: 'a@b.c', email_verified_at: null, created_at: '', updated_at: '' }

beforeEach(() => {
  vi.clearAllMocks()
  createMockPinia()
})

describe('authStore', () => {
  it('membaca token tersimpan sebagai state awal', () => {
    putAccessToken('saved')
    createMockPinia()
    const store = useAuthStore()
    expect(store.token).toBe('saved')
    expect(store.isAuthenticated).toBe(true)
  })

  it('belum terautentikasi tanpa token', () => {
    expect(useAuthStore().isAuthenticated).toBe(false)
  })

  it('login berhasil menyimpan token dan user', async () => {
    vi.mocked(login).mockResolvedValue({ token: 'tok', user })
    const store = useAuthStore()
    await expect(store.login({ email: 'a@b.c', password: 'x' })).resolves.toBe(true)
    expect(getAccessToken()).toBe('tok')
    expect(store.token).toBe('tok')
    expect(store.user).toEqual(user)
    expect(store.isAuthLoading).toBe(false)
  })

  it('login gagal menampilkan dialog error', async () => {
    vi.mocked(login).mockRejectedValue(new ApiError('Kredensial akun tidak ditemukan', null, 401))
    const store = useAuthStore()
    await expect(store.login({ email: 'a@b.c', password: 'x' })).resolves.toBe(false)
    expect(showErrorDialog).toHaveBeenCalledWith('Kredensial akun tidak ditemukan')
    expect(store.token).toBeNull()
    expect(store.isAuthLoading).toBe(false)
  })

  it('register berhasil', async () => {
    vi.mocked(register).mockResolvedValue('ok')
    const store = useAuthStore()
    await expect(store.register({ name: 'A', email: 'a@b.c', password: 'x' })).resolves.toBe(true)
    expect(store.isAuthLoading).toBe(false)
  })

  it('register gagal menampilkan dialog error', async () => {
    vi.mocked(register).mockRejectedValue(new ApiError('Data tidak valid', { email: ['sudah dipakai'] }, 422))
    const store = useAuthStore()
    await expect(store.register({ name: 'A', email: 'a@b.c', password: 'x' })).resolves.toBe(false)
    expect(showErrorDialog).toHaveBeenCalledWith('Data tidak valid: sudah dipakai')
  })

  it('logout menghapus sesi', async () => {
    putAccessToken('tok')
    createMockPinia()
    vi.mocked(logout).mockResolvedValue()
    const store = useAuthStore()
    store.user = user
    await store.logout()
    expect(logout).toHaveBeenCalled()
    expect(getAccessToken()).toBeNull()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })

  it('logout tetap menghapus sesi walau API gagal', async () => {
    putAccessToken('tok')
    createMockPinia()
    vi.mocked(logout).mockRejectedValue(new Error('offline'))
    const store = useAuthStore()
    await store.logout()
    expect(getAccessToken()).toBeNull()
    expect(store.token).toBeNull()
  })
})
