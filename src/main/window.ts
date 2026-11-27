// src/main/window.ts
import { BrowserWindow, Menu, shell, session } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { attachDevToolsBindings, isDevToolsEnabled } from './devtools'

const icon = join(__dirname, '../../resources/icon.ico')



// CONFIGURE SESSION SECURITY
function configureSession() {
  // SPOOF THE ORIGIN TO MATCH WHAT THE SERVER EXPECTS
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({
      requestHeaders: {
        ...details.requestHeaders,
        'Origin': 'https://onuman.kehem.com',
        'Referer': 'https://onuman.kehem.com/'
      }
    })
  })

  // CONFIGURE CONTENT SECURITY POLICY
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          `default-src 'self' 'unsafe-inline' 'unsafe-eval';
        img-src 'self' data: blob: https:;
        frame-src 'self' https:;
        connect-src 'self' ws: wss: https: 
          wss://*.asia-southeast1.firebasedatabase.app 
          https://*.asia-southeast1.firebasedatabase.app 
          wss://*.firebaseio.com 
          https://*.firebaseio.com 
          https://*.googleapis.com;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' 
          https://www.googletagmanager.com 
          https://*.asia-southeast1.firebasedatabase.app 
          https://*.firebaseio.com 
          https://*.googleapis.com;
        style-src 'self' 'unsafe-inline' 
          https://kehem.github.io 
          https://cdn.jsdelivr.net 
          https://fonts.googleapis.com;
        font-src 'self' 
          https://cdn.jsdelivr.net 
          https://surajit-singha-sisir.github.io 
          https://fonts.gstatic.com 
          data:;`
        ]
      }
    })
  })
}

// CREATE MAIN BROWSER WINDOW
export function createWindow(): BrowserWindow {
  // CONFIGURE SESSION FIRST
  configureSession()

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      allowRunningInsecureContent: false,
      devTools: isDevToolsEnabled()
    }

  })

  // WINDOW EVENT HANDLERS
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // DEVTOOLS SHORTCUTS (F12, CTRL+SHIFT+I, CTRL+SHIFT+J) + CONSOLE BUFFER
  attachDevToolsBindings(mainWindow)

  // PREVENT THE DEFAULT CONTEXT MENU, BUT OFFER "INSPECT ELEMENT" WHEN DEVTOOLS
  // ARE ALLOWED - RIGHT-CLICK IS THE FASTEST WAY TO THE ELEMENTS PANEL
  mainWindow.webContents.on('context-menu', (e, params) => {
    e.preventDefault()
    if (!isDevToolsEnabled()) return

    Menu.buildFromTemplate([
      {
        label: 'Inspect Element',
        click: () => mainWindow.webContents.inspectElement(params.x, params.y)
      }
    ]).popup({ window: mainWindow })
  })

  // HANDLE EXTERNAL LINKS
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // LOAD CONTENT
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// CREATE PDF WINDOW FOR EXPORT
export function createPdfWindow(): BrowserWindow {
  return new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
}