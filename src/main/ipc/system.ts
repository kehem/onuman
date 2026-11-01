// src/main/ipc/system.ts
import { ipcMain, app, shell } from 'electron'
import os from 'os'
import fs from 'fs'
import path from 'path'

// GET SYSTEM INFORMATION
function getSystemInfo() {
    return {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus(),
        networkInterfaces: os.networkInterfaces()
    }
}

// SETUP SYSTEM HANDLERS
export function setupSystemHandlers() {
    // GET SYSTEM INFORMATION HANDLER
    ipcMain.handle('system-info', async () => {
        const systemInfo = getSystemInfo()
        console.log('🖥️ System info requested')
        return systemInfo
    })

    // GET DOWNLOADS PATH HANDLER
    ipcMain.handle('get-downloads-path', () => {
        const downloadsPath = app.getPath('downloads')
        console.log('📂 Downloads path requested:', downloadsPath)
        return downloadsPath
    })

    // OPEN DOWNLOADS FOLDER HANDLER
    ipcMain.handle('open-downloads-folder', async () => {
        try {
            const downloadsPath = app.getPath('downloads')
            await shell.openPath(downloadsPath)
            console.log('✅ Downloads folder opened')
            return true
        } catch (error) {
            console.error('❌ Error opening downloads folder:', error)
            return false
        }
    })

    // SAVE REPORT TO TEMPORARY FILE HANDLER
    ipcMain.handle('save-report-to-temp', async (_, htmlContent) => {
        try {
            const tempDir = os.tmpdir()
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
            const filename = `report-${timestamp}.html`
            const filePath = path.join(tempDir, filename)

            fs.writeFileSync(filePath, htmlContent, 'utf8')
            console.log('✅ Temporary report file created:', filePath)

            return filePath
        } catch (error) {
            console.error('❌ Error creating temporary report file:', error)
            return null
        }
    })

    // OPEN FILE IN BROWSER HANDLER
    ipcMain.handle('open-in-browser', async (_, filePath) => {
        try {
            if (!fs.existsSync(filePath)) {
                console.error('❌ File does not exist:', filePath)
                return false
            }

            // USE SHELL.OPENEXTERNAL TO OPEN IN DEFAULT BROWSER
            await shell.openExternal(`file://${filePath}`)
            console.log('✅ Opened in browser:', filePath)

            // OPTIONAL: CLEAN UP THE TEMP FILE AFTER SOME TIME (5 MINUTES)
            setTimeout(() => {
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath)
                        console.log('🗑️ Cleaned up temp file:', filePath)
                    }
                } catch (cleanupError) {
                    console.error('⚠️ Could not clean up temp file:', cleanupError)
                }
            }, 5 * 60 * 1000) // 5 MINUTES

            return true
        } catch (error) {
            console.error('❌ Error opening file in browser:', error)
            return false
        }
    })
}