<!-- components/INPUTS/FootingInputs.vue -->

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

import { FootingItem } from '../../../Interfaces/Footing';
import { Reinforcement, Stirrup } from '../../../Interfaces/Inputs';
import FootingBasic from './FootingBasic.vue';
import Reinforcements from '../Reinforcements.vue';
import Stirrups from '../Stirrups.vue';

/* --------------------------------------------
 * PROPS & EMITS
 * ------------------------------------------ */
const props = defineProps<{
    projectID: number;
    footingData?: FootingItem | null | undefined;
    unit?: string;
}>();

const emit = defineEmits<{
    (e: 'submit-response', response: any): void;
}>();

/* -------------------------------------------
 * GLOBAL REFS & UTILITIES
 * ------------------------------------------ */
const footingOptions = ref<string[]>([]);
const { showToast } = useToast();


/* --------------------------------------------
 * FORM STATE & CONTROLS
 * ------------------------------------------ */
const isEditMode = ref(false);
const formMode = ref<'create' | 'update'>('create');
const originalData = ref<FootingItem | null>(null);
const hasChanges = ref(false);
const selectedFooting = ref('');
const footingData = ref('');
const footingShape = ref<'Circle' | 'Rectangle' | 'Trapezoid'>('Rectangle')
const footingName = ref('');
const footingQty = ref('');
const footingHeight = ref('');
const footingWidth = ref('');
const footingLength = ref('');
const footingRadius = ref('');
const footingBase = ref('');
const stirrupAction = ref(false);






/* --------------------------------------------
 * FootingBasic.vue
 * ------------------------------------------ */
const basicOriginalValues = ref({
    footingHeight: '',
    footingWidth: '',
    footingLength: '',
    footingRadius: '',
    footingBaseTop: ''
});



/* ------------------------------------------
 * REINFORCEMENTS
 * ------------------------------------------ */
const reinforcements = ref<Reinforcement[]>([
    {
        horizontal: '',
        vertical: '',
        horizontal_original: '',
        vertical_original: '',
        horizontal_diameter: 0,
        vertical_diameter: 0
    }
])


// STIRRUPS
const stirrups = ref<Stirrup[]>([]);
const spacing = ref(''); // x1Deduction
const rodDiameter = ref(''); // x1Diameter
const midSpacing = ref(''); // x2Deduction
const midRodDiameter = ref(''); // x2Diameter

// ORIGINAL
const spacing_original = ref('');
const rodDiameter_original = ref('');
const midSpacing_original = ref('');
const midRodDiameter_original = ref('');




function updateOriginalValue(field: string, value: string) {
    switch (field) {
        case 'spacing-original': spacing_original.value = value; break;
        case 'rodDiameter-original': rodDiameter_original.value = value; break;
        case 'midSpacing-original': midSpacing_original.value = value; break;
        case 'midRodDiameter-original': midRodDiameter_original.value = value; break;
    }
    checkForChanges();
}

function handleStirrupOriginal(index: number, field: keyof Stirrup, value: string) {
    const s = stirrups.value[index];
    if (!s) return;
    const originalField = (field + '_original') as keyof Stirrup;
    (s as any)[originalField] = value;
    checkForChanges();
}

function addStirrup() {
    stirrups.value.push({
        deduction: '',
        diameter: '',
        height: '',
        deduction_original: '',
        diameter_original: '',
        height_original: ''
    });
    checkForChanges();
}

function removeStirrup(index: number) {
    stirrups.value.splice(index, 1);
    checkForChanges();
}

function updateStirrups(newList: Stirrup[]) {
    stirrups.value = newList;
    checkForChanges();
}


// FOOTER
const saveAsPreset = ref(false);




const stirrupOriginalValues = ref({
    spacing: '',
    rodDiameter: '',
    midSpacing: '',
    midRodDiameter: ''
});

/* ------------------------------------------
 * UPDATE THE STIRRUP ORIGINAL HANDLERS
 * ------------------------------------------ */
/* Add handler for original values */
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
        const response = await get('/api/footing/presets');
        footingOptions.value = response.map((item: any) => item.name);
        footingData.value = JSON.stringify(response);
    } catch (error) {
        console.log(error);
    }
});

/* ------------------------------------------
 * PRESET SELECTION WATCHER
 * ------------------------------------------ */
watch([selectedFooting, footingData], ([newPresetName, newFootingData]) => {
    if (!newPresetName || formMode.value === 'update') return;
    try {
        const presets = JSON.parse(newFootingData || '[]') as FootingItem[];
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
const populateForm = (data: FootingItem, isPreset = false) => {
    isEditMode.value = !isPreset;
    stirrupAction.value = !!(data.stirrups && data.stirrups.length > 0);

    formMode.value = isPreset ? 'create' : 'update';
    selectedFooting.value = data.name || '';
    footingShape.value = data.type as 'Circle' | 'Rectangle' | 'Trapezoid' || 'Rectangle';
    footingName.value = isPreset ? '' : data.name || '';
    footingQty.value = data.quantity?.toString() || '';
    footingHeight.value = data.height ? `${data.height} mm` : '';
    footingWidth.value = data.width ? `${data.width} mm` : '';
    footingLength.value = data.length ? `${data.length} mm` : '';
    footingRadius.value = data.diameter ? `${data.diameter} mm` : '';
    footingBase.value = data.footing_base ? `${data.footing_base} mm` : ''
    basicOriginalValues.value.footingBaseTop = data.footing_base_original;


    basicOriginalValues.value.footingHeight = data.height_original;
    basicOriginalValues.value.footingWidth = data.width_original;
    basicOriginalValues.value.footingLength = data.length_original;
    basicOriginalValues.value.footingRadius = data.diameter_original;
    basicOriginalValues.value.footingBaseTop = data.footing_base_original;

    reinforcements.value = data.reinforcements?.map(r => ({
        horizontal: `${r.horizontal} mm`,
        vertical: `${r.vertical} mm`,
        horizontal_original: r.horizontal_original,
        vertical_original: r.vertical_original,
        horizontal_diameter: r.horizontal_diameter || 0,
        vertical_diameter: r.vertical_diameter || 0,
        support: r.support || false
    })) || [{
        horizontal: '',
        vertical: '',
        horizontal_original: '',
        vertical_original: '',
        horizontal_diameter: 0,
        vertical_diameter: 0
    }];


    spacing.value = data.stirrups?.[0]?.deduction ? `${data.stirrups[0].deduction} mm` : '';
    rodDiameter.value = data.stirrups?.[0]?.diameter ? `${data.stirrups[0].diameter} mm` : '';
    midSpacing.value = data.stirrups?.[1]?.deduction ? `${data.stirrups[1].deduction} mm` : '';
    midRodDiameter.value = data.stirrups?.[1]?.diameter ? `${data.stirrups[1].diameter} mm` : '';

    spacing_original.value = data.stirrups?.[0]?.deduction_original || '';
    rodDiameter_original.value = data.stirrups?.[0]?.diameter_original || '';
    midSpacing_original.value = data.stirrups?.[1]?.deduction_original || '';
    midRodDiameter_original.value = data.stirrups?.[1]?.diameter_original || '';

    stirrupOriginalValues.value.spacing = spacing_original.value;
    stirrupOriginalValues.value.rodDiameter = rodDiameter_original.value;
    stirrupOriginalValues.value.midSpacing = midSpacing_original.value;
    stirrupOriginalValues.value.midRodDiameter = midRodDiameter_original.value;

    stirrups.value = data.stirrups?.slice(2).map(s => ({
        deduction: s.deduction ? `${s.deduction} mm` : '',
        diameter: s.diameter ? `${s.diameter} mm` : '',
        length: s.length ? `${s.length} mm` : '',
        height: s.height ? `${s.height} mm` : '',
        deduction_original: s.deduction_original || '',
        diameter_original: s.diameter_original || '',
        height_original: s.height_original || ''
    })) || [];

    imageURL.value = data.imageUrl || null;
    saveAsPreset.value = data.preset || false;
    originalData.value = isPreset ? null : JSON.parse(JSON.stringify(data));
    hasChanges.value = isPreset ? true : false;

    addBounceClass();
};


/* ------------------------------------------
 * FORM FIELD CHANGE DETECTION
 * ------------------------------------------ */
watch(() => props.footingData, (newData) => {
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
 * DYNAMIC REINFORCEMENTS / STIRRUPS
 * ------------------------------------------ */
const addReinforcement = () => {
    reinforcements.value.push({
        horizontal: '',
        vertical: '',
        horizontal_original: '',
        vertical_original: '',
        horizontal_diameter: 0,
        vertical_diameter: 0
    })
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



const getFormDataJson = () => ({
    projectId: props.projectID,
    selectedFooting: selectedFooting.value,
    type: footingShape.value === 'Circle' ? 'Circular' :
        footingShape.value === 'Rectangle' ? 'Rectangle' : 'Trapezoid',

    name: footingName.value.trim(),
    quantity: parseFloat(footingQty.value.trim()) || 0,
    height: parseFloat(stripMm(footingHeight.value)) || 0,
    height_original: basicOriginalValues.value.footingHeight || '',
    width: footingShape.value === 'Rectangle' || footingShape.value === 'Trapezoid' ? parseFloat(stripMm(footingWidth.value)) || 0 : 0,
    length: footingShape.value === 'Rectangle' ? parseFloat(stripMm(footingLength.value)) || 0 : 0,
    width_original: basicOriginalValues.value.footingWidth || '',
    length_original: basicOriginalValues.value.footingLength || '',
    diameter: parseFloat(stripMm(footingRadius.value)) || 0,
    diameter_original: basicOriginalValues.value.footingRadius || '',
    footing_base: parseFloat(stripMm(footingBase.value)) || 0,
    footing_base_original: basicOriginalValues.value.footingBaseTop || '',
    reinforcements: reinforcements.value.map(r => ({
        horizontal: parseFloat(stripMm(r.horizontal)) || 0,
        vertical: parseFloat(stripMm(r.vertical)) || 0,
        horizontal_original: r.horizontal_original,
        vertical_original: r.vertical_original,
        horizontal_diameter: r.horizontal_diameter,
        vertical_diameter: r.vertical_diameter,
        support: r.support || false
    })),

    stirrups: stirrupAction.value ? [
        {
            deduction: parseFloat(stripMm(spacing.value)) || 0,
            diameter: parseFloat(stripMm(rodDiameter.value)) || 0,
            height: 0,
            deduction_original: spacing_original.value || '',
            diameter_original: rodDiameter_original.value || ''
        },
        {
            deduction: parseFloat(stripMm(midSpacing.value)) || 0,
            diameter: parseFloat(stripMm(midRodDiameter.value)) || 0,
            height: 0,
            deduction_original: midSpacing_original.value || '',
            diameter_original: midRodDiameter_original.value || ''
        },
        ...stirrups.value.map(s => ({
            deduction: parseFloat(stripMm(s.deduction)) || 0,
            diameter: parseFloat(stripMm(s.diameter)) || 0,
            height: parseFloat(stripMm(s.length ?? '')) || 0,
            deduction_original: s.deduction_original || '',
            diameter_original: s.diameter_original || '',
            length_original: s.length_original || '',
            weight_original: s.weight_original || '',
            height_original: s.height_original || ''
        }))
    ] : [],
    stirrup_action: stirrupAction.value,
    imageUrl: imageURL.value,
    preset: saveAsPreset.value
});


/* ------------------------------------------
 * FORM SUBMIT & RESET
 * ------------------------------------------ */
const submitForm = async (event: Event) => {
    event.preventDefault();


    try {
        const formData = getFormDataJson();
        const response = formMode.value === 'update'
            ? await post(`/api/footing/update/${props.footingData?.id}`, formData)
            : await post('/api/footing/create', formData);

        showToast('success', `${formMode.value === 'update' ? 'Updated' : 'Created'} successfully`);
        emit('submit-response', response);
        if (formMode.value === 'create') resetForm();
        if (formMode.value === 'update') resetForm();
    } catch (error) {
        showToast('error', 'Submission failed');
    }
};

const resetForm = () => {
    selectedFooting.value = '';
    footingShape.value = 'Rectangle';
    footingName.value = '';
    footingQty.value = '';
    footingHeight.value = '';
    footingWidth.value = '';
    footingLength.value = '';
    footingRadius.value = '';

    basicOriginalValues.value = {
        footingHeight: '', footingWidth: '', footingLength: '', footingRadius: '', footingBaseTop: ''
    };

    reinforcements.value = [{
        horizontal: '',
        vertical: '',
        horizontal_original: '',
        vertical_original: '',
        horizontal_diameter: 0,
        vertical_diameter: 0,
        support: false
    }];

    stirrups.value = [];

    spacing.value = '';
    rodDiameter.value = '';
    midSpacing.value = '';
    midRodDiameter.value = '';

    spacing_original.value = '';
    rodDiameter_original.value = '';
    midSpacing_original.value = '';
    midRodDiameter_original.value = '';

    stirrupOriginalValues.value = {
        spacing: '', rodDiameter: '', midSpacing: '', midRodDiameter: ''
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
            <p>FOOTING INPUTS</p>
        </div>

        <!-- INPUT GROUP -->
        <div class="input-group onuman-insider-scrollbar onuman-input-height">
            <!-- ITEM(PRESETS) -->
            <div class="input-group-item combobox-wrapper">
                <OnumanCombobox id="onuman-combobox-footing" :options="footingOptions"
                    placeholder="Select Footing Preset" v-model:selected="selectedFooting" />
            </div>

            <!-- PILE BASIC INPUTS -->
            <FootingBasic v-model:footingShape="footingShape" v-model:footingName="footingName"
                v-model:footingQty="footingQty" v-model:footingHeight="footingHeight"
                v-model:footingWidth="footingWidth" v-model:footingLength="footingLength"
                v-model:footingRadius="footingRadius" v-model:footingBaseTop="footingBase"
                :originalFootingHeight="basicOriginalValues.footingHeight"
                :originalFootingWidth="basicOriginalValues.footingWidth"
                :originalFootingLength="basicOriginalValues.footingLength"
                :originalFootingRadius="basicOriginalValues.footingRadius"
                :originalFootingBaseTop="basicOriginalValues.footingBaseTop"
                @update:originalValue="handleOriginalInputs" />

            <!-- REINFORCEMENTS -->
            <Reinforcements :reinforcements="reinforcements" @update:reinforcements="(val) => reinforcements = val"
                @add-reinforcement="addReinforcement" @remove-reinforcement="removeReinforcement"
                @reinforcement-horizontal="(val) => console.log('horizontal:', val)"
                @reinforcement-horizontal_original="(index, val) => console.log('horizontal original:', index, val)"
                @reinforcement-horizontal_diameter="(val) => console.log('horizontal diameter:', val)"
                @reinforcement-vertical_diameter="(val) => console.log('vertical diameter:', val)" />



            <div class="stirrup-applience">
                <button type="button" class="onuman-btn" :class="{ active: stirrupAction }"
                    @click="stirrupAction = true">
                    With Stirrups
                </button>
                <button type="button" class="onuman-btn" :class="{ active: !stirrupAction }"
                    @click="stirrupAction = false">
                    Without Stirrups
                </button>
            </div>

            <!-- STIRRUPS -->
            <Stirrups v-if="stirrupAction" :spacing="spacing" :spacing_original="spacing_original"
                :rodDiameter="rodDiameter" :rodDiameter_original="rodDiameter_original" :midSpacing="midSpacing"
                :midSpacing_original="midSpacing_original" :midRodDiameter="midRodDiameter"
                :midRodDiameter_original="midRodDiameter_original" :stirrups="stirrups"
                @update:spacing="spacing = $event" @update:rodDiameter="rodDiameter = $event"
                @update:midSpacing="midSpacing = $event" @update:midRodDiameter="midRodDiameter = $event"
                @update:stirrups="updateStirrups" @add-stirrup="addStirrup" @remove-stirrup="removeStirrup"
                @spacing-original="updateOriginalValue('spacing-original', $event)"
                @rodDiameter-original="updateOriginalValue('rodDiameter-original', $event)"
                @midSpacing-original="updateOriginalValue('midSpacing-original', $event)"
                @midRodDiameter-original="updateOriginalValue('midRodDiameter-original', $event)"
                @stirrup-originalDeduction="(i, v) => handleStirrupOriginal(i, 'deduction', v)"
                @stirrup-originalDiameter="(i, v) => handleStirrupOriginal(i, 'diameter', v)"
                @stirrup-originalHeight="(i, v) => handleStirrupOriginal(i, 'height', v)" />


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
                        content="Save the inputs as <span style='color: #4c8'>preset</span>. <br><u>Note:</u> Footing name will set as preset name"
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