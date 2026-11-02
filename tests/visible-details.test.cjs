const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { resolve } = require('node:path')
const { parse: parseSfc } = require('@vue/compiler-sfc')
const { baseParse } = require('@vue/compiler-dom')

function descendants(node) {
  return [node, ...(node.children || []).flatMap(descendants)]
}
function hasClass(node, name) {
  return node.props?.some(p => p.type === 6 && p.name === 'class' && p.value?.content.split(/\s+/).includes(name))
}

test('reinforcement and stirrup details are visible without a toggle on every relevant page', () => {
  for (const name of ['Pile', 'Column', 'Beam', 'Footing', 'Slab', 'Lift-Share-Wall']) {
    const file = resolve(`src/renderer/src/pages/Exterior/${name}.vue`)
    const source = fs.readFileSync(file, 'utf8')
    const { descriptor, errors } = parseSfc(source)
    assert.deepEqual(errors, [], name)
    assert.doesNotMatch(source, /showDetails|toggleDetails|Details View|Hide Details/, name)
    if (name === 'Column') assert.doesNotMatch(source, /overall-calculation-heading|OVERALL \/ CURRENT SELECTION|<h2>CC calculation<\/h2>/i)
    const nodes = descendants(baseParse(descriptor.template.content))
    if (name !== 'Slab') {
      const result = nodes.find(n => n.tag === 'StructuralResults')
      assert.ok(result, name)
      const kind = { Pile: 'pile', Footing: 'footing', Beam: 'beam', 'Lift-Share-Wall': 'wall' }[name]
      if (kind) assert.ok(result.props.some(p => p.type === 6 && p.name === 'kind' && p.value?.content === kind), name)
      for (const event of ['edit', 'delete']) assert.ok(result.props.some(p => p.type === 7 && p.name === 'on' && p.arg?.content === event), `${name} ${event}`)
      assert.ok(nodes.some(n => n.tag === 'RCCCalculation'), name)
      assert.ok(nodes.some(n => n.tag === 'Graph'), name)
      if (name === 'Beam' || name === 'Column') assert.ok(nodes.some(n => n.tag === 'Tabs'), name)
      assert.ok(!result.props.some(p => p.type === 7 && ['if', 'show', 'for'].includes(p.name)), name)
      continue
    }
    const sections = nodes.filter(n => hasClass(n, 'expand-details'))
    assert.equal(sections.length, 1, name)
    const section = sections[0]
    assert.ok(!section.props.some(p => p.type === 7 && ['if', 'show', 'for'].includes(p.name)), name)
    assert.ok(descendants(section).some(n => n.tag === 'Reinforcements'), name)
    if (name !== 'Slab') assert.ok(descendants(section).some(n => n.tag === 'Stirrups'), name)
  }
})

test('stirrups heading appears for both empty and populated data', async () => {
  const { createServer } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default
  const { createSSRApp, h } = require('vue')
  const { renderToString } = require('@vue/server-renderer')
  const { createPinia } = await import('pinia')
  const server = await createServer({
    configFile: false, root: process.cwd(), plugins: [vue()], appType: 'custom',
    server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, include: [] }
  })
  try {
    const { default: Stirrups } = await server.ssrLoadModule(resolve('src/renderer/src/components/OUTPUTS/Stirrups.vue'))
    const render = stirrups => renderToString(createSSRApp({ render: () => h(Stirrups, { stirrups, projectName: [] }) }).use(createPinia()))
    const empty = await render([])
    assert.match(empty, /<legend>Stirrups<\/legend>/)
    assert.match(empty, /No stirrup data available/)
    const populated = await render([{ pileName: 'P1', stirrups: [{ diameter: 10, deduction: 100, weight: 2, total_ring: 4 }] }])
    assert.match(populated, /<legend>Stirrups<\/legend>/)
    assert.match(populated, /P1/)
    assert.match(populated, /10 mm/)
    assert.doesNotMatch(populated, /No stirrup data available/)
  } finally {
    await server.close()
  }
})
