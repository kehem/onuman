// src/preload/apis/file.ts
import { ipcRenderer } from 'electron'
import type { FileReadResult } from '../types'

// FILE OPERATION APIS
export const fileAPI = {
    // SELECT FILE(S) USING DIALOG
    selectFile: () =>
        ipcRenderer.invoke('select-file') as Promise<string[]>,

    // READ FILE CONTENT
    readFile: (filePath: string) =>
        ipcRenderer.invoke('read-file', filePath) as Promise<FileReadResult>,

    // SAVE FILE WITH DIALOG
    saveFile: (content: string, defaultPath?: string) =>
        ipcRenderer.invoke('save-file', content, defaultPath) as Promise<string | null>,

    // OPEN FILE WITH DEFAULT APPLICATION
    openFile: (filePath: string) =>
        ipcRenderer.invoke('open-file', filePath) as Promise<boolean>,

    // SHOW ITEM IN FOLDER/EXPLORER
    showItemInFolder: (filePath: string) =>
        ipcRenderer.invoke('show-item-in-folder', filePath) as Promise<boolean>,

    // GET DOWNLOADS DIRECTORY PATH
    getDownloadsPath: () =>
        ipcRenderer.invoke('get-downloads-path') as Promise<string>,

    // OPEN DOWNLOADS FOLDER
    openDownloadsFolder: () =>
        ipcRenderer.invoke('open-downloads-folder') as Promise<boolean>
}