// src/preload/types/index.ts

// SYSTEM INFO INTERFACE
export interface SystemInfo {
    hostname: string
    platform: string
    arch: string
    release: string
    totalMemory: number
    freeMemory: number
    cpus: any[]
    networkInterfaces: any
}

// EXPORT COMPLETION EVENT INTERFACE
export interface ExportCompleteEvent {
    type: 'pdf' | 'word' | 'excel' | 'csv' | 'json'
    path: string
    filename: string
}

// UPDATE STATUS INTERFACE
export interface UpdateStatus {
    status: 'checking' | 'available' | 'not-available' | 'error'
    version?: string
    error?: string
}

// FILE READ RESULT INTERFACE
export interface FileReadResult {
    data: Buffer
    filename: string
}

// STORE INTERFACE
export interface StoreAPI {
    set: (key: string, value: any) => Promise<void>
    get: (key: string) => Promise<any>
}

// MAIN ELECTRON API INTERFACE
export interface ElectronAPI {
    // WINDOW CONTROLS
    closeWindow: () => Promise<void>
    minimizeWindow: () => Promise<void>
    maximizeWindow: () => Promise<void>

    // DIALOG OPERATIONS
    showConfirmDialog: (message: string, title?: string) => Promise<boolean>
    openUpdateWebsite: () => Promise<boolean>

    // NAVIGATION CONTROLS
    navigateForward: () => Promise<boolean>
    navigateBackward: () => Promise<boolean>
    canNavigateForward: () => Promise<boolean>
    canNavigateBackward: () => Promise<boolean>

    // UPDATE MANAGEMENT
    checkForUpdates: () => Promise<any>
    getAppVersion: () => Promise<string>
    onUpdateStatus: (callback: (status: UpdateStatus) => void) => void
    removeUpdateStatusListener: () => void

    // EXPORT OPERATIONS
    printToPDF: (htmlContent: string) => Promise<string | null>
    exportToWord: (htmlContent: string) => Promise<string | null>
    exportToExcel: (data: any) => Promise<string | null>
    exportToCSV: (data: any) => Promise<string | null>
    exportToJSON: (data: any) => Promise<string | null>
    saveReportToTemp: (htmlContent: string) => Promise<string | null>
    openInBrowser: (filePath: string) => Promise<boolean>
    onExportComplete: (callback: (event: ExportCompleteEvent) => void) => void
    removeExportCompleteListener: () => void

    // FILE OPERATIONS
    selectFile: () => Promise<string[]>
    readFile: (filePath: string) => Promise<FileReadResult>
    saveFile: (content: string, defaultPath?: string) => Promise<string | null>
    openFile: (filePath: string) => Promise<boolean>
    showItemInFolder: (filePath: string) => Promise<boolean>
    getDownloadsPath: () => Promise<string>
    openDownloadsFolder: () => Promise<boolean>

    // SYSTEM INFORMATION
    getSystemInfo: () => Promise<SystemInfo>
    getServerAddress: () => Promise<string>

    // SECURE STORAGE (KEYTAR)
    storeLicenseKey: (licenseKey: string) => Promise<void>
    getLicenseKey: () => Promise<string>
    storeMotherboardID: (motherboardID: string) => Promise<void>
    getMotherboardID: () => Promise<string>

    // GENERAL JSON STORE
    store: StoreAPI

    // APP LIFECYCLE
    onAppWillClose: (callback: () => void) => void
    onAppReady: (callback: () => void) => void
    removeAppLifecycleListeners: () => void
}

// TYPESCRIPT GLOBAL DECLARATIONS
declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}