// src/preload/apis/lifecycle.ts
import { ipcRenderer } from 'electron'

// APP LIFECYCLE APIS
export const lifecycleAPI = {
    // LISTEN FOR APP WILL CLOSE EVENT
    onAppWillClose: (callback: () => void) => {
        ipcRenderer.on('app-lifecycle:will-close', callback)
        // REGISTER WITH MAIN PROCESS
        ipcRenderer.invoke('app-lifecycle:register-will-close')
    },

    // LISTEN FOR APP READY EVENT
    onAppReady: (callback: () => void) => {
        ipcRenderer.on('app-lifecycle:ready', callback)
        // REGISTER WITH MAIN PROCESS  
        ipcRenderer.invoke('app-lifecycle:register-ready')
    },

    // REMOVE ALL APP LIFECYCLE LISTENERS
    removeAppLifecycleListeners: () => {
        ipcRenderer.removeAllListeners('app-lifecycle:will-close')
        ipcRenderer.removeAllListeners('app-lifecycle:ready')
        ipcRenderer.invoke('app-lifecycle:unregister')
    }
}