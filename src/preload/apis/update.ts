// src/preload/apis/update.ts
import { ipcRenderer } from 'electron'
import type { UpdateStatus } from '../types'

// UPDATE MANAGEMENT APIS
export const updateAPI = {
    // CHECK FOR UPDATES
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

    // GET APP VERSION
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // LISTEN FOR UPDATE STATUS CHANGES
    onUpdateStatus: (callback: (status: UpdateStatus) => void) => {
        ipcRenderer.on('update-status', (_, status) => callback(status))
    },

    // REMOVE UPDATE STATUS LISTENER
    removeUpdateStatusListener: () => {
        ipcRenderer.removeAllListeners('update-status')
    }
}