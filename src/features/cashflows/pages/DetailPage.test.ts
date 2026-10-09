import { fireEvent, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/helpers/apiHelper'
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '~/helpers/toolsHelper'
import { Blank, createDeferred, mockCashFlows, renderWithProviders } from '~/test-utils'
import { getCashFlow, getLabels, removeCashFlow, updateCashFlow } from '../api/cashFlowApi'
import DetailPage from './DetailPage.vue'

vi.mock('../api/cashFlowApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}))

const routes = [
  { path: '/', component: Blank },
  { path: '/cash-flows/:cashFlowId', component: DetailPage },
]

const setup = async (id = 2) => {
  const result = await renderWithProviders(DetailPage, { route: `/cash-flows/${id}`, routes })
  await flushPromises()
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCashFlow).mockImplementation(async (id) => mockCashFlows.find((item) => item.id === id)!)
  vi.mocked(getLabels).mockResolvedValue(['gaji'])
  vi.mocked(updateCashFlow).mockResolvedValue()
  vi.mocked(removeCashFlow).mockResolvedValue()
  vi.mocked(showConfirmDialog).mockResolvedValue(true)
})

describe('DetailPage', () => {
  it('menampilkan rincian transaksi pemasukan', async () => {
    await setup(2)
    expect(getCashFlow).toHaveBeenCalledWith(2)
    expect(screen.getByText('Gaji bulanan')).toBeInTheDocument()
    expect(screen.getAllByText('Pemasukan (Inflow)')).toHaveLength(2)
    expect(screen.getByText('Tunai')).toBeInTheDocument()
    expect(screen.getAllByText(/Rp\s2\.500\.000/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/5 Okt 2024, 18[.:]26/)).toHaveLength(2)
    expect(screen.getByRole('link', { name: /Kembali ke ringkasan/ })).toHaveAttribute('href', '/')
  })

  it('menampilkan rincian transaksi pengeluaran', async () => {
    await setup(3)
    expect(screen.getAllByText('Pengeluaran (Outflow)')).toHaveLength(2)
    expect(screen.getByText('Tabungan')).toBeInTheDocument()
    expect(screen.getByText('Membeli keyboard dan mouse')).toBeInTheDocument()
  })

  it('menampilkan status memuat', async () => {
    const deferred = createDeferred<(typeof mockCashFlows)[number]>()
    vi.mocked(getCashFlow).mockReturnValue(deferred.promise)
    await renderWithProviders(DetailPage, { route: '/cash-flows/2', routes })
    expect(screen.getByText('Memuat rincian transaksi...')).toBeInTheDocument()
    deferred.resolve(mockCashFlows[0])
    await flushPromises()
    expect(screen.getByText('Gaji bulanan')).toBeInTheDocument()
  })

  it('menampilkan pesan jika transaksi tidak ditemukan', async () => {
    vi.mocked(getCashFlow).mockRejectedValue(new ApiError('Data tidak ditemukan', null, 404))
    await setup(99)
    expect(showErrorDialog).toHaveBeenCalledWith('Data tidak ditemukan')
    expect(screen.getByText('Transaksi tidak ditemukan.')).toBeInTheDocument()
  })

  it('mengubah transaksi lalu memuat ulang detail', async () => {
    await setup(2)
    await fireEvent.click(screen.getByRole('button', { name: /Ubah/ }))
    expect(screen.getByRole('heading', { name: 'Ubah Transaksi' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }))
    await flushPromises()
    expect(updateCashFlow).toHaveBeenCalledWith(2, expect.objectContaining({ label: 'gaji', nominal: 2500000 }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(getCashFlow).toHaveBeenCalledTimes(2)
  })

  it('menutup modal ubah tanpa menyimpan', async () => {
    await setup(2)
    await fireEvent.click(screen.getByRole('button', { name: /Ubah/ }))
    await fireEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('menghapus transaksi lalu kembali ke beranda', async () => {
    const { router } = await setup(2)
    await fireEvent.click(screen.getByRole('button', { name: /Hapus/ }))
    await flushPromises()
    expect(removeCashFlow).toHaveBeenCalledWith(2)
    expect(showSuccessDialog).toHaveBeenCalledWith('Transaksi berhasil dihapus.')
    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('tidak menghapus jika konfirmasi dibatalkan', async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false)
    const { router } = await setup(2)
    await fireEvent.click(screen.getByRole('button', { name: /Hapus/ }))
    await flushPromises()
    expect(removeCashFlow).not.toHaveBeenCalled()
    expect(router.currentRoute.value.fullPath).toBe('/cash-flows/2')
  })

  it('tetap di halaman jika penghapusan gagal', async () => {
    vi.mocked(removeCashFlow).mockRejectedValue(new ApiError('Gagal', null, 500))
    const { router } = await setup(2)
    await fireEvent.click(screen.getByRole('button', { name: /Hapus/ }))
    await flushPromises()
    expect(showSuccessDialog).not.toHaveBeenCalled()
    expect(router.currentRoute.value.fullPath).toBe('/cash-flows/2')
  })
})
