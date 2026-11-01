<!-- components/Dashboard/TABS.vue -->
<template>
    <section class="tab-managements-container">
        <!-- LOADING STATE -->
        <div v-if="!tabStore.isHydrated" class="tab-loading">
            <i class="m-loading"></i>
            <span>Loading tabs...</span>
        </div>
        <section v-else class="tab-managements">
            <!-- BACKWARD AND FORWARD -->
            <ul class="fixed-tabs">
                <li :class="['tab', 'nav-tab', 'nav-back', { disabled: !canGoBack || isExcludedRoute }]" 
                    title="Go Back" @click="navigateBackward">
                    <i class="m-arrow-long-left nav-icon"></i>
                </li>
                <li :class="['tab', 'shortcut-li', 'nav-tab', 'nav-forward', { disabled: !canGoForward }]" 
                    title="Go Forward" @click="navigateForward">
                    <i class="m-arrow-long-right nav-icon"></i>
                </li>
            </ul>
            
            <!-- DYNAMIC TABS CONTAINER -->
            <ul class="tabs-container" ref="tabsContainerRef">

                <!-- HOME TAB (ALWAYS FIRST) -->
                <li v-if="homeTab" :class="['tab', 'home-tab', {
                    active: homeTab.isActive,
                    pinned: homeTab.isPinned
                }]" @click="switchToTab(homeTab.id)" @contextmenu.prevent="showTabContextMenu($event, homeTab)"
                    :title="getTabTooltip(homeTab)">

                    <!-- HOME TAB ICON -->
                    <i :class="[homeTab.icon, 'title-icon']"></i>

                    <!-- HOME TAB TITLE -->
                    <p>{{ homeTab.title }}</p>

                    <!-- NO CLOSE BUTTON FOR HOME TAB -->
                    <!-- PIN INDICATOR FOR HOME TAB IF PINNED -->
                    <i v-if="homeTab.isPinned" class="m-pin2 pin-indicator" title="Pinned Tab"></i>
                </li>

                <!-- RENDER SORTED NON-HOME TABS -->
                <li v-for="tab in sortedNonHomeTabs" :key="tab.id" :class="['tab', {
                    active: tab.isActive,
                    pinned: tab.isPinned,
                    'default-tab': tab.type === 'default',
                    'project-tab': tab.type === 'project'
                }]" @click="switchToTab(tab.id)" @mousedown.middle="closeTab(tab.id)"
                    @contextmenu.prevent="showTabContextMenu($event, tab)" :title="getTabTooltip(tab)">

                    <!-- TAB ICON -->
                    <i :class="[tab.icon, 'title-icon']"></i>

                    <!-- TAB TITLE -->
                    <p>{{ tab.title }}</p>

                    <!-- CLOSE BUTTON (HIDDEN FOR PINNED TABS) -->
                    <i v-if="!tab.isPinned" class="m-x1 cross-btn" @click.stop="closeTab(tab.id)"></i>

                    <!-- PIN INDICATOR FOR PINNED TABS -->
                    <i v-if="tab.isPinned" class="m-pin2 pin-indicator" title="Pinned Tab"></i>
                </li>

                <!-- ADD NEW TAB BUTTON -->
                <i class="m-plus3 add-new-tab add-tab-btn" title="Go to Home Tab (Ctrl+T)" @click="forwardToHomeTab"></i>

            </ul>
            <!-- ENHANCED CONTEXT MENU -->
            <TabContextMenu :is-open="isOpen" :modal-ref="modalRef" @close="closeModal"
                @action="handleContextMenuAction" />
        </section>


    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TabContextMenu from './TabContextMenu.vue'
import { useModal } from '../../composables/useModal'
import { Tab, useTabStore } from '../../stores/tabStore'

// COMPOSABLES
const router = useRouter()
const route = useRoute()
const tabStore = useTabStore()

// EXCLUDED ROUTES FOR NAVIGATION
const EXCLUDED_ROUTES = [
    'Index',
    'License', 
    'PrivacyPolicy',
    'CompanyInfo',
    'welcome'
]

// NAVIGATION STATE
const canGoBack = ref(false)
const canGoForward = ref(false)

// MODAL COMPOSABLE
const {
    isOpen,
    modalRef,
    closeModal
} = useModal()

// COMPUTED PROPERTIES
const hasActiveTabs = computed(() => tabStore.tabsCount > 0)
const defaultTabs = computed(() => tabStore.defaultTabs)
const projectTabs = computed(() => tabStore.projectTabs)

// Check if current route is excluded from navigation
const isExcludedRoute = computed(() => {
    const routeName = route.name as string
    return EXCLUDED_ROUTES.includes(routeName)
})

// FORWARD "NEW TAB" TO HOME TAB
const forwardToHomeTab = () => {
    const home = homeTab.value
    if (home) {
        switchToTab(home.id)
    } else {
        // Safety: if home tab doesn't exist, ensure it
        tabStore.ensureHomeTab()
        const ensured = tabStore.getHomeTab()
        if (ensured) {
            switchToTab(ensured.id)
        }
    }
}

// NAVIGATION METHODS
const updateNavigationState = async () => {
    try {
        if (window.electronAPI?.canNavigateBackward && window.electronAPI?.canNavigateForward) {
            canGoBack.value = await window.electronAPI.canNavigateBackward()
            canGoForward.value = await window.electronAPI.canNavigateForward()
        }
    } catch (error) {
        console.error('Error updating navigation state:', error)
        canGoBack.value = false
        canGoForward.value = false
    }
}

const navigateBackward = async () => {
    try {
        // Don't allow backward navigation on excluded routes
        if (isExcludedRoute.value) {
            console.warn('Cannot navigate backward from excluded route')
            return
        }

        if (!canGoBack.value) {
            console.warn('Cannot navigate backward - no history')
            return
        }

        if (window.electronAPI?.navigateBackward) {
            const result = await window.electronAPI.navigateBackward()
            if (result) {
                // Update navigation state after successful navigation
                setTimeout(updateNavigationState, 100)
            }
        }
    } catch (error) {
        console.error('Error navigating backward:', error)
    }
}

const navigateForward = async () => {
    try {
        if (!canGoForward.value) {
            console.warn('Cannot navigate forward - no history')
            return
        }

        if (window.electronAPI?.navigateForward) {
            const result = await window.electronAPI.navigateForward()
            if (result) {
                // Update navigation state after successful navigation
                setTimeout(updateNavigationState, 100)
            }
        }
    } catch (error) {
        console.error('Error navigating forward:', error)
    }
}

// HOME TAB (DASHBOARD/HOME TAB)
const homeTab = computed(() => tabStore.getHomeTab())

// SORTED NON-HOME TABS (PINNED FIRST, THEN OTHERS)
const sortedNonHomeTabs = computed(() => {
    const nonHomeTabs = tabStore.sortedTabs.filter(tab => !tab.isHomeTab)

    // Sort: pinned tabs first, then regular tabs
    const pinnedTabs = nonHomeTabs.filter(tab => tab.isPinned)
        .sort((a, b) => a.timestamp - b.timestamp)

    const regularTabs = nonHomeTabs.filter(tab => !tab.isPinned)
        .sort((a, b) => a.timestamp - b.timestamp)

    return [...pinnedTabs, ...regularTabs]
})

// TAB ACTIONS WITH ENHANCED ERROR HANDLING
const switchToTab = async (tabId: string) => {
    try {
        const tab = tabStore.getTabById(tabId)
        if (!tab) {
            console.warn(`Tab with ID ${tabId} not found`)
            return
        }

        tabStore.setActiveTab(tabId)

        // Navigate to tab route if different from current
        if (route.fullPath !== tab.route) {
            await router.push(tab.route)
        }
    } catch (error) {
        console.error('Failed to switch to tab:', error)
    }
}

const closeTab = (tabId: string) => {
    try {
        const tab = tabStore.getTabById(tabId)
        if (!tab) {
            return
        }

        // Prevent closing home tab
        if (tab.isHomeTab) {
            return
        }

        // Prevent closing pinned tabs
        if (tab.isPinned) {
            console.warn('Cannot close pinned tab')
            return
        }

        // Prevent closing last tab when no other tabs exist
        const totalTabs = tabStore.tabsCount
        const defaultTabsCount = defaultTabs.value.length
        const projectTabsCount = projectTabs.value.length

        if (totalTabs <= 1) {
            console.warn('Cannot close the last tab')
            return
        }

        // Special case: If closing the last default tab and only project tabs remain
        if (tab.type === 'default' && defaultTabsCount <= 1 && projectTabsCount === 0) {
            console.warn('Cannot close the last default tab when no project tabs exist')
            return
        }

        tabStore.closeTab(tabId)

        // Navigate to new active tab
        const newActiveTab = tabStore.activeTab
        if (newActiveTab && route.fullPath !== newActiveTab.route) {
            router.push(newActiveTab.route).catch(console.error)
        }
    } catch (error) {
        console.error('Failed to close tab:', error)
    }
}

// TAB CONTEXT MENU
const showTabContextMenu = (_event: MouseEvent, tab: Tab) => {
    // You can implement a tab-specific context menu here
    console.log('Right-clicked on tab:', tab)
}

const handleContextMenuAction = (action: string, data?: any) => {
    try {
        switch (action) {
            case 'closeAll':
                tabStore.closeAllTabs()
                break
            case 'closeOthers':
                // Implementation for closing other tabs
                break
            case 'pinTab':
                if (data?.tabId) {
                    tabStore.toggleTabPin(data.tabId)
                }
                break
            case 'exportTabs':
                exportTabsToFile()
                break
            case 'importTabs':
                importTabsFromFile()
                break
            default:
                console.warn(`Unknown context menu action: ${action}`)
        }
    } catch (error) {
        console.error(`Failed to execute context menu action ${action}:`, error)
    }
}

// TAB TOOLTIP GENERATOR WITH ENHANCED INFO
const getTabTooltip = (tab: Tab): string => {
    const parts: string[] = []

    // Add title
    parts.push(tab.title)

    // Add home tab indicator
    if (tab.isHomeTab) {
        parts.push(`🏠 Home Tab`)
    } else {
        // Add tab type with emoji
        if (tab.type === 'project') {
            parts.push(`🗂️ Project Tab`)
            if (tab.projectName) {
                parts.push(`Project: ${tab.projectName}`)
            }
        } else {
            parts.push(`📄 Default Tab`)
        }
    }

    // Add pin status
    if (tab.isPinned) {
        parts.push('📌 Pinned')
    }

    // Add timestamp info (not for home tab)
    if (!tab.isHomeTab) {
        const timeAgo = getTimeAgo(tab.timestamp)
        parts.push(`Created: ${timeAgo}`)
    }

    // Add keyboard shortcut hint
    const allTabs = homeTab.value ? [homeTab.value, ...sortedNonHomeTabs.value] : sortedNonHomeTabs.value
    const tabIndex = allTabs.findIndex(t => t.id === tab.id)
    if (tabIndex < 9) {
        const shortcut = navigator.platform.includes('Mac')
            ? `⌘${tabIndex + 1}`
            : `Ctrl+${tabIndex + 1}`
        parts.push(`Shortcut: ${shortcut}`)
    }

    // Add middle-click hint (not for home tab)
    if (!tab.isHomeTab) {
        parts.push('Middle-click to close')
    }

    return parts.join('\n')
}

// UTILITY FUNCTIONS
const getTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
}

// FILE IMPORT/EXPORT FUNCTIONS
const exportTabsToFile = () => {
    try {
        const tabsData = tabStore.exportTabs()
        const blob = new Blob([tabsData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = `tabs-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Failed to export tabs:', error)
    }
}

const importTabsFromFile = () => {
    try {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'

        input.onchange = (event: Event) => {
            const target = event.target as HTMLInputElement
            const file = target.files?.[0]

            if (!file) return

            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string
                    const success = tabStore.importTabs(content)

                    if (success) {
                        console.log('Tabs imported successfully')
                        // Optionally show a success notification
                    } else {
                        console.error('Failed to import tabs')
                        // Optionally show an error notification
                    }
                } catch (error) {
                    console.error('Error reading file:', error)
                }
            }
            reader.readAsText(file)
        }

        input.click()
    } catch (error) {
        console.error('Failed to import tabs:', error)
    }
}

// ROUTE CHANGE HANDLING WITH IMPROVED LOGIC
const handleRouteChange = async () => {
    try {
        // Wait for hydration to complete
        if (!tabStore.isHydrated) {
            return
        }

        const currentRoute = route.fullPath
        const routeName = route.name as string

        // Check if it's a home route
        if (tabStore.isHomeRoute(routeName)) {
            // Ensure home tab exists and is active
            tabStore.ensureHomeTab()
            const homeTabData = tabStore.getHomeTab()
            if (homeTabData) {
                tabStore.setActiveTab(homeTabData.id)
            }
            return
        }

        // Skip excluded routes for default tabs
        if (tabStore.isExcludedRoute(routeName)) {
            return
        }

        // Determine tab type
        const tabType = tabStore.determineTabType(routeName, route.query)

        if (tabType === 'project') {
            const projectId = route.query?.id as string

            // Check if ANY tab exists for this project and route
            const existingProjectTab = tabStore.getProjectTab(projectId, currentRoute)

            if (existingProjectTab) {
                // Tab exists, just activate it
                tabStore.setActiveTab(existingProjectTab.id)
                return
            }

            // Check if any tab exists for this project (different route)
            const existingProjectTabs = tabStore.getTabsByProjectId(projectId)

            if (existingProjectTabs.length > 0) {
                // Update existing project tab
                const existingTab = existingProjectTabs[0]
                const newTitle = tabStore.generateTabTitle(route, tabType)
                const newIcon = tabStore.getRouteIcon(routeName)

                existingTab.route = currentRoute
                existingTab.title = newTitle
                existingTab.icon = newIcon
                tabStore.setActiveTab(existingTab.id)
                return
            }
        } else {
            // For default tabs, check by route
            const existingTab = tabStore.getTabByRoute(currentRoute)
            if (existingTab) {
                tabStore.setActiveTab(existingTab.id)
                return
            }
        }

        // Create new tab if none exists
        tabStore.createTabFromRoute(route)
    } catch (error) {
        console.error('Error handling route change:', error)
    }
}

// INITIALIZE TAB FOR CURRENT ROUTE
const initializeCurrentRouteTab = async () => {
    try {
        const routeName = route.name as string

        // Check if it's a home route
        if (tabStore.isHomeRoute(routeName)) {
            tabStore.ensureHomeTab()
            const homeTabData = tabStore.getHomeTab()
            if (homeTabData) {
                tabStore.setActiveTab(homeTabData.id)
            }
            return
        }

        // Skip excluded routes
        if (tabStore.isExcludedRoute(routeName)) {
            return
        }

        // Create tab from current route
        tabStore.createTabFromRoute(route)
    } catch (error) {
        console.error('Error initializing current route tab:', error)
    }
}


// VISIBILITY CHANGE HANDLER (for saving when page becomes hidden)
const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
        // Save tabs when page becomes hidden
        tabStore.manualSave()
    }
}

// BEFORE UNLOAD HANDLER (for saving before page unload)
const handleBeforeUnload = () => {
    tabStore.manualSave()
}

// COMPONENT OPTIONS
defineOptions({
    inheritAttrs: false
})




// SCROLL ON WHEEL
const tabsContainerRef = ref<HTMLElement | null>(null)

const handleWheelScroll = (event: WheelEvent) => {
    if (!tabsContainerRef.value) return

    // Only move horizontally, prevent vertical scrolling
    event.preventDefault()
    tabsContainerRef.value.scrollLeft += event.deltaY
}

onMounted(() => {
    if (tabsContainerRef.value) {
        tabsContainerRef.value.addEventListener('wheel', handleWheelScroll, { passive: false })
    }
})

onBeforeUnmount(() => {
    if (tabsContainerRef.value) {
        tabsContainerRef.value.removeEventListener('wheel', handleWheelScroll)
    }
})

// LIFECYCLE HOOKS
onMounted(async () => {
    try {
        // Wait for tab store hydration
        if (!tabStore.isHydrated) {
            await tabStore.hydrate()
        }

        // Wait for next tick to ensure DOM is ready
        await nextTick()

        // Ensure home tab exists
        tabStore.ensureHomeTab()

        // Initialize tab for current route if needed
        if (!hasActiveTabs.value) {
            await initializeCurrentRouteTab()
        } else {
            // Handle current route
            await handleRouteChange()
        }

        // Update navigation state
        await updateNavigationState()

        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Add before unload listener
        window.addEventListener('beforeunload', handleBeforeUnload)

    } catch (error) {
        console.error('Error during component mounting:', error)
    }
})

onBeforeUnmount(() => {
    // Clean up event listeners
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('beforeunload', handleBeforeUnload)

    // Final save before unmounting
    tabStore.manualSave()
})

// WATCH ROUTE CHANGES WITH ERROR HANDLING
watch(
    () => route.fullPath,
    async (newPath, oldPath) => {
        if (newPath !== oldPath) {
            await nextTick()
            await handleRouteChange()
            // Update navigation state when route changes
            await updateNavigationState()
        }
    },
    { immediate: false }
)

// WATCH FOR TAB STORE HYDRATION
watch(
    () => tabStore.isHydrated,
    async (isHydrated) => {
        if (isHydrated) {
            await nextTick()
            // Ensure home tab exists
            tabStore.ensureHomeTab()
            if (!hasActiveTabs.value) {
                await initializeCurrentRouteTab()
            }
        }
    }
)
</script>
