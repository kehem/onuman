<!-- components/INPUTS/TilesInputs.vue -->


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

import { TilesItem } from '../../../Interfaces/Tiles';
import TilesBasic from './TilesBasic.vue';

// IMAGE UPLOADER COMPOSABLE
const {
    handleFileChange,
    isUploading,
    uploadProgress,
    imageURL,
} = useImageUploader()
/* ------------------------------------------
 * PROPS & EMITS
 * ------------------------------------------ */
const props = defineProps<{
    projectID: number;
    tilesData?: TilesItem | null | undefined;
    unit?: string;
}>();

const emit = defineEmits<{
    (e: 'submit-response', response: any): void;
}>();

/* ------------------------------------------
 * GLOBAL REFS & UTILITIES
 * ------------------------------------------ */
const beamOptions = ref<string[]>([]);
const { showToast } = useToast();

/* ------------------------------------------
 * FORM STATE & CONTROLS
 * ------------------------------------------ */
const isEditMode = ref(false);
const formMode = ref<'create' | 'update'>('create');
const originalData = ref<TilesItem | null>(null);
const hasChanges = ref(false);
const selectedData = ref('');
const tilesData = ref('');
const Type = ref<'floor' | 'wall' | 'stair'>('floor');
const Name = ref('');
const Area = ref('');
const Amount = ref('');
const LabourBill = ref('');
const Qty = ref('');
const Height = ref('');
const StairHeight = ref('');
const Width = ref('');
const Length = ref('');





/* ------------------------------------------
 * TilesBasic.vue
 * ------------------------------------------ */
const basicOriginalValues = ref({
    Height: '',
    StairHeight: '',
    Width: '',
    Length: '',
    Area: ''
});
const selectedFloors = ref<number[]>([])

// watch(selectedFloors, (newVal, oldVal) => {
//     console.log('selectedFloors changed:', newVal, oldVal);
// });




// FOOTER
const saveAsPreset = ref(false);



/* ------------------------------------------
 * HANDLE ORIGINAL VALUES
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
        const response = await get(`/api/tiles/presets?projectId=${props.projectID}`);
        beamOptions.value = response.map((item: any) => item.name);
        tilesData.value = JSON.stringify(response);
    } catch (error) {
        // console.log(error);
    }
});

/* ------------------------------------------
 * PRESET SELECTION WATCHER
 * ------------------------------------------ */
watch([selectedData, tilesData], ([newPresetName, newPileData]) => {
    if (!newPresetName || formMode.value === 'update') return;
    try {
        const presets = JSON.parse(newPileData || '[]') as TilesItem[];
        const selectedPreset = presets.find(preset => preset.name === newPresetName);
        if (selectedPreset) {
            populateForm(selectedPreset, true);
        } else {
            showToast('error', 'Selected preset not found');
        }
    } catch (error) {
        showToast('error', 'Failed to load preset data');
    }
});
// Add this watcher in TilesInputs.vue
// watch(Type, (newType, oldType) => {
//     // Clear area when switching away from floor type
//     if (oldType === 'floor' && newType !== 'floor') {
//         Area.value = '';
//         basicOriginalValues.value.Area = '';
//     }

//     // Clear width, length, height when switching to floor type
//     if (newType === 'floor' && oldType !== 'floor') {
//         Width.value = '';
//         Length.value = '';
//         Height.value = '';
//         StairHeight.value = '';
//         Qty.value = '';
//         basicOriginalValues.value.Width = '';
//         basicOriginalValues.value.Length = '';
//         basicOriginalValues.value.Height = '';
//         basicOriginalValues.value.StairHeight = '';
//     }
// });
/* ------------------------------------------
 * FORM FIELD CHANGE DETECTION
 * ------------------------------------------ */
watch(() => props.tilesData, (newData) => {
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
 * FORM POPULATION FROM DATA
 * ------------------------------------------ */
const populateForm = (data: TilesItem, isPreset = false) => {
    isEditMode.value = !isPreset;
    formMode.value = isPreset ? 'create' : 'update';


    selectedFloors.value = typeof data.floor === 'string'
        ? (data.floor as string).split(',').map(Number)
        : Array.isArray(data.floor)
            ? data.floor
            : [Number(data.floor)].filter(n => !isNaN(n));





    selectedData.value = data.name || '';
    Name.value = isPreset ? '' : data.name || '';
    LabourBill.value = data.labour_bill?.toString() || '';
    Type.value = (data.beam_type as 'floor' | 'wall' | 'stair') ?? 'floor';
    Area.value = data.area ? `${data.area} mm²` : '';
    Amount.value = data.amount?.toString() || '';
    Width.value = data.width ? `${data.width} mm` : '';
    Length.value = data.length ? `${data.length} mm` : '';
    Height.value = data.height ? `${data.height} mm` : '';
    StairHeight.value = data.stair_height ? `${data.stair_height} mm` : '';
    Qty.value = data.quantity?.toString() || '';

    basicOriginalValues.value.Height = data.height_original;
    basicOriginalValues.value.Width = data.width_original;
    basicOriginalValues.value.Length = data.length_original;
    basicOriginalValues.value.Area = data.area_original;
    basicOriginalValues.value.StairHeight = data.stair_height_original;

    imageURL.value = data.imageUrl || null;
    saveAsPreset.value = data.preset || false;
    originalData.value = isPreset ? null : JSON.parse(JSON.stringify(data));
    hasChanges.value = isPreset ? true : false;

    addBounceClass();
};

/* ------------------------------------------
 * DATA SERIALIZATION & CLEANING
 * ------------------------------------------ */


const getFormDataJson = () => ({
    projectId: props.projectID,
    floor: selectedFloors.value.sort((a, b) => a - b).join(','),
    name: Name.value.trim(),
    labour_bill: LabourBill.value,
    tiles_type: Type.value,
    area: stripMm(Area.value),
    area_original: basicOriginalValues.value.Area,
    amount: parseFloat(Amount.value.trim()) || 0,
    width: parseFloat(stripMm(Width.value)) || 0,
    width_original: basicOriginalValues.value.Width || '',
    length: parseFloat(stripMm(Length.value)) || 0,
    length_original: basicOriginalValues.value.Length || '',
    height: parseFloat(stripMm(Height.value)) || 0,
    height_original: basicOriginalValues.value.Height || '',
    stair_height: parseFloat(stripMm(StairHeight.value)) || 0,
    stair_height_original: basicOriginalValues.value.StairHeight || '',
    quantity: parseFloat(Qty.value.trim()) || 0,

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
            ? await post(`/api/tiles/update/${props.tilesData?.id}`, formData)
            : await post('/api/tiles/create', formData);

        showToast('success', `${formMode.value === 'update' ? 'Updated' : 'Created'} successfully`);
        emit('submit-response', response);
        if (formMode.value === 'create') reloadWindow();
        if (formMode.value === 'update') reloadWindow();
    } catch (error) {
        showToast('error', 'Submission failed');
    }
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
            <p>TILES INPUTS</p>
        </div>
        <!-- INPUT GROUP -->
        <div class="input-group onuman-insider-scrollbar onuman-input-height">
            <!-- ITEM(PRESETS) -->
            <div class="input-group-item combobox-wrapper">
                <OnumanCombobox id="onuman-combobox-beam" :options="beamOptions" placeholder="Select Preset"
                    v-model:selected="selectedData" />
            </div>
            <!-- TILES BASIC INPUTS -->
            <TilesBasic v-model:type="Type" v-model:name="Name" v-model:qty="Qty" v-model:area="Area"
                v-model:height="Height" v-model:stair_height="StairHeight" v-model:width="Width" v-model:length="Length"
                v-model:amount="Amount" v-model:labour_bill="LabourBill" v-model:selectedFloors="selectedFloors"
                :originalHeight="basicOriginalValues.Height" :originalStairHeight="basicOriginalValues.StairHeight"
                :originalWidth="basicOriginalValues.Width" :originalLength="basicOriginalValues.Length"
                :originalArea="basicOriginalValues.Area" @update:originalValue="handleOriginalInputs" />

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
                        content="Save the inputs as <span style='color: #4c8'>preset</span>. <br><u>Note:</u> Tiles name will set as preset name"
                        position="top">
                        <div class="checkbox">
                            <input type="checkbox" id="preset-checker" name="preset-checker" v-model="saveAsPreset" />
                            <label for="preset-checker">Save as Preset</label>
                        </div>
                    </Tooltip>
                </span>
                <button type="submit" class="onuman-submit-btn btn-width" value="Submit">
                    {{ isEditMode ? 'Update' : 'Submit' }}
                </button>
            </div>
        </div>
    </form>
</template>