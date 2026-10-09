<script setup lang="ts">
import { LogOut, Menu, Wallet } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/features/auth/states/authStore'
import AvatarComponent from '~/features/common/components/AvatarComponent.vue'
import { useUsersStore } from '~/features/users/states/usersStore'
import { showConfirmDialog } from '~/helpers/toolsHelper'

defineEmits<{ (e: 'toggle-sidebar'): void }>()

const router = useRouter()
const auth = useAuthStore()
const users = useUsersStore()

const handleLogout = async (): Promise<void> => {
  if (!(await showConfirmDialog('Anda yakin ingin keluar dari akun?'))) {
    return
  }
  await auth.logout()
  await router.replace('/auth/login')
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-3 border-b border-stone-200 bg-white/90 px-4 backdrop-blur sm:px-6">
    <button type="button" aria-label="Buka menu" class="rounded-lg p-2 hover:bg-stone-100 lg:hidden" @click="$emit('toggle-sidebar')">
      <Menu class="size-5" />
    </button>
    <div class="flex items-center gap-2.5 font-extrabold tracking-tight">
      <span class="grid size-9 place-items-center rounded-xl bg-emerald-950 text-emerald-300"><Wallet class="size-5" /></span>
      <span class="hidden sm:inline">Delcom Cash Flow</span>
    </div>

    <div class="ml-auto flex items-center gap-3">
      <div v-if="users.profile" class="flex items-center gap-3">
        <div class="hidden text-right sm:block">
          <p class="text-sm leading-tight font-bold">{{ users.profile.name }}</p>
          <p class="text-xs text-stone-500">@{{ users.profile.email.split('@')[0] }}</p>
        </div>
        <AvatarComponent :name="users.profile.name" :photo="users.profile.photo" size-class="size-9" />
        <span class="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 md:flex">
          <span class="size-1.5 rounded-full bg-emerald-500"></span>Sesi aktif
        </span>
      </div>
      <span v-else class="text-sm text-stone-500">Memuat sesi...</span>

      <button type="button" class="flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-semibold hover:bg-stone-50" @click="handleLogout">
        <LogOut class="size-4" /><span class="hidden sm:inline">Keluar</span>
      </button>
    </div>
  </header>
</template>
