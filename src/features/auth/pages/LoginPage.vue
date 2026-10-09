<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useInput } from '~/hooks/useInput'
import { useAuthStore } from '../states/authStore'

const router = useRouter()
const auth = useAuthStore()
const [email, onEmail] = useInput('')
const [password, onPassword] = useInput('')

const submit = async (): Promise<void> => {
  if (await auth.login({ email: email.value, password: password.value })) {
    await router.replace('/')
  }
}
</script>

<template>
  <section>
    <h2 class="text-3xl font-extrabold tracking-tight">Masuk</h2>
    <p class="mt-2 text-stone-600">Selamat datang kembali. Masuk untuk melihat arus kas Anda.</p>

    <form class="mt-8 space-y-5" @submit.prevent="submit">
      <div>
        <label for="login-email-input" class="mb-1.5 block text-sm font-semibold">Email</label>
        <input
          id="login-email-input"
          type="email"
          required
          autocomplete="email"
          :value="email"
          placeholder="nama@email.com"
          class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          @input="onEmail"
        />
      </div>
      <div>
        <label for="login-password-input" class="mb-1.5 block text-sm font-semibold">Kata Sandi</label>
        <input
          id="login-password-input"
          type="password"
          required
          autocomplete="current-password"
          :value="password"
          placeholder="••••••••"
          class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          @input="onPassword"
        />
      </div>
      <button
        id="login-submit-button"
        type="submit"
        :disabled="auth.isAuthLoading"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
      >
        <LoaderCircle v-if="auth.isAuthLoading" class="size-4 animate-spin" />
        {{ auth.isAuthLoading ? 'Memproses...' : 'Masuk' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-stone-600">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-emerald-700 hover:underline">Daftar sekarang</RouterLink>
    </p>
  </section>
</template>