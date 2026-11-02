const { test } = require('node:test')
const assert = require('node:assert/strict')
const { resolve } = require('node:path')
const { createRenderer, h, nextTick, ref } = require('vue')

function createHost() {
  const node = (type, text = '') => ({ type, text, children: [], props: {}, parent: null })
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
    assert.match(text(host.root), /46\.81/); assert.match(text(host.root), /26\s+Kg/)
    assert.match(text(host.root), /Total volume\s+2\.00\s+ft/); assert.match(text(host.root), /Total dry volume\s+3\.08\s+ft/)
    const comments = all(host.root, n => n.props.class === 'comment')
    assert.deepEqual(comments.map(n => n.props['data-id']), [1, 2, 3])
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
