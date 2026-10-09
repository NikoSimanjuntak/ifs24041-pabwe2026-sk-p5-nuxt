<script setup lang="ts">
import {
  Banknote,
  Eye,
  HandCoins,
  Pencil,
  PiggyBank,
  Plus,
  RotateCcw,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'
import { formatDateTime, formatRupiah, showConfirmDialog, showSuccessDialog } from '~/helpers/toolsHelper'
import AddModal from '../components/modals/AddModal.vue'
import ChangeModal from '../components/modals/ChangeModal.vue'
import { SOURCE_LABELS, TYPE_LABELS } from '../constants'
import { useCashFlowsStore, type CashFlow, type CashFlowQueryParams } from '../states/cashFlowsStore'

const store = useCashFlowsStore()
const filters = reactive({ type: '', source: '', label: '', start: '', end: '' })
const showAdd = ref(false)
const editing = ref<CashFlow | null>(null)
const statsMode = ref<'daily' | 'monthly'>('daily')

const buildQuery = (): CashFlowQueryParams => ({
  type: filters.type as CashFlowQueryParams['type'],
  source: filters.source as CashFlowQueryParams['source'],
  label: filters.label,
  start_date: filters.start ? `${filters.start} 00:00:00` : undefined,
  end_date: filters.end ? `${filters.end} 23:59:59` : undefined,
})

const loadCashFlows = (): Promise<void> => store.fetchCashFlows(buildQuery())

const refreshAll = (): Promise<unknown> =>
  Promise.all([loadCashFlows(), store.fetchLabels(), store.fetchDailyStats(), store.fetchMonthlyStats()])

onMounted(refreshAll)

const resetFilters = async (): Promise<void> => {
  Object.assign(filters, { type: '', source: '', label: '', start: '', end: '' })
  await loadCashFlows()
}

const handleSaved = async (): Promise<void> => {
  showAdd.value = false
  editing.value = null
  await refreshAll()
}

const handleDelete = async (cashFlow: CashFlow): Promise<void> => {
  if (!(await showConfirmDialog(`Hapus transaksi "${cashFlow.label}"?`))) {
    return
  }
  if (await store.deleteCashFlow(cashFlow.id)) {
    await showSuccessDialog('Transaksi berhasil dihapus.')
    await refreshAll()
  }
}

const handleDeleteAll = async (): Promise<void> => {
  if (!(await showConfirmDialog('Seluruh transaksi akan dihapus permanen. Lanjutkan?'))) {
    return
  }
  if (await store.deleteAllCashFlows()) {
    await showSuccessDialog('Seluruh transaksi berhasil direset.')
    await refreshAll()
  }
}

const cards = computed(() => [
  { key: 'cashflow', label: 'Total Saldo Kas Bersih', value: store.stats.cashflow, icon: Scale, tone: 'bg-emerald-950 text-white' },
  { key: 'inflow', label: 'Total Pemasukan (Inflow)', value: store.stats.total_inflow, icon: TrendingUp, tone: 'bg-white text-emerald-700' },
  { key: 'outflow', label: 'Total Pengeluaran (Outflow)', value: store.stats.total_outflow, icon: TrendingDown, tone: 'bg-white text-rose-700' },
  { key: 'cash', label: 'Saldo Kas Tunai', value: store.stats.cash, icon: Banknote, tone: 'bg-white text-stone-800' },
  { key: 'savings', label: 'Saldo Rekening Tabungan', value: store.stats.savings, icon: PiggyBank, tone: 'bg-white text-stone-800' },
  { key: 'loans', label: 'Saldo Pinjaman', value: store.stats.loans, icon: HandCoins, tone: 'bg-white text-stone-800' },
])

const series = computed(() => (statsMode.value === 'daily' ? store.dailyStats : store.monthlyStats))

const bars = computed(() => {
  const { stats_inflow: inflow, stats_outflow: outflow } = series.value
  const max = Math.max(1, ...Object.values(inflow), ...Object.values(outflow))
  return Object.keys(inflow).map((key) => ({
    key,
    caption: key.split('-').slice(0, 2).join('/'),
    inflowHeight: (inflow[key] / max) * 100,
    outflowHeight: (outflow[key] / max) * 100,
  }))
})

const fieldClass =
  'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
</script>

<template>
  <section class="space-y-8">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-emerald-700">Dashboard</p>
        <h1 class="text-2xl font-extrabold tracking-tight">Ringkasan Arus Kas</h1>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800" @click="showAdd = true">
          <Plus class="size-4" />Tambah Transaksi
        </button>
        <button type="button" :disabled="store.isCashFlowDeleteAll" class="flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60" @click="handleDeleteAll">
          <RotateCcw class="size-4" />Reset Semua Transaksi
        </button>
      </div>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="card in cards" :key="card.key" data-testid="stat-card" :class="[card.tone, 'rounded-2xl border border-stone-200 p-5']">
        <div class="flex items-center gap-2 text-sm font-semibold">
          <component :is="card.icon" class="size-5" />{{ card.label }}
        </div>
        <p class="mt-3 text-2xl font-extrabold tracking-tight">{{ formatRupiah(card.value) }}</p>
      </article>
    </div>

    <article class="rounded-2xl border border-stone-200 bg-white p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-bold">Tren Pemasukan &amp; Pengeluaran</h2>
        <div class="flex rounded-xl bg-stone-100 p-1 text-sm font-semibold">
          <button type="button" :class="['rounded-lg px-3 py-1', statsMode === 'daily' ? 'bg-white shadow' : 'text-stone-600']" @click="statsMode = 'daily'">Harian</button>
          <button type="button" :class="['rounded-lg px-3 py-1', statsMode === 'monthly' ? 'bg-white shadow' : 'text-stone-600']" @click="statsMode = 'monthly'">Bulanan</button>
        </div>
      </div>
      <p v-if="bars.length === 0" class="py-8 text-center text-sm text-stone-600">Belum ada data statistik.</p>
      <div v-else class="flex h-40 items-end gap-2 overflow-x-auto">
        <div v-for="bar in bars" :key="bar.key" data-testid="stat-bar" :title="bar.key" class="flex min-w-10 flex-1 flex-col items-center gap-1">
          <div class="flex h-32 w-full items-end justify-center gap-1">
            <div class="w-3 rounded-t bg-emerald-500" :style="{ height: `${bar.inflowHeight}%` }"></div>
            <div class="w-3 rounded-t bg-rose-500" :style="{ height: `${bar.outflowHeight}%` }"></div>
          </div>
          <span class="text-[10px] text-stone-600">{{ bar.caption }}</span>
        </div>
      </div>
      <div class="mt-3 flex gap-4 text-xs text-stone-600">
        <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-emerald-500"></span>Pemasukan</span>
        <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-rose-500"></span>Pengeluaran</span>
      </div>
    </article>

    <form class="grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5" @submit.prevent="loadCashFlows">
      <div>
        <label for="filter-type" class="mb-1 block text-xs font-semibold text-stone-600">Jenis Arus Kas</label>
        <select id="filter-type" v-model="filters.type" :class="fieldClass">
          <option value="">Semua jenis</option>
          <option v-for="(text, value) in TYPE_LABELS" :key="value" :value="value">{{ text }}</option>
        </select>
      </div>
      <div>
        <label for="filter-source" class="mb-1 block text-xs font-semibold text-stone-600">Sumber Dana</label>
        <select id="filter-source" v-model="filters.source" :class="fieldClass">
          <option value="">Semua sumber</option>
          <option v-for="(text, value) in SOURCE_LABELS" :key="value" :value="value">{{ text }}</option>
        </select>
      </div>
      <div>
        <label for="filter-label" class="mb-1 block text-xs font-semibold text-stone-600">Label</label>
        <select id="filter-label" v-model="filters.label" :class="fieldClass">
          <option value="">Semua label</option>
          <option v-for="item in store.labels" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>
      <div>
        <label for="filter-start" class="mb-1 block text-xs font-semibold text-stone-600">Tanggal Awal</label>
        <input id="filter-start" v-model="filters.start" type="date" :class="fieldClass" />
      </div>
      <div>
        <label for="filter-end" class="mb-1 block text-xs font-semibold text-stone-600">Tanggal Akhir</label>
        <input id="filter-end" v-model="filters.end" type="date" :class="fieldClass" />
      </div>
      <div class="flex gap-2 sm:col-span-2 lg:col-span-5">
        <button type="submit" class="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">Terapkan Filter</button>
        <button type="button" class="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold hover:bg-stone-50" @click="resetFilters">Atur Ulang</button>
      </div>
    </form>

    <div>
      <h2 class="mb-3 font-bold">Daftar Transaksi</h2>
      <p v-if="store.isCashFlowsLoading" class="rounded-2xl bg-white p-8 text-center text-stone-600">Memuat transaksi...</p>
      <p v-else-if="store.cashFlows.length === 0" class="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">
        Belum ada transaksi yang sesuai.
      </p>
      <template v-else>
        <div class="hidden overflow-x-auto rounded-2xl border border-stone-200 bg-white md:block">
          <table class="w-full text-left text-sm">
            <thead class="bg-stone-50 text-xs tracking-wide text-stone-600 uppercase">
              <tr>
                <th class="px-4 py-3">Tanggal</th>
                <th class="px-4 py-3">Label</th>
                <th class="px-4 py-3">Sumber</th>
                <th class="px-4 py-3">Jenis</th>
                <th class="px-4 py-3 text-right">Nominal</th>
                <th class="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              <tr v-for="cashFlow in store.cashFlows" :key="cashFlow.id" data-testid="cash-flow-row">
                <td class="px-4 py-3 whitespace-nowrap text-stone-600">{{ formatDateTime(cashFlow.created_at) }}</td>
                <td class="px-4 py-3 font-semibold">{{ cashFlow.label }}</td>
                <td class="px-4 py-3">{{ SOURCE_LABELS[cashFlow.source] }}</td>
                <td class="px-4 py-3">
                  <span :class="['rounded-full px-2.5 py-1 text-xs font-bold', cashFlow.type === 'inflow' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700']">
                    {{ cashFlow.type === 'inflow' ? 'Pemasukan' : 'Pengeluaran' }}
                  </span>
                </td>
                <td :class="['px-4 py-3 text-right font-bold whitespace-nowrap', cashFlow.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700']">
                  {{ cashFlow.type === 'inflow' ? '+' : '-' }}{{ formatRupiah(cashFlow.nominal) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <RouterLink :to="`/cash-flows/${cashFlow.id}`" :aria-label="`Lihat detail transaksi ${cashFlow.id}`" class="rounded-lg p-2 hover:bg-stone-100"><Eye class="size-4" /></RouterLink>
                    <button type="button" :aria-label="`Ubah transaksi ${cashFlow.id}`" class="rounded-lg p-2 hover:bg-stone-100" @click="editing = cashFlow"><Pencil class="size-4" /></button>
                    <button type="button" :aria-label="`Hapus transaksi ${cashFlow.id}`" class="rounded-lg p-2 text-rose-600 hover:bg-rose-50" @click="handleDelete(cashFlow)"><Trash2 class="size-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul class="space-y-3 md:hidden">
          <li v-for="cashFlow in store.cashFlows" :key="cashFlow.id" data-testid="cash-flow-card" class="rounded-2xl border border-stone-200 bg-white p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-bold">{{ cashFlow.label }}</p>
                <p class="text-xs text-stone-600">{{ formatDateTime(cashFlow.created_at) }} &middot; {{ SOURCE_LABELS[cashFlow.source] }}</p>
              </div>
              <span :class="['rounded-full px-2.5 py-1 text-xs font-bold', cashFlow.type === 'inflow' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700']">
                {{ cashFlow.type === 'inflow' ? 'Pemasukan' : 'Pengeluaran' }}
              </span>
            </div>
            <p :class="['mt-3 text-lg font-extrabold', cashFlow.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700']">
              {{ cashFlow.type === 'inflow' ? '+' : '-' }}{{ formatRupiah(cashFlow.nominal) }}
            </p>
            <div class="mt-3 flex gap-1">
              <RouterLink :to="`/cash-flows/${cashFlow.id}`" :aria-label="`Lihat detail transaksi ${cashFlow.id}`" class="rounded-lg p-2 hover:bg-stone-100"><Eye class="size-4" /></RouterLink>
              <button type="button" :aria-label="`Ubah transaksi ${cashFlow.id}`" class="rounded-lg p-2 hover:bg-stone-100" @click="editing = cashFlow"><Pencil class="size-4" /></button>
              <button type="button" :aria-label="`Hapus transaksi ${cashFlow.id}`" class="rounded-lg p-2 text-rose-600 hover:bg-rose-50" @click="handleDelete(cashFlow)"><Trash2 class="size-4" /></button>
            </div>
          </li>
        </ul>
      </template>
    </div>

    <AddModal v-if="showAdd" :labels="store.labels" @close="showAdd = false" @saved="handleSaved" />
    <ChangeModal v-if="editing" :cash-flow="editing" :labels="store.labels" @close="editing = null" @saved="handleSaved" />
  </section>
</template>