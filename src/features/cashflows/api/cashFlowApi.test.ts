import { beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from '~/helpers/apiHelper'
import { mockCashFlows, mockDailyStats, mockMonthlyStats } from '~/test-utils'
import {
  createCashFlow,
  getCashFlow,
  getCashFlows,
  getDailyStats,
  getLabels,
  getMonthlyStats,
  mapStats,
  removeAllCashFlows,
  removeCashFlow,
  updateCashFlow,
} from './cashFlowApi'

vi.mock('~/helpers/apiHelper', () => ({ request: vi.fn() }))

const requestMock = vi.mocked(request)
const ok = (data: unknown) => ({ status: 'success', message: 'ok', data }) as never
const payload = { type: 'inflow', source: 'cash', label: 'gaji', nominal: 1, description: 'x' } as const

beforeEach(() => requestMock.mockReset())

describe('mapStats', () => {
  it('menghitung saldo per sumber dana', () => {
    expect(
      mapStats({
        cashflow: 2000000,
        total_inflow: 3000000,
        total_outflow: 1000000,
        total_inflow_cash: 2000000,
        total_outflow_cash: 500000,
        total_inflow_savings: 600000,
        total_outflow_savings: 100000,
        total_inflow_loans: 400000,
        total_outflow_loans: 400000,
      }),
    ).toEqual({ cashflow: 2000000, total_inflow: 3000000, total_outflow: 1000000, cash: 1500000, savings: 500000, loans: 0 })
  })

  it('menganggap kunci yang tidak ada bernilai nol', () => {
    expect(mapStats({})).toEqual({ cashflow: 0, total_inflow: 0, total_outflow: 0, cash: 0, savings: 0, loans: 0 })
  })
})

describe('cashFlowApi', () => {
  it('getCashFlows memakai filter dan memetakan statistik', async () => {
    requestMock.mockResolvedValue(ok({ cash_flows: mockCashFlows, stats: { cashflow: 5, total_inflow_cash: 7 } }))
    const result = await getCashFlows({ type: 'inflow', label: 'gaji' })
    expect(requestMock).toHaveBeenCalledWith('/cash-flows', { params: { type: 'inflow', label: 'gaji' } })
    expect(result.cashFlows).toEqual(mockCashFlows)
    expect(result.stats.cashflow).toBe(5)
    expect(result.stats.cash).toBe(7)
  })

  it('getCashFlows menangani statistik yang tidak dikirim', async () => {
    requestMock.mockResolvedValue(ok({ cash_flows: [] }))
    const result = await getCashFlows({})
    expect(result.stats.cashflow).toBe(0)
  })

  it('getCashFlow memanggil GET /cash-flows/:id', async () => {
    requestMock.mockResolvedValue(ok({ cash_flow: mockCashFlows[0] }))
    await expect(getCashFlow(2)).resolves.toEqual(mockCashFlows[0])
    expect(requestMock).toHaveBeenCalledWith('/cash-flows/2')
  })

  it('createCashFlow memanggil POST /cash-flows', async () => {
    requestMock.mockResolvedValue(ok({ cash_flow_id: 9 }))
    await expect(createCashFlow(payload)).resolves.toBe(9)
    expect(requestMock).toHaveBeenCalledWith('/cash-flows', { method: 'POST', body: payload })
  })

  it('updateCashFlow memanggil PUT /cash-flows/:id', async () => {
    requestMock.mockResolvedValue(ok(undefined))
    await expect(updateCashFlow(2, payload)).resolves.toBeUndefined()
    expect(requestMock).toHaveBeenCalledWith('/cash-flows/2', { method: 'PUT', body: payload })
  })

  it('removeCashFlow memanggil DELETE /cash-flows/:id', async () => {
    requestMock.mockResolvedValue(ok(undefined))
    await expect(removeCashFlow(2)).resolves.toBeUndefined()
    expect(requestMock).toHaveBeenCalledWith('/cash-flows/2', { method: 'DELETE' })
  })

  it('getLabels memanggil GET /cash-flows/labels', async () => {
    requestMock.mockResolvedValue(ok({ labels: ['gaji'] }))
    await expect(getLabels()).resolves.toEqual(['gaji'])
    expect(requestMock).toHaveBeenCalledWith('/cash-flows/labels')
  })

  it('getDailyStats memanggil GET /cash-flows/stats/daily (dengan & tanpa parameter)', async () => {
    requestMock.mockResolvedValue(ok(mockDailyStats))
    await expect(getDailyStats()).resolves.toEqual(mockDailyStats)
    expect(requestMock).toHaveBeenLastCalledWith('/cash-flows/stats/daily', { params: {} })
    await getDailyStats({ end_date: '2024-10-05 23:59:59', total_data: 7 })
    expect(requestMock).toHaveBeenLastCalledWith('/cash-flows/stats/daily', {
      params: { end_date: '2024-10-05 23:59:59', total_data: 7 },
    })
  })

  it('getMonthlyStats memanggil GET /cash-flows/stats/monthly (dengan & tanpa parameter)', async () => {
    requestMock.mockResolvedValue(ok(mockMonthlyStats))
    await expect(getMonthlyStats()).resolves.toEqual(mockMonthlyStats)
    expect(requestMock).toHaveBeenLastCalledWith('/cash-flows/stats/monthly', { params: {} })
    await getMonthlyStats({ total_data: 12 })
    expect(requestMock).toHaveBeenLastCalledWith('/cash-flows/stats/monthly', { params: { total_data: 12 } })
  })

  it('removeAllCashFlows memanggil DELETE /cash-flows', async () => {
    requestMock.mockResolvedValue(ok(undefined))
    await expect(removeAllCashFlows()).resolves.toBeUndefined()
    expect(requestMock).toHaveBeenCalledWith('/cash-flows', { method: 'DELETE' })
  })
})
