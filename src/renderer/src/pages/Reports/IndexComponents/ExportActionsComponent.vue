<!-- /src/pages/Reports/InComponents/ExportActionsComponent.vue -->

<template>
    <div class="export-grid">
        <!-- PDF EXPORT -->
        <div class="export-card">
            <button @click="handlePDFExport" :disabled="!hasContent || isExporting"
                :class="['export-btn', 'export-pdf', { 'exporting': isExportingPDF }]">
                <div class="btn-content">
                    <i class="m-document-file-pdf1"></i>
                    <span>{{ isExportingPDF ? 'Generating...' : 'Export PDF' }}</span>
                </div>
                <div v-if="isExportingPDF" class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </button>
            <p class="export-desc">High-quality PDF document</p>
        </div>

        <!-- EXCEL EXPORT -->
        <div class="export-card">
            <button @click="handleExcelExport" :disabled="!hasContent || isExporting"
                :class="['export-btn', 'export-excel', { 'exporting': isExportingExcel }]">
                <div class="btn-content">
                    <i class="m-file-excel"></i>
                    <span>{{ isExportingExcel ? 'Processing...' : 'Export Excel' }}</span>
                </div>
                <div v-if="isExportingExcel" class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </button>
            <p class="export-desc">Spreadsheet format (CSV)</p>
        </div>

        <!-- WORD EXPORT -->
        <div class="export-card">
            <button @click="handleWordExport" :disabled="!hasContent || isExporting"
                :class="['export-btn', 'export-word', { 'exporting': isExportingWord }]">
                <div class="btn-content">
                    <i class="m-file-word"></i>
                    <span>{{ isExportingWord ? 'Creating...' : 'Export Word' }}</span>
                </div>
                <div v-if="isExportingWord" class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </button>
            <p class="export-desc">Editable document format</p>
        </div>

        <!-- PREVIEW (EXTERNAL BROWSER) -->
        <div class="export-card">
            <button @click="handlePreview" :disabled="!hasContent" class="export-btn export-print">
                <div class="btn-content">
                    <i class="m-eye"></i>
                    <span>Preview</span>
                </div>
            </button>
            <p class="export-desc">Open in browser to print</p>
        </div>
    </div>
</template>

<script setup lang="ts">
// COMPONENT PROPS
interface Props {
    hasContent: boolean;
    isExporting: boolean;
    isExportingPDF: boolean;
    isExportingExcel: boolean;
    isExportingWord: boolean;
}

// COMPONENT EMITS
interface Emits {
    exportPDF: [];
    exportExcel: [];
    exportWord: [];
    preview: [];
}

// DEFINE PROPS AND EMITS
defineProps<Props>();
const emit = defineEmits<Emits>();

// EVENT HANDLERS
const handlePDFExport = (): void => {
    emit('exportPDF');
};

const handleExcelExport = (): void => {
    emit('exportExcel');
};

const handleWordExport = (): void => {
    emit('exportWord');
};

const handlePreview = (): void => {
    emit('preview');
};
</script>