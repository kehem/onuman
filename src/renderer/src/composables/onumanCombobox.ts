// composables/onumanCombobox
import { ref, computed, onMounted, onUnmounted, ComputedRef } from 'vue'

export function useOnumanCombobox(options: string[] | ComputedRef<string[]>) {
  const isOpen = ref(false)
  const selectedOption = ref('')
  const searchQuery = ref('')
  const comboboxInput = ref<HTMLInputElement | null>(null)
  const dropdownList = ref<HTMLElement | null>(null)
  const focusedOptionIndex = ref(-1)

  // Resolve options to string[] (handles both string[] and ComputedRef<string[]>)
  const resolvedOptions = computed(() => (Array.isArray(options) ? options : options.value))

  // Filtered options based on search query
  const filteredOptions = computed(() => {
    if (!searchQuery.value) return resolvedOptions.value
    return resolvedOptions.value.filter((option) =>
      option.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      focusedOptionIndex.value = -1
      setTimeout(() => comboboxInput.value?.focus(), 0)
    }
  }

  // Select an option
  const selectOption = (option: string) => {
    selectedOption.value = option
    searchQuery.value = option
    isOpen.value = false
    focusedOptionIndex.value = -1
  }

  // Handle input changes
  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    searchQuery.value = input.value
    isOpen.value = true
    focusedOptionIndex.value = -1
  }

  // Handle keyboard navigation
  const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen.value && event.key === 'Enter') {
      toggleDropdown()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (focusedOptionIndex.value < filteredOptions.value.length - 1) {
        focusedOptionIndex.value++
      } else {
        focusedOptionIndex.value = 0
      }
      scrollToFocusedOption()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (focusedOptionIndex.value > 0) {
        focusedOptionIndex.value--
      } else {
        focusedOptionIndex.value = filteredOptions.value.length - 1
      }
      scrollToFocusedOption()
    } else if (event.key === 'Enter' && focusedOptionIndex.value >= 0) {
      event.preventDefault()
      selectOption(filteredOptions.value[focusedOptionIndex.value])
    } else if (event.key === 'Escape') {
      isOpen.value = false
      focusedOptionIndex.value = -1
      searchQuery.value = '' // Clear input
      selectedOption.value = '' // Clear selected option
    }
  }

  // Scroll to focused option
  const scrollToFocusedOption = () => {
    if (dropdownList.value && focusedOptionIndex.value >= 0) {
      const focusedElement = dropdownList.value.children[focusedOptionIndex.value] as HTMLElement
      focusedElement?.scrollIntoView({ block: 'nearest' })
    }
  }

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const combobox = comboboxInput.value?.closest('.onuman-combobox')
    if (combobox && !combobox.contains(event.target as Node)) {
      isOpen.value = false
      focusedOptionIndex.value = -1
    }
  }

  // Initialize event listeners
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    comboboxInput.value?.addEventListener('keydown', handleKeydown)
  })

  // Cleanup event listeners
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    comboboxInput.value?.removeEventListener('keydown', handleKeydown)
  })

  return {
    isOpen,
    selectedOption,
    searchQuery,
    filteredOptions,
    comboboxInput,
    dropdownList,
    focusedOptionIndex,
    toggleDropdown,
    selectOption,
    handleInput
  }
}
