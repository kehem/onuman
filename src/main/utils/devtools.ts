// src/main/utils/devtools.ts
// PURE HELPERS FOR DEVTOOLS SO THEY CAN BE UNIT-TESTED WITHOUT ELECTRON

export type DevToolsMode = 'detach' | 'right' | 'bottom' | 'undocked'

export const DEVTOOLS_MODES: DevToolsMode[] = ['detach', 'right', 'bottom', 'undocked']

// THE MINIMAL SHAPE OF AN ELECTRON INPUT EVENT WE CARE ABOUT
export interface KeyInputLike {
  key: string
  control?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
}

// F12 ON EVERY PLATFORM, PLUS THE CHROME-STYLE COMBOS:
// Ctrl+Shift+I / Ctrl+Shift+J ON WINDOWS + LINUX, Cmd+Shift+I / Cmd+Shift+J ON macOS
export function isDevToolsShortcut(
  input: KeyInputLike,
  platform: NodeJS.Platform = process.platform
): boolean {
  const key = (input.key || '').toLowerCase()
  const primary = platform === 'darwin' ? !!input.meta : !!input.control

  if (key === 'f12') return true
  return primary && !!input.shift && (key === 'i' || key === 'j')
}

// DEVTOOLS ARE ALLOWED IN ANY NON-PACKAGED (DEVELOPMENT) RUN, OR WHEN THE BUILD
// WAS MADE WITH ENABLE_DEVTOOLS=true
export function isDevToolsAllowed(
  env: Record<string, string | undefined>,
  isPackaged: boolean
): boolean {
  return env.ENABLE_DEVTOOLS === 'true' || !isPackaged
}

// DEVTOLS_MODE CONTROLS THE DOCK POSITION; 'detach' IS SAFEST FOR A FRAMELESS UI
export function resolveDevToolsMode(value?: string): DevToolsMode {
  return DEVTOOLS_MODES.includes(value as DevToolsMode) ? (value as DevToolsMode) : 'detach'
}
