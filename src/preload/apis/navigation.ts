// src/preload/apis/navigation.ts
import { ipcRenderer } from 'electron'

// NAVIGATION CONTROL APIS
export const navigationAPI = {
    // NAVIGATE FORWARD
    navigateForward: () =>
        ipcRenderer.invoke('navigate-forward') as Promise<boolean>,

    // NAVIGATE BACKWARD
    navigateBackward: () =>
        ipcRenderer.invoke('navigate-backward') as Promise<boolean>,

    // CHECK IF CAN NAVIGATE FORWARD
    canNavigateForward: () =>
        ipcRenderer.invoke('can-navigate-forward') as Promise<boolean>,

    // CHECK IF CAN NAVIGATE BACKWARD
    canNavigateBackward: () =>
        ipcRenderer.invoke('can-navigate-backward') as Promise<boolean>
}