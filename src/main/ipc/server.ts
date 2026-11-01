// src/main/ipc/server.ts
import { ipcMain } from 'electron'
import { getServerAddr } from '../server'

// SETUP SERVER HANDLERS
export function setupServerHandlers() {
    // GET SERVER ADDRESS HANDLER
    ipcMain.handle('get-server-address', async () => {
        const serverAddress = getServerAddr()
        console.log('📡 IPC: get-server-address requested ->', serverAddress)
        return serverAddress
    })
}