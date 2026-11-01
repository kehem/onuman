<!-- src/components/TabContextMenu.vue -->
<template>
  <aside class="fixed-button">
    <div class="right-action" title="Tab Options">
      <!-- TRIGGER: Add ref and click handler -->
      <i ref="triggerRef" class="m-dots-three-vertical" @click="toggleModal"></i>

      <ul ref="modalRef" class="open-action-modal" :class="{ 'is-open': isOpen }" v-show="isOpen">
        <!-- PIN/UNPIN CURRENT TAB -->
        <li @click="togglePinCurrentTab">
          <i :class="currentTabPinned ? 'm-pin-off' : 'm-pin2'"></i>
          <p>{{ currentTabPinned ? 'Unpin Current Tab' : 'Pin Current Tab' }}</p>
        </li>

        <!-- DUPLICATE CURRENT TAB -->
        <!-- <li @click="duplicateCurrentTab" class="no-border">
          <i class="m-copy"></i>
          <p>Duplicate Tab</p>
        </li> -->

        <!-- SEPARATOR -->
        <li class="separator"></li>

        <!-- CLOSE CURRENT TAB -->
        <li @click="closeCurrentTab" :class="{ disabled: tabsCount <= 1 }">
          <i class="m-x1"></i>
          <p>Close Tab</p>
        </li>

        <!-- CLOSE ALL TABS -->
        <li @click="closeAllTabs">
          <i class="m-tab1"></i>
          <p>Close All Tabs</p>
        </li>

        <!-- CLOSE OTHER TABS -->
        <li @click="closeOtherTabs" :class="{ disabled: tabsCount <= 1 }" class="no-border">
          <i class="m-tab-close"></i>
          <p>Close Other Tabs</p>
        </li>

        <!-- SEPARATOR -->
        <li class="separator"></li>

        <!-- UNDO CLOSE TAB -->
        <!-- <li @click="undoCloseTab" :class="{ disabled: !canUndo }" class="no-border">
          <i class="m-undo"></i>
          <p>Undo Close Tab</p> <i class="m-chevron-right"></i>
          <span v-if="canUndo && lastClosedTabTitle" class="shortcut">{{ lastClosedTabTitle }}</span>
        </li> -->


        <!-- NEW TAB -->
        <li @click="createNewTab">
          <i class="m-plus3"></i>
          <p>New Tab</p> <i class="m-chevron-right"></i>
          <span class="shortcut">{{ isMac ? '⌘T' : 'Ctrl+T' }}</span>
        </li>

        <!-- REFRESH TAB -->
        <!-- <li @click="refreshCurrentTab" class="no-border">
          <i class="m-refresh"></i>
          <p>Refresh Tab</p>
        </li> -->

        <!-- SEPARATOR -->
        <li class="separator"></li>

        <!-- MOVE TAB LEFT -->
        <li @click="moveTabLeft" :class="{ disabled: !canMoveLeft }">
          <i class="m-arrow-left"></i>
          <p>Move Tab Left</p>
        </li>

        <!-- MOVE TAB RIGHT -->
        <li @click="moveTabRight" :class="{ disabled: !canMoveRight }" class="no-border">
          <i class="m-arrow-right"></i>
          <p>Move Tab Right</p>
        </li>
        <!-- TAB SETTINGS -->
        <!-- <li @click="openTabSettings">
          <i class="m-settings"></i>
          <p>Tab Settings</p>
        </li> -->
      </ul>
    </div>
  </aside>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTabStore } from '../../stores/tabStore'
import { useTabShortcuts } from '../../composables/useTabShortcuts'
import { useModal } from '../../composables/useModal'

// PROPS
interface Props {
  isOpen: boolean
  modalRef: any
}
// MODAL COMPOSABLE
const {
  isOpen,
  triggerRef,
  modalRef,
  toggleModal,
  closeModal
} = useModal()

defineProps<Props>()

// COMPOSABLES
const router = useRouter()
const tabStore = useTabStore()
const { isMac, createNewTab } = useTabShortcuts()

// EMITS
const emit = defineEmits<{
  close: []
}>()

// COMPUTED PROPERTIES
const currentTab = computed(() => tabStore.activeTab)
const currentTabPinned = computed(() => currentTab.value?.isPinned || false)
const tabsCount = computed(() => tabStore.tabsCount)

// TAB MOVEMENT CAPABILITIES
const canMoveLeft = computed(() => {
  if (!currentTab.value) return false
  const sortedTabs = tabStore.sortedTabs
  const currentIndex = sortedTabs.findIndex(tab => tab.id === currentTab.value?.id)
  return currentIndex > 0
})

const canMoveRight = computed(() => {
  if (!currentTab.value) return false
  const sortedTabs = tabStore.sortedTabs
  const currentIndex = sortedTabs.findIndex(tab => tab.id === currentTab.value?.id)
  return currentIndex < sortedTabs.length - 1
})

// TAB ACTIONS
const togglePinCurrentTab = () => {
  if (!currentTab.value) return
  tabStore.toggleTabPin(currentTab.value.id)
  emit('close') 
  closeModal()
}

// const duplicateCurrentTab = () => {
//   if (!currentTab.value) return
//   const newTab = tabStore.duplicateTab(currentTab.value.id)
//   if (newTab) {
//     router.push(newTab.route)
//   }
//   emit('close')
//   closeModal()
// }

const closeCurrentTab = () => {
  if (!currentTab.value || tabsCount.value <= 1) return

  const currentTabId = currentTab.value.id
  tabStore.closeTab(currentTabId)

  // NAVIGATE TO NEW ACTIVE TAB
  const newActiveTab = tabStore.activeTab
  if (newActiveTab) {
    router.push(newActiveTab.route)
  }

  emit('close')
  closeModal()
}

const closeAllTabs = () => {
  tabStore.closeAllTabs()

  // IF NO TABS LEFT, CREATE NEW DASHBOARD TAB
  if (tabStore.tabsCount === 0) {
    createNewTab()
  } else {
    const activeTab = tabStore.activeTab
    if (activeTab) {
      router.push(activeTab.route)
    }
  }

  emit('close')
  closeModal()
}

const closeOtherTabs = () => {
  if (!currentTab.value || tabsCount.value <= 1) return

  const currentTabId = currentTab.value.id
  const tabsToClose = tabStore.tabs.filter(tab =>
    tab.id !== currentTabId && !tab.isPinned
  )

  tabsToClose.forEach(tab => {
    tabStore.closeTab(tab.id)
  })

  emit('close')
  closeModal()
}

// const undoCloseTab = () => {
//   if (!canUndo.value) return

//   tabStore.undoCloseTab()

//   // NAVIGATE TO RESTORED TAB
//   const activeTab = tabStore.activeTab
//   if (activeTab) {
//     router.push(activeTab.route)
//   }

//   emit('close')
//   closeModal()
// }

// const refreshCurrentTab = () => {
//   if (!currentTab.value) return

//   // FORCE ROUTE REFRESH
//   const currentRoute = currentTab.value.route
//   router.push({ path: '/temp' }).then(() => {
//     router.push(currentRoute)
//   })

//   emit('close')
//   closeModal()
// }

const moveTabLeft = () => {
  if (!canMoveLeft.value || !currentTab.value) return

  const sortedTabs = tabStore.sortedTabs
  const currentIndex = sortedTabs.findIndex(tab => tab.id === currentTab.value?.id)

  if (currentIndex > 0) {
    // SWAP TIMESTAMPS TO CHANGE ORDER
    const currentTimestamp = sortedTabs[currentIndex].timestamp
    const leftTabTimestamp = sortedTabs[currentIndex - 1].timestamp

    sortedTabs[currentIndex].timestamp = leftTabTimestamp
    sortedTabs[currentIndex - 1].timestamp = currentTimestamp
  }

  emit('close')
  closeModal()
}

const moveTabRight = () => {
  if (!canMoveRight.value || !currentTab.value) return

  const sortedTabs = tabStore.sortedTabs
  const currentIndex = sortedTabs.findIndex(tab => tab.id === currentTab.value?.id)

  if (currentIndex < sortedTabs.length - 1) {
    // SWAP TIMESTAMPS TO CHANGE ORDER
    const currentTimestamp = sortedTabs[currentIndex].timestamp
    const rightTabTimestamp = sortedTabs[currentIndex + 1].timestamp

    sortedTabs[currentIndex].timestamp = rightTabTimestamp
    sortedTabs[currentIndex + 1].timestamp = currentTimestamp
  }

  emit('close')
  closeModal()
}

// const openTabSettings = () => {
//   // PLACEHOLDER FOR TAB SETTINGS - CAN BE EXPANDED
//   console.log('Opening tab settings...')
//   emit('close')
  // closeModal()
// }
</script>
