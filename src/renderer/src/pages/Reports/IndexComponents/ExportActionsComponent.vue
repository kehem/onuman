<!-- /src/pages/Reports/InComponents/ExportActionsComponent.vue -->

<template>
  <div class="export-grid">
    <div class="export-card">
      <button
        :disabled="!hasExcelContent || isExporting"
        :class="['export-btn', 'export-excel', { exporting: isExportingExcel }]"
        @click="handleExcelExport"
      >
        <div class="btn-content">
          <i class="m-file-excel"></i>
          <span>{{ isExportingExcel ? 'Saving...' : 'Save Excel' }}</span>
        </div>
        <div v-if="isExportingExcel" class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </button>
      <p class="export-desc">Save the Django-generated workbook</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hasExcelContent: boolean
  isExporting: boolean
  isExportingExcel: boolean
}

interface Emits {
  exportExcel: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleExcelExport = (): void => {
  emit('exportExcel')
}
</script>
