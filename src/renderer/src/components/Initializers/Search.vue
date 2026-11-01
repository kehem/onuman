<template>
  <!-- SEARCH BAR -->
  <div class="onuman-search">
    <div class="onuman-input-box">
      <input
        type="search"
        id="search"
        name="search"
        class="onuman-input2"
        placeholder="Search... (Ctrl + Shift + Tab)"
        maxlength="200"
        aria-labelledby="search-label"
        v-model="searchQuery"
        @input="handleSearch"
        :tabindex="isAnyModalOpen ? -1 : 0"
      />
    </div>
    <div class="search-result" v-show="showSearchResults" role="region" aria-live="polite">
      <div class="inner-search-result">
        <div class="search-loader" v-if="isSearching" aria-busy="true"></div>
        <ul v-else>
          <li
            v-for="result in searchResults"
            :key="result"
            role="option"
            :tabindex="isAnyModalOpen ? -1 : 0"
          >
            {{ result }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const searchQuery = ref('')
const searchResults = ref<string[]>([])
const isSearching = ref(false)
const showSearchResults = ref(false)
const isModalOpen = ref<{ [key: string]: boolean }>({})
import { useToast } from '../../composables/Toast'
const { showToast } = useToast()

const handleKeydown = (event: KeyboardEvent) => {
  if (isAnyModalOpen.value) return

  const ctrl = event.ctrlKey
  const shift = event.shiftKey
  const alt = event.altKey
  const key = event.key.toLowerCase()

  if (ctrl && shift && !alt && key === 'tab') {
    const searchInput = document.getElementById('search') as HTMLInputElement
    searchInput?.focus()
    showToast('info', 'Focused Search Input')
    event.preventDefault()
  }
}
const handleSearch = async () => {
  if (searchQuery.value.trim() === '') {
    showSearchResults.value = false
    searchResults.value = []
    return
  }

  isSearching.value = true
  showSearchResults.value = true

  setTimeout(() => {
    searchResults.value = [`Results for "${searchQuery.value}"`]
    isSearching.value = false
  }, 1000)
}

// Check if any modal is open
const isAnyModalOpen = computed(() => {
  return Object.values(isModalOpen.value).some((isOpen) => isOpen)
})

// const handleOutsideClick = (event: MouseEvent) => {
//     const target = event.target as HTMLElement;
// };

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // window.addEventListener('click', handleOutsideClick);
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  // window.removeEventListener('click', handleOutsideClick);
})
</script>
