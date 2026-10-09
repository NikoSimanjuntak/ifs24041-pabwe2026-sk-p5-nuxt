<script setup lang="ts">
import { Wallet } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { getAccessToken } from '~/helpers/apiHelper'

const router = useRouter()

// Pengguna yang sudah masuk tidak perlu melihat halaman login/registrasi.
if (getAccessToken()) {
  router.replace('/')
}
</script>

<template>
  <div class="grid min-h-screen bg-stone-50 lg:grid-cols-[1.1fr_1fr]">
    <aside class="relative hidden flex-col justify-between overflow-hidden bg-emerald-950 p-12 text-emerald-50 lg:flex">
      <div class="flex items-center gap-3 text-lg font-bold tracking-tight">
        <span class="grid size-10 place-items-center rounded-xl bg-emerald-400 text-emerald-950"><Wallet class="size-5" /></span>
        Delcom Cash Flow
      </div>
      <div class="max-w-md space-y-4">
        <p class="text-4xl leading-tight font-extrabold tracking-tight">Catat setiap rupiah, pahami arah uangmu.</p>
        <p class="text-emerald-200">Pantau pemasukan, pengeluaran, tabungan, dan pinjaman dalam satu buku kas yang rapi.</p>
      </div>
      <p class="text-sm text-emerald-300">Praktikum Pengembangan Aplikasi Web 2026</p>
      <div class="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full border-[28px] border-emerald-900"></div>
    </aside>
    <main class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 text-lg font-bold lg:hidden">
          <span class="grid size-10 place-items-center rounded-xl bg-emerald-950 text-emerald-300"><Wallet class="size-5" /></span>
          Delcom Cash Flow
        </div>
        <RouterView />
      </div>
    </main>
  </div>
</template>