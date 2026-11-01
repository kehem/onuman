// main/ipc/Keytar.ts

import { app, ipcMain } from 'electron'
import keytar from 'keytar'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import si from 'systeminformation'
import { execSync } from 'child_process'
import { existsSync, readFileSync, copyFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import { platform } from 'os'

const SERVICE = 'my-electron-app'

type StoreData = {
  profile?: {
    name?: string
    position?: string
    company?: string
  }
  [key: string]: any
}

let db: Low<StoreData>

let handlersInitialized = false

async function initDb() {
  console.log('[UserStore] Initializing LowDB...')
  const userDataPath = app.getPath('userData')
  mkdirSync(userDataPath, { recursive: true })
  const storePath = join(userDataPath, 'electron-data.json')
  const legacyPath = resolve('electron-data.json')
  // Preserve data written by earlier versions, without continuing to write in
  // the installation or current working directory.
  if (!existsSync(storePath) && legacyPath !== storePath && existsSync(legacyPath)) {
    copyFileSync(legacyPath, storePath)
  }
  db = new Low<StoreData>(new JSONFile<StoreData>(storePath), {})
  await db.read()
  db.data ||= {}
  console.log('[UserStore] LowDB initialized')
}

async function getLinuxMotherboardID(): Promise<string> {
  const methods = [
    // Method 1: DMI system information
    () => {
      try {
        return readFileSync('/sys/class/dmi/id/board_serial', 'utf8').trim()
      } catch {
        return null
      }
    },

    // Method 2: DMI product UUID as fallback
    () => {
      try {
        return readFileSync('/sys/class/dmi/id/product_uuid', 'utf8').trim()
      } catch {
        return null
      }
    },

    // Method 3: Machine ID (systemd)
    () => {
      try {
        return readFileSync('/etc/machine-id', 'utf8').trim()
      } catch {
        return null
      }
    },

    // Method 4: Using dmidecode command (requires root)
    () => {
      try {
        const result = execSync('sudo dmidecode -s baseboard-serial-number', {
          encoding: 'utf8',
          timeout: 5000
        }).trim()
        return result !== 'Not Specified' ? result : null
      } catch {
        return null
      }
    },

    // Method 5: Hardware UUID
    () => {
      try {
        return readFileSync('/sys/class/dmi/id/product_serial', 'utf8').trim()
      } catch {
        return null
      }
    }
  ]

  for (const method of methods) {
    try {
      const result = method()
      if (result && result !== 'Unknown' && result !== 'Not Specified' && result.length > 0) {
        console.log(`[UserStore] Found motherboard ID using method: ${result}`)
        return result
      }
    } catch (err) {
      // Continue to next method
      continue
    }
  }

  console.warn('[UserStore] Could not retrieve motherboard ID on Linux')
  return 'linux-fallback-' + Date.now()
}

async function updateStoredMotherboardID() {
  try {
    let realID = 'Unknown'

    if (platform() === 'linux') {
      realID = await getLinuxMotherboardID()
    } else {
      // Use systeminformation for Windows/macOS
      const baseboard = await si.baseboard()
      realID = baseboard.serial || 'Unknown'
    }

    console.log(`[UserStore] Retrieved motherboard ID: ${realID}`)

    // Test keytar availability before using
    try {
      await keytar.setPassword(SERVICE, 'motherboardID', realID)
      console.log('[UserStore] Motherboard ID stored securely via keytar.')
    } catch (keytarErr) {
      console.error('[UserStore] Keytar failed, falling back to JSON storage:', keytarErr)
      // Fallback to JSON storage (less secure but functional)
      db.data.motherboardID = realID
      await db.write()
    }
  } catch (err) {
    console.error('[UserStore] Failed to fetch/store motherboard ID:', err)
  }
}

// Test keytar functionality on Linux
async function testKeytarOnLinux() {
  if (platform() !== 'linux') return true

  try {
    const testKey = 'keytar-test'
    const testValue = 'test-value-' + Date.now()

    await keytar.setPassword(SERVICE, testKey, testValue)
    const retrieved = await keytar.getPassword(SERVICE, testKey)
    await keytar.deletePassword(SERVICE, testKey)

    const success = retrieved === testValue
    console.log(`[UserStore] Keytar test on Linux: ${success ? 'PASSED' : 'FAILED'}`)

    if (!success) {
      console.log(
        '[UserStore] Consider installing: sudo apt-get install libsecret-1-dev (Ubuntu/Debian)'
      )
    }

    return success
  } catch (err) {
    console.error('[UserStore] Keytar test failed on Linux:', err)
    console.log(
      '[UserStore] Install keyring support: sudo apt-get install libsecret-1-dev gnome-keyring'
    )
    return false
  }
}

export async function initUserStoreHandlers() {
  if (handlersInitialized) {
    console.warn('[UserStore] Handlers already initialized. Skipping.')
    return
  }
  handlersInitialized = true
  console.log('[UserStore] Initializing IPC handlers...')

  await initDb()

  // Test keytar on Linux
  const keytarWorking = await testKeytarOnLinux()

  // SECURE VALUES (keytar with fallback)
  ipcMain.handle('store-license-key', async (_event, licenseKey: string) => {
    console.log('[IPC] store-license-key called')
    try {
      await keytar.setPassword(SERVICE, 'licenseKey', licenseKey)
    } catch (err) {
      console.warn('[IPC] Keytar failed, using JSON fallback:', err)
      db.data._secureData = db.data._secureData || {}
      db.data._secureData.licenseKey = licenseKey
      await db.write()
    }
  })

  ipcMain.handle('get-license-key', async () => {
    console.log('[IPC] get-license-key called')
    try {
      const key = await keytar.getPassword(SERVICE, 'licenseKey')
      return key || db.data._secureData?.licenseKey || ''
    } catch (err) {
      console.warn('[IPC] Keytar failed, checking JSON fallback:', err)
      return db.data._secureData?.licenseKey || ''
    }
  })

  ipcMain.handle('store-motherboard-id', async (_event, motherboardID: string) => {
    console.log('[IPC] store-motherboard-id called')
    try {
      await keytar.setPassword(SERVICE, 'motherboardID', motherboardID)
    } catch (err) {
      console.warn('[IPC] Keytar failed, using JSON fallback:', err)
      db.data._secureData = db.data._secureData || {}
      db.data._secureData.motherboardID = motherboardID
      await db.write()
    }
  })

  ipcMain.handle('get-motherboard-id', async () => {
    console.log('[IPC] get-motherboard-id called')
    try {
      const id = await keytar.getPassword(SERVICE, 'motherboardID')
      return id || db.data._secureData?.motherboardID || db.data.motherboardID || ''
    } catch (err) {
      console.warn('[IPC] Keytar failed, checking JSON fallback:', err)
      return db.data._secureData?.motherboardID || db.data.motherboardID || ''
    }
  })

  // Populate the device ID once on a new installation and keep it stable.
  console.log('[UserStore] Checking stored motherboard ID...')
  const storedID = await (async () => {
    try {
      return (await keytar.getPassword(SERVICE, 'motherboardID')) || db.data._secureData?.motherboardID || db.data.motherboardID
    } catch {
      return db.data._secureData?.motherboardID || db.data.motherboardID
    }
  })()
  if (!storedID) await updateStoredMotherboardID()

  // GENERIC JSON STORAGE (non-sensitive)
  ipcMain.handle('store:set', async (_event, key: string, value: any) => {
    console.log(`[IPC] store:set called with key=${key}`)
    db.data[key] = value
    await db.write()
  })

  ipcMain.handle('store:get', async (_event, key: string) => {
    console.log(`[IPC] store:get called with key=${key}`)
    return db.data[key]
  })

  console.log('[UserStore] IPC handlers registered successfully.')

  if (!keytarWorking && platform() === 'linux') {
    console.warn(
      '[UserStore] WARNING: Keytar not working properly on Linux. Using less secure JSON fallback.'
    )
  }
}
