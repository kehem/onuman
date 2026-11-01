// src/main/updater.ts
import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'

// CONFIGURE AUTO-UPDATER FOR CHECK ONLY (NO DOWNLOAD/INSTALL)
export function configureAutoUpdater() {
    // SET THE UPDATE SERVER URL
    autoUpdater.setFeedURL({
        provider: 'generic',
        url: 'https://onuman.kehem.com/auto-updates',
        channel: 'latest'
    })

    // CONFIGURE AUTO-UPDATER SETTINGS - DISABLE ALL AUTOMATIC BEHAVIORS
    autoUpdater.autoDownload = false  // DON'T AUTO-DOWNLOAD
    autoUpdater.autoInstallOnAppQuit = false  // DON'T AUTO-INSTALL

    // SETUP EVENT HANDLERS
    setupUpdateEventHandlers()

    console.log('✅ Auto-updater configured for version checking only')
}

// SETUP AUTO-UPDATER EVENT HANDLERS
function setupUpdateEventHandlers() {
    autoUpdater.on('checking-for-update', () => {
        console.log('🔍 Checking for update...')
        const mainWindow = BrowserWindow.getFocusedWindow()
        mainWindow?.webContents.send('update-status', { status: 'checking' })
    })

    autoUpdater.on('update-available', (info) => {
        console.log('✅ Update available:', info.version)
        const mainWindow = BrowserWindow.getFocusedWindow()
        mainWindow?.webContents.send('update-status', {
            status: 'available',
            version: info.version,
            releaseNotes: info.releaseNotes,
            releaseDate: info.releaseDate
        })
    })

    autoUpdater.on('update-not-available', (info) => {
        console.log('❌ Update not available:', info.version)
        const mainWindow = BrowserWindow.getFocusedWindow()
        mainWindow?.webContents.send('update-status', {
            status: 'not-available',
            version: info.version
        })
    })

    autoUpdater.on('error', (err) => {
        console.error('❌ Auto-updater error:', err)
        const mainWindow = BrowserWindow.getFocusedWindow()
        mainWindow?.webContents.send('update-status', {
            status: 'error',
            error: err.message || 'Unknown update error'
        })
    })
}

// MANUAL UPDATE CHECK
export async function checkForUpdates() {
    try {
        console.log('🔍 Manual update check initiated by user')
        const result = await autoUpdater.checkForUpdates()
        return result
    } catch (error) {
        console.error('Check for updates error:', error)
        throw error
    }
}