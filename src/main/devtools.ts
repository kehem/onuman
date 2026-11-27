// src/main/devtools.ts
// EVERYTHING DEVTOOLS LIVES HERE: PERMISSION, KEYBOARD SHORTCUTS, IPC ACTIONS AND HELPERS
import { app, BrowserWindow, clipboard, dialog } from 'electron'
import { writeFileSync } from 'fs'
import { join } from 'path'
import {
  isDevToolsAllowed,
  isDevToolsShortcut,
  resolveDevToolsMode,
  type DevToolsMode
} from './utils/devtools'

export type { DevToolsMode }

const CONSOLE_LOG_LIMIT = 500

interface CapturedLog {
  level: string
  message: string
  time: string
}

// ONE BUFFER PER WINDOW SO EACH WINDOW CAN COPY ITS OWN CONSOLE
const consoleLogs = new Map<number, CapturedLog[]>()

// DEVTOOLS ARE ALWAYS AVAILABLE IN DEVELOPMENT, AND CAN BE FORCED ON IN A
// PACKAGED BUILD WITH ENABLE_DEVTOOLS=true (npm run build:win-dev / build:mac ...)
export function isDevToolsEnabled(): boolean {
  return isDevToolsAllowed(process.env, app.isPackaged)
}

function getTargetWindow(candidate?: BrowserWindow | null): BrowserWindow | null {
  if (candidate && !candidate.isDestroyed()) return candidate
  const focused = BrowserWindow.getFocusedWindow()
  if (focused) return focused
  const windows = BrowserWindow.getAllWindows().filter((w) => !w.isDestroyed())
  return windows.length ? windows[windows.length - 1] : null
}

function devToolsMode(): DevToolsMode {
  return resolveDevToolsMode(process.env.DEVTOOLS_MODE)
}

// KEYBOARD SHORTCUTS ARE REGISTERED HERE, NOT IN AN APP MENU.
// THE WINDOW IS CREATED WITH autoHideMenuBar + frame:false, SO THE DEFAULT
// "Toggle Developer Tools" MENU ITEM NEVER REACHES THE USER, AND DOCKED
// DEVTOOLS SWALLOW F12 ONCE OPEN. before-input-event FIRES IN THE MAIN PROCESS
// BEFORE THE PAGE (OR DEVTOOLS) SEES THE KEY, SO IT ALWAYS WORKS.
export function attachDevToolsBindings(window: BrowserWindow): void {
  const contents = window.webContents

  contents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return

    // F12, Ctrl/Cmd+Shift+I, Ctrl/Cmd+Shift+J
    if (!isDevToolsShortcut(input)) return

    // ALWAYS SWALLOW THE KEY SO DEVTOOLS CANNOT INTERCEPT ITS OWN TOGGLE
    event.preventDefault()

    if (!isDevToolsEnabled()) {
      showDevToolsDisabledHint()
      return
    }

    toggleDevTools(window)
  })

  // COLLECT THE SAME MESSAGES THE CONSOLE TAB WOULD SHOW, SO THEY CAN BE
  // COPIED / EXPORTED WITHOUT OPENING DEVTOOLS AT ALL
  const logs: CapturedLog[] = []
  consoleLogs.set(contents.id, logs)

  contents.on('console-message', (...args: unknown[]) => {
    // ELECTRON >= 35 PASSES AN EVENT OBJECT, OLDER VERSIONS PASS POSITIONAL ARGS
    const first = args[0] as { level?: unknown; message?: unknown } | undefined
    const isEventObject = !!first && typeof first === 'object' && 'level' in first
    const level = isEventObject ? first?.level : args[1]
    const message = isEventObject ? first?.message : args[2]
    const levelNames = ['verbose', 'info', 'warning', 'error']
    logs.push({
      level: typeof level === 'number' ? (levelNames[level] ?? 'info') : String(level ?? 'info'),
      message: String(message ?? ''),
      time: new Date().toISOString()
    })
    if (logs.length > CONSOLE_LOG_LIMIT) logs.shift()
  })

  contents.on('devtools-opened', () => console.log('🛠️ DevTools opened'))
  contents.on('devtools-closed', () => console.log('🛠️ DevTools closed'))

  // DROP THE BUFFER WHEN THE WINDOW GOES AWAY
  window.on('closed', () => consoleLogs.delete(contents.id))
}

// OPEN / TOGGLE / CLOSE / QUERY DEVTOOLS (USED BY IPC HANDLERS AND THE APP MENU)
export function openDevTools(candidate?: BrowserWindow | null): boolean {
  const window = getTargetWindow(candidate)
  if (!window || !isDevToolsEnabled()) return false
  window.webContents.openDevTools({ mode: devToolsMode() })
  return true
}

export function toggleDevTools(candidate?: BrowserWindow | null): boolean {
  const window = getTargetWindow(candidate)
  if (!window || !isDevToolsEnabled()) return false
  if (window.webContents.isDevToolsOpened()) {
    window.webContents.closeDevTools()
    return false
  }
  window.webContents.openDevTools({ mode: devToolsMode() })
  return true
}

export function closeDevTools(candidate?: BrowserWindow | null): boolean {
  const window = getTargetWindow(candidate)
  if (!window) return false
  window.webContents.closeDevTools()
  return true
}

export function isDevToolsOpen(candidate?: BrowserWindow | null): boolean {
  return !!getTargetWindow(candidate)?.webContents.isDevToolsOpened()
}

// SHOWN WHEN SOMEONE PRESSES F12 IN A PACKAGED BUILD WITHOUT ENABLE_DEVTOOLS
export function showDevToolsDisabledHint(): void {
  dialog.showMessageBox({
    type: 'info',
    title: 'Developer Tools are disabled',
    message: 'This build has developer tools turned off.',
    detail:
      'Run the app in development ("npm run dev"), or rebuild with ENABLE_DEVTOOLS=true ' +
      '(for example "npm run build:win-dev") to inspect the renderer, main and preload processes.'
  })
}

function formatLogs(candidate?: BrowserWindow | null): string | null {
  const window = getTargetWindow(candidate)
  if (!window) return null
  const entries = consoleLogs.get(window.webContents.id) ?? []
  const header = [
    'Onuman console export',
    `app version: ${app.getVersion()}`,
    `electron: ${process.versions.electron}`,
    `chrome: ${process.versions.chrome}`,
    `platform: ${process.platform} ${process.arch}`,
    `url: ${window.webContents.getURL()}`,
    `exported: ${new Date().toISOString()}`,
    ''
  ].join('\n')
  const body = entries.map((l) => `[${l.time}] [${l.level}] ${l.message}`).join('\n')
  return `${header}${body || '(no console output captured)'}\n`
}

// COPY EVERYTHING THAT WOULD APPEAR IN THE DEVTOOLS CONSOLE
export function copyConsoleLogsToClipboard(candidate?: BrowserWindow | null): boolean {
  const text = formatLogs(candidate)
  if (text == null) return false
  clipboard.writeText(text)
  return true
}

// SAVE THE SAME LOGS TO A FILE (SUPPORT / CUSTOMER MACHINE WITHOUT DEVTOOLS)
export function exportConsoleLogs(candidate?: BrowserWindow | null): string | null {
  const text = formatLogs(candidate)
  if (text == null) return null
  const filePath = join(app.getPath('temp'), `onuman-console-${Date.now()}.log`)
  writeFileSync(filePath, text, 'utf8')
  return filePath
}

export function logDevToolsAvailability(): void {
  if (!isDevToolsEnabled()) {
    console.log('🛠️ DevTools disabled for this build (set ENABLE_DEVTOOLS=true to enable)')
    return
  }
  console.log('🛠️ DevTools shortcuts: F12 / Ctrl+Shift+I (Cmd+Shift+I on macOS)')
  console.log(
    '🛠️ Remote debugging: run electron with --inspect=9229 (main) or --remote-debugging-port=9222'
  )
}
