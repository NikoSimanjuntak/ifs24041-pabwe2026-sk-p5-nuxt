import Swal from 'sweetalert2'

export const showSuccessDialog = async (message: string): Promise<void> => {
  await Swal.fire({ icon: 'success', title: 'Berhasil', text: message, confirmButtonColor: '#047857' })
}

export const showErrorDialog = async (message: string): Promise<void> => {
  await Swal.fire({ icon: 'error', title: 'Terjadi Kesalahan', text: message, confirmButtonColor: '#047857' })
}

/** Menampilkan dialog konfirmasi. Mengembalikan true jika pengguna menekan tombol konfirmasi. */
export const showConfirmDialog = async (message: string): Promise<boolean> => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Konfirmasi',
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#047857',
    cancelButtonColor: '#78716c',
  })
  return result.isConfirmed
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export const formatRupiah = (value: number): string => rupiahFormatter.format(value)

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' })

/** Format tanggal & waktu (WIB) dari string ISO, contoh: "5 Okt 2024, 19.09". */
export const formatDateTime = (iso: string): string => dateTimeFormatter.format(new Date(iso))

/** Format tanggal (WIB) dari string ISO, contoh: "5 Oktober 2024". */
export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso))

/** Menghasilkan URL foto profil absolut (API dapat mengembalikan path relatif atau null). */
export const resolvePhotoUrl = (photo: string | null): string | null => {
  if (!photo) {
    return null
  }
  if (/^https?:\/\//.test(photo)) {
    return photo
  }
  return `${new URL(DELCOM_BASEURL).origin}/${photo.replace(/^\//, '')}`
}
