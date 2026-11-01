// composables/useColumnResize.ts
import { ref, computed, onMounted, onUnmounted, nextTick, readonly, watch, type Ref } from 'vue'

interface UseColumnResizeOptions {
  initialLeftWidth?: number
  minWidth?: number
  maxWidth?: number
  storageKey?: string
  dividerWidth?: number
  dividerColor?: string
  dividerHoverColor?: string
  dividerActiveColor?: string
  showHandle?: boolean
  onResize?: (leftWidth: number, rightWidth: number) => void
}

interface ResizableLayout {
  container: Ref<HTMLElement | undefined>
  leftPanel: Ref<HTMLElement | undefined>
  rightPanel: Ref<HTMLElement | undefined>
  isDragging: Ref<boolean>
  leftWidth: Ref<number>
  rightWidth: Ref<number>
  resetWidth: () => void
  setWidth: (width: number) => void
}

export function useColumnResize(options: UseColumnResizeOptions = {}): ResizableLayout {
  const {
    initialLeftWidth = 20,
    minWidth = 10,
    maxWidth = 90,
    storageKey = 'column-left-width',
    dividerWidth = 3,
    dividerColor = '#3a3a3aff',
    dividerHoverColor = '#3b82f6',
    dividerActiveColor = '#3b82f6',
    showHandle = true,
    onResize
  } = options

  // Reactive refs
  const container = ref<HTMLElement>()
  const leftPanel = ref<HTMLElement>()
  const rightPanel = ref<HTMLElement>()
  const isDragging = ref(false)
  const leftWidth = ref(initialLeftWidth)
  const dividerElement = ref<HTMLElement>()

  // Computed values
  const rightWidth = computed(() => 100 - leftWidth.value)

  // Storage functions
  const saveToStorage = (width: number) => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, width.toString())
      } catch (error) {
        console.warn('Failed to save column width to localStorage:', error)
      }
    }
  }

  const loadFromStorage = (): number | null => {
    if (!storageKey) return null
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? parseFloat(saved) : null
    } catch (error) {
      console.warn('Failed to load column width from localStorage:', error)
      return null
    }
  }

  // Update panel widths
  const updatePanelWidths = () => {
    if (leftPanel.value) {
      leftPanel.value.style.width = `${leftWidth.value}%`
      leftPanel.value.style.flexShrink = '0'
    }
    if (rightPanel.value) {
      rightPanel.value.style.width = `${rightWidth.value}%`
      rightPanel.value.style.flexShrink = '0'
    }
  }

  // Create and inject divider element
  const createDivider = () => {
    if (!container.value || dividerElement.value) return

    const divider = document.createElement('div')
    divider.className = 'column-resize-divider'

    // Divider styles
    Object.assign(divider.style, {
      width: `${dividerWidth}px`,
      background: dividerColor,
      cursor: 'col-resize',
      position: 'relative',
      marginLeft: '-12px',
      flexShrink: '0',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1'
    })

    // Create handle if enabled
    if (showHandle) {
      const handle = document.createElement('div')
      handle.className = 'column-resize-handle'
      Object.assign(handle.style, {
        position: 'relative',
        width: '5px',
        height: '50px',
        background: '#2e82ffff',
        borderRadius: '4px',
        transition: 'background-color 0.2s ease',
        pointerEvents: 'none'
      })
      divider.appendChild(handle)
    }

    // Hover effects
    const handleMouseEnter = () => {
      divider.style.background = dividerHoverColor
      if (showHandle) {
        const handle = divider.querySelector('.column-resize-handle') as HTMLElement
        if (handle) handle.style.background = '#ffffff'
      }
    }

    const handleMouseLeave = () => {
      if (!isDragging.value) {
        divider.style.background = dividerColor
        if (showHandle) {
          const handle = divider.querySelector('.column-resize-handle') as HTMLElement
          if (handle) handle.style.background = '#9ca3af'
        }
      }
    }

    divider.addEventListener('mouseenter', handleMouseEnter)
    divider.addEventListener('mouseleave', handleMouseLeave)
    divider.addEventListener('mousedown', startDragging)

    // Insert divider between left and right panels
    if (leftPanel.value && rightPanel.value) {
      container.value.insertBefore(divider, rightPanel.value)
    }

    dividerElement.value = divider
  }

  // Apply container styles
  const setupContainer = () => {
    if (!container.value) return

    Object.assign(container.value.style, {
      display: 'flex',
      position: 'relative',
      width: '100%',
      gap: '0'
    })
  }

  // Drag handling
  const startDragging = (event: MouseEvent) => {
    if (!container.value || !dividerElement.value) return

    isDragging.value = true

    // Update divider appearance
    dividerElement.value.style.background = dividerActiveColor
    if (showHandle) {
      const handle = dividerElement.value.querySelector('.column-resize-handle') as HTMLElement
      if (handle) handle.style.background = '#ffffff'
    }

    // Set global cursor and prevent text selection
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.body.classList.add('dragging-columns')

    const containerRect = container.value.getBoundingClientRect()
    const containerWidth = containerRect.width

    const handleMouseMove = (e: MouseEvent) => {
      if (!container.value) return

      const mouseX = e.clientX - containerRect.left
      const newLeftWidth = (mouseX / containerWidth) * 100

      // Constrain within min/max bounds
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newLeftWidth))
      leftWidth.value = constrainedWidth

      updatePanelWidths()
      onResize?.(constrainedWidth, 100 - constrainedWidth)
    }

    const handleMouseUp = () => {
      isDragging.value = false

      // Reset divider appearance
      if (dividerElement.value) {
        dividerElement.value.style.background = dividerColor
        if (showHandle) {
          const handle = dividerElement.value.querySelector('.column-resize-handle') as HTMLElement
          if (handle) handle.style.background = '#9ca3af'
        }
      }

      // Reset global styles
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.body.classList.remove('dragging-columns')

      // Save to storage
      saveToStorage(leftWidth.value)

      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Prevent default to avoid text selection
    event.preventDefault()
  }

  // Reset to initial width
  const resetWidth = () => {
    leftWidth.value = initialLeftWidth
    updatePanelWidths()
    saveToStorage(initialLeftWidth)
    onResize?.(initialLeftWidth, 100 - initialLeftWidth)
  }

  // Set specific width
  const setWidth = (width: number) => {
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, width))
    leftWidth.value = constrainedWidth
    updatePanelWidths()
    saveToStorage(constrainedWidth)
    onResize?.(constrainedWidth, 100 - constrainedWidth)
  }

  // Initialize layout
  const initializeLayout = async () => {
    await nextTick()

    if (!container.value || !leftPanel.value || !rightPanel.value) {
      console.warn('useColumnResize: Container and panels must be provided')
      return
    }

    // Load saved width
    const savedWidth = loadFromStorage()
    if (savedWidth !== null && savedWidth >= minWidth && savedWidth <= maxWidth) {
      leftWidth.value = savedWidth
    }

    setupContainer()
    createDivider()
    updatePanelWidths()
  }

  // Store watcher stop function
  let stopWatcher: (() => void) | null = null

  // Watch for changes and update
  const setupWatcher = () => {
    // Watch for width changes and update panels
    stopWatcher = watch(
      leftWidth,
      () => {
        updatePanelWidths()
      },
      { immediate: true }
    )
  }

  // Lifecycle management
  onMounted(() => {
    initializeLayout()
    setupWatcher()
  })

  onUnmounted(() => {
    // Stop watcher
    if (stopWatcher) {
      stopWatcher()
    }

    // Clean up any remaining drag state
    if (isDragging.value) {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.body.classList.remove('dragging-columns')
    }

    // Save current width
    saveToStorage(leftWidth.value)

    // Remove divider element
    if (dividerElement.value && dividerElement.value.parentNode) {
      dividerElement.value.parentNode.removeChild(dividerElement.value)
    }
  })

  return {
    container,
    leftPanel,
    rightPanel,
    isDragging: readonly(isDragging),
    leftWidth: readonly(leftWidth),
    rightWidth,
    resetWidth,
    setWidth
  }
}

// Helper function for even simpler usage
export function useSimpleColumnResize(storageKey?: string, initialWidth = 25) {
  return useColumnResize({
    initialLeftWidth: initialWidth,
    storageKey: storageKey || 'simple-column-width',
    minWidth: 10,
    maxWidth: 90
  })
}
