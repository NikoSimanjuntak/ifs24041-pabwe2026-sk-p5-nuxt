import { fireEvent, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/helpers/apiHelper'
import { showSuccessDialog } from '~/helpers/toolsHelper'
import { createDeferred, mockUser, renderWithProviders } from '~/test-utils'
import { changePassword, getMe, updateMe, uploadPhoto } from '../api/userApi'
import ProfilePage from './ProfilePage.vue'

vi.mock('../api/userApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const failure = new ApiError('Gagal', null, 422)

const setup = async () => {
  const result = await renderWithProviders(ProfilePage)
  await flushPromises()
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getMe).mockResolvedValue(mockUser)
})

describe('ProfilePage', () => {
  it('menampilkan status memuat sebelum profil tersedia', async () => {
    const deferred = createDeferred<typeof mockUser>()
    vi.mocked(getMe).mockReturnValue(deferred.promise)
    await renderWithProviders(ProfilePage)
    expect(screen.getByText('Memuat profil...')).toBeInTheDocument()
    deferred.resolve(mockUser)
    await flushPromises()
    expect(screen.queryByText('Memuat profil...')).not.toBeInTheDocument()
  })

  it('mengisi formulir dari data profil', async () => {
    await setup()
    expect(screen.getByLabelText('Nama')).toHaveValue('Delcom Testing')
    expect(screen.getByLabelText('Email')).toHaveValue('testing@delcom.org')
    expect(screen.getByText('Ganti Foto')).toBeInTheDocument()
  })

  it('memperbarui profil', async () => {
    vi.mocked(updateMe).mockResolvedValue({ ...mockUser, name: 'Baru' })
    await setup()
    await fireEvent.update(screen.getByLabelText('Nama'), 'Baru')
    await fireEvent.update(screen.getByLabelText('Email'), 'baru@delcom.org')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan Profil' }))
    await flushPromises()
    expect(updateMe).toHaveBeenCalledWith({ name: 'Baru', email: 'baru@delcom.org' })
    expect(showSuccessDialog).toHaveBeenCalledWith('Profil berhasil diperbarui.')
  })

  it('tidak menampilkan sukses saat pembaruan profil gagal', async () => {
    vi.mocked(updateMe).mockRejectedValue(failure)
    await setup()
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan Profil' }))
    await flushPromises()
    expect(showSuccessDialog).not.toHaveBeenCalled()
  })

  it('menonaktifkan tombol saat profil sedang disimpan', async () => {
    const deferred = createDeferred<typeof mockUser>()
    vi.mocked(updateMe).mockReturnValue(deferred.promise)
    await setup()
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan Profil' }))
    expect(screen.getByRole('button', { name: 'Simpan Profil' })).toBeDisabled()
    deferred.resolve(mockUser)
    await flushPromises()
  })

  it('mengunggah foto profil', async () => {
    vi.mocked(uploadPhoto).mockResolvedValue('ok')
    await setup()
    const file = new File(['x'], 'foto.png', { type: 'image/png' })
    await fireEvent.change(screen.getByLabelText('Ganti Foto'), { target: { files: [file] } })
    await flushPromises()
    expect(uploadPhoto).toHaveBeenCalledWith(file)
    expect(showSuccessDialog).toHaveBeenCalledWith('Foto profil berhasil diperbarui.')
  })

  it('tidak melakukan apa-apa jika tidak ada file dipilih', async () => {
    await setup()
    await fireEvent.change(screen.getByLabelText('Ganti Foto'), { target: { files: [] } })
    await flushPromises()
    expect(uploadPhoto).not.toHaveBeenCalled()
  })

  it('tidak menampilkan sukses saat unggah foto gagal dan menampilkan status mengunggah', async () => {
    const deferred = createDeferred<string>()
    vi.mocked(uploadPhoto).mockReturnValue(deferred.promise)
    await setup()
    const file = new File(['x'], 'foto.png', { type: 'image/png' })
    await fireEvent.change(screen.getByLabelText('Ganti Foto'), { target: { files: [file] } })
    expect(screen.getByText('Mengunggah...')).toBeInTheDocument()
    deferred.reject(failure)
    await flushPromises()
    expect(showSuccessDialog).not.toHaveBeenCalled()
  })

  it('mengubah kata sandi lalu mengosongkan formulir', async () => {
    vi.mocked(changePassword).mockResolvedValue('ok')
    await setup()
    await fireEvent.update(screen.getByLabelText('Kata Sandi Saat Ini'), '123456')
    await fireEvent.update(screen.getByLabelText('Kata Sandi Baru'), '654321')
    await fireEvent.update(screen.getByLabelText('Konfirmasi Kata Sandi Baru'), '654321')
    await fireEvent.click(screen.getByRole('button', { name: 'Ubah Kata Sandi' }))
    await flushPromises()
    expect(changePassword).toHaveBeenCalledWith({
      password: '123456',
      new_password: '654321',
      new_password_confirmation: '654321',
    })
    expect(showSuccessDialog).toHaveBeenCalledWith('Kata sandi berhasil diubah.')
    expect(screen.getByLabelText('Kata Sandi Saat Ini')).toHaveValue('')
    expect(screen.getByLabelText('Kata Sandi Baru')).toHaveValue('')
    expect(screen.getByLabelText('Konfirmasi Kata Sandi Baru')).toHaveValue('')
  })

  it('mempertahankan isian saat ubah kata sandi gagal dan menampilkan loading', async () => {
    const deferred = createDeferred<string>()
    vi.mocked(changePassword).mockReturnValue(deferred.promise)
    await setup()
    await fireEvent.update(screen.getByLabelText('Kata Sandi Saat Ini'), '123456')
    await fireEvent.update(screen.getByLabelText('Kata Sandi Baru'), '654321')
    await fireEvent.update(screen.getByLabelText('Konfirmasi Kata Sandi Baru'), '654321')
    await fireEvent.click(screen.getByRole('button', { name: 'Ubah Kata Sandi' }))
    expect(screen.getByRole('button', { name: 'Ubah Kata Sandi' })).toBeDisabled()
    deferred.reject(failure)
    await flushPromises()
    expect(showSuccessDialog).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Kata Sandi Saat Ini')).toHaveValue('123456')
  })
})
