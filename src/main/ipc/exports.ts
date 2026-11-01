// src/main/ipc/exports.ts
import { ipcMain, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import { generateFilename, ensureDownloadsDir, htmlToCSV } from '../utils/fileUtils'
import { createPdfWindow } from '../window'

// SETUP EXPORT HANDLERS
export function setupExportHandlers() {
    // PRINT TO PDF HANDLER
    ipcMain.handle('print-to-pdf', async (_, htmlContent) => {
        try {
            const downloadsPath = ensureDownloadsDir()
            const filename = generateFilename('report', 'pdf')
            const filePath = path.join(downloadsPath, filename)

            // CREATE A NEW WINDOW FOR PDF GENERATION
            const pdfWindow = createPdfWindow()

            await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

            // GENERATE PDF
            const pdfData = await pdfWindow.webContents.printToPDF({
                printBackground: true,
                margins: {
                    top: 0.5,
                    bottom: 0.5,
                    left: 0.5,
                    right: 0.5
                }
            })

            fs.writeFileSync(filePath, pdfData)
            pdfWindow.close()

            // EMIT EXPORT COMPLETE EVENT
            const mainWindow = BrowserWindow.getFocusedWindow()
            mainWindow?.webContents.send('export-complete', {
                type: 'pdf',
                path: filePath,
                filename: filename
            })

            console.log('✅ PDF exported successfully:', filePath)
            return filePath
        } catch (error) {
            console.error('❌ PDF export error:', error)
            return null
        }
    })

    // EXPORT TO EXCEL (CSV) HANDLER
    ipcMain.handle('export-to-excel', async (_, data) => {
        try {
            const downloadsPath = ensureDownloadsDir()
            const filename = generateFilename('report', 'csv')
            const filePath = path.join(downloadsPath, filename)

            let csvContent = ''

            if (Array.isArray(data) && data.length > 0) {
                // IF DATA IS AN ARRAY OF OBJECTS, CONVERT TO CSV
                const headers = Object.keys(data[0])
                csvContent = headers.join(',') + '\n'
                csvContent += data.map(row =>
                    headers.map(header => {
                        const value = row[header] || ''
                        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
                            ? `"${value.replace(/"/g, '""')}"`
                            : value
                    }).join(',')
                ).join('\n')
            } else if (typeof data === 'string') {
                // IF DATA IS HTML STRING, TRY TO EXTRACT TABLE DATA
                csvContent = htmlToCSV(data)
            } else {
                // FALLBACK FOR OTHER DATA TYPES
                csvContent = JSON.stringify(data, null, 2)
            }

            fs.writeFileSync(filePath, csvContent, 'utf8')

            // EMIT EXPORT COMPLETE EVENT
            const mainWindow = BrowserWindow.getFocusedWindow()
            mainWindow?.webContents.send('export-complete', {
                type: 'excel',
                path: filePath,
                filename: filename
            })

            console.log('✅ Excel (CSV) exported successfully:', filePath)
            return filePath
        } catch (error) {
            console.error('❌ Excel export error:', error)
            return null
        }
    })

    // EXPORT TO WORD (HTML) HANDLER
    ipcMain.handle('export-to-word', async (_, htmlContent) => {
        try {
            const downloadsPath = ensureDownloadsDir()
            const filename = generateFilename('report', 'html')
            const filePath = path.join(downloadsPath, filename)

            // CREATE A SIMPLE HTML DOCUMENT THAT CAN BE OPENED IN WORD
            const wordHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`

            fs.writeFileSync(filePath, wordHtml, 'utf8')

            // EMIT EXPORT COMPLETE EVENT
            const mainWindow = BrowserWindow.getFocusedWindow()
            mainWindow?.webContents.send('export-complete', {
                type: 'word',
                path: filePath,
                filename: filename
            })

            console.log('✅ Word (HTML) exported successfully:', filePath)
            return filePath
        } catch (error) {
            console.error('❌ Word export error:', error)
            return null
        }
    })

    // EXPORT TO CSV HANDLER
    ipcMain.handle('export-to-csv', async (_, data) => {
        try {
            const downloadsPath = ensureDownloadsDir()
            const filename = generateFilename('report', 'csv')
            const filePath = path.join(downloadsPath, filename)

            let csvContent = ''

            if (Array.isArray(data) && data.length > 0) {
                const headers = Object.keys(data[0])
                csvContent = headers.join(',') + '\n'
                csvContent += data.map(row =>
                    headers.map(header => {
                        const value = row[header] || ''
                        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
                            ? `"${value.replace(/"/g, '""')}"`
                            : value
                    }).join(',')
                ).join('\n')
            } else {
                csvContent = 'No data available'
            }

            fs.writeFileSync(filePath, csvContent, 'utf8')

            // EMIT EXPORT COMPLETE EVENT
            const mainWindow = BrowserWindow.getFocusedWindow()
            mainWindow?.webContents.send('export-complete', {
                type: 'csv',
                path: filePath,
                filename: filename
            })

            console.log('✅ CSV exported successfully:', filePath)
            return filePath
        } catch (error) {
            console.error('❌ CSV export error:', error)
            return null
        }
    })

    // EXPORT TO JSON HANDLER
    ipcMain.handle('export-to-json', async (_, data) => {
        try {
            const downloadsPath = ensureDownloadsDir()
            const filename = generateFilename('report', 'json')
            const filePath = path.join(downloadsPath, filename)

            const jsonContent = JSON.stringify(data, null, 2)
            fs.writeFileSync(filePath, jsonContent, 'utf8')

            // EMIT EXPORT COMPLETE EVENT
            const mainWindow = BrowserWindow.getFocusedWindow()
            mainWindow?.webContents.send('export-complete', {
                type: 'json',
                path: filePath,
                filename: filename
            })

            console.log('✅ JSON exported successfully:', filePath)
            return filePath
        } catch (error) {
            console.error('❌ JSON export error:', error)
            return null
        }
    })
}