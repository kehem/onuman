require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'node' } })
const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  isDevToolsShortcut,
  isDevToolsAllowed,
  resolveDevToolsMode
} = require('../src/main/utils/devtools.ts')

test('F12 toggles devtools on every platform', () => {
  assert.equal(isDevToolsShortcut({ key: 'F12' }, 'win32'), true)
  assert.equal(isDevToolsShortcut({ key: 'f12' }, 'darwin'), true)
  assert.equal(isDevToolsShortcut({ key: 'F12', control: true }, 'linux'), true)
})

test('ctrl+shift+i and ctrl+shift+j toggle devtools on windows and linux', () => {
  assert.equal(isDevToolsShortcut({ key: 'I', control: true, shift: true }, 'win32'), true)
  assert.equal(isDevToolsShortcut({ key: 'j', control: true, shift: true }, 'linux'), true)
  assert.equal(isDevToolsShortcut({ key: 'i', control: true }, 'win32'), false)
  // CMD ON WINDOWS IS A NO-OP
  assert.equal(isDevToolsShortcut({ key: 'i', meta: true, shift: true }, 'win32'), false)
})

test('cmd+shift+i toggles devtools on macos', () => {
  assert.equal(isDevToolsShortcut({ key: 'i', meta: true, shift: true }, 'darwin'), true)
  assert.equal(isDevToolsShortcut({ key: 'j', meta: true, shift: true }, 'darwin'), true)
  assert.equal(isDevToolsShortcut({ key: 'i', control: true, shift: true }, 'darwin'), false)
})

test('unrelated keys are ignored', () => {
  assert.equal(isDevToolsShortcut({ key: 'r', control: true }), false)
  assert.equal(isDevToolsShortcut({ key: 'i', shift: true }), false)
  assert.equal(isDevToolsShortcut({ key: '' }), false)
})

test('devtools are enabled in development and opt-in for packaged builds', () => {
  assert.equal(isDevToolsAllowed({}, false), true)
  assert.equal(isDevToolsAllowed({}, true), false)
  assert.equal(isDevToolsAllowed({ ENABLE_DEVTOOLS: 'true' }, true), true)
  assert.equal(isDevToolsAllowed({ ENABLE_DEVTOOLS: 'false' }, true), false)
  assert.equal(isDevToolsAllowed({ ENABLE_DEVTOOLS: '1' }, true), false)
})

test('devtools mode defaults to detached for the frameless window', () => {
  assert.equal(resolveDevToolsMode(undefined), 'detach')
  assert.equal(resolveDevToolsMode('bogus'), 'detach')
  assert.equal(resolveDevToolsMode('right'), 'right')
  assert.equal(resolveDevToolsMode('bottom'), 'bottom')
  assert.equal(resolveDevToolsMode('undocked'), 'undocked')
})
