import { ref, type Ref } from 'vue'
import type { ExportHistoryItem, ExportStatus } from '../../pages/Reports/Types/ReportFormTypes'

interface ExportOperations {
  isExporting: Ref<boolean>
  isExportingExcel: Ref<boolean>
  exportStatus: Ref<ExportStatus>
  exportHistory: Ref<ExportHistoryItem[]>
  exportToExcel: (bytes: Uint8Array | null, filename: string) => Promise<void>
}

export function useExportOperations(): ExportOperations {
  const isExportingExcel = ref(false)
  const exportStatus = ref<ExportStatus>({ message: '', type: '', path: null })
  const exportHistory = ref<ExportHistoryItem[]>([])

  const exportToExcel = async (bytes: Uint8Array | null, filename: string): Promise<void> => {
    if (!bytes?.byteLength) {
      exportStatus.value = {
        message: 'Generate the report before saving the Excel workbook',
        type: 'error',
        path: null
      }
      return
    }

    try {
      isExportingExcel.value = true
      const excelPath = await window.electronAPI.saveReportXlsx(bytes, filename)
      if (!excelPath) {
        exportStatus.value = {
          message: 'Failed to save the Excel workbook',
          type: 'error',
          path: null
        }
        return
      }

      const savedFilename = excelPath.split(/[\\/]/).pop() || filename
      exportStatus.value = {
        message: `Excel workbook saved to ${excelPath}`,
        type: 'success',
        path: excelPath
      }
      exportHistory.value.unshift({
        type: 'excel',
        filename: savedFilename,
        path: excelPath,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Excel export error:', error)
      exportStatus.value = {
        message: 'An error occurred while saving the Excel workbook',
        type: 'error',
        path: null
      }
    } finally {
      isExportingExcel.value = false
      setTimeout(() => {
        exportStatus.value = { message: '', type: '', path: null }
      }, 5000)
    }
  }

  return {
    isExporting: isExportingExcel,
    isExportingExcel,
    exportStatus,
    exportHistory,
    exportToExcel
  }
}
