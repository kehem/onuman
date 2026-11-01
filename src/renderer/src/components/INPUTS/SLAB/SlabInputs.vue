<!-- components/INPUTS/SlabInputs.vue -->

<script setup lang="ts">
/* ------------------------------------------
 * IMPORTS
 * ------------------------------------------ */
import { ref, watch, onMounted, computed } from 'vue';
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

import { SlabItem, Reinforcement } from '../../../Interfaces/Slab';
import SlabBasic from './SlabBasic.vue';
import Reinforcements from './Reinforcements.vue';

/* ------------------------------------------
 * PROPS & EMITS
 * ------------------------------------------ */
const props = defineProps<{
    projectID: number;
    slabData?: SlabItem | null | undefined;
    unit?: string;
}>();

const emit = defineEmits<{
    (e: 'submit-response', response: any): void;
}>();

/* ------------------------------------------
 * GLOBAL REFS & UTILITIES
 * ------------------------------------------ */
const slabOptions = ref<string[]>([]);
const { showToast } = useToast();


/* ------------------------------------------
 * FORM STATE & CONTROLS
 * ------------------------------------------ */
const isEditMode = ref(false);
const formMode = ref<'create' | 'update'>('create');
const originalData = ref<SlabItem | null>(null);
const hasChanges = ref(false);
const selectedSlab = ref('');
const slabData = ref('');
const slabShape = ref(true);
const slabWidth = ref('');
const slabLength = ref('');
const crankBar = ref(false);
const topBar = ref(false);

/* ------------------------------------------
 * SlabBasic.vue
 * ------------------------------------------ */
const slabType = ref<'Main' | 'Sun Shade' | 'False' | 'Ground'>('Main')
const area = ref('')
const width = ref('')
const length = ref('')
const thickness = ref('')
const quantity = ref('')
const selectedFloors = ref<number[]>([])

const originalArea = ref('')
const originalLength = ref('')
const originalWidth = ref('')
const originalThickness = ref('')

const inputMode = ref<'area' | 'manual'>('area')

// Computed property to determine if we're in area mode
const isArea = computed(() => inputMode.value === 'area')

// Add this ref for basic original values (add this to your refs section)
const basicOriginalValues = ref({
    area: '',
    width: '',
    length: '',
    thickness: ''
});

/* ------------------------------------------
 * REINFORCEMENTS
 * ------------------------------------------ */
const reinforcements = ref<Reinforcement[]>([
    {
        id: `reinforcement-${Date.now()}`,
        support: false,
        length: '',
        length_original: '',
        horizontal_diameter: 0,
        horizontal_distance: '',
        horizontal_distance_original: '',
        width: '',
        width_original: '',
        vertical_diameter: 0,
        vertical_distance: '',
        vertical_distance_original: ''
    }
]);

// Add these new refs for crank bar and top bar support states
const crankBarSupport = ref(false);
const topBarSupport = ref(false);

const handleCrankBarUpdate = (value: boolean) => {
    crankBar.value = value;
    checkForChanges();
};

const handleTopBarUpdate = (value: boolean) => {
    topBar.value = value;
    checkForChanges();
};

// Add these new handlers for support checkboxes
const handleCrankBarSupportUpdate = (value: boolean) => {
    crankBarSupport.value = value;
    checkForChanges();
};

const handleTopBarSupportUpdate = (value: boolean) => {
    topBarSupport.value = value;
    checkForChanges();
};

// FOOTER
const saveAsPreset = ref(false);


/* ------------------------------------------
 * REINFORCEMENT EVENT HANDLERS
 * ------------------------------------------ */
const handleReinforcementUpdate = (updatedReinforcements: Reinforcement[]) => {
    reinforcements.value = updatedReinforcements;
    checkForChanges();
};

const handleReinforcementHorizontalDiameter = () => {
    // Handle horizontal diameter change if needed
    checkForChanges();
};

const handleReinforcementVerticalDiameter = () => {
    // Handle vertical diameter change if needed
    checkForChanges();
};

const handleReinforcementHorizontalDistance = () => {
    // Handle horizontal distance change if needed
    checkForChanges();
};

const handleReinforcementVerticalDistance = () => {
    // Handle vertical distance change if needed
    checkForChanges();
};

const handleReinforcementWidth = () => {
    // Handle width change if needed
    checkForChanges();
};

const handleReinforcementLength = () => {
    // Handle length change if needed
    checkForChanges();
};

const handleReinforcementOriginal = (index: number, field: string, value: string) => {
    if (reinforcements.value[index]) {
        (reinforcements.value[index] as any)[field] = value;
        checkForChanges();
    }
};

/* ------------------------------------------
 * API INITIALIZATION
 * ------------------------------------------ */
onMounted(async () => {


    try {
        const response = await get(`/api/slab/presets?projectId=${props.projectID}`);
        slabOptions.value = response.map((item: any) => item.name);
        slabData.value = JSON.stringify(response);
    } catch (error) {
    }
});

/* ------------------------------------------
 * PRESET SELECTION WATCHER
 * ------------------------------------------ */
watch([selectedSlab, slabData], ([newPresetName, newSlabData]) => {
    if (!newPresetName || formMode.value === 'update') return;
    try {
        const presets = JSON.parse(newSlabData || '[]') as SlabItem[];
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

/* ------------------------------------------
 * FORM POPULATION FROM DATA
 * ------------------------------------------ */
const populateForm = (data: SlabItem, isPreset = false) => {
    isEditMode.value = !isPreset;
    slabType.value = data.type as typeof slabType.value;

    // Populate main values
    area.value = data.area ? `${data.area} mm` : '';
    length.value = data.length ? `${data.length} mm` : '';
    width.value = data.width ? `${data.width} mm` : '';
    thickness.value = data.thickness ? `${data.thickness} mm` : '';
    quantity.value = data.quantity?.toString() || '';

    if (data.area && (!data.length || !data.width)) {
        inputMode.value = 'area';
    } else if (data.length && data.width) {
        inputMode.value = 'manual';
    } else {
        inputMode.value = 'area'; // default
    }

    if (data.area_original) {
        area.value = data.area ? `${data.area} mm` : '';
    } else {
        area.value = ''; // Keep area empty if no area_original
    }

    // Populate original values for SlabBasic
    basicOriginalValues.value.area = data.area_original || '';
    basicOriginalValues.value.length = data.length_original || '';
    basicOriginalValues.value.width = data.width_original || '';
    basicOriginalValues.value.thickness = data.thickness_original || '';

    // Update the individual original value refs that are used in template
    originalArea.value = data.area_original || '';
    originalLength.value = data.length_original || '';
    originalWidth.value = data.width_original || '';
    originalThickness.value = data.thickness_original || '';

    selectedFloors.value = typeof data.floor === 'string'
        ? (data.floor as string).split(',').map(Number)
        : Array.isArray(data.floor)
            ? data.floor
            : [Number(data.floor)].filter(n => !isNaN(n));

    formMode.value = isPreset ? 'create' : 'update';
    selectedSlab.value = data.name || '';

    reinforcements.value = data.reinforcements?.map(r => ({
        id: r.id || `reinforcement-${Date.now()}`,
        support: r.support || false,
        // Add mm suffix to length if it's a number, keep as is if already a string
        length: typeof r.length === 'number' ? `${r.length} mm` : (r.length || `${data.length || 0} mm`),
        length_original: r.length_original || data.length_original || '',
        horizontal_diameter: r.horizontal_diameter || 0,
        // Add mm suffix to horizontal_distance if it's a number
        horizontal_distance: typeof r.horizontal_distance === 'number' ? `${r.horizontal_distance} mm` : (r.horizontal_distance || ''),
        horizontal_distance_original: r.horizontal_distance_original || '',
        // Add mm suffix to width if it's a number, keep as is if already a string
        width: typeof r.width === 'number' ? `${r.width} mm` : (r.width || `${data.width || 0} mm`),
        width_original: r.width_original || data.width_original || '',
        vertical_diameter: r.vertical_diameter || 0,
        // Add mm suffix to vertical_distance if it's a number
        vertical_distance: typeof r.vertical_distance === 'number' ? `${r.vertical_distance} mm` : (r.vertical_distance || ''),
        vertical_distance_original: r.vertical_distance_original || ''
    })) || [{
        id: `reinforcement-${Date.now()}`,
        support: false,
        length: `${data.length || 0} mm`,
        length_original: data.length_original || '',
        horizontal_diameter: 0,
        horizontal_distance: '',
        horizontal_distance_original: '',
        width: `${data.width || 0} mm`,
        width_original: data.width_original || '',
        vertical_diameter: 0,
        vertical_distance: '',
        vertical_distance_original: ''
    }];

    crankBar.value = Array.isArray(data.crank_bar) && data.crank_bar.length > 0;
    crankBarSupport.value = Array.isArray(data.crank_bar) && data.crank_bar[0]?.support || false;
    topBar.value = Array.isArray(data.top_bar) && data.top_bar.length > 0;
    topBarSupport.value = Array.isArray(data.top_bar) && data.top_bar[0]?.support || false;


    imageURL.value = data.imageUrl || null;
    saveAsPreset.value = data.preset || false;

    originalData.value = isPreset ? null : JSON.parse(JSON.stringify(data));
    hasChanges.value = isPreset ? true : false;

    addBounceClass();
};

/* ------------------------------------------
 * FORM FIELD CHANGE DETECTION
 * ------------------------------------------ */
watch(() => props.slabData, (newData) => {
    if (newData) populateForm(newData, false);
}, { immediate: true });

watch(slabShape, () => {
    if (slabShape.value) {
        slabWidth.value = '';
        slabLength.value = '';
    }
    checkForChanges();
});

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
 * DYNAMIC REINFORCEMENTS / STIRRUPS
 * ------------------------------------------ */
// Updated addReinforcement function for SlabInputs.vue
const addReinforcement = () => {
    // Determine the default values based on input mode
    let defaultWidth = '';
    let defaultWidthOriginal = '';
    let defaultLength = '';
    let defaultLengthOriginal = '';

    if (inputMode.value === 'manual') {
        // In manual mode, use SlabBasic width and length
        defaultWidth = width.value; // SlabBasic width
        defaultWidthOriginal = basicOriginalValues.value.width;
        defaultLength = length.value; // SlabBasic length
        defaultLengthOriginal = basicOriginalValues.value.length;
    } else {
        // In area mode, use thickness as length and empty width (will be filled by user)
        defaultWidth = ''; // Will be filled by user in area mode
        defaultWidthOriginal = '';
        defaultLength = thickness.value; // Use thickness as default length
        defaultLengthOriginal = basicOriginalValues.value.thickness;
    }

    reinforcements.value.push({
        id: `reinforcement-${Date.now()}`,
        support: false,
        length: defaultLength,
        length_original: defaultLengthOriginal,
        horizontal_diameter: 0,
        horizontal_distance: '',
        horizontal_distance_original: '',
        width: defaultWidth,
        width_original: defaultWidthOriginal,
        vertical_diameter: 0,
        vertical_distance: '',
        vertical_distance_original: ''
    });
    checkForChanges();
};

const removeReinforcement = (index: number) => {
    if (reinforcements.value.length > 1) {
        reinforcements.value.splice(index, 1);
        checkForChanges();
    } else {
        showToast('error', 'At least one reinforcement is required');
    }
};

/* ------------------------------------------
 * DATA SERIALIZATION & CLEANING
 * ------------------------------------------ */

interface SlabFormData {
    floor: string;
    projectId: number;
    selectedSlab: string;
    type: 'Main' | 'Sun Shade' | 'False' | 'Ground';
    area: number;
    area_original: string;
    width: number;
    width_original: string;
    thickness: number;
    thickness_original: string;
    quantity: number;
    length: number;
    length_original: string;
    reinforcements: Array<{
        id: string;
        support: boolean;
        length: number;
        length_original: string;
        horizontal_diameter: number;
        horizontal_distance: number;
        horizontal_distance_original: string;
        width: number;
        width_original: string;
        vertical_diameter: number;
        vertical_distance: number;
        vertical_distance_original: string;
    }>;
    imageUrl: string | null;
    preset: boolean;
    crank_bar?: Array<{
        width?: number;
        width_original?: string;
        diameter?: number;
        distance?: number;
        distance_original?: string;
        support?: boolean;
        r_width?: number;
    }>;
    top_bar?: Array<{
        length?: number;
        length_original?: string;
        diameter?: number;
        distance?: number;
        distance_original?: string;
        support?: boolean;
        r_length?: number;
    }>;
}

// Updated getFormDataJson function in SlabInputs.vue
const getFormDataJson = () => {
    const baseData: SlabFormData = {
        ...(slabType.value !== 'Ground'
            ? { floor: selectedFloors.value.sort((a, b) => a - b).join(',') }
            : { floor: '0' }),
        projectId: props.projectID,
        selectedSlab: selectedSlab.value,
        type: slabType.value,
        area: parseFloat(stripMm(area.value)) || 0,
        area_original: basicOriginalValues.value.area,
        width: parseFloat(stripMm(width.value)) || 0,
        width_original: basicOriginalValues.value.width,
        thickness: parseFloat(stripMm(thickness.value)) || 0,
        thickness_original: basicOriginalValues.value.thickness,
        quantity: parseFloat(quantity.value.trim()) || 0,
        length: parseFloat(stripMm(length.value)) || 0,
        length_original: basicOriginalValues.value.length,

        reinforcements: reinforcements.value.map(r => ({
            id: r.id ?? `reinforcement-${Date.now()}`,
            support: r.support || false,
            length: parseFloat(stripMm(r.length)) || 0,
            length_original: r.length_original,
            horizontal_diameter: r.horizontal_diameter,
            horizontal_distance: parseFloat(stripMm(r.horizontal_distance)) || 0,
            horizontal_distance_original: r.horizontal_distance_original,
            width: parseFloat(stripMm(r.width)) || 0,
            width_original: r.width_original,
            vertical_diameter: r.vertical_diameter,
            vertical_distance: parseFloat(stripMm(r.vertical_distance)) || 0,
            vertical_distance_original: r.vertical_distance_original
        })),

        imageUrl: imageURL.value,
        preset: saveAsPreset.value,
        crank_bar: [],
        top_bar: []
    };

    // Crank Bar as Array - with r_width (original full width)
    if (crankBar.value && reinforcements.value.length > 0) {
        const firstReinforcement = reinforcements.value[0];

        const sourceWidth = inputMode.value === 'manual'
            ? parseFloat(stripMm(width.value)) || 0
            : parseFloat(stripMm(firstReinforcement.width)) || 0;

        const sourceWidthOriginal = inputMode.value === 'manual'
            ? basicOriginalValues.value.width
            : firstReinforcement.width_original;

        baseData.crank_bar = [{
            r_width: sourceWidth, // Original full width
            width: sourceWidth / 3, // Divided width
            width_original: sourceWidthOriginal,
            diameter: firstReinforcement.horizontal_diameter,
            distance: parseFloat(stripMm(firstReinforcement.horizontal_distance)) || 0,
            distance_original: firstReinforcement.horizontal_distance_original,
            support: crankBarSupport.value
        }];
    } else {
        baseData.crank_bar = [];
    }

    // Top Bar as Array - with r_length (original full length)
    if (topBar.value && reinforcements.value.length > 0) {
        const firstReinforcement = reinforcements.value[0];

        const sourceLength = inputMode.value === 'manual'
            ? parseFloat(stripMm(length.value)) || 0
            : parseFloat(stripMm(firstReinforcement.length)) || 0;

        const sourceLengthOriginal = inputMode.value === 'manual'
            ? basicOriginalValues.value.length
            : firstReinforcement.length_original;

        baseData.top_bar = [{
            r_length: sourceLength, // Original full length
            length: sourceLength / 3, // Divided length
            length_original: sourceLengthOriginal,
            diameter: firstReinforcement.vertical_diameter,
            distance: parseFloat(stripMm(firstReinforcement.vertical_distance)) || 0,
            distance_original: firstReinforcement.vertical_distance_original,
            support: topBarSupport.value
        }];
    } else {
        baseData.top_bar = [];
    }

    return baseData;
}

/* ------------------------------------------
 * UPDATE resetForm FUNCTION
 * ------------------------------------------ */
const resetForm = () => {
    selectedFloors.value = [];
    selectedSlab.value = '';
    slabType.value = 'Main';
    area.value = '';
    length.value = '';
    width.value = '';
    thickness.value = '';
    quantity.value = '';
    imageURL.value = '';

    inputMode.value = 'area';

    basicOriginalValues.value = {
        area: '', width: '', length: '', thickness: ''
    };
    originalArea.value = '';
    originalLength.value = '';
    originalWidth.value = '';
    originalThickness.value = '';

    reinforcements.value = [{
        id: `reinforcement-${Date.now()}`,
        support: false,
        length: '',
        length_original: '',
        horizontal_diameter: 0,
        horizontal_distance: '',
        horizontal_distance_original: '',
        width: '',
        width_original: '',
        vertical_diameter: 0,
        vertical_distance: '',
        vertical_distance_original: ''
    }];


    isEditMode.value = false;
    hasChanges.value = false;
    formMode.value = 'create';

    // Reset crank and top bar
    crankBar.value = false;
    topBar.value = false;
    crankBarSupport.value = false;
    topBarSupport.value = false;
};

/* ------------------------------------------
 * UPDATE handleOriginalValue FUNCTION
 * ------------------------------------------ */
function handleOriginalValue(field: string, value: string) {
    if (field === 'area') {
        originalArea.value = value;
        basicOriginalValues.value.area = value;
    } else if (field === 'length') {
        originalLength.value = value;
        basicOriginalValues.value.length = value;
    } else if (field === 'width') {
        originalWidth.value = value;
        basicOriginalValues.value.width = value;
    } else if (field === 'thickness') {
        originalThickness.value = value;
        basicOriginalValues.value.thickness = value;
    }
    checkForChanges();
}
const reloadWindow = () => {
    window.location.reload();
};
/* ------------------------------------------
 * FORM SUBMIT & RESET
 * ------------------------------------------ */
const submitForm = async (event: Event) => {
    event.preventDefault();
    try {
        const formData = getFormDataJson();
        const response = formMode.value === 'update'
            ? await post(`/api/slab/update/${props.slabData?.id}`, formData)
            : await post('/api/slab/create', formData);

        showToast('info', `${formMode.value === 'update' ? 'Updated' : 'Created'} successfully`);
        emit('submit-response', response);
        reloadWindow();
        if (formMode.value === 'create') resetForm(); reloadWindow();
        if (formMode.value === 'update') resetForm(); reloadWindow();
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
defineExpose({
    resetForm,
    populateForm,
    getFormDataJson
});
</script>


<template>
    <form class="input-group-container" @submit="submitForm">
        <!-- GROUP NAME -->
        <div class="group-name">
            <p>SLAB INPUTS</p>
        </div>
        <!-- INPUT GROUP -->
        <div class="input-group onuman-insider-scrollbar onuman-input-height">
            <!-- ITEM(PRESETS) -->
            <div class="input-group-item combobox-wrapper">
                <OnumanCombobox id="onuman-combobox-slab" :options="slabOptions" placeholder="Select Preset"
                    v-model:selected="selectedSlab" />
            </div>
            <!-- SLAB BASIC INPUTS -->
            <SlabBasic :slabType="slabType" :area="area" :width="width" :length="length" :thickness="thickness"
                :quantity="quantity" :originalArea="originalArea" :originalLength="originalLength"
                :originalWidth="originalWidth" :originalThickness="originalThickness" :selectedFloors="selectedFloors"
                :inputMode="inputMode" @update:area="area = $event" @update:width="width = $event"
                @update:length="length = $event" @update:thickness="thickness = $event"
                @update:quantity="quantity = $event" @update:selectedFloors="selectedFloors = $event"
                @update:originalValue="handleOriginalValue" @update:inputMode="inputMode = $event; checkForChanges()"
                @update:slabType="slabType = $event as typeof slabType; checkForChanges()" />

            <!-- LONG REINFORCEMENTS -->
            <Reinforcements :reinforcements="reinforcements" :isArea="isArea" :crankBar="crankBar" :topBar="topBar"
                :crankBarSupport="crankBarSupport" :topBarSupport="topBarSupport" :slabWidth="width"
                :slabLength="length" :slabWidthOriginal="basicOriginalValues.width"
                :slabLengthOriginal="basicOriginalValues.length" :inputMode="inputMode"
                @update:reinforcements="handleReinforcementUpdate" @add-reinforcement="addReinforcement"
                @remove-reinforcement="removeReinforcement"
                @reinforcement-horizontal_diameter="handleReinforcementHorizontalDiameter"
                @reinforcement-vertical_diameter="handleReinforcementVerticalDiameter"
                @reinforcement-horizontal_distance="handleReinforcementHorizontalDistance"
                @reinforcement-vertical_distance="handleReinforcementVerticalDistance"
                @reinforcement-width="handleReinforcementWidth" @reinforcement-length="handleReinforcementLength"
                @reinforcement-horizontal_distance_original="(index, value) => handleReinforcementOriginal(index, 'horizontal_distance_original', value)"
                @reinforcement-vertical_distance_original="(index, value) => handleReinforcementOriginal(index, 'vertical_distance_original', value)"
                @reinforcement-width_original="(index, value) => handleReinforcementOriginal(index, 'width_original', value)"
                @reinforcement-length_original="(index, value) => handleReinforcementOriginal(index, 'length_original', value)"
                @update:crankBar="handleCrankBarUpdate" @update:topBar="handleTopBarUpdate"
                @update:crankBarSupport="handleCrankBarSupportUpdate"
                @update:topBarSupport="handleTopBarSupportUpdate" />

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
                        content="Save the inputs as <span style='color: #4c8'>preset</span>. <br><u>Note:</u> Slab name will set as preset name"
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