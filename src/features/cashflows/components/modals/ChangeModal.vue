<script setup lang="ts">
import { LoaderCircle, X } from 'lucide-vue-next'
import { ref } from 'vue'
import { showSuccessDialog } from '~/helpers/toolsHelper'
import { useInput } from '~/hooks/useInput'
import { SOURCE_LABELS, TYPE_LABELS } from '../../constants'
import { useCashFlowsStore, type CashFlow } from '../../states/cashFlowsStore'

const props = defineProps<{ cashFlow: CashFlow; labels: string[] }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const store = useCashFlowsStore()
const type = ref(props.cashFlow.type)
const source = ref(props.cashFlow.source)
const [label, onLabel] = useInput(props.cashFlow.label)
const [nominal, onNominal] = useInput(String(props.cashFlow.nominal))
const [description, onDescription] = useInput(props.cashFlow.description)

const submit = async (): Promise<void> => {
  const saved = await store.changeCashFlow(props.cashFlow.id, {
    type: type.value,
    source: source.value,
    label: label.value,
    nominal: Number(nominal.value),
    description: description.value,
  })
  if (saved) {
    await showSuccessDialog('Transaksi berhasil diperbarui.')
    emit('saved')
  }
}
</script>

<template>
  <div data-testid="modal-backdrop" class="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-stone-900/50 p-4" @click.self="emit('close')">
    <div role="dialog" aria-modal="true" aria-labelledby="change-title" class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
      <div class="mb-5 flex items-start justify-between">
        <div>
          <h2 id="change-title" class="text-xl font-extrabold tracking-tight">Ubah Transaksi</h2>
          <p class="text-sm text-stone-600">Perbarui data transaksi yang tersimpan.</p>
        </div>
        <button type="button" aria-label="Tutup" class="rounded-lg p-2 hover:bg-stone-100" @click="emit('close')"><X class="size-5" /></button>
      </div>
      <form class="space-y-4" @submit.prevent="submit">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="cf-type" class="mb-1.5 block text-sm font-semibold">Jenis Arus Kas</label>
              <select id="cf-type" v-model="type" class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100">
                <option v-for="(text, value) in TYPE_LABELS" :key="value" :value="value">{{ text }}</option>
              </select>
            </div>
            <div>
              <label for="cf-source" class="mb-1.5 block text-sm font-semibold">Sumber Dana</label>
              <select id="cf-source" v-model="source" class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100">
                <option v-for="(text, value) in SOURCE_LABELS" :key="value" :value="value">{{ text }}</option>
              </select>
            </div>
          </div>
          <div>
            <label for="cf-label" class="mb-1.5 block text-sm font-semibold">Label Kategori</label>
            <input id="cf-label" type="text" required list="cf-label-options" :value="label" placeholder="contoh: gaji" class="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onLabel" />
            <datalist id="cf-label-options"><option v-for="item in labels" :key="item" :value="item"></option></datalist>
          </div>
          <div>
            <label for="cf-nominal" class="mb-1.5 block text-sm font-semibold">Nominal (Rupiah)</label>
            <input id="cf-nominal" type="number" required min="1" :value="nominal" placeholder="0" class="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onNominal" />
          </div>
          <div>
            <label for="cf-description" class="mb-1.5 block text-sm font-semibold">Keterangan</label>
            <textarea id="cf-description" required rows="3" :value="description" placeholder="Tuliskan keterangan transaksi" class="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onDescription"></textarea>
          </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="rounded-xl border border-stone-300 px-5 py-3 font-semibold hover:bg-stone-50" @click="emit('close')">Batal</button>
          <button type="submit" :disabled="store.isCashFlowChange" class="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
            <LoaderCircle v-if="store.isCashFlowChange" class="size-4 animate-spin" />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
