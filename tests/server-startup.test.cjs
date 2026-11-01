require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'node' } })
const { test } = require('node:test')
const assert = require('node:assert/strict')
const net = require('node:net')

// Reserve an available IPv4 port for the test server.
test('server address does not depend on localhost resolving to IPv4', async () => {
  const probe = net.createServer()
  await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve))
  process.env.PORT = String(probe.address().port)
  await new Promise((resolve, reject) => probe.close((err) => err ? reject(err) : resolve()))
  const { startServer, getServerAddress } = require('../server/server.ts')
  const server = await startServer()
  try {
    const originalFetch = global.fetch
    global.fetch = () => { throw new Error('Unexpected localhost probe') }
    try {
      assert.equal(new URL(await getServerAddress()).port, process.env.PORT)
    } finally {
      global.fetch = originalFetch
    }
    const response = await fetch(`http://127.0.0.1:${process.env.PORT}/ping`)
    assert.equal((await response.json()).pong, true)
  } finally {
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()))
  }
})
