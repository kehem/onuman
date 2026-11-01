// src/preload/apis/window.ts
import { ipcRenderer } from 'electron'

// WINDOW CONTROL APIS
export const windowAPI = {
    // CLOSE WINDOW
    closeWindow: () => ipcRenderer.invoke('window:close'),

    // MINIMIZE WINDOW
    minimizeWindow: () => ipcRenderer.invoke('window:minimize'),

    // MAXIMIZE/UNMAXIMIZE WINDOW
    maximizeWindow: () => ipcRenderer.invoke('window:maximize')
}