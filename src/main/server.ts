// src/main/server.ts
import { startServer, getServerAddress } from '../../server/server'

let serverInstance: any = null
let serverAddress: string | null = null

// START THE EXPRESS SERVER
export async function startAppServer() {
    try {
        serverInstance = await startServer()
        serverAddress = await getServerAddress()

        if (!serverAddress) {
            throw new Error('Failed to get server address')
        }

        console.log('📍 Server address:', serverAddress)
        return serverInstance
    } catch (error) {
        console.error('❌ Failed to start server:', error)
        throw error
    }
}

// GET SERVER ADDRESS
export function getServerAddr(): string | null {
    return serverAddress
}

// STOP SERVER
export function stopServer() {
    if (serverInstance) {
        console.log('🛑 Shutting down server...')
        serverInstance.close()
        serverInstance = null
        serverAddress = null
    }
}

// CHECK IF SERVER IS RUNNING
export function isServerRunning(): boolean {
    return serverInstance !== null
}