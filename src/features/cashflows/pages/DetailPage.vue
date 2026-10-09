<script setup lang="ts">
import { ArrowLeft, Pencil, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDateTime, formatRupiah, showConfirmDialog, showSuccessDialog } from '~/helpers/toolsHelper'
import ChangeModal from '../components/modals/ChangeModal.vue'
import { SOURCE_LABELS, TYPE_LABELS } from '../constants'
import { useCashFlowsStore } from '../states/cashFlowsStore'

const route = useRoute()
const router = useRouter()
const store = useCashFlowsStore()
const editing = ref(false)
const cashFlowId = computed(() => Number(route.params.cashFlowId))

onMounted(() => Promise.all([store.fetchCashFlow(cashFlowId.value), store.fetchLabels()]))

const handleSaved = async (): Promise<void> => {
  editing.value = false
  await store.fetchCashFlow(cashFlowId.value)
}

const handleDelete = async (): Promise<void> => {
  if (!(await showConfirmDialog('Transaksi ini akan dihapus permanen. Lanjutkan?'))) {
    return
  }
  if (await store.deleteCashFlow(cashFlowId.value)) {
    await showSuccessDialog('Transaksi berhasil dihapus.')
    await router.replace('/')
  }
}
</script>

<template>
  <section class="space-y-6">
    <RouterLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
      <ArrowLeft class="size-4" />Kembali ke ringkasan
    </RouterLink>

    <p v-if="store.isCashFlowLoading" class="rounded-2xl bg-white p-8 text-center text-stone-500">Memuat rincian transaksi...</p>

    <article v-else-if="store.cashFlow" class="overflow-hidden rounded-3xl border border-stone-200 bg-white">
      <div :class="['p-6 sm:p-8', store.cashFlow.type === 'inflow' ? 'bg-emerald-950 text-white' : 'bg-rose-950 text-white']">
        <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{{ TYPE_LABELS[store.cashFlow.type] }}</span>
        <h1 class="mt-4 text-3xl font-extrabold tracking-tight">{{ formatRupiah(store.cashFlow.nominal) }}</h1>
        <p class="mt-1 text-white/70">{{ store.cashFlow.label }}</p>
      </div>
      <dl class="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
        <div><dt class="text-xs font-semibold tracking-wide text-stone-500 uppercase">Kategori Label</dt><dd class="mt-1 font-bold">{{ store.cashFlow.label }}</dd></div>
        <div><dt class="text-xs font-semibold tracking-wide text-stone-500 uppercase">Sumber Dana</dt><dd class="mt-1 font-bold">{{ SOURCE_LABELS[store.cashFlow.source] }}</dd></div>
        <div><dt class="text-xs font-semibold tracking-wide text-stone-500 uppercase">Tipe</dt><dd class="mt-1 font-bold">{{ TYPE_LABELS[store.cashFlow.type] }}</dd></div>
        <div><dt class="text-xs font-semibold tracking-wide text-stone-500 uppercase">Nominal</dt><dd class="mt-1 font-bold">{{ formatRupiah(store.cashFlow.nominal) }}</dd></div>
        <div class="sm:col-span-2"><dt class="text-xs font-semibold tracking-wide text-stone-500 uppercase">Deskripsi</dt><dd class="mt-1">{{ store.cashFlow.description }}</dd></div>
        <div><dt class="text-xs font-semibold tracking-wide text-stone-500 uppercase">Dibuat</dt><dd class="mt-1">{{ formatDateTime(store.cashFlow.created_at) }}</dd></div>
        <div><dt class="text-xs font-semibold tracking-wide text-stone-500 uppercase">Diperbarui</dt><dd class="mt-1">{{ formatDateTime(store.cashFlow.updated_at) }}</dd></div>
      </dl>
      <div class="flex flex-wrap gap-3 border-t border-stone-100 p-6 sm:px-8">
        <button type="button" class="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800" @click="editing = true">
          <Pencil class="size-4" />Ubah
        </button>
        <button type="button" :disabled="store.isCashFlowDelete" class="flex items-center gap-2 rounded-xl border border-rose-300 px-5 py-3 font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60" @click="handleDelete">
          <Trash2 class="size-4" />Hapus
        </button>
      </div>
      <ChangeModal v-if="editing" :cash-flow="store.cashFlow" :labels="store.labels" @close="editing = false" @saved="handleSaved" />
    </article>

    <p v-else class="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">Transaksi tidak ditemukan.</p>
  </section>
</template>
