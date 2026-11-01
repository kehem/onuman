// src/main/shortcuts.ts
import { globalShortcut, BrowserWindow } from 'electron'

// SETUP GLOBAL SHORTCUTS
export function setupGlobalShortcuts() {
    // CTRL+ALT+RIGHT - NAVIGATE FORWARD
    globalShortcut.register('Ctrl+Alt+Right', () => {
        const mainWindow = BrowserWindow.getFocusedWindow()

        if (mainWindow && mainWindow.webContents.navigationHistory.canGoForward()) {
            mainWindow.webContents.navigationHistory.goForward()
            console.log('🚀 Ctrl+Alt+Right: Navigated forward')
        } else {
            console.log('⚠️ Ctrl+Alt+Right: Cannot navigate forward')
        }
    })

    // CTRL+ALT+LEFT - NAVIGATE BACKWARD
    globalShortcut.register('Ctrl+Alt+Left', () => {
        const mainWindow = BrowserWindow.getFocusedWindow()

        if (mainWindow && mainWindow.webContents.navigationHistory.canGoBack()) {
            mainWindow.webContents.navigationHistory.goBack()
            console.log('🚀 Ctrl+Alt+Left: Navigated backward')
        } else {
            console.log('⚠️ Ctrl+Alt+Left: Cannot navigate backward')
        }
    })
}

// CLEANUP GLOBAL SHORTCUTS
export function cleanupShortcuts() {
    globalShortcut.unregisterAll()
    console.log('🧹 Global shortcuts unregistered')
}