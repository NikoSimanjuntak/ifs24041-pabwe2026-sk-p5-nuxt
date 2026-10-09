<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { showSuccessDialog } from '~/helpers/toolsHelper'
import { useInput } from '~/hooks/useInput'
import { useAuthStore } from '../states/authStore'

const router = useRouter()
const auth = useAuthStore()
const [name, onName] = useInput('')
const [email, onEmail] = useInput('')
const [password, onPassword] = useInput('')

const submit = async (): Promise<void> => {
  const registered = await auth.register({ name: name.value, email: email.value, password: password.value })
  if (registered) {
    await showSuccessDialog('Akun berhasil dibuat. Silakan masuk.')
    await router.push('/auth/login')
  }
}
</script>

<template>
  <section>
    <h2 class="text-3xl font-extrabold tracking-tight">Buat Akun</h2>
    <p class="mt-2 text-stone-600">Daftar gratis dan mulai mencatat arus kas Anda.</p>

    <form class="mt-8 space-y-5" @submit.prevent="submit">
      <div>
        <label for="register-name" class="mb-1.5 block text-sm font-semibold">Nama Lengkap</label>
        <input id="register-name" type="text" required autocomplete="name" :value="name" placeholder="Nama Anda"
          class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onName" />
      </div>
      <div>
        <label for="register-email" class="mb-1.5 block text-sm font-semibold">Email</label>
        <input id="register-email" type="email" required autocomplete="email" :value="email" placeholder="nama@email.com"
          class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onEmail" />
      </div>
      <div>
        <label for="register-password" class="mb-1.5 block text-sm font-semibold">Kata Sandi</label>
        <input id="register-password" type="password" required autocomplete="new-password" :value="password" placeholder="Minimal 6 karakter"
          class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onPassword" />
      </div>
      <button type="submit" :disabled="auth.isAuthLoading"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">
        <LoaderCircle v-if="auth.isAuthLoading" class="size-4 animate-spin" />
        {{ auth.isAuthLoading ? 'Memproses...' : 'Daftar' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-stone-600">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-emerald-700 hover:underline">Masuk</RouterLink>
    </p>
  </section>
</template>
