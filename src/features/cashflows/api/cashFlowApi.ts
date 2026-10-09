import { request } from '~/helpers/apiHelper'
import type {
  CashFlow,
  CashFlowChartStats,
  CashFlowPayload,
  CashFlowQueryParams,
  CashFlowStats,
} from '../states/cashFlowsStore'

type RawStats = Record<string, number>

interface ChartParams {
  end_date?: string
  total_data?: number
}

const valueOf = (raw: RawStats, key: string): number => raw[key] ?? 0

/** Mengubah statistik mentah API menjadi ringkasan saldo (inflow dikurangi outflow per sumber dana). */
export const mapStats = (raw: RawStats): CashFlowStats => ({
  cashflow: valueOf(raw, 'cashflow'),
  total_inflow: valueOf(raw, 'total_inflow'),
  total_outflow: valueOf(raw, 'total_outflow'),
  cash: valueOf(raw, 'total_inflow_cash') - valueOf(raw, 'total_outflow_cash'),
  savings: valueOf(raw, 'total_inflow_savings') - valueOf(raw, 'total_outflow_savings'),
  loans: valueOf(raw, 'total_inflow_loans') - valueOf(raw, 'total_outflow_loans'),
})

export const getCashFlows = async (
  query: CashFlowQueryParams,
): Promise<{ cashFlows: CashFlow[]; stats: CashFlowStats }> => {
  const response = await request<{ cash_flows: CashFlow[]; stats?: RawStats }>('/cash-flows', { params: { ...query } })
  return { cashFlows: response.data.cash_flows, stats: mapStats(response.data.stats ?? {}) }
}

export const getCashFlow = async (id: number): Promise<CashFlow> => {
  const response = await request<{ cash_flow: CashFlow }>(`/cash-flows/${id}`)
  return response.data.cash_flow
}

export const createCashFlow = async (payload: CashFlowPayload): Promise<number> => {
  const response = await request<{ cash_flow_id: number }>('/cash-flows', { method: 'POST', body: payload })
  return response.data.cash_flow_id
}

export const updateCashFlow = async (id: number, payload: CashFlowPayload): Promise<void> => {
  await request(`/cash-flows/${id}`, { method: 'PUT', body: payload })
}

export const removeCashFlow = async (id: number): Promise<void> => {
  await request(`/cash-flows/${id}`, { method: 'DELETE' })
}

export const getLabels = async (): Promise<string[]> => {
  const response = await request<{ labels: string[] }>('/cash-flows/labels')
  return response.data.labels
}

export const getDailyStats = async (params: ChartParams = {}): Promise<CashFlowChartStats> => {
  const response = await request<CashFlowChartStats>('/cash-flows/stats/daily', { params: { ...params } })
  return response.data
}

export const getMonthlyStats = async (params: ChartParams = {}): Promise<CashFlowChartStats> => {
  const response = await request<CashFlowChartStats>('/cash-flows/stats/monthly', { params: { ...params } })
  return response.data
}

export const removeAllCashFlows = async (): Promise<void> => {
  await request('/cash-flows', { method: 'DELETE' })
}
