// /src/composables/Exports/useExportHelpers.ts

import type { ExportStatus } from '../../pages/Reports/Types/ReportFormTypes';

// EXPORT HELPERS COMPOSABLE
export function useExportHelpers() {

    // STATUS ICON HELPER
    const getStatusIcon = (type: string): string => {
        return type === 'success' ? 'm-check-circle' : 'm-alert-circle';
    };

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

    // DISMISS STATUS FUNCTION
    const dismissStatus = (exportStatus: { value: ExportStatus }): void => {
        exportStatus.value = { message: '', type: '', path: null };
    };

    // FILE OPERATIONS
    const openFileLocation = async (filePath: string, exportStatus: { value: ExportStatus }): Promise<void> => {
        try {
            await window.electronAPI.showItemInFolder(filePath);
        } catch (error) {
            console.error('Error opening file location:', error);
            exportStatus.value = {
                message: 'Failed to open file location',
                type: 'error',
                path: null
            };
        }
    };

    const openFile = async (filePath: string, exportStatus: { value: ExportStatus }): Promise<void> => {
        try {
            await window.electronAPI.openFile(filePath);
        } catch (error) {
            console.error('Error opening file:', error);
            exportStatus.value = {
                message: 'Failed to open file',
                type: 'error',
                path: null
            };
        }
    };

    // EXTERNAL CSS LOADER HELPER
    const loadExternalReportCSS = (): void => {
        const linkId = 'external-report-style';
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = 'https://kehem.github.io/uzzal/report.css';
            document.head.appendChild(link);
        }
    };

    // VALIDATION HELPERS
    const validateProjectSelection = (projectId: number | null, exportStatus: { value: ExportStatus }): boolean => {
        if (!projectId) {
            exportStatus.value = {
                message: 'Please select a project',
                type: 'error',
                path: null
            };
            return false;
        }
        return true;
    };

    const validateHTMLContent = (htmlContent: string, exportStatus: { value: ExportStatus }, operation: string): boolean => {
        if (!htmlContent) {
            exportStatus.value = {
                message: `No report to ${operation}`,
                type: 'error',
                path: null
            };
            return false;
        }
        return true;
    };

    // ERROR HANDLER HELPER
    const handleExportError = (error: any, operation: string, exportStatus: { value: ExportStatus }): void => {
        console.error(`${operation} error:`, error);
        const errorMessage = error.response?.message || error.message || `Failed to ${operation.toLowerCase()}`;
        exportStatus.value = {
            message: errorMessage,
            type: 'error',
            path: null
        };
    };

    // AUTO DISMISS SUCCESS STATUS HELPER
    const autoDismissStatus = (exportStatus: { value: ExportStatus }, delay: number = 5000): void => {
        if (exportStatus.value.type === 'success') {
            setTimeout(() => {
                exportStatus.value = { message: '', type: '', path: null };
            }, delay);
        }
    };

    return {
        // ICON AND FORMATTING HELPERS
        getStatusIcon,
        getFileIcon,
        formatTime,

        // STATUS MANAGEMENT
        dismissStatus,
        autoDismissStatus,

        // FILE OPERATIONS
        openFileLocation,
        openFile,

        // UTILITY HELPERS
        loadExternalReportCSS,
        validateProjectSelection,
        validateHTMLContent,
        handleExportError
    };
}