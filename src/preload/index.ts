// src/preload/index.ts
import { contextBridge } from 'electron'
import { windowAPI } from './apis/window'
import { dialogAPI } from './apis/dialog'
import { navigationAPI } from './apis/navigation'
import { updateAPI } from './apis/update'
import { exportAPI } from './apis/export'
import { fileAPI } from './apis/file'
import { systemAPI } from './apis/system'
import { storeAPI } from './apis/store'
import { lifecycleAPI } from './apis/lifecycle'
import type { ElectronAPI } from './types'

// COMBINE ALL APIS INTO ONE ELECTRON API OBJECT
const electronAPI: ElectronAPI = {
  // WINDOW CONTROLS
  ...windowAPI,

  // DIALOG OPERATIONS
  ...dialogAPI,

  // NAVIGATION CONTROLS
  ...navigationAPI,

  // UPDATE MANAGEMENT
  ...updateAPI,

  // EXPORT OPERATIONS
  ...exportAPI,

  // FILE OPERATIONS
  ...fileAPI,

  // SYSTEM INFORMATION
  ...systemAPI,

  // STORE OPERATIONS
  ...storeAPI,

  // APP LIFECYCLE
  ...lifecycleAPI
}

// EXPOSE THE ELECTRON API TO THE RENDERER PROCESS
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

console.log('✅ Preload script loaded successfully')