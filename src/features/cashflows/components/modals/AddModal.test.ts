import { fireEvent, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/helpers/apiHelper'
import { showErrorDialog, showSuccessDialog } from '~/helpers/toolsHelper'
import { createDeferred, renderWithProviders } from '~/test-utils'
import { createCashFlow } from '../../api/cashFlowApi'
import AddModal from './AddModal.vue'

vi.mock('../../api/cashFlowApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const setup = () => renderWithProviders(AddModal, { props: { labels: ['gaji', 'makan'] } })

const fillForm = async () => {
  await fireEvent.update(screen.getByLabelText('Jenis Arus Kas'), 'outflow')
  await fireEvent.update(screen.getByLabelText('Sumber Dana'), 'savings')
  await fireEvent.update(screen.getByLabelText('Label Kategori'), 'makan')
  await fireEvent.update(screen.getByLabelText('Nominal (Rupiah)'), '25000')
  await fireEvent.update(screen.getByLabelText('Keterangan'), 'Makan siang')
}

beforeEach(() => vi.clearAllMocks())

describe('AddModal', () => {
  it('menampilkan form dengan pilihan jenis, sumber dana, dan saran label', async () => {
    await setup()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tambah Transaksi' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Pemasukan (Inflow)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Pengeluaran (Outflow)' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Tunai' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Tabungan' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Pinjaman' })).toBeInTheDocument()
    expect(document.querySelectorAll('#cf-label-options option')).toHaveLength(2)
  })

  it('menyimpan transaksi baru dan mengirim event saved', async () => {
    vi.mocked(createCashFlow).mockResolvedValue(10)
    const { emitted } = await setup()
    await fillForm()
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await flushPromises()
    expect(createCashFlow).toHaveBeenCalledWith({
      type: 'outflow',
      source: 'savings',
      label: 'makan',
      nominal: 25000,
      description: 'Makan siang',
    })
    expect(showSuccessDialog).toHaveBeenCalledWith('Transaksi berhasil ditambahkan.')
    expect(emitted().saved).toHaveLength(1)
  })

  it('tidak mengirim saved jika penyimpanan gagal', async () => {
    vi.mocked(createCashFlow).mockRejectedValue(new ApiError('Data tidak valid', null, 422))
    const { emitted } = await setup()
    await fillForm()
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Data tidak valid')
    expect(emitted().saved).toBeUndefined()
  })

  it('menampilkan status loading saat menyimpan', async () => {
    const deferred = createDeferred<number>()
    vi.mocked(createCashFlow).mockReturnValue(deferred.promise)
    await setup()
    await fillForm()
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeDisabled()
    deferred.resolve(1)
    await flushPromises()
  })

  it('menutup modal lewat tombol X, tombol Batal, dan klik backdrop', async () => {
    const { emitted } = await setup()
    await fireEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    await fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(emitted().close).toHaveLength(3)
    await fireEvent.click(screen.getByRole('dialog'))
    expect(emitted().close).toHaveLength(3)
  })
})
