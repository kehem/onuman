// src/composables/useModal.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useModal() {
    const isOpen = ref(false)
    const triggerRef: Ref<HTMLElement | null> = ref(null)
    const modalRef: Ref<HTMLElement | null> = ref(null)

    const openModal = () => {
        isOpen.value = true
    }

    const closeModal = () => {
        isOpen.value = false
    }

    const toggleModal = () => {
        isOpen.value = !isOpen.value
    }

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement

        // Don't close if clicking on the trigger element
        if (triggerRef.value && triggerRef.value.contains(target)) {
            return
        }

        // Close if clicking outside the modal
        if (modalRef.value && !modalRef.value.contains(target)) {
            closeModal()
        }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen.value) {
            closeModal()
        }
    }

    onMounted(() => {
        document.addEventListener('click', handleClickOutside)
        document.addEventListener('keydown', handleEscapeKey)
    })

    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscapeKey)
    })

    return {
        isOpen,
        triggerRef,
        modalRef,
        openModal,
        closeModal,
        toggleModal
    }
}