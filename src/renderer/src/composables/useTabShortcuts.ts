// src/composables/useTabShortcuts.ts
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTabStore } from '../stores/tabStore'

export function useTabShortcuts() {
  const router = useRouter()
  const tabStore = useTabStore()

  // DETECT OS FOR CORRECT MODIFIER KEY
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  const modifierKey = isMac ? 'metaKey' : 'ctrlKey'

  // ✅ CREATE NEW TAB → FORWARD TO HOME TAB
  const createNewTab = () => {
    tabStore.ensureHomeTab()
    const homeTab = tabStore.getHomeTab()
    if (homeTab) {
      tabStore.setActiveTab(homeTab.id)
      router.push(homeTab.route)
    } else {
      console.warn('Home tab could not be ensured')
    }
  }

  // CLOSE CURRENT ACTIVE TAB
  const closeCurrentTab = () => {
    const activeTab = tabStore.activeTab
    if (!activeTab) return

    // PREVENT CLOSING IF IT'S THE ONLY TAB OR HOME TAB
    if (tabStore.tabsCount === 1 || activeTab.isHomeTab) {
      console.warn('Cannot close the last tab or home tab')
      return
    }

    tabStore.closeTab(activeTab.id)

    // Navigate to new active tab
    const newActiveTab = tabStore.activeTab
    if (newActiveTab) {
      router.replace(newActiveTab.route)
    } else {
      // fallback → go to home
      createNewTab()
    }
  }

  // UNDO LAST CLOSED TAB
  const undoCloseTab = () => {
    if (!tabStore.canUndo) return
    tabStore.undoCloseTab()
    navigateToActiveTab()
  }

  // CLOSE ALL TABS → GO TO HOME TAB
  const closeAllTabs = () => {
    tabStore.closeAllTabs()
    createNewTab()
  }


  // NAVIGATE TO CURRENTLY ACTIVE TAB
  const navigateToActiveTab = () => {
    const activeTab = tabStore.activeTab
    if (activeTab && router.currentRoute.value.fullPath !== activeTab.route) {
      router.push(activeTab.route)
    }
  }

  // KEYBOARD SHORTCUTS HANDLER
  const handleKeydown = (event: KeyboardEvent) => {
    if (!event[modifierKey as keyof KeyboardEvent]) return

    switch (event.key.toLowerCase()) {
      // Ctrl/Cmd + T → Forward to Home tab
      case 't':
        if (!event.shiftKey) {
          event.preventDefault()
          createNewTab()
        } else {
          // Ctrl+Shift+T → Undo close tab
          event.preventDefault()
          undoCloseTab()
        }
        break

      // Ctrl/Cmd + W → Close current tab
      case 'w':
        if (!event.shiftKey) {
          event.preventDefault()
          closeCurrentTab()
        } else {
          // Ctrl+Shift+W → Close all → go Home
          event.preventDefault()
          closeAllTabs()
        }
        break

      // Ctrl/Cmd + → Next tab
      case 'arrowright':
        event.preventDefault()
        navigateToActiveTab()
        break

      // Ctrl/Cmd + ← Previous tab
      case 'arrowleft':
        event.preventDefault()
        navigateToActiveTab()
        break
    }
  }

  // LIFECYCLE HOOKS
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    // ACTIONS
    createNewTab,
    closeCurrentTab,
    undoCloseTab,
    closeAllTabs,

    // UTILITY
    isMac,
    modifierKey
  }
}
