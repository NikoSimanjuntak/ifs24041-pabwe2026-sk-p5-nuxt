import { fireEvent, screen, within } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/helpers/apiHelper'
import { showConfirmDialog, showSuccessDialog } from '~/helpers/toolsHelper'
import {
  Blank,
  createDeferred,
  emptyChartStats,
  mockCashFlows,
  mockDailyStats,
  mockMonthlyStats,
  mockStats,
  renderWithProviders,
} from '~/test-utils'
import {
  createCashFlow,
  getCashFlows,
  getDailyStats,
  getLabels,
  getMonthlyStats,
  removeAllCashFlows,
  removeCashFlow,
  updateCashFlow,
} from '../api/cashFlowApi'
import HomePage from './HomePage.vue'

vi.mock('../api/cashFlowApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}))

const routes = [
  { path: '/', component: HomePage },
  { path: '/cash-flows/:cashFlowId', component: Blank },
]

const setup = async () => {
  const result = await renderWithProviders(HomePage, { routes })
  await flushPromises()
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCashFlows).mockResolvedValue({ cashFlows: mockCashFlows, stats: mockStats })
  vi.mocked(getLabels).mockResolvedValue(['gaji', 'alat-elektronik'])
  vi.mocked(getDailyStats).mockResolvedValue(mockDailyStats)
  vi.mocked(getMonthlyStats).mockResolvedValue(mockMonthlyStats)
  vi.mocked(createCashFlow).mockResolvedValue(1)
  vi.mocked(updateCashFlow).mockResolvedValue()
  vi.mocked(removeCashFlow).mockResolvedValue()
  vi.mocked(removeAllCashFlows).mockResolvedValue()
  vi.mocked(showConfirmDialog).mockResolvedValue(true)
})

describe('HomePage', () => {
  it('memuat data saat dibuka dan menampilkan kartu ringkasan', async () => {
    await setup()
    expect(getCashFlows).toHaveBeenCalledTimes(1)
    expect(getLabels).toHaveBeenCalledTimes(1)
    expect(getDailyStats).toHaveBeenCalledTimes(1)
    expect(getMonthlyStats).toHaveBeenCalledTimes(1)

    const cards = screen.getAllByTestId('stat-card')
    expect(cards).toHaveLength(6)
    expect(within(cards[0]).getByText('Total Saldo Kas Bersih')).toBeInTheDocument()
    expect(cards[0]).toHaveTextContent(/Rp\s2\.100\.000/)
    expect(cards[1]).toHaveTextContent(/Total Pemasukan \(Inflow\)/)
    expect(cards[1]).toHaveTextContent(/Rp\s2\.500\.000/)
    expect(cards[2]).toHaveTextContent(/Total Pengeluaran \(Outflow\)/)
    expect(cards[2]).toHaveTextContent(/Rp\s400\.000/)
    expect(cards[3]).toHaveTextContent('Saldo Kas Tunai')
    expect(cards[4]).toHaveTextContent('Saldo Rekening Tabungan')
    expect(cards[5]).toHaveTextContent('Saldo Pinjaman')
  })

  it('menampilkan transaksi pada tabel dan kartu dengan badge jenis', async () => {
    await setup()
    expect(screen.getAllByTestId('cash-flow-row')).toHaveLength(2)
    expect(screen.getAllByTestId('cash-flow-card')).toHaveLength(2)
    expect(screen.getAllByText('Pemasukan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pengeluaran').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/^\+Rp\s2\.500\.000$/)).toHaveLength(2)
    expect(screen.getAllByText(/^-Rp\s400\.000$/)).toHaveLength(2)
    expect(screen.getAllByLabelText('Lihat detail transaksi 2')[0]).toHaveAttribute('href', '/cash-flows/2')
  })

  it('menampilkan status memuat transaksi', async () => {
    const deferred = createDeferred<{ cashFlows: typeof mockCashFlows; stats: typeof mockStats }>()
    vi.mocked(getCashFlows).mockReturnValue(deferred.promise)
    await renderWithProviders(HomePage, { routes })
    expect(screen.getByText('Memuat transaksi...')).toBeInTheDocument()
    deferred.resolve({ cashFlows: mockCashFlows, stats: mockStats })
    await flushPromises()
    expect(screen.queryByText('Memuat transaksi...')).not.toBeInTheDocument()
  })

  it('menampilkan pesan kosong jika tidak ada transaksi', async () => {
    vi.mocked(getCashFlows).mockResolvedValue({ cashFlows: [], stats: mockStats })
    await setup()
    expect(screen.getByText('Belum ada transaksi yang sesuai.')).toBeInTheDocument()
  })

  it('menampilkan grafik harian lalu bulanan', async () => {
    await setup()
    expect(screen.getAllByTestId('stat-bar')).toHaveLength(2)
    expect(screen.getByText('05/10')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Bulanan' }))
    expect(screen.getAllByTestId('stat-bar')).toHaveLength(3)
    expect(screen.getByText('10/2024')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Harian' }))
    expect(screen.getAllByTestId('stat-bar')).toHaveLength(2)
  })

  it('menampilkan pesan jika statistik kosong', async () => {
    vi.mocked(getDailyStats).mockResolvedValue(emptyChartStats)
    await setup()
    expect(screen.getByText('Belum ada data statistik.')).toBeInTheDocument()
  })

  it('menerapkan filter ke API', async () => {
    await setup()
    await fireEvent.update(screen.getByLabelText('Jenis Arus Kas'), 'inflow')
    await fireEvent.update(screen.getByLabelText('Sumber Dana'), 'cash')
    await fireEvent.update(screen.getByLabelText('Label'), 'gaji')
    await fireEvent.update(screen.getByLabelText('Tanggal Awal'), '2024-10-01')
    await fireEvent.update(screen.getByLabelText('Tanggal Akhir'), '2024-10-31')
    await fireEvent.click(screen.getByRole('button', { name: 'Terapkan Filter' }))
    await flushPromises()
    expect(getCashFlows).toHaveBeenLastCalledWith({
      type: 'inflow',
      source: 'cash',
      label: 'gaji',
      start_date: '2024-10-01 00:00:00',
      end_date: '2024-10-31 23:59:59',
    })
  })

  it('mengatur ulang filter', async () => {
    await setup()
    await fireEvent.update(screen.getByLabelText('Jenis Arus Kas'), 'outflow')
    await fireEvent.update(screen.getByLabelText('Tanggal Awal'), '2024-10-01')
    await fireEvent.click(screen.getByRole('button', { name: 'Atur Ulang' }))
    await flushPromises()
    expect(getCashFlows).toHaveBeenLastCalledWith({
      type: '',
      source: '',
      label: '',
      start_date: undefined,
      end_date: undefined,
    })
    expect(screen.getByLabelText('Jenis Arus Kas')).toHaveValue('')
  })

  it('menambah transaksi lalu memuat ulang data', async () => {
    await setup()
    await fireEvent.click(screen.getByRole('button', { name: /Tambah Transaksi/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await fireEvent.update(screen.getByLabelText('Label Kategori'), 'bonus')
    await fireEvent.update(screen.getByLabelText('Nominal (Rupiah)'), '1000')
    await fireEvent.update(screen.getByLabelText('Keterangan'), 'Bonus')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await flushPromises()
    expect(createCashFlow).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(getCashFlows).toHaveBeenCalledTimes(2)
  })

  it('menutup modal tambah tanpa menyimpan', async () => {
    await setup()
    await fireEvent.click(screen.getByRole('button', { name: /Tambah Transaksi/ }))
    await fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('mengubah transaksi', async () => {
    await setup()
    await fireEvent.click(screen.getAllByLabelText('Ubah transaksi 2')[0])
    expect(screen.getByRole('heading', { name: 'Ubah Transaksi' })).toBeInTheDocument()
    expect(screen.getByLabelText('Label Kategori')).toHaveValue('gaji')
    await fireEvent.update(screen.getByLabelText('Keterangan'), 'Gaji revisi')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }))
    await flushPromises()
    expect(updateCashFlow).toHaveBeenCalledWith(2, expect.objectContaining({ description: 'Gaji revisi' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(getCashFlows).toHaveBeenCalledTimes(2)
  })

  it('menutup modal ubah tanpa menyimpan', async () => {
    await setup()
    await fireEvent.click(screen.getAllByLabelText('Ubah transaksi 3')[0])
    await fireEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(updateCashFlow).not.toHaveBeenCalled()
  })

  it('menghapus transaksi setelah konfirmasi', async () => {
    await setup()
    await fireEvent.click(screen.getAllByLabelText('Hapus transaksi 2')[0])
    await flushPromises()
    expect(showConfirmDialog).toHaveBeenCalled()
    expect(removeCashFlow).toHaveBeenCalledWith(2)
    expect(showSuccessDialog).toHaveBeenCalledWith('Transaksi berhasil dihapus.')
    expect(getCashFlows).toHaveBeenCalledTimes(2)
  })

  it('tidak menghapus transaksi jika konfirmasi dibatalkan', async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false)
    await setup()
    await fireEvent.click(screen.getAllByLabelText('Hapus transaksi 2')[0])
    await flushPromises()
    expect(removeCashFlow).not.toHaveBeenCalled()
  })

  it('tidak menampilkan sukses jika penghapusan gagal', async () => {
    vi.mocked(removeCashFlow).mockRejectedValue(new ApiError('Gagal', null, 500))
    await setup()
    await fireEvent.click(screen.getAllByLabelText('Hapus transaksi 3')[1])
    await flushPromises()
    expect(showSuccessDialog).not.toHaveBeenCalled()
    expect(getCashFlows).toHaveBeenCalledTimes(1)
  })

  it('mereset seluruh transaksi setelah konfirmasi', async () => {
    await setup()
    await fireEvent.click(screen.getByRole('button', { name: /Reset Semua Transaksi/ }))
    await flushPromises()
    expect(removeAllCashFlows).toHaveBeenCalledTimes(1)
    expect(showSuccessDialog).toHaveBeenCalledWith('Seluruh transaksi berhasil direset.')
    expect(getCashFlows).toHaveBeenCalledTimes(2)
  })

  it('tidak mereset jika konfirmasi dibatalkan', async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false)
    await setup()
    await fireEvent.click(screen.getByRole('button', { name: /Reset Semua Transaksi/ }))
    await flushPromises()
    expect(removeAllCashFlows).not.toHaveBeenCalled()
  })

  it('tidak menampilkan sukses jika reset gagal', async () => {
    vi.mocked(removeAllCashFlows).mockRejectedValue(new ApiError('Gagal', null, 500))
    await setup()
    await fireEvent.click(screen.getByRole('button', { name: /Reset Semua Transaksi/ }))
    await flushPromises()
    expect(showSuccessDialog).not.toHaveBeenCalled()
  })
})
