<!-- SRC/COMPONENTS/OUTPUTS/ACTIONS.VUE -->
<template>
    <div v-if="inline" class="inline-actions">
        <button type="button" @click="updateInputs"><i class="m-pen1" aria-hidden="true"></i> Edit</button>
        <button type="button" class="delete-action" @click="deleteData"><i class="m-trash1" aria-hidden="true"></i> Delete</button>
        <button type="button" @click="openModal"><i class="m-image2" aria-hidden="true"></i> Image</button>
        <ModalBox :is-open="isModalOpen" :show-close-button="true" @close="closeModal">
            <div v-if="imageUrl" class="covered-image onuman-scrollbar">
                <img :src="imageUrl" alt="Support Image" class="modal-image" />
            </div>
            <div v-else class="no-image-found"><i class="m-image"></i><p>No image available</p></div>
        </ModalBox>
    </div>
    <div v-else class="actioned-container" ref="containerRef">
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
    inline?: boolean
}>()

// EMIT delete event
const emit = defineEmits<{
    (e: 'send-data', data: InputItems): void
    (e: 'delete-data', id: string): void
}>()

const deleteData = () => {
    emit('delete-data', props.sectionDATA.id);
    isOpenActions.value = false;
};


// UPDATE INPUTS
const updateInputs = () => {
    emit('send-data', props.sectionDATA as InputItems);
    isOpenActions.value = false;
};

// IMAGE MODAL
const isModalOpen = ref(false);
const imageUrl = ref<string | null>(null);

const openModal = () => {
    imageUrl.value = props.sectionDATA.imageUrl ?? null;
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

<style scoped>
.inline-actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.inline-actions button { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.7rem; border: 1px solid #49605a; border-radius: 0.35rem; background: #263b36; color: #dcebe6; font-size: 0.75rem; cursor: pointer; }
.inline-actions button:hover, .inline-actions button:focus-visible { background: #36534b; outline: 2px solid #8abeb0; outline-offset: 2px; }
.inline-actions .delete-action { color: #ffd1c9; border-color: #79524d; background: #422f2d; }
</style>
