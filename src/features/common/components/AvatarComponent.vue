<script setup lang="ts">
import { computed, ref } from 'vue'
import { resolvePhotoUrl } from '~/helpers/toolsHelper'

const props = defineProps<{ name: string; photo: string | null; sizeClass: string }>()

const failed = ref(false)
const url = computed(() => resolvePhotoUrl(props.photo))
const initial = computed(() => props.name.charAt(0).toUpperCase())
</script>

<template>
  <img
    v-if="url && !failed"
    :src="url"
    :alt="`Foto ${name}`"
    :class="[sizeClass, 'shrink-0 rounded-full object-cover ring-2 ring-white']"
    @error="failed = true"
  />
  <span
    v-else
    data-testid="avatar-initial"
    :class="[sizeClass, 'grid shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800']"
  >{{ initial }}</span>
</template>
