<script setup lang="ts">
import { onMounted } from 'vue'
import AvatarComponent from '~/features/common/components/AvatarComponent.vue'
import { formatDate } from '~/helpers/toolsHelper'
import { useUsersStore } from '../states/usersStore'

const store = useUsersStore()

onMounted(() => store.fetchUsers())
</script>

<template>
  <section class="space-y-6">
    <header>
      <p class="text-sm font-semibold text-emerald-700">Direktori</p>
      <h1 class="text-2xl font-extrabold tracking-tight">Daftar Pengguna</h1>
      <p class="mt-1 text-stone-600">Seluruh pengguna yang terdaftar pada sistem Delcom.</p>
    </header>

    <p v-if="store.isUsersLoading" class="rounded-2xl bg-white p-8 text-center text-stone-500">Memuat pengguna...</p>
    <p v-else-if="store.users.length === 0" class="rounded-2xl bg-white p-8 text-center text-stone-500">Belum ada pengguna.</p>
    <ul v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="user in store.users" :key="user.id" class="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5">
        <AvatarComponent :name="user.name" :photo="user.photo" size-class="size-14 text-lg" />
        <div class="min-w-0">
          <p class="truncate font-bold">{{ user.name }}</p>
          <p class="truncate text-sm text-stone-600">{{ user.email }}</p>
          <p class="mt-1 text-xs text-stone-500">Bergabung {{ formatDate(user.created_at) }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
