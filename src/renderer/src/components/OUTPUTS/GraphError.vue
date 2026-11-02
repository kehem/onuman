<template>
  <aside class="graph overview">
    <div class="no-data-container" role="alert">
      <div class="no-data-content">
        <i class="m-error"></i>
        <h2>Unable to Load Chart</h2>
        <p>{{ message }}</p>
        <button type="button" class="btn btn-primary" @click="$emit('retry')">Try Again</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ message: string }>()
defineEmits<{ (e: 'retry'): void }>()
</script>
