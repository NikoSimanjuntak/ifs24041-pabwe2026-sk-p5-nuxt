import Swal from 'sweetalert2'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatRupiah,
  resolvePhotoUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from './toolsHelper'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

const fire = vi.mocked(Swal.fire)

beforeEach(() => {
  fire.mockReset()
  fire.mockResolvedValue({ isConfirmed: true } as never)
})

describe('dialog helpers', () => {
  it('menampilkan dialog sukses', async () => {
    await showSuccessDialog('Berhasil disimpan')
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', text: 'Berhasil disimpan' }))
  })

  it('menampilkan dialog error', async () => {
    await showErrorDialog('Oops')
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Oops' }))
  })

  it('mengembalikan true saat konfirmasi disetujui', async () => {
    await expect(showConfirmDialog('Yakin?')).resolves.toBe(true)
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning', showCancelButton: true, text: 'Yakin?' }))
  })

  it('mengembalikan false saat konfirmasi dibatalkan', async () => {
    fire.mockResolvedValue({ isConfirmed: false } as never)
    await expect(showConfirmDialog('Yakin?')).resolves.toBe(false)
  })
})

describe('formatter', () => {
  it('memformat rupiah', () => {
    expect(formatRupiah(1000)).toMatch(/^Rp\s1\.000$/)
    expect(formatRupiah(2500000)).toMatch(/^Rp\s2\.500\.000$/)
  })

  it('memformat tanggal & waktu (WIB)', () => {
    const text = formatDateTime('2024-10-05T12:09:16.000000Z')
    expect(text).toMatch(/5 Okt 2024/)
    expect(text).toMatch(/19[.:]09/)
  })

  it('memformat tanggal panjang', () => {
    expect(formatDate('2024-10-05T12:09:16.000000Z')).toBe('5 Oktober 2024')
  })
})

describe('resolvePhotoUrl', () => {
  it('mengembalikan null untuk foto kosong', () => {
    expect(resolvePhotoUrl(null)).toBeNull()
    expect(resolvePhotoUrl('')).toBeNull()
  })

  it('mempertahankan URL absolut', () => {
    expect(resolvePhotoUrl('https://cdn.test/a.png')).toBe('https://cdn.test/a.png')
    expect(resolvePhotoUrl('http://127.0.0.1:8000/a.png')).toBe('http://127.0.0.1:8000/a.png')
  })

  it('melengkapi path relatif dengan origin API', () => {
    expect(resolvePhotoUrl('img/profile/1.png')).toBe('https://open-api.delcom.org/img/profile/1.png')
    expect(resolvePhotoUrl('/img/profile/1.png')).toBe('https://open-api.delcom.org/img/profile/1.png')
  })
})
