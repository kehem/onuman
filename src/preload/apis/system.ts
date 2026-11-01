// src/preload/apis/system.ts
import { ipcRenderer } from 'electron'
import type { SystemInfo } from '../types'

// SYSTEM INFORMATION APIS
export const systemAPI = {
    // GET SYSTEM INFORMATION
    getSystemInfo: () =>
        ipcRenderer.invoke('system-info') as Promise<SystemInfo>,

    // GET SERVER ADDRESS
    getServerAddress: () =>
        ipcRenderer.invoke('get-server-address') as Promise<string>
}