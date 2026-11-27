// src/main/ipc/devtools.ts
import { ipcMain, BrowserWindow, shell } from 'electron'
import {
  closeDevTools,
  copyConsoleLogsToClipboard,
  exportConsoleLogs,
  isDevToolsEnabled,
  isDevToolsOpen,
  openDevTools,
  toggleDevTools
} from '../devtools'

// SETUP DEVTOOLS HANDLERS
// THE RENDERER USES THESE FOR ITS OWN "OPEN DEVTOOLS" BUTTON / SHORTCUT HANDLER,
// AND `devtools:export-console` STILL WORKS WHEN DEVTOOLS ARE DISABLED, SO
// SUPPORT CAN COLLECT LOGS FROM A CUSTOMER MACHINE.
export function setupDevToolsHandlers(): void {
  const windowFor = (event: Electron.IpcMainInvokeEvent): BrowserWindow | null =>
    BrowserWindow.fromWebContents(event.sender)

  ipcMain.handle('devtools:enabled', () => isDevToolsEnabled())

  ipcMain.handle('devtools:is-open', (event) => isDevToolsOpen(windowFor(event)))

  ipcMain.handle('devtools:open', (event) => openDevTools(windowFor(event)))

  ipcMain.handle('devtools:toggle', (event) => toggleDevTools(windowFor(event)))

  ipcMain.handle('devtools:close', (event) => closeDevTools(windowFor(event)))

  ipcMain.handle('devtools:copy-console', (event) => copyConsoleLogsToClipboard(windowFor(event)))

  ipcMain.handle('devtools:export-console', async (event) => {
    const filePath = exportConsoleLogs(windowFor(event))
    if (filePath) shell.showItemInFolder(filePath)
    return filePath
  })
}
