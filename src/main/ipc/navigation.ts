// src/main/ipc/navigation.ts
import { ipcMain, BrowserWindow } from 'electron'

// SETUP NAVIGATION HANDLERS
export function setupNavigationHandlers() {
    // NAVIGATE FORWARD HANDLER
    ipcMain.handle('navigate-forward', () => {
        try {
            const mainWindow = BrowserWindow.getFocusedWindow()

            if (mainWindow && mainWindow.webContents.navigationHistory.canGoForward()) {
                mainWindow.webContents.navigationHistory.goForward()
                console.log('🚀 Navigated forward')
                return true
            }

            console.log('⚠️ Cannot navigate forward')
            return false
        } catch (error) {
            console.error('❌ Navigation forward error:', error)
            return false
        }
    })

    // NAVIGATE BACKWARD HANDLER
    ipcMain.handle('navigate-backward', () => {
        try {
            const mainWindow = BrowserWindow.getFocusedWindow()

            if (mainWindow && mainWindow.webContents.navigationHistory.canGoBack()) {
                mainWindow.webContents.navigationHistory.goBack()
                console.log('🚀 Navigated backward')
                return true
            }

            console.log('⚠️ Cannot navigate backward')
            return false
        } catch (error) {
            console.error('❌ Navigation backward error:', error)
            return false
        }
    })

    // CHECK IF CAN NAVIGATE FORWARD
    ipcMain.handle('can-navigate-forward', () => {
        try {
            const mainWindow = BrowserWindow.getFocusedWindow()
            const canNavigate = mainWindow ? mainWindow.webContents.navigationHistory.canGoForward() : false
            console.log('🔍 Can navigate forward:', canNavigate)
            return canNavigate
        } catch (error) {
            console.error('❌ Error checking forward navigation:', error)
            return false
        }
    })

    // CHECK IF CAN NAVIGATE BACKWARD
    ipcMain.handle('can-navigate-backward', () => {
        try {
            const mainWindow = BrowserWindow.getFocusedWindow()
            const canNavigate = mainWindow ? mainWindow.webContents.navigationHistory.canGoBack() : false
            console.log('🔍 Can navigate backward:', canNavigate)
            return canNavigate
        } catch (error) {
            console.error('❌ Error checking backward navigation:', error)
            return false
        }
    })
}