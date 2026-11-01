require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'node' } })
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { checkStartupLicense } = require('../src/renderer/src/composables/checkStartupLicense.ts')

const fail = async () => { throw new Error('Should not be called') }

test('fresh install goes to activation without contacting the server', async () => {
  assert.deepEqual(await checkStartupLicense(async () => '', fail, fail), { status: 'missing-license' })
})

test('missing device ID does not send a license request', async () => {
  assert.deepEqual(await checkStartupLicense(async () => 'key', async () => '', fail), { status: 'missing-serial' })
})

test('existing installation checks the license and returns the response', async () => {
  const data = { license: true, organization: { name: 'Example' } }
  assert.deepEqual(await checkStartupLicense(async () => 'key', async () => 'serial', async () => data), { status: 'verified', data })
})

test('license server errors are propagated for the UI to handle', async () => {
  await assert.rejects(checkStartupLicense(async () => 'key', async () => 'serial', fail), /Should not be called/)
})
