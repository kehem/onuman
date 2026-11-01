// src/composables/useElectronStore.ts
import { ipcRenderer } from 'electron'

export function useElectronStore() {
  const set = async (key: string, value: any) => {
    await ipcRenderer.invoke('store:set', key, value)
  }

  const get = async <T = any>(key: string): Promise<T | undefined> => {
    return await ipcRenderer.invoke('store:get', key)
  }

  const setLicenseKey = async (key: string) => {
    await ipcRenderer.invoke('store-license-key', key)
  }

  const getLicenseKey = async (): Promise<string> => {
    return await ipcRenderer.invoke('get-license-key')
  }

  const getMotherboardID = async (): Promise<string> => {
    return await ipcRenderer.invoke('get-motherboard-id')
  }

  return {
    set,
    get,
    setLicenseKey,
    getLicenseKey,
    getMotherboardID
  }
}
