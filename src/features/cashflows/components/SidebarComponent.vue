<script setup lang="ts">
import { LayoutDashboard, UserRound, Users, X } from 'lucide-vue-next'

defineProps<{ open: boolean }>()
defineEmits<{ (e: 'close'): void }>()

const items = [
  { to: '/', label: 'Ringkasan Arus Kas', icon: LayoutDashboard },
  { to: '/users', label: 'Direktori Pengguna', icon: Users },
  { to: '/profile', label: 'Profil Saya', icon: UserRound },
]
</script>

<template>
  <div v-if="open" data-testid="sidebar-backdrop" class="fixed inset-0 z-30 bg-stone-900/40 lg:hidden" @click="$emit('close')"></div>
  <aside
    :class="[
      'fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-stone-200 bg-white p-4 transition-transform lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="mb-2 flex items-center justify-between px-3 lg:hidden">
      <span class="text-xs font-semibold tracking-widest text-stone-500 uppercase">Menu</span>
      <button type="button" aria-label="Tutup menu" class="rounded-lg p-1.5 hover:bg-stone-100" @click="$emit('close')"><X class="size-4" /></button>
    </div>
    <nav class="space-y-1">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        exact-active-class="!bg-emerald-700 !text-white"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
        @click="$emit('close')"
      >
        <component :is="item.icon" class="size-5" />
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
