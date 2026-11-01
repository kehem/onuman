// src/main/utils/fileUtils.ts
import { app } from 'electron'
import fs from 'fs'

// GENERATE FILENAME WITH TIMESTAMP
export function generateFilename(prefix: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    return `${prefix}-${timestamp}.${extension}`
}

// ENSURE DOWNLOADS DIRECTORY EXISTS
export function ensureDownloadsDir(): string {
    const downloadsPath = app.getPath('downloads')
    if (!fs.existsSync(downloadsPath)) {
        fs.mkdirSync(downloadsPath, { recursive: true })
        console.log('📁 Created downloads directory:', downloadsPath)
    }
    return downloadsPath
}

// CONVERT HTML TABLES TO CSV FORMAT
export function htmlToCSV(html: string): string {
    try {
        // SIMPLE HTML TO CSV CONVERSION
        // REMOVE HTML TAGS AND EXTRACT TABLE DATA
        const rows = html.match(/<tr[^>]*>(.*?)<\/tr>/gi) || []
        const csvRows: string[] = []

        for (const row of rows) {
            const cells = row.match(/<t[hd][^>]*>(.*?)<\/t[hd]>/gi) || []
            const csvCells = cells.map(cell => {
                // REMOVE HTML TAGS AND CLEAN UP CONTENT
                const content = cell.replace(/<[^>]*>/g, '').trim()
                // ESCAPE QUOTES AND WRAP IN QUOTES IF CONTAINS COMMA
                return content.includes(',') || content.includes('"')
                    ? `"${content.replace(/"/g, '""')}"`
                    : content
            })

            if (csvCells.length > 0) {
                csvRows.push(csvCells.join(','))
            }
        }

        const result = csvRows.length > 0 ? csvRows.join('\n') : 'No table data found'
        console.log('✅ HTML to CSV conversion completed')
        return result
    } catch (error) {
        console.error('❌ HTML to CSV conversion error:', error)
        return 'Error converting HTML to CSV'
    }
}