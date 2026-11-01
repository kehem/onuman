// src/preload/apis/export.ts
import { ipcRenderer } from 'electron'
import type { ExportCompleteEvent } from '../types'

// EXPORT OPERATION APIS
export const exportAPI = {
    // PRINT TO PDF
    printToPDF: (htmlContent: string) =>
        ipcRenderer.invoke('print-to-pdf', htmlContent) as Promise<string | null>,

    // SAVE REPORT TO TEMPORARY FILE
    saveReportToTemp: (htmlContent: string) =>
        ipcRenderer.invoke('save-report-to-temp', htmlContent) as Promise<string | null>,

    // OPEN FILE IN BROWSER
    openInBrowser: (filePath: string) =>
        ipcRenderer.invoke('open-in-browser', filePath) as Promise<boolean>,

    // EXPORT TO WORD (HTML FORMAT)
    exportToWord: (htmlContent: string) =>
        ipcRenderer.invoke('export-to-word', htmlContent) as Promise<string | null>,

    // EXPORT TO EXCEL (CSV FORMAT)
    exportToExcel: (data: any) =>
        ipcRenderer.invoke('export-to-excel', data) as Promise<string | null>,

    // EXPORT TO CSV
    exportToCSV: (data: any) =>
        ipcRenderer.invoke('export-to-csv', data) as Promise<string | null>,

    // EXPORT TO JSON
    exportToJSON: (data: any) =>
        ipcRenderer.invoke('export-to-json', data) as Promise<string | null>,

    // LISTEN FOR EXPORT COMPLETION
    onExportComplete: (callback: (event: ExportCompleteEvent) => void) => {
        ipcRenderer.on('export-complete', (_, event) => callback(event))
    },

    // REMOVE EXPORT COMPLETION LISTENER
    removeExportCompleteListener: () => {
        ipcRenderer.removeAllListeners('export-complete')
    }
}