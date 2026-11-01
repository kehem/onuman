<!-- SRC/COMPONENTS/OUTPUTS/ACTIONS.VUE -->
<template>
    <div class="actioned-container" ref="containerRef">
        <span class="vertical-dotted" @click="openActions"><i class="m-dots-three-vertical"></i></span>
        <!-- POPUP -->
        <div v-if="isOpenActions" class="open-actions-popup">
            <ToolTip content="Edit Inputs" position="left">
                <button type="button" class="open-action-btn" @click="updateInputs"><i class="m-pen1"></i>
                    <p>Update</p>
                </button>
            </ToolTip>
            <ToolTip content="Parmanently delete" position="left">
                <button type="button" class="open-action-btn trash-item" @click="deleteData"><i class="m-trash1"></i>
                    <p>Delete</p>
                </button>
            </ToolTip>
            <ToolTip content="See Support Image" position="left">
                <button type="button" class="open-action-btn imaged" @click="openModal"><i class="m-image2"></i>
                    <p>Image</p>
                </button>
            </ToolTip>

            <ModalBox :is-open="isModalOpen" :show-close-button="true" @close="closeModal">
                <div v-if="imageUrl" class="covered-image onuman-scrollbar">
                    <img :src="imageUrl" alt="Support Image" class="modal-image" />
                </div>
                <div v-else class="no-image-found">
                    <i class="m-image"></i>
                    <p>No image available</p>
                </div>
            </ModalBox>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ToolTip from '../Initializers/ToolTip.vue';
import ModalBox from '../UI/ModalBox.vue';
import { InputItems } from "../../Interfaces/Inputs";

const props = defineProps<{
    type: string
    sectionDATA: Record<string, any>
}>()

// EMIT delete event
const emit = defineEmits<{
    (e: 'send-data', data: InputItems): void
    (e: 'delete-data', id: string): void
}>()

const deleteData = () => {
    emit('delete-data', itemId);
    isOpenActions.value = false;
};


const sectionData = props.sectionDATA as InputItems;

// PILE ID
const itemId = props.sectionDATA.id;

// UPDATE INPUTS
const updateInputs = () => {
    emit('send-data', sectionData);
    isOpenActions.value = false;
};

// IMAGE MODAL
const isModalOpen = ref(false);
const imageUrl = ref<string | null>(null);

const openModal = () => {
    imageUrl.value = sectionData.imageUrl ?? null;
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const isOpenActions = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const openActions = () => {
    isOpenActions.value = true;
};

const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node) && !isModalOpen.value) {
        isOpenActions.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>