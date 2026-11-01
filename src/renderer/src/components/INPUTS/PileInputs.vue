<!-- components/INPUTS/PileInputs.vue -->

<script setup lang="ts">
/* ------------------------------------------
 * IMPORTS
 * ------------------------------------------ */
import { ref, watch, onMounted } from 'vue';
import OnumanCombobox from '../../components/Initializers/OnumanCombobox.vue';
import Tooltip from '../../components/Initializers/ToolTip.vue';
import { useToast } from '../../composables/Toast';
import { useImageUploader } from '../../composables/useImageUploader';
import { useApi } from '../../composables/useApi'
const { get, post, stripMm } = useApi()
import { PileItem, Reinforcement, Stirrup } from '../../Interfaces/Pile';
import PileBasic from './PileBasic.vue';
import LongReinforcements from './LongReinforcements.vue';
import Stirrups from './Stirrups.vue';

/* ------------------------------------------
 * PROPS & EMITS
 * ------------------------------------------ */
const props = defineProps<{
    projectID: number;
    pileData?: PileItem | null | undefined;
    unit?: string;
}>();

const emit = defineEmits<{
    (e: 'submit-response', response: any): void;
}>();

/* ------------------------------------------
 * GLOBAL REFS & UTILITIES
 * ------------------------------------------ */
const pileOptions = ref<string[]>([]);
const { showToast } = useToast();
// IMAGE UPLOADER COMPOSABLE
const {
    handleFileChange,
    isUploading,
    uploadProgress,
    imageURL,
} = useImageUploader()

/* ------------------------------------------
 * FORM STATE & CONTROLS
 * ------------------------------------------ */
const isEditMode = ref(false);
const formMode = ref<'create' | 'update'>('create');
const originalData = ref<PileItem | null>(null);
const hasChanges = ref(false);
const selectedPile = ref('');
const pileData = ref('');
const pileType = ref(true);
const pileName = ref('');
const pileQty = ref('');
const pileHeight = ref('');
const pileWidth = ref('');
const pileLength = ref('');
const pileRadius = ref('');





/* ------------------------------------------
 * PileBasic.vue
 * ------------------------------------------ */
const basicOriginalValues = ref({
    pileHeight: '',
    pileWidth: '',
    pileLength: '',
    pileRadius: ''
});


/* ------------------------------------------
 * REINFORCEMENTS
 * ------------------------------------------ */

const reinforcements = ref<Reinforcement[]>([
    { qty: '', diameter: 0, support: false, height: '', height_original: '' }
]);

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
        const response = await get('/api/pile/presets');
        pileOptions.value = response.map((item: any) => item.name);
        pileData.value = JSON.stringify(response);
    } catch (error) {
    }
});

/* ------------------------------------------
 * PRESET SELECTION WATCHER
 * ------------------------------------------ */
watch([selectedPile, pileData], ([newPresetName, newPileData]) => {
    if (!newPresetName || formMode.value === 'update') return;
    try {
        const presets = JSON.parse(newPileData || '[]') as PileItem[];
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

// REINFORCEMENT HEIGHT GET FROM PILE BASIC VUE
watch([pileHeight, basicOriginalValues.value], ([newHeight, newOriginal]) => {
    const formattedHeight = newHeight?.trim() || '';
    const formattedOriginal = newOriginal.pileHeight?.trim() || '';

    reinforcements.value.forEach((r) => {
        // Only update if empty
        if (!r.height) {
            r.height = formattedHeight;
        }
        if (!r.height_original) {
            r.height_original = formattedOriginal;
        }
    });
    checkForChanges();
});

/* ------------------------------------------
 * FORM POPULATION FROM DATA
 * ------------------------------------------ */
const populateForm = (data: PileItem, isPreset = false) => {
    isEditMode.value = !isPreset;
    formMode.value = isPreset ? 'create' : 'update';
    selectedPile.value = data.name || '';
    pileType.value = data.type === 'Circular';
    pileName.value = isPreset ? '' : data.name || '';
    pileQty.value = data.quantity?.toString() || '';
    pileHeight.value = data.height ? `${data.height} mm` : '';
    pileWidth.value = data.width ? `${data.width} mm` : '';
    pileLength.value = data.length ? `${data.length} mm` : '';
    pileRadius.value = data.diameter ? `${data.diameter} mm` : '';

    basicOriginalValues.value.pileHeight = data.height_original;
    basicOriginalValues.value.pileWidth = data.width_original;
    basicOriginalValues.value.pileLength = data.length_original;
    basicOriginalValues.value.pileRadius = data.diameter_original;

    const defaultHeight = data.height ? `${data.height} mm` : '';
    const defaultHeightOriginal = data.height_original || '';

    reinforcements.value = data.reinforcements?.map(r => ({
        qty: r.rod_qty.toString(),
        diameter: r.rod_diameter || 0,
        support: r.support || false,
        height: r.height ? `${r.height} mm` : defaultHeight,
        height_original: r.height_original || defaultHeightOriginal
    })) || [{
        qty: '',
        diameter: 0,
        support: false,
        height: defaultHeight,
        height_original: defaultHeightOriginal
    }];

    spacing.value = data.stirrups?.[0]?.deduction ? `${data.stirrups[0].deduction} mm` : '';
    rodDiameter.value = data.stirrups?.[0]?.diameter ? `${data.stirrups[0].diameter} mm` : '';
    midSpacing.value = data.stirrups?.[1]?.deduction ? `${data.stirrups[1].deduction} mm` : '';
    midRodDiameter.value = data.stirrups?.[1]?.diameter ? `${data.stirrups[1].diameter} mm` : '';

    // STIRRUPS
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
watch(() => props.pileData, (newData) => {
    if (newData) populateForm(newData, false);
}, { immediate: true });

watch(pileType, () => {
    if (pileType.value) {
        pileWidth.value = '';
        pileLength.value = '';
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
 * REINFORCEMENT HEIGHT HANDLERS
 * ------------------------------------------ */
const handleOriginalHeight = (index: number, originalHeight: string) => {
    if (reinforcements.value[index]) {
        if (originalHeight.includes('mm')) {
            reinforcements.value[index].height = originalHeight;
        } else {
            reinforcements.value[index].height_original = originalHeight;
        }
    }
    checkForChanges();
};

const handleConvertedHeight = (height: string) => {
    if (reinforcements.value[0]) {
        reinforcements.value[0].height = height;
    }
    console.log(`Reinforcement 1 converted height: ${height}`);
    checkForChanges();
};

/* ------------------------------------------
 * DYNAMIC REINFORCEMENTS / STIRRUPS
 * ------------------------------------------ */
const addReinforcement = () => {
    reinforcements.value.push({ qty: '', diameter: 0, support: false, height: '', height_original: '' });
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
    selectedPile: selectedPile.value,
    type: pileType.value ? 'Circular' : 'Rectangle',
    name: pileName.value.trim(),
    quantity: parseFloat(pileQty.value.trim()) || 0,
    height: parseFloat(stripMm(pileHeight.value)) || 0,
    height_original: basicOriginalValues.value.pileHeight || '',
    width: pileType.value ? 0 : parseFloat(stripMm(pileWidth.value)) || 0,
    width_original: basicOriginalValues.value.pileWidth || '',
    length: pileType.value ? 0 : parseFloat(stripMm(pileLength.value)) || 0,
    length_original: basicOriginalValues.value.pileLength || '',
    diameter: parseFloat(stripMm(pileRadius.value)) || 0,
    diameter_original: basicOriginalValues.value.pileRadius || '',
    reinforcements: reinforcements.value.map(r => ({
        rod_qty: parseFloat(r.qty.trim()) || 0,
        rod_diameter: r.diameter || 0,
        height: parseFloat(stripMm(r.height ?? '')) || 0,
        support: r.support || false,
        height_original: r.height_original || ''
    })),
    stirrups: [
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
    ],

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
            ? await post(`/api/pile/update/${props.pileData?.id}`, formData)
            : await post('/api/pile/create', formData);

        showToast('success', `${formMode.value === 'update' ? 'Updated' : 'Created'} successfully`);
        emit('submit-response', response);
        if (formMode.value === 'create') resetForm();
        if (formMode.value === 'update') resetForm();
    } catch (error) {
        showToast('error', 'Submission failed');
    }
};

const resetForm = () => {
    selectedPile.value = '';
    pileType.value = true;
    pileName.value = '';
    pileQty.value = '';
    pileHeight.value = '';
    pileWidth.value = '';
    pileLength.value = '';
    pileRadius.value = '';
    imageURL.value = '';


    basicOriginalValues.value = {
        pileHeight: '', pileWidth: '', pileLength: '', pileRadius: ''
    };

    reinforcements.value = [{ qty: '', diameter: 0, support: false, height: '', height_original: '' }];
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
            <p>PILE INPUTS</p>
        </div>
        <!-- INPUT GROUP -->
        <div class="input-group onuman-insider-scrollbar onuman-input-height">
            <!-- ITEM(PRESETS) -->
            <div class="input-group-item combobox-wrapper">
                <OnumanCombobox id="onuman-combobox-pile" :options="pileOptions" placeholder="Select Pile Preset"
                    v-model:selected="selectedPile" />
            </div>
            <!-- PILE BASIC INPUTS -->
            <PileBasic v-model:pileType="pileType" v-model:pileName="pileName" v-model:pileQty="pileQty"
                v-model:pileHeight="pileHeight" v-model:pileWidth="pileWidth" v-model:pileLength="pileLength"
                v-model:pileRadius="pileRadius" :originalPileHeight="basicOriginalValues.pileHeight"
                :originalPileWidth="basicOriginalValues.pileWidth" :originalPileLength="basicOriginalValues.pileLength"
                :originalPileRadius="basicOriginalValues.pileRadius" @update:originalValue="handleOriginalInputs" />


            <!-- LONG REINFORCEMENTS -->
            <LongReinforcements v-model:reinforcements="reinforcements"
                @reinforcement-originalHeight="handleOriginalHeight" @reinforcement-height="handleConvertedHeight"
                @add-reinforcement="addReinforcement" @remove-reinforcement="removeReinforcement" />


            <!-- STIRRUPS -->
            <Stirrups :spacing="spacing" :spacing_original="spacing_original" :rodDiameter="rodDiameter"
                :rodDiameter_original="rodDiameter_original" :midSpacing="midSpacing"
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
                        content="Save the inputs as <span style='color: #4c8'>preset</span>. <br><u>Note:</u> Pile name will set as preset name"
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