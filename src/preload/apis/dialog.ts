// src/preload/apis/dialog.ts
import { ipcRenderer } from 'electron'

// DIALOG OPERATION APIS
export const dialogAPI = {
    // SHOW CONFIRMATION DIALOG
    showConfirmDialog: (message: string, title?: string) =>
        ipcRenderer.invoke('show-confirm-dialog', message, title) as Promise<boolean>,

    // OPEN UPDATE WEBSITE IN EXTERNAL BROWSER
    openUpdateWebsite: () =>
        ipcRenderer.invoke('open-update-website') as Promise<boolean>
}