import { defineStore } from 'pinia'
import { getErrorMessage } from '~/helpers/apiHelper'
import { showErrorDialog } from '~/helpers/toolsHelper'
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

export type CashFlowType = 'inflow' | 'outflow'
export type CashFlowSource = 'cash' | 'savings' | 'loans'

export interface CashFlow {
  id: number
  user_id: number
  type: CashFlowType
  source: CashFlowSource
  label: string
  description: string
  nominal: number
  created_at: string
  updated_at: string
}

export interface CashFlowPayload {
  type: CashFlowType
  source: CashFlowSource
  label: string
  nominal: number
  description: string
}

export interface CashFlowQueryParams {
  type?: CashFlowType | ''
  source?: CashFlowSource | ''
  label?: string
  start_date?: string
  end_date?: string
}

/** Ringkasan saldo hasil kalkulasi dari statistik mentah API. */
export interface CashFlowStats {
  cashflow: number
  total_inflow: number
  total_outflow: number
  cash: number
  savings: number
  loans: number
}

/** Statistik harian/bulanan: kunci tanggal/bulan -> nominal. */
export interface CashFlowChartStats {
  stats_inflow: Record<string, number>
  stats_outflow: Record<string, number>
  stats_cashflow: Record<string, number>
}

export interface CashFlowsState {
  cashFlows: CashFlow[]
  cashFlow: CashFlow | null
  stats: CashFlowStats
  labels: string[]
  dailyStats: CashFlowChartStats
  monthlyStats: CashFlowChartStats
  isCashFlowsLoading: boolean
  isCashFlowLoading: boolean
  isLabelsLoading: boolean
  isStatsLoading: boolean
  isCashFlowAdd: boolean
  isCashFlowAdded: boolean
  isCashFlowChange: boolean
  isCashFlowChanged: boolean
  isCashFlowDelete: boolean
  isCashFlowDeleted: boolean
  isCashFlowDeleteAll: boolean
  isCashFlowDeletedAll: boolean
}

const emptyStats = (): CashFlowStats => ({
  cashflow: 0,
  total_inflow: 0,
  total_outflow: 0,
  cash: 0,
  savings: 0,
  loans: 0,
})

const emptyChartStats = (): CashFlowChartStats => ({
  stats_inflow: {},
  stats_outflow: {},
  stats_cashflow: {},
})

export const useCashFlowsStore = defineStore('cashFlows', {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: emptyStats(),
    labels: [],
    dailyStats: emptyChartStats(),
    monthlyStats: emptyChartStats(),
    isCashFlowsLoading: false,
    isCashFlowLoading: false,
    isLabelsLoading: false,
    isStatsLoading: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  actions: {
    async fetchCashFlows(query: CashFlowQueryParams): Promise<void> {
      this.isCashFlowsLoading = true
      try {
        const result = await getCashFlows(query)
        this.cashFlows = result.cashFlows
        this.stats = result.stats
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isCashFlowsLoading = false
      }
    },
    async fetchCashFlow(id: number): Promise<void> {
      this.cashFlow = null
      this.isCashFlowLoading = true
      try {
        this.cashFlow = await getCashFlow(id)
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isCashFlowLoading = false
      }
    },
    async fetchLabels(): Promise<void> {
      this.isLabelsLoading = true
      try {
        this.labels = await getLabels()
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isLabelsLoading = false
      }
    },
    async fetchDailyStats(): Promise<void> {
      this.isStatsLoading = true
      try {
        this.dailyStats = await getDailyStats()
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isStatsLoading = false
      }
    },
    async fetchMonthlyStats(): Promise<void> {
      this.isStatsLoading = true
      try {
        this.monthlyStats = await getMonthlyStats()
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isStatsLoading = false
      }
    },
    async addCashFlow(payload: CashFlowPayload): Promise<boolean> {
      this.isCashFlowAdd = true
      this.isCashFlowAdded = false
      try {
        await createCashFlow(payload)
        this.isCashFlowAdded = true
        return true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
        return false
      } finally {
        this.isCashFlowAdd = false
      }
    },
    async changeCashFlow(id: number, payload: CashFlowPayload): Promise<boolean> {
      this.isCashFlowChange = true
      this.isCashFlowChanged = false
      try {
        await updateCashFlow(id, payload)
        this.isCashFlowChanged = true
        return true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
        return false
      } finally {
        this.isCashFlowChange = false
      }
    },
    async deleteCashFlow(id: number): Promise<boolean> {
      this.isCashFlowDelete = true
      this.isCashFlowDeleted = false
      try {
        await removeCashFlow(id)
        this.isCashFlowDeleted = true
        return true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
        return false
      } finally {
        this.isCashFlowDelete = false
      }
    },
    async deleteAllCashFlows(): Promise<boolean> {
      this.isCashFlowDeleteAll = true
      this.isCashFlowDeletedAll = false
      try {
        await removeAllCashFlows()
        this.isCashFlowDeletedAll = true
        return true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
        return false
      } finally {
        this.isCashFlowDeleteAll = false
      }
    },
  },
})
