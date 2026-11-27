// src/preload/apis/devtools.ts
import { ipcRenderer } from 'electron'

// DEVTOOLS APIS
export const devtoolsAPI = {
  // TRUE WHEN THIS BUILD ALLOWS DEVTOOLS (DEV BUILD OR ENABLE_DEVTOOLS=true)
  isDevToolsEnabled: (): Promise<boolean> => ipcRenderer.invoke('devtools:enabled'),

  // TRUE WHEN THE DEVTOOLS PANEL IS CURRENTLY OPEN
  isDevToolsOpen: (): Promise<boolean> => ipcRenderer.invoke('devtools:is-open'),

  // OPEN DEVTOOLS IN A SEPARATE WINDOW (SAFE WITH A FRAMELESS UI)
  openDevTools: (): Promise<boolean> => ipcRenderer.invoke('devtools:open'),

  // OPEN / CLOSE
  toggleDevTools: (): Promise<boolean> => ipcRenderer.invoke('devtools:toggle'),

  // CLOSE DEVTOOLS
  closeDevTools: (): Promise<boolean> => ipcRenderer.invoke('devtools:close'),

  // COPY THE CONSOLE BUFFER TO THE CLIPBOARD
  copyConsoleLogs: (): Promise<boolean> => ipcRenderer.invoke('devtools:copy-console'),

  // SAVE THE CONSOLE BUFFER TO A .log FILE AND REVEAL IT
  exportConsoleLogs: (): Promise<string | null> => ipcRenderer.invoke('devtools:export-console')
}
