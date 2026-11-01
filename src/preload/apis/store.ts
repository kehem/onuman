// src/preload/apis/store.ts
import { ipcRenderer } from 'electron'
import type { StoreAPI } from '../types'

// STORE OPERATION APIS
export const storeAPI = {
    // SECURE STORAGE (KEYTAR) - LICENSE AND MOTHERBOARD ID
    storeLicenseKey: (licenseKey: string) =>
        ipcRenderer.invoke('store-license-key', licenseKey),

    getLicenseKey: () =>
        ipcRenderer.invoke('get-license-key') as Promise<string>,

    storeMotherboardID: (motherboardID: string) =>
        ipcRenderer.invoke('store-motherboard-id', motherboardID),

    getMotherboardID: () =>
        ipcRenderer.invoke('get-motherboard-id') as Promise<string>,

    // GENERAL JSON STORE (LOWDB)
    store: {
        set: (key: string, value: any) =>
            ipcRenderer.invoke('store:set', key, value),

        get: (key: string) =>
            ipcRenderer.invoke('store:get', key)
    } as StoreAPI
}