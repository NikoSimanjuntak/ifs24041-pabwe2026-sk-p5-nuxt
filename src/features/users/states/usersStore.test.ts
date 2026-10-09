import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/helpers/apiHelper'
import { showErrorDialog } from '~/helpers/toolsHelper'
import { createMockPinia, mockUser } from '~/test-utils'
import { changePassword, getMe, getUsers, updateMe, uploadPhoto } from '../api/userApi'
import { useUsersStore } from './usersStore'

vi.mock('../api/userApi')
vi.mock('~/helpers/toolsHelper', () => ({ showErrorDialog: vi.fn() }))

const failure = new ApiError('Gagal', null, 500)

beforeEach(() => {
  vi.clearAllMocks()
  createMockPinia()
})

describe('usersStore', () => {
  it('fetchUsers mengisi daftar pengguna', async () => {
    vi.mocked(getUsers).mockResolvedValue([mockUser])
    const store = useUsersStore()
    await store.fetchUsers()
    expect(store.users).toEqual([mockUser])
    expect(store.isUsersLoading).toBe(false)
  })

  it('fetchUsers menampilkan error', async () => {
    vi.mocked(getUsers).mockRejectedValue(failure)
    const store = useUsersStore()
    await store.fetchUsers()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
    expect(store.users).toEqual([])
    expect(store.isUsersLoading).toBe(false)
  })

  it('fetchProfile mengisi profil', async () => {
    vi.mocked(getMe).mockResolvedValue(mockUser)
    const store = useUsersStore()
    await store.fetchProfile()
    expect(store.profile).toEqual(mockUser)
    expect(store.isProfileLoading).toBe(false)
  })

  it('fetchProfile menampilkan error', async () => {
    vi.mocked(getMe).mockRejectedValue(failure)
    const store = useUsersStore()
    await store.fetchProfile()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
    expect(store.profile).toBeNull()
  })

  it('updateProfile berhasil memperbarui profil', async () => {
    vi.mocked(updateMe).mockResolvedValue({ ...mockUser, name: 'Baru' })
    const store = useUsersStore()
    await expect(store.updateProfile({ name: 'Baru', email: mockUser.email })).resolves.toBe(true)
    expect(store.profile?.name).toBe('Baru')
    expect(store.isProfileUpdating).toBe(false)
  })

  it('updateProfile gagal', async () => {
    vi.mocked(updateMe).mockRejectedValue(failure)
    const store = useUsersStore()
    await expect(store.updateProfile({ name: 'x', email: 'y' })).resolves.toBe(false)
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
    expect(store.isProfileUpdating).toBe(false)
  })

  it('changePhoto berhasil lalu memuat ulang profil', async () => {
    vi.mocked(uploadPhoto).mockResolvedValue('ok')
    vi.mocked(getMe).mockResolvedValue({ ...mockUser, photo: 'img/baru.png' })
    const store = useUsersStore()
    const file = new File(['x'], 'a.png')
    await expect(store.changePhoto(file)).resolves.toBe(true)
    expect(uploadPhoto).toHaveBeenCalledWith(file)
    expect(store.profile?.photo).toBe('img/baru.png')
    expect(store.isPhotoUploading).toBe(false)
  })

  it('changePhoto gagal', async () => {
    vi.mocked(uploadPhoto).mockRejectedValue(failure)
    const store = useUsersStore()
    await expect(store.changePhoto(new File(['x'], 'a.png'))).resolves.toBe(false)
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
    expect(store.isPhotoUploading).toBe(false)
  })

  it('changePassword berhasil', async () => {
    vi.mocked(changePassword).mockResolvedValue('ok')
    const store = useUsersStore()
    const payload = { password: '1', new_password: '2', new_password_confirmation: '2' }
    await expect(store.changePassword(payload)).resolves.toBe(true)
    expect(changePassword).toHaveBeenCalledWith(payload)
    expect(store.isPasswordChanging).toBe(false)
  })

  it('changePassword gagal', async () => {
    vi.mocked(changePassword).mockRejectedValue(failure)
    const store = useUsersStore()
    await expect(store.changePassword({ password: '1', new_password: '2', new_password_confirmation: '3' })).resolves.toBe(false)
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
  })
})
