const { test } = require('node:test')
const assert = require('node:assert/strict')
const { resolve } = require('node:path')

test('first-run image uploads initialize auth and send multipart data', async () => {
  const { createServer } = await import('vite')
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    server: { middlewareMode: true },
    appType: 'custom',
    plugins: [{
      name: 'stub-toast-for-test',
      enforce: 'pre',
      load(id) {
        if (id.replaceAll('\\', '/').endsWith('/composables/Toast.ts')) {
          return 'export function useToast() { return { showToast() {} } }'
        }
      }
    }]
  })
  const previousWindow = global.window
  try {
    let storedKey = 'new-license'
    let keyReads = 0
    let serialReads = 0
    global.window = { electronAPI: {
      getLicenseKey: async () => { keyReads++; return storedKey },
      getMotherboardID: async () => { serialReads++; return 'serial-123' }
    } }
    const { useApi } = await server.ssrLoadModule(resolve('src/renderer/src/composables/useApi.ts'))
    const { useImageUploader } = await server.ssrLoadModule(resolve('src/renderer/src/composables/useImageUploader.ts'))
    const api = useApi()
    const requests = []
    api.apiClient.defaults.adapter = async (config) => {
      requests.push(config)
      return { data: { status: 'success', image_url: 'uploads/photo.png' }, status: 200, statusText: 'OK', headers: {}, config }
    }

    const file = new File(['image content'], 'photo.png', { type: 'image/png' })
    const uploader = useImageUploader()
    let uploadError
    await uploader.handleFileChange({ target: { files: [file], value: 'photo.png' } }, {
      onError: (message) => { uploadError = message }
    })
    assert.equal(uploadError, undefined)
    assert.match(uploader.imageURL.value, /uploads\/photo\.png$/)
    assert.equal(keyReads, 1)
    assert.equal(serialReads, 1)
    assert.equal(requests[0].headers.get('Authorization'), 'new-license')
    assert.equal(requests[0].headers.get('serialID'), 'serial-123')
    assert.ok(requests[0].data instanceof FormData)
    assert.equal(requests[0].data.get('image').name, 'photo.png')
    assert.notEqual(requests[0].headers.get('Content-Type'), 'application/json')

    // Activation initially checks a license before it is stored. The newly
    // activated key must be used immediately, without restarting the app.
    api.resetAuth()
    storedKey = ''
    await api.initialize()
    storedKey = 'activated-license'
    api.setToken(storedKey)
    await uploader.handleFileChange({ target: { files: [file], value: 'photo.png' } })
    assert.equal(requests[1].headers.get('Authorization'), 'activated-license')
    assert.equal(requests[1].headers.get('serialID'), 'serial-123')

    // Registration also posts FormData through the shared API client.
    const registration = new FormData()
    registration.append('photo', 'uploads/photo.png')
    await api.post('/api/create_org', registration)
    assert.ok(requests[2].data instanceof FormData)
    assert.equal(requests[2].data.get('photo'), 'uploads/photo.png')
    assert.notEqual(requests[2].headers.get('Content-Type'), 'application/json')
  } finally {
    global.window = previousWindow
    await server.close()
  }
})
