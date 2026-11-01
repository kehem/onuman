<template>
  <slot v-if="loading" name="loading" />
  <img
    v-show="!loading"
    class="project-img"
    :src="imageSrc"
    :alt="alt"
    :style="isDefault ? placeholderStyle : undefined"
    @load="loading = false"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import onumanLogo from '../../assets/images/Onuman-logo-full-white.svg'

const props = defineProps<{ src?: string | null; alt: string }>()
const loading = ref(true)
const failed = ref(false)
const imageSrc = computed(() => !failed.value && props.src?.trim() ? props.src : onumanLogo)
const isDefault = computed(() => imageSrc.value === onumanLogo)
const placeholderStyle = {
  objectFit: 'contain' as const,
  backgroundColor: '#182330',
  padding: 'clamp(1.5rem, 8%, 4rem)',
  boxSizing: 'border-box' as const
}

// A new image should be tried even if the previous one failed.
watch(() => props.src, () => { failed.value = false })
watch(imageSrc, () => { loading.value = true })

function handleError() {
  if (isDefault.value) {
    // Avoid an error loop if even the bundled image cannot load.
    loading.value = false
  } else {
    failed.value = true
  }
}
</script>
