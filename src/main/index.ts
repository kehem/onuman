// src/main/index.ts
import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initUserStoreHandlers } from './ipc/Keytar'
import { createWindow } from './window'
import { setupIpcHandlers } from './ipc'
import { configureAutoUpdater } from './updater'
import { startAppServer } from './server'
import { setupGlobalShortcuts, cleanupShortcuts } from './shortcuts'

let mainWindow: BrowserWindow | null = null
let server: any = null

async function initializeApp(): Promise<{ mainWindow: BrowserWindow; server: any } | null> {
  try {
    console.log('🚀 Starting Electron app...')

    // INITIALIZE USER STORE HANDLERS
    await initUserStoreHandlers()
    console.log('✅ User store handlers initialized')

    // CONFIGURE AUTO-UPDATER
    configureAutoUpdater()
    console.log('✅ Auto-updater configured')

    // START THE EXPRESS SERVER
    console.log('🌐 Starting Express server...')
    server = await startAppServer()
    console.log('✅ Express server started')

    // SET UP ELECTRON APP
    electronApp.setAppUserModelId('com.electron.fileshare')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // SETUP IPC HANDLERS
    setupIpcHandlers()
    console.log('✅ All IPC handlers registered')

    // SETUP GLOBAL SHORTCUTS
    setupGlobalShortcuts()
    console.log('✅ Global shortcuts registered')

    // CREATE MAIN WINDOW
    mainWindow = createWindow()

    // CHECK AUTO UPDATE ON LAUNCH
    if (!is.dev) {
      setTimeout(async () => {
        try {
          console.log('🔍 Auto-checking for updates on app launch...')
          const { autoUpdater } = await import('electron-updater')
          await autoUpdater.checkForUpdates()
        } catch (error) {
          console.error('Auto-update check failed:', error)
        }
      }, 3000)
    }

    return { mainWindow, server }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    const { dialog } = await import('electron')
    dialog.showErrorBox(
      'Initialization Error',
      `Failed to start the application: ${errorMessage}\n\nPlease check the console for more details.`
    )
    app.quit()
    return null
  }
}

// APP EVENT HANDLERS
app.whenReady().then(async () => {
  const result = await initializeApp()
  if (result) {
    mainWindow = result.mainWindow
    server = result.server
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// CLEANUP ON QUIT
app.on('will-quit', () => {
  cleanupShortcuts()
})

app.on('before-quit', () => {
  // CLEAN UP SERVER IF IT EXISTS
  if (server) {
    console.log('🛑 Shutting down server...')
    server.close()
  }
})

// EXPORT FOR OTHER MODULES
export { mainWindow, server }