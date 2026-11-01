// src/main/ipc/dialogs.ts
import { ipcMain, dialog, BrowserWindow, shell } from 'electron'

// SETUP DIALOG HANDLERS
export function setupDialogHandlers() {
    // CONFIRM DIALOG HANDLER
    ipcMain.handle('show-confirm-dialog', async (event, message: string, title?: string) => {
        // GET THE WINDOW THAT SENT THE EVENT
        const senderWindow = BrowserWindow.fromWebContents(event.sender)
        const targetWindow = senderWindow ||
            BrowserWindow.getFocusedWindow() ||
            BrowserWindow.getAllWindows()[0]

        if (!targetWindow) {
            console.error('No window available for dialog')
            return false
        }

        const result = await dialog.showMessageBox(targetWindow, {
            type: 'question',
            buttons: ['Cancel', 'Confirm'],
            defaultId: 1,
            cancelId: 0,
            title: title || 'Onuman Confirmation',
            message: message,
            noLink: true
        })

        return result.response === 1
    })

    // OPEN UPDATE WEBSITE HANDLER
    ipcMain.handle('open-update-website', async () => {
        try {
            await shell.openExternal('https://onuman.kehem.com/')
            console.log('✅ Opened update website')
            return true
        } catch (error) {
            console.error('❌ Failed to open update website:', error)
            return false
        }
    })
}