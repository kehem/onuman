const { test } = require('node:test')
const assert = require('node:assert/strict')
const { resolve } = require('node:path')
const { createRenderer, h, nextTick, ref } = require('vue')

function createHost() {
  const node = (type, text = '') => ({ type, text, children: [], props: {}, parent: null, listeners: {}, addEventListener(event, fn) { this.listeners[event] = fn }, removeEventListener(event) { delete this.listeners[event] } })
  const root = node('root')
  const renderer = createRenderer({
    createElement: type => node(type), createText: text => node('text', text), createComment: text => node('comment', text),
    insertStaticContent: (content, parent, anchor) => {
      const n = node('static', content); n.parent = parent
      const index = anchor ? parent.children.indexOf(anchor) : -1
      if (index < 0) parent.children.push(n); else parent.children.splice(index, 0, n)
      return [n, n]
    },
    setText: (n, text) => { n.text = text }, setElementText: (n, text) => { n.text = text },
    parentNode: n => n.parent, nextSibling: n => n.parent?.children[n.parent.children.indexOf(n) + 1] || null,
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
function all(node, predicate) { return [ ...(predicate(node) ? [node] : []), ...node.children.flatMap(n => all(n, predicate)) ] }
const text = node => [node.text, ...node.children.map(text)].join(' ')

async function loadComponent() {
  const { build } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default
  const stubs = {
    unitStore: `export function useUnitStore() { return {targetUnit: 'ft', convertUnit: (_from, n, dimension = 1) => n / Math.pow(304.8, dimension)} }`,
    Comments: `import {h} from 'vue'; export default {props:['typeid','type'], render() { return h('span', {class:'comment', 'data-id':this.typeid}, 'comment') } }`,
    Actions: `import {h} from 'vue'; export default {props:['sectionDATA','type'], emits:['send-data','delete-data'], render() { return h('div', [h('button', {class:'edit', onClick: () => this.$emit('send-data', this.sectionDATA)}, 'edit'), h('button', {class:'delete', onClick: () => this.$emit('delete-data', this.sectionDATA.id)}, 'delete')]) } }`
  }
  const result = await build({
    configFile: false, root: process.cwd(), logLevel: 'silent', plugins: [{
      name: 'column-output-test-stubs', enforce: 'pre',
      resolveId(id) {
        const name = Object.keys(stubs).find(n => id.endsWith('/' + n) || id.endsWith('/' + n + '.vue'))
        if (name) return '\0column-output:' + name
      },
      load(id) { if (id.startsWith('\0column-output:')) return stubs[id.slice('\0column-output:'.length)] }
    }, vue()],
    build: { write: false, lib: { entry: resolve('src/renderer/src/components/OUTPUTS/StructuralResults.vue'), formats: ['cjs'] }, rollupOptions: { external: ['vue'] } }
  })
  const Module = require('node:module')
  const compiled = new Module(resolve('tests/column-results-component.cjs'), module)
  compiled.filename = resolve('tests/column-results-component.cjs'); compiled.paths = module.paths
  compiled._compile(result[0].output.find(item => item.type === 'chunk').code, compiled.filename)
  return compiled.exports.default || compiled.exports
}

test('column results keep each record, actions, units and overall totals connected', async () => {
  const component = await loadComponent()
  const data = [
    { id: 1, name: 'Same name', type: 'Rectangle', quantity: 2, height: 3048, width: 609.6, length: 914.4, diameter: 0, area: 92903.04, volume: 28316846.592,
      reinforcements: [{ rod_qty: 4, rod_diameter: 16, weight: 36.53, support: true }],
      stirrups: [{ diameter: '10', deduction: '304.8', weight: '22.5', total_ring: '12', height: '250' }] },
    { id: 2, name: 'Same name', type: 'Circular', quantity: 3, height: 6096, width: 0, length: 0, diameter: 304.8, area: 92903.04, volume: 28316846.592,
      reinforcements: [{ rod_qty: 6, rod_diameter: 12, weight: 10.28, support: false }],
      stirrups: [{ diameter: '8', deduction: '609.6', weight: '3.5', total_ring: '7', height: '0' }] },
    { id: 3, name: 'Third column', type: 'Rectangle', quantity: 1, height: 3048, width: 0, length: 0, diameter: 0, area: 0, volume: 0, reinforcements: [], stirrups: [] }
  ]
  const original = structuredClone(data)
  const columns = ref(data)
  let edited, deleted
  const host = createHost()
  try {
    host.render(h({ setup: () => () => h(component, { columns: columns.value, type: 'exterior/column', totalVolume: 56633693.184, onEdit: value => { edited = value }, onDelete: value => { deleted = value } }) }), host.root)
    await nextTick()
    const cards = all(host.root, n => n.type === 'article')
    assert.equal(cards.length, 3)
    assert.equal(cards[0].props['aria-labelledby'], 'column-result-1')
    assert.equal(cards[1].props['aria-labelledby'], 'column-result-2')
    assert.match(text(cards[0]), /16 mm/); assert.match(text(cards[0]), /36\.53/); assert.match(text(cards[0]), /22\.50/)
    assert.doesNotMatch(text(cards[0]), /10\.28/)
    assert.match(text(cards[1]), /12 mm/); assert.match(text(cards[1]), /10\.28/); assert.match(text(cards[1]), /3\.50/)
    assert.doesNotMatch(text(cards[1]), /36\.53/)
    assert.match(text(cards[2]), /No reinforcement data available/)
    assert.match(text(cards[2]), /No stirrup data available/)
    assert.match(text(cards[0]), /10 ft/); assert.match(text(cards[0]), /1 ft/)
    assert.match(text(host.root), /Total reinforcement weight\s+72\.81\s+kg/); assert.doesNotMatch(text(host.root), /Total stirrup weight/)
    assert.match(text(host.root), /Total volume\s+2\.00\s+ft/); assert.match(text(host.root), /Total dry volume\s+3\.08\s+ft/)
    const comments = all(host.root, n => n.props.class === 'comment')
    assert.deepEqual(comments.map(n => n.props['data-id']), [1, 2, 3])
    const overview = all(host.root, n => n.props.class === 'overview')[0]
    assert.doesNotMatch(text(overview), /Same name|Third column/)
    for (let i = 0; i < cards.length; i++) {
      assert.equal(all(cards[i], n => n.props.class === 'comment')[0].props['data-id'], data[i].id)
      assert.equal(all(cards[i], n => n.props.class === 'edit').length, 1)
      assert.equal(all(cards[i], n => n.props.class === 'delete').length, 1)
    }
    const edit = all(host.root, n => n.props.class === 'edit')
    const del = all(host.root, n => n.props.class === 'delete')
    edit[1].props.onClick(); del[0].props.onClick()
    assert.equal(edited.id, 2); assert.equal(deleted, 1)
    assert.deepEqual(data, original)
    columns.value = []
    await nextTick()
    assert.match(text(host.root), /No columns in this selection yet/)
    assert.equal(all(host.root, n => n.type === 'article').length, 0)
  } finally {
    host.render(null, host.root)
  }
})

test('other structural outputs keep duplicate-name details, page fields, totals and actions linked by record', async () => {
  const component = await loadComponent()
  for (const kind of ['pile', 'footing', 'beam', 'wall']) {
    const data = [
      { id: 41, name: 'Duplicate', type: 'Rectangle', quantity: 2, height: 3048, width: 609.6, length: 914.4, clear_cover: 304.8, diameter: 0, area: 92903.04, volume: 28316846.592,
        reinforcements: [{ rod_qty: 4, rod_diameter: 16, horizontal_diameter: 14, horizontal_bar: 18, horizontal_weight: 15.3, vertical_bar: 21, vertical_weight: 25.4, weight: 40.7, support: true }],
        stirrups: [{ diameter: '10', deduction: '304.8', weight: '5', total_ring: '12', height: '250' }] },
      { id: 42, name: 'Duplicate', type: 'Circular', quantity: 1, height: 3048, width: 0, length: 0, clear_cover: 0, diameter: 304.8, area: 0, volume: 0,
        reinforcements: [{ rod_qty: 7, rod_diameter: 22, horizontal_diameter: 20, horizontal_bar: 27, horizontal_weight: 32.1, vertical_bar: 31, vertical_weight: 41.2, weight: 73.3, support: false }],
        stirrups: [{ diameter: '8', deduction: '609.6', weight: '3', total_ring: '7', height: '0' }] }
    ]
    const before = structuredClone(data)
    let edited, deleted
    const host = createHost()
    try {
      host.render(h(component, { columns: data, kind, type: 'exterior/' + kind, totalVolume: 28316846.592, onEdit: value => { edited = value }, onDelete: value => { deleted = value } }), host.root)
      await nextTick()
      const cards = all(host.root, n => n.type === 'article')
      assert.equal(cards.length, 2, kind)
      assert.equal(cards[0].props['aria-labelledby'], 'column-result-41', kind)
      assert.equal(cards[1].props['aria-labelledby'], 'column-result-42', kind)
      assert.match(text(cards[0]), /10 mm/); assert.doesNotMatch(text(cards[0]), /8 mm/)
      assert.match(text(cards[1]), /8 mm/); assert.doesNotMatch(text(cards[1]), /10 mm/)
      assert.match(text(host.root), /Total volume\s+1\.00\s+ft/)
      assert.match(text(host.root), /Total dry volume\s+1\.54\s+ft/)
      assert.match(text(host.root), /114/); assert.match(text(host.root), /8\s+Kg/)
      if (kind === 'footing') {
        assert.match(text(cards[0]), /Horizontal total rods/)
        assert.match(text(cards[0]), /18 pcs/); assert.match(text(cards[0]), /15\.30/); assert.match(text(cards[0]), /25\.40/)
        assert.doesNotMatch(text(cards[0]), /32\.10/)
        assert.match(text(cards[1]), /27 pcs/); assert.match(text(cards[1]), /41\.20/)
      } else {
        assert.match(text(cards[0]), /16 mm/); assert.match(text(cards[1]), /22 mm/)
      }
      if (kind === 'wall') {
        assert.match(text(cards[0]), /Clear cover\s+1 ft/)
        assert.match(text(cards[1]), /Clear cover\s+0 ft/)
      }
      if (kind === 'beam') assert.match(text(cards[1]), /Width\s+N\/A/)
      const comments = all(host.root, n => n.props.class === 'comment')
      assert.deepEqual(comments.map(n => n.props['data-id']), [41, 42])
      all(host.root, n => n.props.class === 'edit')[1].props.onClick()
      all(host.root, n => n.props.class === 'delete')[0].props.onClick()
      assert.equal(edited, data[1]); assert.equal(deleted, 41)
      assert.deepEqual(data, before)
    } finally { host.render(null, host.root) }
  }
})

test('column weight breakdown combines diameter values from reinforcements and stirrups without losing unknown diameters', async () => {
  const component = await loadComponent()
  const columns = ref([
    { id: 1, name: 'A', type: 'Rectangle', quantity: 1, height: 0, area: 0, volume: 0,
      reinforcements: [{ rod_diameter: 12, weight: 10.125 }, { rod_diameter: 16, weight: 7 }, { weight: 4 }],
      stirrups: [{ diameter: '12', weight: '2.25' }, { diameter: 'bad', weight: '3' }] },
    { id: 2, name: 'A', type: 'Circular', quantity: 1, height: 0, area: 0, volume: 0,
      reinforcements: [{ rod_diameter: 12, weight: 1 }], stirrups: [{ diameter: '16', weight: '0.5' }] }
  ])
  const original = JSON.parse(JSON.stringify(columns.value))
  const host = createHost()
  try {
    host.render(h({ setup: () => () => h(component, { columns: columns.value, type: 'column', totalVolume: 0 }) }), host.root)
    await nextTick()
    const summary = all(host.root, n => n.props.class === 'weight-breakdown')[0]
    const rows = all(summary, n => n.type === 'tr').slice(1).map(text)
    assert.equal(rows.length, 3)
    assert.match(rows[0], /12 mm\s+13\.38\s+kg/)
    assert.match(rows[1], /16 mm\s+7\.50\s+kg/)
    assert.match(rows[2], /Unspecified diameter\s+7\s+kg/)
    assert.match(text(summary), /Total reinforcement weight\s+27\.88\s+kg/)
    assert.deepEqual(columns.value, original)
    columns.value = []
    await nextTick()
    assert.match(text(summary), /No reinforcement or stirrup weight data available/)
    assert.match(text(summary), /Total reinforcement weight\s+0\s+kg/)
  } finally { host.render(null, host.root) }
})

test('inline actions expose image, edit and delete using the latest record data', async () => {
  const { build } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default
  const stubs = {
    ToolTip: `import { h } from 'vue'; export default { render() { return h('div', this.$slots.default?.()) } }`,
    ModalBox: `import { h } from 'vue'; export default { props:['isOpen'], emits:['close'], render() { return this.isOpen ? h('div', {class:'test-modal'}, [this.$slots.default?.(), h('button', {class:'close-modal', onClick: () => this.$emit('close')}, 'close')]) : null } }`
  }
  const result = await build({
    configFile: false, root: process.cwd(), logLevel: 'silent', plugins: [{
      name: 'actions-test-stubs', enforce: 'pre',
      resolveId(id) { const name = Object.keys(stubs).find(n => id.endsWith('/' + n + '.vue')); if (name) return '\0control:' + name },
      load(id) { if (id.startsWith('\0control:')) return stubs[id.slice('\0control:'.length)] }
    }, vue()],
    build: { write: false, lib: { entry: resolve('src/renderer/src/components/OUTPUTS/Actions.vue'), formats: ['cjs'] }, rollupOptions: { external: ['vue'] } }
  })
  const Module = require('node:module')
  const compiled = new Module(resolve('tests/actions-component.cjs'), module)
  compiled.filename = resolve('tests/actions-component.cjs'); compiled.paths = module.paths
  compiled._compile(result[0].output.find(item => item.type === 'chunk').code, compiled.filename)
  const component = compiled.exports.default || compiled.exports
  const documentBefore = global.document
  global.document = { addEventListener() {}, removeEventListener() {} }
  const item = ref({ id: 10, name: 'First', imageUrl: 'old.png' })
  let edited, deleted
  const host = createHost()
  try {
    host.render(h({ setup: () => () => h(component, { inline: true, type: 'column', sectionDATA: item.value, onSendData: value => { edited = value }, onDeleteData: value => { deleted = value } }) }), host.root)
    await nextTick()
    const button = name => all(host.root, n => n.type === 'button' && text(n).includes(name))[0]
    assert.ok(button('Edit')); assert.ok(button('Delete')); assert.ok(button('Image'))
    item.value = { id: 10, name: 'Updated', imageUrl: 'updated.png' }
    await nextTick()
    button('Edit').props.onClick(); button('Delete').props.onClick(); button('Image').props.onClick()
    await nextTick()
    assert.equal(edited.name, 'Updated'); assert.equal(deleted, 10)
    assert.equal(all(host.root, n => n.type === 'img')[0].props.src, 'updated.png')
    all(host.root, n => n.props.class === 'close-modal')[0].props.onClick()
    await nextTick()
    item.value = { id: 10, name: 'No image', imageUrl: null }
    await nextTick()
    button('Image').props.onClick(); await nextTick()
    assert.match(text(host.root), /No image available/)
  } finally {
    host.render(null, host.root)
    global.document = documentBefore
  }
})

test('inline comments load and save against the column ID', async () => {
  const { build } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default
  const result = await build({
    configFile: false, root: process.cwd(), logLevel: 'silent', plugins: [{
      name: 'comment-api-stub', enforce: 'pre',
      resolveId(id) { if (id.endsWith('/useApi')) return '\0comment-api' },
      load(id) { if (id === '\0comment-api') return `export function useApi() { return { get: async (url, options) => { globalThis.commentTestCalls.push(['get', url, options]); return {id: 123, comment: 'Original', updated_at: ''} }, put: async (url, body) => { globalThis.commentTestCalls.push(['put', url, body]) } } }` }
    }, vue()],
    build: { write: false, lib: { entry: resolve('src/renderer/src/components/Dashboard/Comments.vue'), formats: ['cjs'] }, rollupOptions: { external: ['vue'] } }
  })
  const Module = require('node:module')
  const compiled = new Module(resolve('tests/comment-component.cjs'), module)
  compiled.filename = resolve('tests/comment-component.cjs'); compiled.paths = module.paths
  compiled._compile(result[0].output.find(item => item.type === 'chunk').code, compiled.filename)
  const component = compiled.exports.default || compiled.exports
  const documentBefore = global.document
  global.document = { addEventListener() {}, removeEventListener() {}, activeElement: null }
  global.commentTestCalls = []
  const host = createHost()
  try {
    host.render(h(component, { inline: true, type: 'column', typeid: 42 }), host.root)
    await nextTick()
    all(host.root, n => n.type === 'button' && n.props.class === 'comment-button')[0].props.onClick({ preventDefault() {} })
    await new Promise(resolve => setImmediate(resolve)); await nextTick()
    assert.deepEqual(global.commentTestCalls[0], ['get', '/api/get_comment', { params: { type: 'column', typeid: 42 } }])
    all(host.root, n => n.type === 'i' && n.props.class === 'm-compose')[0].props.onClick()
    await nextTick()
    const textarea = all(host.root, n => n.type === 'textarea')[0]
    textarea.value = 'Updated comment'
    textarea.listeners.input({ target: textarea })
    await nextTick()
    await textarea.props.onFocusout({ preventDefault() {} })
    assert.deepEqual(global.commentTestCalls[1], ['put', '/api/send_comment/123', { comment: 'Updated comment' }])
  } finally {
    host.render(null, host.root)
    global.document = documentBefore
    delete global.commentTestCalls
  }
})
