import { fireEvent, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/helpers/apiHelper'
import { showErrorDialog, showSuccessDialog } from '~/helpers/toolsHelper'
import { createDeferred, mockCashFlows, renderWithProviders } from '~/test-utils'
import { updateCashFlow } from '../../api/cashFlowApi'
import ChangeModal from './ChangeModal.vue'

vi.mock('../../api/cashFlowApi')
vi.mock('~/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}))

const setup = () => renderWithProviders(ChangeModal, { props: { cashFlow: mockCashFlows[0], labels: ['gaji'] } })

beforeEach(() => vi.clearAllMocks())

describe('ChangeModal', () => {
  it('menampilkan data transaksi yang akan diubah', async () => {
    await setup()
    expect(screen.getByRole('heading', { name: 'Ubah Transaksi' })).toBeInTheDocument()
    expect(screen.getByLabelText('Jenis Arus Kas')).toHaveValue('inflow')
    expect(screen.getByLabelText('Sumber Dana')).toHaveValue('cash')
    expect(screen.getByLabelText('Label Kategori')).toHaveValue('gaji')
    expect(screen.getByLabelText('Nominal (Rupiah)')).toHaveValue(2500000)
    expect(screen.getByLabelText('Keterangan')).toHaveValue('Gaji bulanan')
  })

  it('menyimpan perubahan dan mengirim event saved', async () => {
    vi.mocked(updateCashFlow).mockResolvedValue()
    const { emitted } = await setup()
    await fireEvent.update(screen.getByLabelText('Jenis Arus Kas'), 'outflow')
    await fireEvent.update(screen.getByLabelText('Sumber Dana'), 'loans')
    await fireEvent.update(screen.getByLabelText('Label Kategori'), 'bonus')
    await fireEvent.update(screen.getByLabelText('Nominal (Rupiah)'), '3000000')
    await fireEvent.update(screen.getByLabelText('Keterangan'), 'Bonus tahunan')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }))
    await flushPromises()
    expect(updateCashFlow).toHaveBeenCalledWith(2, {
      type: 'outflow',
      source: 'loans',
      label: 'bonus',
      nominal: 3000000,
      description: 'Bonus tahunan',
    })
    expect(showSuccessDialog).toHaveBeenCalledWith('Transaksi berhasil diperbarui.')
    expect(emitted().saved).toHaveLength(1)
  })

  it('tidak mengirim saved jika perubahan gagal', async () => {
    vi.mocked(updateCashFlow).mockRejectedValue(new ApiError('Data tidak valid', null, 422))
    const { emitted } = await setup()
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }))
    await flushPromises()
    expect(showErrorDialog).toHaveBeenCalledWith('Data tidak valid')
    expect(emitted().saved).toBeUndefined()
  })

  it('menampilkan status loading saat menyimpan', async () => {
    const deferred = createDeferred<void>()
    vi.mocked(updateCashFlow).mockReturnValue(deferred.promise)
    await setup()
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }))
    expect(screen.getByRole('button', { name: 'Simpan Perubahan' })).toBeDisabled()
    deferred.resolve()
    await flushPromises()
  })

  it('menutup modal lewat tombol X, Batal, dan backdrop', async () => {
    const { emitted } = await setup()
    await fireEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    await fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(emitted().close).toHaveLength(3)
  })
})
