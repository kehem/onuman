<!-- /src/pages/Reports/InComponents/ExportStatusBanner.vue -->

<template>
    <div v-if="exportStatus.message" :class="['export-status-banner', exportStatus.type]" @click="dismissStatus">
        <div class="status-content">
            <i :class="getStatusIcon(exportStatus.type)"></i>
            <span>{{ exportStatus.message }}</span>
            <div v-if="exportStatus.path" class="status-actions">
                <button @click.stop="openFileLocation(exportStatus.path)" class="action-btn">
                    <i class="m-folder-open"></i> Show in Folder
                </button>
                <button @click.stop="openFile(exportStatus.path)" class="action-btn">
                    <i class="m-file-text"></i> Open File
                </button>
            </div>
        </div>
        <button @click.stop="dismissStatus" class="dismiss-btn">×</button>
    </div>
</template>

<script setup lang="ts">
import type { ExportStatus } from '../Types/ReportFormTypes';

// COMPONENT PROPS
interface Props {
    exportStatus: ExportStatus;
}

// COMPONENT EMITS
interface Emits {
    dismiss: [];
    openFileLocation: [path: string];
    openFile: [path: string];
}

// DEFINE PROPS AND EMITS
defineProps<Props>();
const emit = defineEmits<Emits>();

// STATUS ICON HELPER
const getStatusIcon = (type: string): string => {
    return type === 'success' ? 'm-check-circle' : 'm-alert-circle';
};

// EVENT HANDLERS
const dismissStatus = (): void => {
    emit('dismiss');
};

const openFileLocation = (path: string): void => {
    emit('openFileLocation', path);
};

const openFile = (path: string): void => {
    emit('openFile', path);
};
</script>