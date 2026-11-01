<!-- /src/pages/Reports/InComponents/ExportHistoryComponent.vue -->

<template>
    <div v-if="exportHistory.length > 0" class="export-history">
        <h4>Recent Exports</h4>
        <div class="history-list">
            <div v-for="(item, index) in exportHistory.slice(0, maxItems)" :key="index" class="history-item">
                <div class="history-info">
                    <i :class="getFileIcon(item.type)"></i>
                    <div class="history-details">
                        <span class="filename">{{ item.filename }}</span>
                        <span class="timestamp">{{ formatTime(item.timestamp) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ExportHistoryItem } from '../Types/ReportFormTypes';

// COMPONENT PROPS
interface Props {
    exportHistory: ExportHistoryItem[];
    maxItems?: number;
}

// DEFINE PROPS WITH DEFAULTS
withDefaults(defineProps<Props>(), {
    maxItems: 3
});

// FILE ICON HELPER
const getFileIcon = (type: string): string => {
    switch (type) {
        case 'pdf': return 'm-document-file-pdf1';
        case 'excel': return 'm-file-excel';
        case 'word': return 'm-file-word';
        default: return 'm-file';
    }
};

// TIME FORMATTING HELPER
const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>