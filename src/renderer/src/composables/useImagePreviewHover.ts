// src/composables/useImagePreviewHover.ts

import { onBeforeUnmount } from 'vue'

export type PreviewPosition = 'right' | 'left' | 'top' | 'bottom' | 'auto'

export function useImagePreviewHover() {
  let previewEl: HTMLDivElement | null = null
  let imgEl: HTMLImageElement | null = null
  let hideTimer: number | null = null

  const width = 320
  const margin = 12
  const transitionMs = 150

  function createPreviewDom() {
    if (previewEl) return

    previewEl = document.createElement('div')
    imgEl = document.createElement('img')

    Object.assign(previewEl.style, {
      position: 'fixed',
      display: 'none',
      opacity: '0',
      transform: 'scale(0.95)',
      transition: `opacity ${transitionMs}ms ease, transform ${transitionMs}ms ease`,
      zIndex: '9999',
      background: '#fff',
      border: '1px solid #ccc',
      borderRadius: '6px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      padding: '6px',
      pointerEvents: 'none',
      maxWidth: `${width}px`,
    })

    Object.assign(imgEl.style, {
      display: 'block',
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '4px',
    })

    previewEl.appendChild(imgEl)
    document.body.appendChild(previewEl)
  }

  function positionPreview(el: HTMLElement, pos: PreviewPosition) {
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const rightSpace = vw - rect.right
    const leftSpace = rect.left

    let top = 0
    let left = 0
    let transform = ''

    let finalPos = pos
    if (pos === 'auto') {
      finalPos = rightSpace >= width + margin ? 'right' : 'left'
    } else if (pos === 'right' && rightSpace < width + margin && leftSpace >= width + margin) {
      finalPos = 'left'
    } else if (pos === 'left' && leftSpace < width + margin && rightSpace >= width + margin) {
      finalPos = 'right'
    }

    switch (finalPos) {
      case 'right':
        top = rect.top + rect.height / 2
        left = rect.right + margin
        transform = 'translateY(-50%)'
        break
      case 'left':
        top = rect.top + rect.height / 2
        left = rect.left - margin - width
        transform = 'translateY(-50%)'
        break
      case 'top':
        top = rect.top - margin
        left = rect.left + rect.width / 2
        transform = 'translate(-50%, -100%)'
        break
      case 'bottom':
        top = rect.bottom + margin
        left = rect.left + rect.width / 2
        transform = 'translate(-50%, 0)'
        break
    }

    previewEl!.style.top = `${top}px`
    previewEl!.style.left = `${left}px`
    previewEl!.style.transform = `${transform} scale(1)`
  }

  function showPreview(e: MouseEvent, position: PreviewPosition = 'right') {
    createPreviewDom()
    const el = e.currentTarget as HTMLImageElement
    if (!el?.src) return

    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }

    imgEl!.src = el.src
    positionPreview(el, position)

    previewEl!.style.display = 'block'
    previewEl!.offsetHeight // force reflow
    previewEl!.style.opacity = '1'

    el.addEventListener('mouseleave', hidePreview, { passive: true })
  }

  function hidePreview() {
    if (!previewEl) return
    previewEl.style.opacity = '0'
    previewEl.style.transform += ' scale(0.95)'
    hideTimer = window.setTimeout(() => {
      previewEl!.style.display = 'none'
    }, transitionMs)
  }

  onBeforeUnmount(() => {
    if (previewEl?.parentNode) {
      previewEl.parentNode.removeChild(previewEl)
    }
    previewEl = null
    imgEl = null
  })

  return {
    showPreview,
  }
}
