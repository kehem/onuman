// /src/composables/Exports/useExportOperations.ts

import { ref } from 'vue';
import type { ExportStatus, ExportHistoryItem, ReportDocument } from '../../pages/Reports/Types/ReportFormTypes';
import { useApi } from '../useApi';

// EXPORT OPERATIONS COMPOSABLE
export function useExportOperations() {
    // REACTIVE STATE
    const isExporting = ref(false);
    const isExportingPDF = ref(false);
    const isExportingExcel = ref(false);
    const isExportingWord = ref(false);
    const exportStatus = ref<ExportStatus>({ message: '', type: '', path: null });
    const exportHistory = ref<ExportHistoryItem[]>([]);

    // HELPER FUNCTION TO PARSE THE FILENAME FROM Content-Disposition
    const filenameFromDisposition = (disposition: string | undefined, fallback: string): string => {
        const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition || '');
        if (!match?.[1]) return fallback;
        try {
            return decodeURIComponent(match[1]);
        } catch {
            return match[1];
        }
    };

    // PDF EXPORT FUNCTION
    const exportToPDF = async (htmlContent: string): Promise<void> => {
        if (!htmlContent) {
            exportStatus.value = {
                message: 'No report to save as PDF',
                type: 'error',
                path: null
            };
            return;
        }

        try {
            isExporting.value = true;
            isExportingPDF.value = true;

            const pdfPath = await window.electronAPI.printToPDF(htmlContent);

            if (pdfPath) {
                exportStatus.value = {
                    message: `PDF saved to ${pdfPath}`,
                    type: 'success',
                    path: pdfPath
                };
                exportHistory.value.unshift({
                    type: 'pdf',
                    filename: pdfPath.split('/').pop() || 'report.pdf',
                    path: pdfPath,
                    timestamp: Date.now(),
                });
            } else {
                exportStatus.value = {
                    message: 'Failed to save PDF',
                    type: 'error',
                    path: null
                };
            }
        } catch (error) {
            console.error('PDF error:', error);
            exportStatus.value = {
                message: 'An error occurred while saving PDF',
                type: 'error',
                path: null
            };
        } finally {
            isExporting.value = false;
            isExportingPDF.value = false;
            setTimeout(() => {
                exportStatus.value = { message: '', type: '', path: null };
            }, 5000);
        }
    };

    // EXCEL EXPORT FUNCTION - DOWNLOADS THE REAL .XLSX FROM THE BACKEND
    // (POST /api/report/final_report/excel turns the report document into
    // the workbook - the same document the workbook view renders on screen)
    const exportToExcel = async (document: ReportDocument | null): Promise<void> => {
        if (!document || !Array.isArray(document.rows) || document.rows.length === 0) {
            exportStatus.value = {
                message: 'Generate the report first - the Excel workbook is built from the report document',
                type: 'error',
                path: null
            };
            return;
        }

        try {
            isExporting.value = true;
            isExportingExcel.value = true;

            const { apiClient, initialize } = useApi();
            await initialize();

            const response = await apiClient.post('/api/report/final_report/excel', document, {
                responseType: 'arraybuffer'
            });

            const filename = filenameFromDisposition(
                response.headers?.['content-disposition'] as string | undefined,
                'final_report.xlsx'
            );
            const bytes = new Uint8Array(response.data as ArrayBuffer);
            const excelPath = await window.electronAPI.saveReportXlsx(bytes, filename);

            if (excelPath) {
                exportStatus.value = {
                    message: `Excel workbook saved to ${excelPath}`,
                    type: 'success',
                    path: excelPath
                };
                exportHistory.value.unshift({
                    type: 'excel',
                    filename: excelPath.split('/').pop() || filename,
                    path: excelPath,
                    timestamp: Date.now(),
                });
            } else {
                exportStatus.value = {
                    message: 'Failed to save the Excel workbook',
                    type: 'error',
                    path: null
                };
            }
        } catch (error: any) {
            console.error('Excel export error:', error);
            const status = error?.response?.status;
            exportStatus.value = {
                message:
                    status === 404
                        ? 'This server is missing the Excel export endpoint - deploy the latest onuman-private backend.'
                        : status >= 500
                          ? 'The server failed to build the Excel file - make sure openpyxl is installed (pip install openpyxl) and the backend is up to date.'
                          : 'An error occurred while exporting to Excel',
                type: 'error',
                path: null
            };
        } finally {
            isExporting.value = false;
            isExportingExcel.value = false;
            setTimeout(() => {
                exportStatus.value = { message: '', type: '', path: null };
            }, 5000);
        }
    };

    // WORD EXPORT FUNCTION
    const exportToWord = async (htmlContent: string): Promise<void> => {
        if (!htmlContent) {
            exportStatus.value = {
                message: 'No report to export to Word',
                type: 'error',
                path: null
            };
            return;
        }

        try {
            isExporting.value = true;
            isExportingWord.value = true;

            const wordPath = await window.electronAPI.exportToWord(htmlContent);

            if (wordPath) {
                exportStatus.value = {
                    message: `Word document saved to ${wordPath}`,
                    type: 'success',
                    path: wordPath
                };
                exportHistory.value.unshift({
                    type: 'word',
                    filename: wordPath.split('/').pop() || 'report.docx',
                    path: wordPath,
                    timestamp: Date.now(),
                });
            } else {
                exportStatus.value = {
                    message: 'Failed to export to Word',
                    type: 'error',
                    path: null
                };
            }
        } catch (error) {
            console.error('Word export error:', error);
            exportStatus.value = {
                message: 'An error occurred while exporting to Word',
                type: 'error',
                path: null
            };
        } finally {
            isExporting.value = false;
            isExportingWord.value = false;
            setTimeout(() => {
                exportStatus.value = { message: '', type: '', path: null };
            }, 5000);
        }
    };

    // PRINT PREVIEW FUNCTION
    const exportToPreview = async (htmlContent: string): Promise<void> => {
        if (!htmlContent) {
            exportStatus.value = {
                message: 'No report to preview',
                type: 'error',
                path: null
            };
            return;
        }

        try {
            // CREATE A COMPLETE HTML DOCUMENT WITH MINIMAL ADDITIONAL STYLES
            const printableHtml = `
      <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Project Report</title>
            <link rel="stylesheet" href="https://kehem.github.io/uzzal/report.css">
            <style>
              /* PRINT CONTROLS - ONLY STYLES NEEDED BEYOND EXTERNAL CSS */
              .print-controls {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                border: 1px solid #ddd;
              }
              
              .print-btn, .close-btn {
                border: none;
                padding: 12px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                margin-right: 10px;
                transition: all 0.2s ease;
              }
              
              .print-btn {
                background: #007cba;
                color: white;
              }
              
              .print-btn:hover {
                background: #005a87;
              }
              
              .close-btn {
                background: #dc3545;
                color: white;
                margin-right: 0;
              }
              
              .close-btn:hover {
                background: #c82333;
              }
              
              /* HIDE CONTROLS WHEN PRINTING */
              @media print {
                .print-controls {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body>
            <!-- PRINT CONTROLS -->
            <div class="print-controls">
              <button class="print-btn" onclick="window.print()">
                🖨️ Print Report
              </button>
              <button class="close-btn" onclick="window.close()">
                ✕ Close
              </button>
            </div>

            <!-- REPORT CONTENT -->
            ${htmlContent}
          </body>
        </html>`;

            // SAVE THE HTML TO A TEMPORARY FILE AND OPEN IN EXTERNAL BROWSER
            const tempFilePath = await window.electronAPI.saveReportToTemp(printableHtml);

            if (tempFilePath) {
                const opened = await window.electronAPI.openInBrowser(tempFilePath);

                if (opened) {
                    exportStatus.value = {
                        message: 'Report opened in external browser. You can print from there.',
                        type: 'success',
                        path: null
                    };
                } else {
                    exportStatus.value = {
                        message: 'Failed to open report in browser',
                        type: 'error',
                        path: null
                    };
                }
            } else {
                exportStatus.value = {
                    message: 'Failed to create temporary report file',
                    type: 'error',
                    path: null
                };
            }

            // AUTO-DISMISS SUCCESS MESSAGE AFTER 3 SECONDS
            if (exportStatus.value.type === 'success') {
                setTimeout(() => {
                    exportStatus.value = { message: '', type: '', path: null };
                }, 3000);
            }

        } catch (error) {
            console.error('Print preview error:', error);
            exportStatus.value = {
                message: 'Failed to open print preview',
                type: 'error',
                path: null
            };
        }
    };

    return {
        // REACTIVE STATE
        isExporting,
        isExportingPDF,
        isExportingExcel,
        isExportingWord,
        exportStatus,
        exportHistory,

        // EXPORT FUNCTIONS
        exportToPDF,
        exportToExcel,
        exportToWord,
        exportToPreview
    };
}