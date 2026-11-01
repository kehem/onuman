// src/main/ipc/windows.ts
import { ipcMain, BrowserWindow } from 'electron'

// SETUP WINDOW CONTROL HANDLERS
export function setupWindowHandlers() {
  // CLOSE WINDOW HANDLER
  ipcMain.handle('window:close', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.close()
      console.log('🪟 Window closed')
    } else {
      console.log('⚠️ No focused window to close')
    }
  })

  // MINIMIZE WINDOW HANDLER
  ipcMain.handle('window:minimize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.minimize()
      console.log('🪟 Window minimized')
    } else {
      console.log('⚠️ No focused window to minimize')
    }
  })

  // MAXIMIZE/UNMAXIMIZE WINDOW HANDLER
  ipcMain.handle('window:maximize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
        console.log('🪟 Window unmaximized')
      } else {
        window.maximize()
        console.log('🪟 Window maximized')
      }
    } else {
      console.log('⚠️ No focused window to maximize/unmaximize')
    }
  })
}