// src/plugins/tabPlugin.ts
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { useTabStore } from '../stores/tabStore'

// EXCLUDED ROUTES THAT SHOULD NOT CREATE TABS
const EXCLUDED_ROUTES = [
    'Index',
    'License',
    'PrivacyPolicy',
    'CompanyInfo',
    'welcome',
    'FileShare',
    'Dashboard',
    'addNewProject',
    'chat',
    'reports',
    'Materials',
]

export interface TabPluginOptions {
    router: Router
}

export default {
    install(app: App, options: TabPluginOptions) {
        const { router } = options

        if (!router) {
            throw new Error('Router is required for tab plugin')
        }

        // SETUP ROUTER NAVIGATION GUARDS
        router.beforeEach((to, _from, next) => {
            const routeName = typeof to.name === 'string' ? to.name : ''
            if (EXCLUDED_ROUTES.includes(routeName)) {
                next()
                return
            }
            next()
        })

        // SETUP LINK CLICK HANDLERS FOR NEW TAB CREATION
        setupLinkHandlers(app, router)
    }
}


// SETUP LINK CLICK HANDLERS FOR CTRL+CLICK NEW TAB CREATION
function setupLinkHandlers(app: App, router: Router) {
    app.config.globalProperties.$handleLinkClick = (event: MouseEvent, to: string) => {
        if (event.ctrlKey || event.metaKey) {
            router.beforeEach((to, _from, next) => {
                const tabStore = useTabStore()
                const routeName = typeof to.name === 'string' ? to.name : ''

                // Skip excluded routes
                if (EXCLUDED_ROUTES.includes(routeName)) {
                    next()
                    return
                }

                // Optionally create a tab for non-excluded route
                tabStore.createTabFromRoute(to)
                next()
            })

            router.push({ path: to, query: { newTab: 'true' } })
            event.preventDefault()
        }
    }
}
