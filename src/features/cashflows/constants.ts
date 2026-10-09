import type { CashFlowSource, CashFlowType } from './states/cashFlowsStore'

export const TYPE_LABELS: Record<CashFlowType, string> = {
  inflow: 'Pemasukan (Inflow)',
  outflow: 'Pengeluaran (Outflow)',
}

export const SOURCE_LABELS: Record<CashFlowSource, string> = {
  cash: 'Tunai',
  savings: 'Tabungan',
  loans: 'Pinjaman',
}
