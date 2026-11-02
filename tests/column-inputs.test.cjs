const { test } = require('node:test')
const assert = require('node:assert/strict')
const { resolve } = require('node:path')
const { createRenderer, h, ref, nextTick } = require('vue')

function createHost() {
  const node = (type, text = '') => ({ type, text, children: [], props: {}, style: {}, parent: null, options: [], addEventListener() {} })
  const root = node('root')
  const renderer = createRenderer({
    createElement: type => node(type), createText: text => node('text', text),
    createComment: text => node('comment', text),
    setText: (n, text) => { n.text = text }, setElementText: (n, text) => { n.text = text },
    parentNode: n => n.parent,
    nextSibling: n => n.parent?.children[n.parent.children.indexOf(n) + 1] || null,
    insert: (n, parent, anchor) => {
      if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1)
      n.parent = parent
      const index = anchor ? parent.children.indexOf(anchor) : -1
      if (index < 0) parent.children.push(n); else parent.children.splice(index, 0, n)
    },
    remove: n => { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = null },
    patchProp: (n, key, _old, value) => { n.props[key] = value }
  })
  return { root, ...renderer }
}

function find(node, type) {
  if (node.type === type) return node
  for (const child of node.children) { const result = find(child, type); if (result) return result }
}

async function buildColumnComponent(realChildren = false) {
  const { build } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default
  const sources = {
    useApi: `export function useApi() { return { get: async () => [], post: (...args) => globalThis.__columnTest.post(...args), stripMm: value => (value || '').replace(/mm[²³]?/gi, '').trim() } }`,
    Toast: `export function useToast() { return { showToast() {} } }`,
    useImageUploader: `import { ref } from 'vue'; export function useImageUploader() { return { handleFileChange() {}, isUploading: ref(false), uploadProgress: ref(0), imageURL: ref(null) } }`,
    ColumnBasic: `import { h, defineComponent } from 'vue'; export default defineComponent({ name: 'ColumnBasic', setup(_, {emit}) { globalThis.__columnTest.basic = emit; return () => h('div') } })`,
    LongReinforcements: `import { h, defineComponent } from 'vue'; export default defineComponent({ setup(_, {emit}) { globalThis.__columnTest.reinforcements = emit; return () => h('div') } })`,
    Stirrups: `import { h, defineComponent } from 'vue'; export default defineComponent({ setup(_, {emit}) { globalThis.__columnTest.stirrups = emit; return () => h('div') } })`,
    OnumanCombobox: `import { h, defineComponent } from 'vue'; export default defineComponent({ setup() { return () => h('div') } })`,
    ToolTip: `import { h, defineComponent } from 'vue'; export default defineComponent({ setup(_, {slots}) { return () => h('div', slots.default?.()) } })`,
    UnitConverterInput: `import { h, defineComponent } from 'vue'; export default defineComponent({ props: ['modelValue', 'originalValue', 'inputId'], setup(props, {emit}) { globalThis.__columnTest.inputs[props.inputId] = emit; return () => h('div') } })`,
    router: `export function useRoute() { return { query: { totalFloors: '4' } } }`
  }
  const result = await build({
    configFile: false, root: process.cwd(), logLevel: 'silent',
    plugins: [{
      name: 'column-test-stubs', enforce: 'pre',
      resolveId(id) {
        if (id === 'vue-router' && realChildren) return '\0column-test:router'
        const match = Object.keys(sources).find(name => id.endsWith('/' + name) || id.endsWith('/' + name + '.vue'))
        if (realChildren && ['ColumnBasic', 'LongReinforcements', 'Stirrups'].includes(match)) return
        if (match) return '\0column-test:' + match
      },
      load(id) { if (id.startsWith('\0column-test:')) return sources[id.slice('\0column-test:'.length)] }
    }, vue()],
    build: { write: false, lib: { entry: resolve('src/renderer/src/components/INPUTS/COLUMN/ColumnInputs.vue'), formats: ['cjs'] }, rollupOptions: { external: ['vue'] } }
  })
  const Module = require('node:module')
  const compiled = new Module(resolve('tests/column-component.cjs'), module)
  compiled.filename = resolve('tests/column-component.cjs'); compiled.paths = module.paths
  compiled._compile(result[0].output.find(item => item.type === 'chunk').code, compiled.filename)
  return compiled.exports.default || compiled.exports
}

test('column create and edit requests preserve visible input fields', async () => {
  const component = await buildColumnComponent()
  const oldWindow = global.window, oldDocument = global.document
  let requests = [], reloads = 0
  global.window = { location: { reload: () => { reloads++ } } }
  global.document = { querySelector: () => null }
  global.__columnTest = { post: async (url, payload) => { requests.push({ url, payload }); return { id: 123 } } }
  const host = createHost()
  const selected = ref(null)
  const app = { setup: () => () => h(component, { projectID: 42, columnData: selected.value }) }
  async function submit() {
    const form = find(host.root, 'form')
    await form.props.onSubmit({ preventDefault() {} })
    await nextTick()
    return requests.at(-1)
  }
  const basic = (...args) => global.__columnTest.basic(...args)
  const stirrups = (...args) => global.__columnTest.stirrups(...args)
  try {
    host.render(h(app), host.root)
    await nextTick()
    basic('update:columnType', true)
    basic('update:columnShape', false)
    basic('update:columnQty', '3')
    basic('update:columnHeight', '3000 mm')
    basic('update:clearCover', '40 mm')
    basic('update:columnWidth', '250 mm')
    basic('update:columnLength', '400 mm')
    for (const [field, value] of Object.entries({ columnHeight: '3 m', clearCover: '40 mm', columnWidth: '25 cm', columnLength: '40 cm' })) basic('update:originalValue', field, value)
    global.__columnTest.reinforcements('update:reinforcements', [{ qty: '4', diameter: 16, support: true, height: '3200 mm', height_original: '3.2 m' }])
    stirrups('update:spacing', '100 mm'); stirrups('spacing-original', '10 cm')
    stirrups('update:rodDiameter', '8 mm'); stirrups('rodDiameter-original', '8 mm')
    stirrups('update:midSpacing', '150 mm'); stirrups('midSpacing-original', '15 cm')
    stirrups('update:midRodDiameter', '10 mm'); stirrups('midRodDiameter-original', '10 mm')
    stirrups('update:stirrups', [{ deduction: '30 mm', diameter: '12 mm', height: '900 mm', deduction_original: '3 cm', diameter_original: '12 mm', height_original: '90 cm' }])
    await nextTick()
    const created = await submit()
    assert.equal(created.url, '/api/column/create')
    assert.equal(created.payload.projectId, 42)
    assert.equal(created.payload.column_type, 'short')
    assert.equal(created.payload.type, 'Rectangle')
    assert.deepEqual([created.payload.quantity, created.payload.height, created.payload.clear_cover, created.payload.width, created.payload.length, created.payload.diameter], [3, 3000, 40, 250, 400, 0])
    assert.deepEqual([created.payload.height_original, created.payload.clear_cover_original, created.payload.width_original, created.payload.length_original], ['3 m', '40 mm', '25 cm', '40 cm'])
    assert.deepEqual(created.payload.reinforcements, [{ rod_qty: 4, rod_diameter: 16, height: 3200, support: true, height_original: '3.2 m' }])
    assert.deepEqual(created.payload.stirrups.map(s => [s.deduction, s.diameter, s.height]), [[100, 8, 0], [150, 10, 0], [30, 12, 900]])
    assert.equal(created.payload.stirrups[2].height_original, '90 cm')
    assert.equal(reloads, 1)

    selected.value = {
      id: 9, name: 'C1', floor: '3,1', column_type: 'long', type: 'Rectangle', quantity: 2,
      height: 3000, height_original: '3 m', clear_cover: 40, clear_cover_original: '40 mm',
      width: 250, width_original: '25 cm', length: 400, length_original: '40 cm', diameter: 0, diameter_original: '',
      reinforcements: [{ rod_qty: 4, rod_diameter: 16, height: 3200, height_original: '3.2 m', support: true }],
      stirrups: [{ deduction: '100', diameter: '8' }, { deduction: '150', diameter: '10' }, { deduction: '30', diameter: '12', height: '900', height_original: '90 cm' }]
    }
    await nextTick(); await nextTick()
    const updated = await submit()
    assert.equal(updated.url, '/api/column/update/9')
    assert.equal(updated.payload.column_type, 'long')
    assert.equal(updated.payload.floor, '1,3')
    assert.deepEqual([updated.payload.width, updated.payload.length, updated.payload.stirrups[2].height], [250, 400, 900])
    assert.equal(updated.payload.stirrups[2].height_original, '90 cm')

    selected.value = { ...selected.value, id: 10, floor: 0, column_type: 'short', type: 'Circular', diameter: 500, diameter_original: '50 cm' }
    await nextTick(); await nextTick()
    const circular = await submit()
    assert.equal(circular.url, '/api/column/update/10')
    assert.equal(circular.payload.column_type, 'short')
    assert.deepEqual([circular.payload.floor, circular.payload.width, circular.payload.length, circular.payload.diameter], [0, 0, 0, 500])
    assert.equal(circular.payload.diameter_original, '50 cm')
  } finally {
    host.render(null, host.root)
    delete global.__columnTest
    global.window = oldWindow; global.document = oldDocument
  }
})


test('column child inputs pass dimensions, reinforcement and stirrup edits into the request', async () => {
  const component = await buildColumnComponent(true)
  const oldWindow = global.window, oldDocument = global.document
  let request
  global.window = { location: { reload() {} } }
  global.document = { querySelector: () => null }
  global.__columnTest = { inputs: {}, post: async (url, payload) => { request = { url, payload }; return { id: 1 } } }
  const host = createHost()
  const byId = (node, id) => {
    if (node.props.id === id) return node
    for (const child of node.children) { const result = byId(child, id); if (result) return result }
  }
  const input = (id, value, original) => {
    const emit = global.__columnTest.inputs[id]
    assert.ok(emit, `missing converter ${id}`)
    emit('update:modelValue', value)
    emit('update:originalValue', original)
  }
  try {
    host.render(h(component, { projectID: 7 }), host.root)
    await nextTick()
    byId(host.root, 'shortColumn').props.onChange()
    byId(host.root, 'rectangle').props.onChange()
    byId(host.root, 'column-qty').props.onInput({ target: { value: '2' } })
    await nextTick()
    input('columnHeight', '3000 mm', '3 m')
    input('clearCover', '40 mm', '4 cm')
    input('columnWidth', '250 mm', '25 cm')
    input('columnLength', '400 mm', '40 cm')
    byId(host.root, 'rod-qty-0').props.onInput({ target: { value: '4' } })
    await nextTick()
    byId(host.root, 'reinforcement-height-0').props.onChange({ target: { value: '16' } })
    await nextTick()
    byId(host.root, 'checked-reinforcement-1').props.onChange({ target: { checked: true } })
    await nextTick()
    input('rodHeight-0', '3500 mm', '3.5 m')
    input('spacing', '100 mm', '10 cm')
    input('rodDiameter', '8 mm', '8 mm')
    input('midSpacing', '150 mm', '15 cm')
    input('midRodDiameter', '10 mm', '10 mm')
    await nextTick()
    const addButton = (function locate(n) {
      if (n.type === 'button' && n.props.class === 'onuman-btn') return n
      for (const child of n.children) { const result = locate(child); if (result) return result }
    })(host.root)
    assert.ok(addButton)
    addButton.props.onClick()
    await nextTick()
    input('stirrupDeduction-0', '30 mm', '3 cm')
    await nextTick()
    input('stirrupDiameter-0', '12 mm', '12 mm')
    await nextTick()
    input('stirrupHeight-0', '900 mm', '90 cm')
    await nextTick()
    await find(host.root, 'form').props.onSubmit({ preventDefault() {} })
    assert.equal(request.url, '/api/column/create')
    assert.deepEqual([request.payload.width, request.payload.length, request.payload.quantity], [250, 400, 2])
    assert.deepEqual([request.payload.reinforcements[0].rod_qty, request.payload.reinforcements[0].rod_diameter, request.payload.reinforcements[0].support, request.payload.reinforcements[0].height, request.payload.reinforcements[0].height_original], [4, 16, true, 3500, '3.5 m'])
    assert.deepEqual([request.payload.stirrups[2].deduction, request.payload.stirrups[2].diameter, request.payload.stirrups[2].height, request.payload.stirrups[2].height_original], [30, 12, 900, '90 cm'])
  } finally {
    host.render(null, host.root)
    delete global.__columnTest
    global.window = oldWindow; global.document = oldDocument
  }
})
