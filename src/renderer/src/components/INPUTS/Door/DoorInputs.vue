<!-- components/INPUTS/BrickInputs.vue -->


<script setup lang="ts">
/* ------------------------------------------
 * IMPORTS
 * ------------------------------------------ */
import { ref, watch, onMounted } from 'vue';
import OnumanCombobox from '../../../components/Initializers/OnumanCombobox.vue';
import Tooltip from '../../../components/Initializers/ToolTip.vue';
import { useToast } from '../../../composables/Toast';
import { useImageUploader } from '../../../composables/useImageUploader';
import { useApi } from '../../../composables/useApi';
const { get, post, stripMm } = useApi()

// IMAGE UPLOADER COMPOSABLE
const {
    handleFileChange,
    isUploading,
    uploadProgress,
    imageURL,
} = useImageUploader()

import { BPP } from '../../../Interfaces/BPP';
import BrickBasic from './DoorBasic.vue';

/* ------------------------------------------
 * PROPS & EMITS
 * ------------------------------------------ */
const props = defineProps<{
    projectID: number;
    wallData?: BPP | null | undefined;
    unit?: string;
}>();

const emit = defineEmits<{
    (e: 'submit-response', response: any): void;
}>();



/* ------------------------------------------
 * GLOBAL REFS & UTILITIES
 * ------------------------------------------ */
const wallOptions = ref<string[]>([]);
const { showToast } = useToast();


/* ------------------------------------------
 * FORM STATE & CONTROLS
 * ------------------------------------------ */
const isEditMode = ref(false);
const formMode = ref<'create' | 'update'>('create');
const originalData = ref<BPP | null>(null);
const hasChanges = ref(false);
const selectedBrick = ref('');
const wallData = ref('');
const wallName = ref('');

const wallHeight = ref('');
const wallWidth = ref('');
const DoorQty = ref('');

const wallSide = ref('');





/* ------------------------------------------
 * BrickBasic.vue
 * ------------------------------------------ */
const basicOriginalValues = ref({
    wallHeight: '',
    wallWidth: '',
    DoorQty: '',
});
const selectedFloors = ref<number[]>([])


// FOOTER
const saveAsPreset = ref(false);




/* ------------------------------------------
 * UPDATE THE STIRRUP ORIGINAL HANDLERS
 * ------------------------------------------ */
const handleOriginalInputs = (field: string, value: string) => {
    if (Object.keys(basicOriginalValues.value).includes(field)) {
        (basicOriginalValues.value as any)[field] = value;
        checkForChanges();
    }
};
/* ------------------------------------------
 * API INITIALIZATION
 * ------------------------------------------ */
onMounted(async () => {


    try {
        const response = await get(`/api/door/presets?projectId=${props.projectID}`);
        wallOptions.value = response.map((item: any) => item.name);
        wallData.value = JSON.stringify(response);
    } catch (error) {
        // console.log(error);
    }
});

/* ------------------------------------------
 * PRESET SELECTION WATCHER
 * ------------------------------------------ */
watch([selectedBrick, wallData], ([newPresetName, newPileData]) => {
    if (!newPresetName || formMode.value === 'update') return;
    try {
        const presets = JSON.parse(newPileData || '[]') as BPP[];
        const selectedPreset = presets.find(preset => preset.name === newPresetName);
        if (selectedPreset) {
            populateForm(selectedPreset, true);
        } else {
            showToast('error', 'Selected preset not found');
            resetForm();
        }
    } catch (error) {
        showToast('error', 'Failed to load preset data');
        resetForm();
    }
});

const updateWallSide = (newWallSide: string) => {
    wallSide.value = newWallSide;
};

/* ------------------------------------------
 * FORM POPULATION FROM DATA
 * ------------------------------------------ */
const populateForm = (data: BPP, isPreset = false) => {
    isEditMode.value = !isPreset;
    formMode.value = isPreset ? 'create' : 'update';


    selectedFloors.value = typeof data.floor === 'string'
        ? (data.floor as string).split(',').map(Number)
        : Array.isArray(data.floor)
            ? data.floor
            : [Number(data.floor)].filter(n => !isNaN(n));

    selectedBrick.value = data.name || '';
    wallName.value = isPreset ? '' : data.name || '';

    wallHeight.value = data.height ? `${data.height} mm` : '';
    wallWidth.value = data.width ? `${data.width} mm` : '';
    DoorQty.value = data.quantity ? `${data.quantity}` : '';
    wallSide.value = data.wall_side ?? '';

    basicOriginalValues.value.wallHeight = data.height_original ?? '';
    basicOriginalValues.value.wallWidth = data.width_original ?? '';

    imageURL.value = data.imageUrl || null;
    saveAsPreset.value = data.preset || false;
    originalData.value = isPreset ? null : JSON.parse(JSON.stringify(data));
    hasChanges.value = isPreset ? true : false;
    updateWallSide(wallSide.value);
    addBounceClass();
};

/* ------------------------------------------
 * FORM FIELD CHANGE DETECTION
 * ------------------------------------------ */
watch(() => props.wallData, (newData) => {
    if (newData) populateForm(newData, false);
}, { immediate: true });


const checkForChanges = () => {
    if (!originalData.value) {
        hasChanges.value = true;
        return;
    }
    const currentData = getFormDataJson();
    hasChanges.value = JSON.stringify(currentData) !== JSON.stringify(originalData.value);
};

/* ------------------------------------------
 * ANIMATION
 * ------------------------------------------ */
const addBounceClass = () => {
    const el = document.querySelector('.input-group.onuman-insider-scrollbar');
    if (el) {
        el.classList.add('border-bounce');
        setTimeout(() => el.classList.remove('border-bounce'), 1000);
    }
};


/* ------------------------------------------
 * DATA SERIALIZATION & CLEANING
 * ------------------------------------------ */

const getFormDataJson = () => ({
    projectId: props.projectID,
    floor: selectedFloors.value.sort((a, b) => a - b).join(','),
    width: parseFloat(stripMm(wallWidth.value)) || 0,
    width_original: basicOriginalValues.value.wallWidth || '',
    height: parseFloat(stripMm(wallHeight.value)) || 0,
    height_original: basicOriginalValues.value.wallHeight || '',
    wall_side: wallSide.value,
    quantity: DoorQty.value ? parseInt(DoorQty.value) : 0,

    imageUrl: imageURL.value,
    preset: saveAsPreset.value
});

/* ------------------------------------------
 * FORM SUBMIT & RESET
 * ------------------------------------------ */
const reloadWindow = () => window.location.reload();
const submitForm = async (event: Event) => {
    event.preventDefault();

    try {
        const formData = getFormDataJson();
        const response = formMode.value === 'update'
            ? await post(`/api/door/update/${props.wallData?.id}`, formData)
            : await post('/api/door/create', formData);

        showToast('success', `${formMode.value === 'update' ? 'Updated' : 'Created'} successfully`);
        emit('submit-response', response);
        if (formMode.value === 'create') resetForm(); reloadWindow();
        if (formMode.value === 'update') resetForm(); reloadWindow();
    } catch (error) {
        showToast('error', 'Submission failed');
    }
};

const resetForm = () => {
    selectedBrick.value = '';
    wallName.value = '';
    DoorQty.value = '';
    wallHeight.value = '';
    imageURL.value = '';

    basicOriginalValues.value = {
        wallHeight: '', wallWidth: '', DoorQty: '',
    };


    isEditMode.value = false;
    hasChanges.value = false;
    formMode.value = 'create';
};



const removeImage = () => {
    imageURL.value = '';
    checkForChanges();
};
/* ------------------------------------------
 * EXPOSE PUBLIC METHODS
 * ------------------------------------------ */
defineExpose({});
</script>


<template>
    <form class="input-group-container" @submit="submitForm">
        <!-- GROUP NAME -->
        <div class="group-name">
            <p>BRICK INPUTS</p>
        </div>
        <!-- INPUT GROUP -->
        <div class="input-group onuman-insider-scrollbar onuman-input-height">
            <!-- ITEM(PRESETS) -->
            <div class="input-group-item combobox-wrapper">
                <OnumanCombobox id="onuman-combobox-brick" :options="wallOptions" placeholder="Select Preset"
                    v-model:selected="selectedBrick" />
            </div>


            <!-- BRICK BASIC INPUTS -->
            <BrickBasic v-model:wallHeight="wallHeight" v-model:wallWidth="wallWidth" v-model:DoorQty="DoorQty"
                v-model:wallSide="wallSide" v-model:selectedFloors="selectedFloors"
                :originalWallHeight="basicOriginalValues.wallHeight" :originalWallWidth="basicOriginalValues.wallWidth"
                @update:originalValue="handleOriginalInputs" @update:wallSide="updateWallSide" />




            <!-- SUPPORT IMAGE -->
            <div class="support-image">
                <!-- UPLOAD PROGRESS -->
                <div v-if="isUploading" class="upload-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ uploadProgress }}%</span>
                </div>

                <!-- UPLOADING ANIMATION -->
                <div v-if="isUploading" class="uploading-indicator">
                    <div class="uploading-spinner"></div>
                    <span>Uploading...</span>
                </div>

                <!-- PREVIEW -->
                <div class="support-image-preview" v-if="imageURL && !isUploading">
                    <img :src="imageURL" alt="Support Image" loading="lazy" />
                    <button type="button" class="remove-image" @click="removeImage"><i class="m-cross1"></i></button>
                </div>
                <!-- INPUT FILE -->
                <div class="upload-wrapper" v-if="!imageURL || isUploading">
                    <label for="support-image" class="upload-label" :class="{ disabled: isUploading }">
                        <span v-if="!isUploading">Support Image</span>
                    </label>
                    <input type="file" id="support-image" name="support-image" @change="handleFileChange"
                        :disabled="isUploading" />
                </div>
            </div>

            <!-- SUBMIT -->
            <div class="input-form-submit">
                <span class="preset-checker">
                    <Tooltip
                        content="Save the inputs as <span style='color: #4c8'>preset</span>. <br><u>Note:</u> Column name will set as preset name"
                        position="top">
                        <div class="checkbox">
                            <input type="checkbox" id="preset-checker" name="preset-checker" v-model="saveAsPreset" />
                            <label for="preset-checker">Save as Preset</label>
                        </div>
                    </Tooltip>
                </span>
                <button type="submit" class="onuman-submit-btn btn-thickness" value="Submit">
                    {{ isEditMode ? 'Update' : 'Submit' }}
                </button>
            </div>
        </div>
    </form>
</template>