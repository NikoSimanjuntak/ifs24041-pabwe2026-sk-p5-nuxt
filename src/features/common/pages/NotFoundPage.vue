<script setup lang="ts">
import { Compass } from 'lucide-vue-next'
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-stone-50 p-6 text-center">
    <div class="max-w-md">
      <span class="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Compass class="size-8" /></span>
      <p class="mt-6 text-sm font-semibold tracking-widest text-emerald-700">404</p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight">Halaman tidak ditemukan</h1>
      <p class="mt-3 text-stone-600">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
      <RouterLink to="/" class="mt-8 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">
        Kembali ke Beranda
      </RouterLink>
    </div>
  </main>
</template>
