// src/main/ipc/files.ts
import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import { generateFilename } from '../utils/fileUtils'

// SETUP FILE OPERATION HANDLERS
export function setupFileHandlers() {
    // SELECT FILE HANDLER
    ipcMain.handle('select-file', async () => {
        try {
            console.log('📁 IPC: select-file requested')
            const mainWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]

            if (!mainWindow) {
                console.error('❌ No window available for file dialog')
                return []
            }

            const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile', 'multiSelections'],
                filters: [
                    { name: 'All Files', extensions: ['*'] },
                    { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt'] },
                    { name: 'Spreadsheets', extensions: ['xls', 'xlsx', 'csv'] },
                    { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] },
                    { name: 'Videos', extensions: ['mp4', 'avi', 'mkv', 'mov'] },
                    { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'm4a'] }
                ]
            })

            console.log('📁 Selected files:', result.filePaths)
            return result.filePaths
        } catch (error) {
            console.error('❌ File selection error:', error)
            return []
        }
    })

    // READ FILE HANDLER
    ipcMain.handle('read-file', async (_, filePath) => {
        try {
            const data = fs.readFileSync(filePath)
            const filename = path.basename(filePath)
            console.log('📖 File read successfully:', filename)
            return { data, filename }
        } catch (error) {
            console.error('❌ File read error:', error)
            throw error
        }
    })

    // SAVE FILE HANDLER
    ipcMain.handle('save-file', async (_, content, defaultPath) => {
        try {
            const mainWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]

            if (!mainWindow) {
                console.error('❌ No window available for save dialog')
                return null
            }

            const result = await dialog.showSaveDialog(mainWindow, {
                defaultPath: defaultPath || generateFilename('document', 'txt'),
                filters: [
                    { name: 'Text Files', extensions: ['txt'] },
                    { name: 'HTML Files', extensions: ['html'] },
                    { name: 'JSON Files', extensions: ['json'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            })

            if (!result.canceled && result.filePath) {
                fs.writeFileSync(result.filePath, content, 'utf8')
                console.log('✅ File saved successfully:', result.filePath)
                return result.filePath
            }

            console.log('⚠️ File save canceled')
            return null
        } catch (error) {
            console.error('❌ File save error:', error)
            return null
        }
    })

    // OPEN FILE HANDLER
    ipcMain.handle('open-file', async (_, filePath) => {
        try {
            await shell.openPath(filePath)
            console.log('✅ File opened successfully:', filePath)
            return true
        } catch (error) {
            console.error('❌ File open error:', error)
            return false
        }
    })

    // SHOW ITEM IN FOLDER HANDLER
    ipcMain.handle('show-item-in-folder', async (_, filePath) => {
        try {
            if (!filePath) {
                throw new Error('No file path provided')
            }

            if (!fs.existsSync(filePath)) {
                throw new Error(`File does not exist: ${filePath}`)
            }

            shell.showItemInFolder(filePath)
            console.log('✅ Showed item in folder:', filePath)
            return true
        } catch (error) {
            console.error('❌ Show item in folder error:', error)
            return false
        }
    })
}