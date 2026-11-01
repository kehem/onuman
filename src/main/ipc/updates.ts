// src/main/ipc/updates.ts
import { ipcMain, app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { checkForUpdates } from '../updater'

// SETUP UPDATE HANDLERS
export function setupUpdateHandlers() {
    // CHECK FOR UPDATES HANDLER
    ipcMain.handle('check-for-updates', async () => {
        if (!is.dev) {
            try {
                return await checkForUpdates()
            } catch (error) {
                console.error('❌ Check for updates error:', error)
                throw error
            }
        } else {
            console.log('⚠️ Skipping update check in development mode')
            return null
        }
    })

    // GET APP VERSION HANDLER
    ipcMain.handle('get-app-version', () => {
        const version = app.getVersion()
        console.log('📱 App version requested:', version)
        return version
    })
}