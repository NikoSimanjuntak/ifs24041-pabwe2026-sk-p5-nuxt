<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { onMounted, watch } from 'vue'
import AvatarComponent from '~/features/common/components/AvatarComponent.vue'
import { showSuccessDialog } from '~/helpers/toolsHelper'
import { useInput } from '~/hooks/useInput'
import { useUsersStore } from '../states/usersStore'

const store = useUsersStore()
const [name, onName] = useInput('')
const [email, onEmail] = useInput('')
const [password, onPassword, resetPassword] = useInput('')
const [newPassword, onNewPassword, resetNewPassword] = useInput('')
const [confirmation, onConfirmation, resetConfirmation] = useInput('')

watch(
  () => store.profile,
  (profile) => {
    if (profile) {
      name.value = profile.name
      email.value = profile.email
    }
  },
  { immediate: true },
)

onMounted(() => store.fetchProfile())

const saveProfile = async (): Promise<void> => {
  if (await store.updateProfile({ name: name.value, email: email.value })) {
    await showSuccessDialog('Profil berhasil diperbarui.')
  }
}

const onPhotoChange = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  const file = input.files![0]
  if (!file) {
    return
  }
  if (await store.changePhoto(file)) {
    await showSuccessDialog('Foto profil berhasil diperbarui.')
  }
  input.value = ''
}

const savePassword = async (): Promise<void> => {
  const changed = await store.changePassword({
    password: password.value,
    new_password: newPassword.value,
    new_password_confirmation: confirmation.value,
  })
  if (changed) {
    resetPassword()
    resetNewPassword()
    resetConfirmation()
    await showSuccessDialog('Kata sandi berhasil diubah.')
  }
}
</script>

<template>
  <section class="space-y-6">
    <header>
      <p class="text-sm font-semibold text-emerald-700">Akun</p>
      <h1 class="text-2xl font-extrabold tracking-tight">Profil Saya</h1>
    </header>

    <div class="grid gap-6 lg:grid-cols-2">
      <article class="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 lg:col-span-2">
        <div v-if="store.profile" class="flex items-center gap-5">
          <AvatarComponent :name="store.profile.name" :photo="store.profile.photo" size-class="size-20 text-2xl" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-lg font-bold">{{ store.profile.name }}</p>
            <p class="truncate text-stone-600">{{ store.profile.email }}</p>
            <label for="profile-photo" class="mt-3 inline-flex cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50">
              {{ store.isPhotoUploading ? 'Mengunggah...' : 'Ganti Foto' }}
            </label>
            <input id="profile-photo" type="file" accept="image/*" class="sr-only" :disabled="store.isPhotoUploading" @change="onPhotoChange" />
          </div>
        </div>
        <p v-else class="text-stone-500">Memuat profil...</p>
      </article>

      <form class="space-y-5 rounded-2xl border border-stone-200 bg-white p-6" @submit.prevent="saveProfile">
        <h2 class="text-lg font-bold">Informasi Dasar</h2>
        <div>
          <label for="profile-name" class="mb-1.5 block text-sm font-semibold">Nama</label>
          <input id="profile-name" type="text" required :value="name" class="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onName" />
        </div>
        <div>
          <label for="profile-email" class="mb-1.5 block text-sm font-semibold">Email</label>
          <input id="profile-email" type="email" required :value="email" class="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onEmail" />
        </div>
        <button type="submit" :disabled="store.isProfileUpdating" class="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          <LoaderCircle v-if="store.isProfileUpdating" class="size-4 animate-spin" />
          Simpan Profil
        </button>
      </form>

      <form class="space-y-5 rounded-2xl border border-stone-200 bg-white p-6" @submit.prevent="savePassword">
        <h2 class="text-lg font-bold">Ubah Kata Sandi</h2>
        <div>
          <label for="current-password" class="mb-1.5 block text-sm font-semibold">Kata Sandi Saat Ini</label>
          <input id="current-password" type="password" required autocomplete="current-password" :value="password" class="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onPassword" />
        </div>
        <div>
          <label for="new-password" class="mb-1.5 block text-sm font-semibold">Kata Sandi Baru</label>
          <input id="new-password" type="password" required autocomplete="new-password" :value="newPassword" class="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onNewPassword" />
        </div>
        <div>
          <label for="confirm-password" class="mb-1.5 block text-sm font-semibold">Konfirmasi Kata Sandi Baru</label>
          <input id="confirm-password" type="password" required autocomplete="new-password" :value="confirmation" class="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" @input="onConfirmation" />
        </div>
        <button type="submit" :disabled="store.isPasswordChanging" class="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white hover:bg-stone-800 disabled:opacity-60">
          <LoaderCircle v-if="store.isPasswordChanging" class="size-4 animate-spin" />
          Ubah Kata Sandi
        </button>
      </form>
    </div>
  </section>
</template>
