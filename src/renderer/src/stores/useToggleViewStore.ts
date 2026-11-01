// stores/useToggleViewStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useToggleViewStore = defineStore('toggleView', () => {
    // State
    const currentView = ref<'detailed' | 'graph'>(
        (localStorage.getItem('currentView') as 'detailed' | 'graph') || 'graph'
    )

    // Actions
    const setView = (view: 'detailed' | 'graph') => {
        currentView.value = view
        localStorage.setItem('currentView', view)
    }

    const toggleView = (type: string) => {
        if (type === 'detailed' || type === 'graph') {
            setView(type)
        }
    }

    // Getters
    const isDetailedView = computed(() => currentView.value === 'detailed')
    const isGraphView = computed(() => currentView.value === 'graph')

    return {
        // State
        currentView,

        // Actions
        setView,
        toggleView,

        // Getters
        isDetailedView,
        isGraphView
    }
})