// /src/composables/Exports/useExportOperations.ts

import { ref } from 'vue';
import type { ExportStatus, ExportHistoryItem } from '../../pages/Reports/Types/ReportFormTypes';

// EXPORT OPERATIONS COMPOSABLE
export function useExportOperations() {
    // REACTIVE STATE
    const isExporting = ref(false);
    const isExportingPDF = ref(false);
    const isExportingExcel = ref(false);
    const isExportingWord = ref(false);
    const exportStatus = ref<ExportStatus>({ message: '', type: '', path: null });
    const exportHistory = ref<ExportHistoryItem[]>([]);

    // HELPER FUNCTION TO EXTRACT DATA FROM HTML FOR EXCEL EXPORT
    const extractDataFromHTML = (htmlContent: string): any[] => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const tables = doc.querySelectorAll('table');
            const extractedData: any[] = [];

            tables.forEach((table) => {
                const rows = table.querySelectorAll('tr');
                const tableData: any[] = [];

                rows.forEach((row) => {
                    const cells = row.querySelectorAll('td, th');
                    const rowData: any = {};

                    cells.forEach((cell, cellIndex) => {
                        const cellText = cell.textContent?.trim() || '';
                        rowData[`Column_${cellIndex + 1}`] = cellText;
                    });

                    if (Object.keys(rowData).length > 0) {
                        tableData.push(rowData);
                    }
                });

                if (tableData.length > 0) {
                    extractedData.push(...tableData);
                }
            });

            // IF NO TABLE DATA, EXTRACT TEXT CONTENT
            if (extractedData.length === 0) {
                const textContent = doc.body?.textContent?.trim() || '';
                const lines = textContent.split('\n').filter(line => line.trim());

                lines.forEach((line, index) => {
                    extractedData.push({ 'Line': index + 1, 'Content': line.trim() });
                });
            }

            return extractedData.length > 0 ? extractedData : [{
                'Error': 'No data could be extracted from the report'
            }];

        } catch (error) {
            console.error('Error extracting data from HTML:', error);
            return [{
                'Error': 'Failed to extract data from report',
                'Details': error instanceof Error ? error.message : 'Unknown error'
            }];
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

    // EXCEL EXPORT FUNCTION
    const exportToExcel = async (htmlContent: string): Promise<void> => {
        if (!htmlContent) {
            exportStatus.value = {
                message: 'No report to export to Excel',
                type: 'error',
                path: null
            };
            return;
        }

        try {
            isExporting.value = true;
            isExportingExcel.value = true;

            const exportData = extractDataFromHTML(htmlContent);
            const excelPath = await window.electronAPI.exportToExcel(exportData);

            if (excelPath) {
                exportStatus.value = {
                    message: `Excel file saved to ${excelPath}`,
                    type: 'success',
                    path: excelPath
                };
                exportHistory.value.unshift({
                    type: 'excel',
                    filename: excelPath.split('/').pop() || 'report.csv',
                    path: excelPath,
                    timestamp: Date.now(),
                });
            } else {
                exportStatus.value = {
                    message: 'Failed to export to Excel',
                    type: 'error',
                    path: null
                };
            }
        } catch (error) {
            console.error('Excel export error:', error);
            exportStatus.value = {
                message: 'An error occurred while exporting to Excel',
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