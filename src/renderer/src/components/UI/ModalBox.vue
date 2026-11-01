<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
                <div class="modal-content">
                    <slot />
                    <button v-if="showCloseButton" class="close-button" @click="emit('close')">×</button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">

defineProps<{
    isOpen: boolean
    showCloseButton?: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()
</script>