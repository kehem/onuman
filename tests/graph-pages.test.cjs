const { test } = require('node:test')
const assert = require('node:assert/strict')
const { resolve } = require('node:path')
const { createRenderer, h, nextTick } = require('vue')

function createHost() {
  const node = (type, text = '') => ({ type, text, children: [], props: {}, parent: null })
  const root = node('root')
  const renderer = createRenderer({
    createElement: type => node(type), createText: text => node('text', text),
    createComment: text => node('comment', text),
    insertStaticContent: (content, parent, anchor) => {
      const n = node('static', content); n.parent = parent
      const index = anchor ? parent.children.indexOf(anchor) : -1
      if (index < 0) parent.children.push(n); else parent.children.splice(index, 0, n)
      return [n, n]
    },
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
function find(node, predicate) {
  if (predicate(node)) return node
  for (const child of node.children) { const result = find(child, predicate); if (result) return result }
}
const text = node => [node.text, ...node.children.map(text)].join(' ')
const flush = async () => { await new Promise(resolve => setImmediate(resolve)); await nextTick() }

const graphs = ['PILE', 'FOOTING', 'LIFT', 'COLUMN', 'BEAM', 'SLAB', 'BRICK', 'FINISH_WORK/PLASTER', 'FINISH_WORK/TILES']
test('every graph distinguishes HTTP errors from successful empty data and can retry', async () => {
  const { build } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default
  const Module = require('node:module')
  for (const graph of graphs) {
    const stubs = {
      useApi: `export function useApi() { return { get: (...args) => globalThis.__graphTest.get(...args) } }`,
      router: `import { ref } from 'vue'; export function useRouter() { return { currentRoute: ref({fullPath: '/?id=42'}) } }; export function useRoute() { return { query: { totalFloors: '3' } } }`,
      ChartComponent: `import {h} from 'vue'; export default { render() { return h('div', {class:'mock-chart'}) } }`,
      Tabs: `import {h} from 'vue'; export default { render() { return h('div') } }`
    }
    const result = await build({
      configFile: false, root: process.cwd(), logLevel: 'silent', plugins: [{
        name: 'graph-test-stubs', enforce: 'pre',
        resolveId(id) {
          if (id === 'vue-router') return '\0graph-test:router'
          const name = Object.keys(stubs).find(n => id.endsWith('/' + n) || id.endsWith('/' + n + '.vue'))
          if (name) return '\0graph-test:' + name
        },
        load(id) { if (id.startsWith('\0graph-test:')) return stubs[id.slice('\0graph-test:'.length)] }
      }, vue()],
      build: { write: false, lib: { entry: resolve(`src/renderer/src/components/OUTPUTS/${graph}/Graph.vue`), formats: ['cjs'] }, rollupOptions: { external: ['vue'] } }
    })
    const compiled = new Module(resolve('tests/graph-component.cjs'), module)
    compiled.filename = resolve('tests/graph-component.cjs'); compiled.paths = module.paths
    compiled._compile(result[0].output.find(item => item.type === 'chunk').code, compiled.filename)
    const component = compiled.exports.default || compiled.exports
    let calls = 0
    global.__graphTest = { get: async (url, options) => {
      assert.match(url, /\/graph/)
      assert.deepEqual(options, { suppressErrorToast: true })
      if (++calls === 1) throw { response: { status: 500 } }
      return { rcc: null, material_cost: [] }
    } }
    const host = createHost()
    try {
      host.render(h(component, { initialMainTab: 1, initialSubTab: 'short' }), host.root)
      await flush()
      assert.match(text(host.root), /Unable to Load Chart/, graph)
      assert.match(text(host.root), /HTTP 500/, graph)
      assert.doesNotMatch(text(host.root), /No Chart Data Available/, graph)
      const button = find(host.root, n => n.type === 'button')
      assert.ok(button, graph)
      button.props.onClick()
      await flush()
      assert.match(text(host.root), /No Chart Data Available/, graph)
      assert.doesNotMatch(text(host.root), /HTTP 500/, graph)
      assert.equal(calls, 2, graph)
    } finally {
      host.render(null, host.root)
    }
    const validHost = createHost()
    try {
      global.__graphTest = { get: async () => ({ rcc: { total_price_brick: 100 }, material_cost: [] }) }
      validHost.render(h(component, { initialMainTab: 1, initialSubTab: 'short' }), validHost.root)
      await flush()
      assert.ok(find(validHost.root, n => n.props.class === 'mock-chart'), graph)
      assert.doesNotMatch(text(validHost.root), /No Chart Data Available|Unable to Load Chart/, graph)
    } finally {
      validHost.render(null, validHost.root)
      delete global.__graphTest
    }
  }
})
