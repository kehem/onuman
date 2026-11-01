// src/stores/tabStore.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import router from '../router/Index'

export interface Tab {
    id: string
    title: string
    icon: string
    route: string
    isPinned: boolean
    isActive: boolean
    timestamp: number
    type: 'default' | 'project'
    projectName?: string
    projectId?: string
    isHomeTab?: boolean
}

export interface ClosedTab extends Tab {
    closedAt: number
}

const STORAGE_KEY = 'tab-store-state'
const MAX_CLOSED_TABS = 10
const HOME_TAB_ID = 'home-dashboard-tab'
const HOME_ROUTE_NAMES = ['Dashboard', 'Index', 'home'] as const
const EXCLUDED_ROUTE_NAMES = ['project', 'Profiles'] as const

export const useTabStore = defineStore('tabs', () => {
    // STATE
    const tabs = ref<Tab[]>([])
    const closedTabs = ref<ClosedTab[]>([])
    const currentRoute = ref<string>('')
    const isHydrated = ref(false)

    // -------------------------
    // HELPERS
    // -------------------------
    const limitClosedTabsHistory = () => {
        if (closedTabs.value.length > MAX_CLOSED_TABS) {
            closedTabs.value = closedTabs.value.slice(0, MAX_CLOSED_TABS)
        }
    }

    const pushClosedTab = (tab: Tab) => {
        closedTabs.value.unshift({ ...tab, closedAt: Date.now() })
        limitClosedTabsHistory()
    }

    const pushClosedTabs = (list: Tab[]) => {
        if (!list.length) return
        closedTabs.value.unshift(...list.map(t => ({ ...t, closedAt: Date.now() })))
        limitClosedTabsHistory()
    }

    const safeNavigate = (path: string) => {
        if (router.currentRoute.value.fullPath !== path) {
            router.push(path).catch(() => void 0)
        }
    }

    const activateHomeOrFirst = () => {
        const home = getHomeTab()
        if (home) setActiveTab(home.id)
        else if (tabs.value.length) setActiveTab(tabs.value[0].id)
    }

    // -------------------------
    // PERSISTENCE
    // -------------------------
    const saveToStorage = () => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                tabs: tabs.value,
                closedTabs: closedTabs.value,
                currentRoute: currentRoute.value
            }))
        } catch { }
    }

    const loadFromStorage = () => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY)
            if (!stored) return null
            return JSON.parse(stored)
        } catch { return null }
    }

    const hydrate = () => {
        const state = loadFromStorage()
        if (state) {
            tabs.value = state.tabs.map((tab: Tab) => ({ ...tab, isActive: false }))
            closedTabs.value = state.closedTabs || []
            currentRoute.value = state.currentRoute || ''
            if (tabs.value.length > 0) {
                tabs.value[0].isActive = true
            }
        }

        isHydrated.value = true
        setupAutoSave()
    }

    const setupAutoSave = () => {
        watch([tabs, closedTabs, currentRoute], saveToStorage, { deep: true })
    }

    // -------------------------
    // COMPUTED
    // -------------------------
    const activeTab = computed(() => tabs.value.find(tab => tab.isActive))
    const tabsCount = computed(() => tabs.value.length)
    const defaultTabs = computed(() => tabs.value.filter(tab => tab.type === 'default'))
    const projectTabs = computed(() => tabs.value.filter(tab => tab.type === 'project'))
    const sortedTabs = computed(() => {
        const rank = (t: Tab) => t.isHomeTab ? 0 : t.isPinned ? 1 : t.type === 'default' ? 2 : 3
        return [...tabs.value].sort((a, b) => rank(a) - rank(b) || a.timestamp - b.timestamp)
    })
    const canUndo = computed(() => closedTabs.value.length > 0)

    // -------------------------
    // UTILITY
    // -------------------------
    const isHomeRoute = (routeName: string) => HOME_ROUTE_NAMES.includes(routeName as any)
    const isExcludedRoute = (routeName: string) => EXCLUDED_ROUTE_NAMES.includes(routeName as any)
    const determineTabType = (_routeName: string, query: any) => query?.projectName || query?.id ? 'project' : 'default'
    const extractProjectInfo = (query: any) => ({ projectName: query?.projectName || '', projectId: query?.id || '' })
    const getHomeTab = () => tabs.value.find(tab => tab.isHomeTab)

    const generateTabTitle = (routeInfo: any, tabType: 'default' | 'project') => {
        const name = routeInfo.name as string || 'Untitled'
        if (tabType === 'project' && routeInfo.query?.projectName) {
            return `${routeInfo.query.projectName} - ${name}`
        }
        return name
    }

    const getRouteIcon = (routeName: string): string => {
        try {
            const r = router.getRoutes().find(rt => rt.name === routeName)
            if (r && r.meta?.icon) return r.meta.icon as string
            return 'm-tab1'
        } catch {
            return 'm-home'
        }
    }

    const getTabById = (tabId: string) => tabs.value.find(tab => tab.id === tabId)
    const getTabByRoute = (routePath: string) => tabs.value.find(tab => tab.route === routePath)
    const getProjectTab = (projectId: string, routePath: string) =>
        tabs.value.find(tab => tab.type === 'project' && tab.projectId === projectId && tab.route === routePath)
    const getTabsByProjectId = (projectId: string) =>
        tabs.value.filter(tab => tab.type === 'project' && tab.projectId === projectId)

    // -------------------------
    // TAB MANAGEMENT
    // -------------------------
    const ensureHomeTab = () => { if (!getHomeTab()) createHomeTab() }

    const createHomeTab = () => {
        tabs.value.forEach(t => t.isActive = false)
        const homeTab: Tab = { id: HOME_TAB_ID, title: '', icon: 'm-home', route: '/dashboard', isPinned: false, isActive: true, timestamp: Date.now(), type: 'default', isHomeTab: true }
        tabs.value.unshift(homeTab)
        currentRoute.value = homeTab.route
    }

    const createTab = (tabData: Omit<Tab, 'timestamp'>) => {
        if (tabData.isHomeTab) { ensureHomeTab(); return getHomeTab() && setActiveTab(HOME_TAB_ID) }
        const existing = tabs.value.find(t => t.route === tabData.route && !t.isHomeTab)
        if (existing) return setActiveTab(existing.id)
        tabs.value.forEach(t => t.isActive = false)
        const newTab: Tab = { ...tabData, timestamp: Date.now() }
        newTab.isHomeTab ? tabs.value.unshift(newTab) : tabs.value.push(newTab)
        currentRoute.value = newTab.route
        safeNavigate(newTab.route)
        return newTab
    }

    const createTabFromRoute = (route: RouteLocationNormalized) => {
        if (isHomeRoute(route.name as string)) { ensureHomeTab(); return getHomeTab() && setActiveTab(HOME_TAB_ID) }
        if (isExcludedRoute(route.name as string)) return safeNavigate(route.fullPath)
        const existing = getTabByRoute(route.fullPath)
        if (existing) return setActiveTab(existing.id)
        const tabType = determineTabType(route.name as string, route.query)
        const { projectName, projectId } = extractProjectInfo(route.query)
        return createTab({
            id: tabType === 'project'
                ? `project_${projectId}_${Date.now()}`
                : `default_${String(route.name)}_${Date.now()}`,
            title: generateTabTitle(route, tabType),
            icon: getRouteIcon(route.name as string),
            route: route.fullPath,
            isPinned: false,
            isActive: true,
            type: tabType,
            projectName: tabType === 'project' ? projectName : undefined,
            projectId: tabType === 'project' ? projectId : undefined,
            isHomeTab: false
        })
    }

    const setActiveTab = (tabId: string) => {
        const active = tabs.value.find(t => t.id === tabId)
        if (!active) return // <-- don't nuke active state if id is stale

        tabs.value.forEach(tab => (tab.isActive = tab.id === tabId))
        currentRoute.value = active.route
        safeNavigate(active.route)
    }


    const closeTab = (tabId: string) => {
        const index = tabs.value.findIndex(t => t.id === tabId)
        if (index === -1) return
        const tab = tabs.value[index]
        if (tab.isHomeTab) return
        pushClosedTab(tab)
        tabs.value.splice(index, 1)
        if (tab.isActive) activateHomeOrFirst()
    }

    const closeAllTabs = () => {
        const nonHome = tabs.value.filter(t => !t.isHomeTab)
        pushClosedTabs(nonHome)
        tabs.value = tabs.value.filter(t => t.isHomeTab)
        activateHomeOrFirst()
    }

    const toggleTabPin = (tabId: string) => {
        const tab = tabs.value.find(t => t.id === tabId)
        if (tab && !tab.isHomeTab) tab.isPinned = !tab.isPinned
    }

    const undoCloseTab = () => {
        const last = closedTabs.value.shift()
        if (!last || last.isHomeTab) { ensureHomeTab(); return }
        const { closedAt, ...data } = last
        createTab(data)
    }


    // -------------------------
    // PERSISTENCE ACTIONS
    // -------------------------
    const manualSave = saveToStorage
    const resetStore = () => {
        tabs.value = []
        closedTabs.value = []
        currentRoute.value = ''
        sessionStorage.removeItem(STORAGE_KEY) // <-- was localStorage
    }

    const exportTabs = () => JSON.stringify({ tabs: tabs.value, closedTabs: closedTabs.value, currentRoute: currentRoute.value }, null, 2)
    const importTabs = (jsonData: string) => {
        try {
            const data = JSON.parse(jsonData)
            if (!Array.isArray(data.tabs)) throw new Error('Invalid data')
            tabs.value = data.tabs
            closedTabs.value = data.closedTabs || []
            currentRoute.value = data.currentRoute || ''
            ensureHomeTab()
            saveToStorage()
            return true
        } catch { return false }
    }

    return {
        tabs, closedTabs, currentRoute, isHydrated,
        activeTab, tabsCount, defaultTabs, projectTabs, sortedTabs, canUndo,
        createTab, createTabFromRoute, setActiveTab, closeTab, closeAllTabs, toggleTabPin, undoCloseTab,
        getHomeTab, ensureHomeTab, createHomeTab,
        hydrate, manualSave, resetStore, exportTabs, importTabs,
        isHomeRoute, isExcludedRoute, determineTabType,
        getTabById, getTabByRoute, getProjectTab, getTabsByProjectId, generateTabTitle, getRouteIcon
    }
})
