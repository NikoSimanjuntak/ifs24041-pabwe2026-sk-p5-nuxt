import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '~/helpers/apiHelper'
import { showErrorDialog } from '~/helpers/toolsHelper'
import { createMockPinia, mockCashFlows, mockDailyStats, mockMonthlyStats, mockStats } from '~/test-utils'
import {
  createCashFlow,
  getCashFlow,
  getCashFlows,
  getDailyStats,
  getLabels,
  getMonthlyStats,
  removeAllCashFlows,
  removeCashFlow,
  updateCashFlow,
} from '../api/cashFlowApi'
import { useCashFlowsStore } from './cashFlowsStore'

vi.mock('../api/cashFlowApi')
vi.mock('~/helpers/toolsHelper', () => ({ showErrorDialog: vi.fn() }))

const failure = new ApiError('Gagal', null, 500)
const payload = { type: 'inflow', source: 'cash', label: 'gaji', nominal: 1, description: 'x' } as const

beforeEach(() => {
  vi.clearAllMocks()
  createMockPinia()
})

describe('cashFlowsStore', () => {
  it('memiliki state awal yang kosong', () => {
    const store = useCashFlowsStore()
    expect(store.cashFlows).toEqual([])
    expect(store.cashFlow).toBeNull()
    expect(store.stats).toEqual({ cashflow: 0, total_inflow: 0, total_outflow: 0, cash: 0, savings: 0, loans: 0 })
    expect(store.dailyStats.stats_inflow).toEqual({})
  })

  it('fetchCashFlows mengisi daftar dan statistik', async () => {
    vi.mocked(getCashFlows).mockResolvedValue({ cashFlows: mockCashFlows, stats: mockStats })
    const store = useCashFlowsStore()
    await store.fetchCashFlows({ type: 'inflow' })
    expect(getCashFlows).toHaveBeenCalledWith({ type: 'inflow' })
    expect(store.cashFlows).toEqual(mockCashFlows)
    expect(store.stats).toEqual(mockStats)
    expect(store.isCashFlowsLoading).toBe(false)
  })

  it('fetchCashFlows menampilkan error', async () => {
    vi.mocked(getCashFlows).mockRejectedValue(failure)
    const store = useCashFlowsStore()
    await store.fetchCashFlows({})
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
    expect(store.isCashFlowsLoading).toBe(false)
  })

  it('fetchCashFlow mengisi detail', async () => {
    vi.mocked(getCashFlow).mockResolvedValue(mockCashFlows[0])
    const store = useCashFlowsStore()
    await store.fetchCashFlow(2)
    expect(store.cashFlow).toEqual(mockCashFlows[0])
    expect(store.isCashFlowLoading).toBe(false)
  })

  it('fetchCashFlow mengosongkan detail dan menampilkan error saat gagal', async () => {
    vi.mocked(getCashFlow).mockRejectedValue(failure)
    const store = useCashFlowsStore()
    store.cashFlow = mockCashFlows[0]
    await store.fetchCashFlow(2)
    expect(store.cashFlow).toBeNull()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
  })

  it('fetchLabels berhasil & gagal', async () => {
    vi.mocked(getLabels).mockResolvedValueOnce(['gaji'])
    const store = useCashFlowsStore()
    await store.fetchLabels()
    expect(store.labels).toEqual(['gaji'])
    vi.mocked(getLabels).mockRejectedValueOnce(failure)
    await store.fetchLabels()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
    expect(store.isLabelsLoading).toBe(false)
  })

  it('fetchDailyStats berhasil & gagal', async () => {
    vi.mocked(getDailyStats).mockResolvedValueOnce(mockDailyStats)
    const store = useCashFlowsStore()
    await store.fetchDailyStats()
    expect(store.dailyStats).toEqual(mockDailyStats)
    vi.mocked(getDailyStats).mockRejectedValueOnce(failure)
    await store.fetchDailyStats()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
    expect(store.isStatsLoading).toBe(false)
  })

  it('fetchMonthlyStats berhasil & gagal', async () => {
    vi.mocked(getMonthlyStats).mockResolvedValueOnce(mockMonthlyStats)
    const store = useCashFlowsStore()
    await store.fetchMonthlyStats()
    expect(store.monthlyStats).toEqual(mockMonthlyStats)
    vi.mocked(getMonthlyStats).mockRejectedValueOnce(failure)
    await store.fetchMonthlyStats()
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
    expect(store.isStatsLoading).toBe(false)
  })

  it('addCashFlow berhasil menandai isCashFlowAdded', async () => {
    vi.mocked(createCashFlow).mockResolvedValue(1)
    const store = useCashFlowsStore()
    await expect(store.addCashFlow(payload)).resolves.toBe(true)
    expect(createCashFlow).toHaveBeenCalledWith(payload)
    expect(store.isCashFlowAdded).toBe(true)
    expect(store.isCashFlowAdd).toBe(false)
  })

  it('addCashFlow gagal', async () => {
    vi.mocked(createCashFlow).mockRejectedValue(failure)
    const store = useCashFlowsStore()
    await expect(store.addCashFlow(payload)).resolves.toBe(false)
    expect(store.isCashFlowAdded).toBe(false)
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
    expect(store.isCashFlowAdd).toBe(false)
  })

  it('changeCashFlow berhasil menandai isCashFlowChanged', async () => {
    vi.mocked(updateCashFlow).mockResolvedValue()
    const store = useCashFlowsStore()
    await expect(store.changeCashFlow(2, payload)).resolves.toBe(true)
    expect(updateCashFlow).toHaveBeenCalledWith(2, payload)
    expect(store.isCashFlowChanged).toBe(true)
    expect(store.isCashFlowChange).toBe(false)
  })

  it('changeCashFlow gagal', async () => {
    vi.mocked(updateCashFlow).mockRejectedValue(failure)
    const store = useCashFlowsStore()
    await expect(store.changeCashFlow(2, payload)).resolves.toBe(false)
    expect(store.isCashFlowChanged).toBe(false)
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
  })

  it('deleteCashFlow berhasil menandai isCashFlowDeleted', async () => {
    vi.mocked(removeCashFlow).mockResolvedValue()
    const store = useCashFlowsStore()
    await expect(store.deleteCashFlow(2)).resolves.toBe(true)
    expect(removeCashFlow).toHaveBeenCalledWith(2)
    expect(store.isCashFlowDeleted).toBe(true)
    expect(store.isCashFlowDelete).toBe(false)
  })

  it('deleteCashFlow gagal', async () => {
    vi.mocked(removeCashFlow).mockRejectedValue(failure)
    const store = useCashFlowsStore()
    await expect(store.deleteCashFlow(2)).resolves.toBe(false)
    expect(store.isCashFlowDeleted).toBe(false)
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
  })

  it('deleteAllCashFlows berhasil menandai isCashFlowDeletedAll', async () => {
    vi.mocked(removeAllCashFlows).mockResolvedValue()
    const store = useCashFlowsStore()
    await expect(store.deleteAllCashFlows()).resolves.toBe(true)
    expect(store.isCashFlowDeletedAll).toBe(true)
    expect(store.isCashFlowDeleteAll).toBe(false)
  })

  it('deleteAllCashFlows gagal', async () => {
    vi.mocked(removeAllCashFlows).mockRejectedValue(failure)
    const store = useCashFlowsStore()
    await expect(store.deleteAllCashFlows()).resolves.toBe(false)
    expect(store.isCashFlowDeletedAll).toBe(false)
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal')
  })
})
