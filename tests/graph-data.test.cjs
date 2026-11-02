require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'node' } })
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { effectScope } = require('vue')
const { useGraphData } = require('../src/renderer/src/composables/useGraphData.ts')

function setup(get) {
  const scope = effectScope()
  const data = scope.run(() => useGraphData(get))
  return { ...data, dispose: () => scope.stop() }
}

test('successful empty graph responses are not errors', async () => {
  for (const response of [null, '', ' ', 'null', [], {}, { rcc: null, material_cost: [] }]) {
    const graph = setup(async (_url, options) => {
      assert.deepEqual(options, { suppressErrorToast: true })
      return response
    })
    await graph.loadGraphData('/graph')
    assert.equal(graph.graphError.value, '')
    assert.equal(graph.isLoading.value, false)
    assert.deepEqual(graph.graphData.value, Array.isArray(response) || typeof response === 'string' ? null : response)
    graph.dispose()
  }
})

test('a real HTTP error, network error, and malformed response remain errors', async () => {
  for (const [error, expected] of [
    [{ response: { status: 500 } }, /HTTP 500/],
    [{ response: { status: 403 } }, /HTTP 403/],
    [new Error('Network Error'), /check your connection/]
  ]) {
    const graph = setup(async () => { throw error })
    await graph.loadGraphData('/graph')
    assert.match(graph.graphError.value, expected)
    assert.equal(graph.graphData.value, null)
    graph.dispose()
  }
  for (const response of ['not JSON', { material_cost: 'invalid' }, { error: 'failure' }]) {
    const graph = setup(async () => response)
    await graph.loadGraphData('/graph')
    assert.match(graph.graphError.value, /invalid graph response/)
    graph.dispose()
  }
})

test('valid graph data survives parsing and a retry clears the previous error', async () => {
  let fail = true
  const expected = { rcc: { total_price_brick: 12 }, material_cost: [] }
  const graph = setup(async () => {
    if (fail) throw { response: { status: 500 } }
    return JSON.stringify(expected)
  })
  await graph.loadGraphData('/graph')
  assert.match(graph.graphError.value, /500/)
  fail = false
  await graph.loadGraphData('/graph')
  assert.equal(graph.graphError.value, '')
  assert.deepEqual(graph.graphData.value, expected)
  graph.dispose()
})

test('slower previous tab requests cannot replace the latest response', async () => {
  const pending = []
  const graph = setup(() => new Promise((resolve, reject) => pending.push({ resolve, reject })))
  const first = graph.loadGraphData('/floor/1')
  const second = graph.loadGraphData('/floor/2')
  pending[1].resolve({ rcc: { total_price_brick: 2 } })
  await second
  pending[0].reject({ response: { status: 500 } })
  await first
  assert.equal(graph.graphError.value, '')
  assert.equal(graph.graphData.value.rcc.total_price_brick, 2)
  assert.equal(graph.isLoading.value, false)
  graph.dispose()
})

test('graph requests suppress only the global toast, not the HTTP error', async () => {
  const { createServer } = await import('vite')
  const axios = require('axios')
  const oldWindow = global.window
  const notifications = []
  global.__graphToasts = notifications
  global.window = { electronAPI: { getLicenseKey: async () => 'key', getMotherboardID: async () => 'device' } }
  const server = await createServer({
    configFile: false, root: process.cwd(), appType: 'custom', server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
    plugins: [{ name: 'stub-toast', enforce: 'pre', load(id) {
      if (id.replaceAll('\\', '/').endsWith('/composables/Toast.ts')) {
        return 'export function useToast() { return { showToast: (...args) => globalThis.__graphToasts.push(args) } }'
      }
    } }]
  })
  try {
    const { useApi } = await server.ssrLoadModule(require('node:path').resolve('src/renderer/src/composables/useApi.ts'))
    const api = useApi()
    api.apiClient.defaults.adapter = async config => {
      throw new axios.AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, { status: 500, statusText: 'Error', headers: {}, config, data: { message: 'server failed' } })
    }
    await assert.rejects(api.get('/graph', { suppressErrorToast: true }), e => e.response.status === 500)
    assert.equal(notifications.length, 0)
    await assert.rejects(api.get('/other'), e => e.response.status === 500)
    assert.equal(notifications.length, 1)
    assert.equal(notifications[0][1], 'server failed')
  } finally {
    await server.close()
    global.window = oldWindow
    delete global.__graphToasts
  }
})
