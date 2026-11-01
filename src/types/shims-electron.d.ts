// types/shims-electron.d.ts
// Import types for Electron
import { Buffer } from 'buffer';

// Define the SystemInfo interface
interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  release: string;
  totalMemory: number;
  freeMemory: number;
  cpus: any[];
  networkInterfaces: any;
}

// Define the ExportCompleteEvent interface
interface ExportCompleteEvent {
  type: 'pdf' | 'word' | 'excel' | 'csv' | 'json';
  path: string;
  filename: string;
}

// MODIFIED: Define the UpdateStatus interface (simplified for external link approach)
interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'error';
  version?: string;
  error?: string;
}

// Declare the electronAPI interface for the Window object
declare global {
  interface Window {
    electronAPI: {
      // Window controls
      closeWindow: () => Promise<void>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;

      // Dialog APIs
      showConfirmDialog: (message: string, title?: string) => Promise<boolean>;

      // Navigation APIs
      navigateForward: () => Promise<boolean>;
      navigateBackward: () => Promise<boolean>;
      canNavigateForward: () => Promise<boolean>;
      canNavigateBackward: () => Promise<boolean>;

      // MODIFIED: Auto-updater APIs (simplified for external link approach)
      checkForUpdates: () => Promise<any>;
      openUpdateWebsite: () => Promise<boolean>; // NEW: Open external update website
      getAppVersion: () => Promise<string>;
      onUpdateStatus: (callback: (status: UpdateStatus) => void) => void;
      removeUpdateStatusListener: () => void;

      // File operations and exports
      saveReportToTemp: (htmlContent: string) => Promise<string | null>;
      openInBrowser: (filePath: string) => Promise<boolean>;
      printToPDF: (htmlContent: string) => Promise<string | null>;
      exportToWord: (htmlContent: string) => Promise<string | null>;
      exportToExcel: (data: any) => Promise<string | null>;
      exportToCSV: (data: any) => Promise<string | null>;
      exportToJSON: (data: any) => Promise<string | null>;

      // File operations
      selectFile: () => Promise<string[]>;
      readFile: (filePath: string) => Promise<{ data: Buffer; filename: string }>;
      saveFile: (content: string, defaultPath?: string) => Promise<string | null>;
      openFile: (filePath: string) => Promise<boolean>;
      showItemInFolder: (filePath: string) => Promise<boolean>;

      // Additional file system operations
      getDownloadsPath: () => Promise<string>;
      openDownloadsFolder: () => Promise<boolean>;

      // System info
      getSystemInfo: () => Promise<SystemInfo>;
      getServerAddress: () => Promise<string>;

      // Event listeners for export completion
      onExportComplete: (callback: (event: ExportCompleteEvent) => void) => void;
      removeExportCompleteListener: () => void;

      // Secure storage (keytar)
      storeLicenseKey: (licenseKey: string) => Promise<void>;
      getLicenseKey: () => Promise<string>;
      storeMotherboardID: (motherboardID: string) => Promise<void>;
      getMotherboardID: () => Promise<string>;

      // General JSON store (lowdb)
      store: {
        set: (key: string, value: any) => Promise<void>;
        get: (key: string) => Promise<any>;
      };

      // TAB MANAGEMENT
      onAppWillClose: (callback: () => void) => void;
      onAppReady: (callback: () => void) => void;
      removeAppLifecycleListeners: () => void;
    };
  }
}

// Export the interfaces to make them available elsewhere if needed
export { SystemInfo, ExportCompleteEvent, UpdateStatus };
export interface ElectronAppLifecycle {
  onAppWillClose: (callback: () => void) => void;
  onAppReady: (callback: () => void) => void;
  removeAppLifecycleListeners: () => void;
}