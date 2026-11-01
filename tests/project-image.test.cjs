const { test } = require('node:test')
const assert = require('node:assert/strict')
const { resolve } = require('node:path')
const { createRenderer, h, ref, nextTick } = require('vue')

function renderer() {
  const node = (type, text = '') => ({ type, text, children: [], props: {}, style: {}, parent: null })
  return {
    root: node('root'),
    ...createRenderer({
      createElement: (type) => node(type),
      createText: (text) => node('text', text),
      createComment: (text) => node('comment', text),
      setText: (n, text) => { n.text = text },
      setElementText: (n, text) => { n.text = text },
      parentNode: (n) => n.parent,
      nextSibling: (n) => n.parent?.children[n.parent.children.indexOf(n) + 1] || null,
      insert: (n, parent, anchor) => {
        if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1)
        n.parent = parent
        const index = anchor ? parent.children.indexOf(anchor) : -1
        if (index < 0) parent.children.push(n)
        else parent.children.splice(index, 0, n)
      },
      remove: (n) => {
        if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1)
        n.parent = null
      },
      patchProp: (n, key, _old, value) => { n.props[key] = value }
    })
  }
}

test('project image uses the Onuman fallback and preserves uploaded images', async () => {
  const { build } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default
  const result = await build({
    configFile: false,
    root: process.cwd(),
    plugins: [vue()],
    logLevel: 'silent',
    build: {
      write: false,
      lib: { entry: resolve('src/renderer/src/components/Dashboard/ProjectImage.vue'), formats: ['cjs'] },
      rollupOptions: { external: ['vue'] }
    }
  })
  const Module = require('node:module')
  const compiled = new Module(resolve('tests/project-image-component.cjs'), module)
  compiled.filename = resolve('tests/project-image-component.cjs')
  compiled.paths = module.paths
  compiled._compile(result[0].output.find((item) => item.type === 'chunk').code, compiled.filename)
  const component = compiled.exports.default || compiled.exports
  {
    const src = ref(null)
    const host = renderer()
    host.render(h({ setup: () => () => h(component, { src: src.value, alt: 'Example project' }) }), host.root)
    const img = host.root.children.find((n) => n.type === 'img')
    assert.ok(img)
    const fallback = img.props.src
    assert.ok(fallback)
    assert.equal(img.props.alt, 'Example project')
    assert.equal(img.props.style.objectFit, 'contain')
    img.props.onLoad()
    await nextTick()
    assert.notEqual(img.style.display, 'none')

    src.value = 'https://example.com/project.jpg'
    await nextTick()
    assert.equal(img.props.src, src.value)
    assert.equal(img.props.style, undefined)
    assert.equal(img.style.display, 'none')
    img.props.onLoad()
    await nextTick()
    assert.notEqual(img.style.display, 'none')

    // A broken URL shows the bundled fallback without changing project data.
    img.props.onError()
    await nextTick()
    assert.equal(src.value, 'https://example.com/project.jpg')
    assert.equal(img.props.src, fallback)
    img.props.onLoad()
    await nextTick()
    assert.notEqual(img.style.display, 'none')

    // Replacing an image retries the new URL after a failure.
    src.value = 'https://example.com/new.jpg'
    await nextTick()
    assert.equal(img.props.src, src.value)
    src.value = '   '
    await nextTick()
    assert.equal(img.props.src, fallback)
    img.props.onError()
    await nextTick()
    assert.notEqual(img.style.display, 'none')
  }
})
