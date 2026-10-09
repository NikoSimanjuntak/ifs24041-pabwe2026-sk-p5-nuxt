<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '~/features/users/states/usersStore'
import { getAccessToken } from '~/helpers/apiHelper'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'

const router = useRouter()
const users = useUsersStore()
const isAuthenticated = getAccessToken() !== null
const sidebarOpen = ref(false)

// Rute terproteksi: arahkan ke halaman login jika belum ada token.
if (!isAuthenticated) {
  router.replace('/auth/login')
}

onMounted(async () => {
  if (isAuthenticated) {
    await users.fetchProfile()
  }
})
</script>

<template>
  <div v-if="isAuthenticated" class="min-h-screen bg-stone-50">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
    <main class="pt-16 lg:pl-64">
      <div class="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
