// src/main/ipc/index.ts
import { setupDialogHandlers } from './dialogs'
import { setupUpdateHandlers } from './updates'
import { setupWindowHandlers } from './windows'
import { setupSystemHandlers } from './system'
import { setupFileHandlers } from './files'
import { setupExportHandlers } from './exports'
import { setupNavigationHandlers } from './navigation'
import { setupServerHandlers } from './server'

// SETUP ALL IPC HANDLERS
export function setupIpcHandlers() {
    // DIALOG HANDLERS
    setupDialogHandlers()

    // UPDATE HANDLERS
    setupUpdateHandlers()

    // WINDOW CONTROL HANDLERS
    setupWindowHandlers()

    // SYSTEM HANDLERS
    setupSystemHandlers()

    // FILE OPERATION HANDLERS
    setupFileHandlers()

    // EXPORT HANDLERS
    setupExportHandlers()

    // NAVIGATION HANDLERS
    setupNavigationHandlers()

    // SERVER HANDLERS
    setupServerHandlers()
}