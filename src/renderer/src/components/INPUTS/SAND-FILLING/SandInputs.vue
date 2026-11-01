<!-- components/INPUTS/SandInputs.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from '../../../composables/Toast';
import { useApi } from '../../../composables/useApi';
const { get, post, stripMm } = useApi()

import UnitConverterInput from '../../INPUTS/UnitConverterInput.vue';

const props = defineProps<{
    projectID: number;
    sandData?: any | null | undefined;
    unit?: string;
}>();

const emit = defineEmits<{
    (e: 'submit-response', response: any): void;
    (e: 'update:area', value: string): void;
    (e: 'update:height', value: string): void;
}>();

const { showToast } = useToast();

onMounted(async () => {
    
    
});



// Initialize with existing data if in update mode
const area = ref(props.sandData?.area || '');
const height = ref(props.sandData?.height || '');
const originalArea = ref(props.sandData?.area_original || '');
const originalHeight = ref(props.sandData?.height_original || '');

// Determine if we're in create or update mode
const formMode = computed(() => props.sandData?.id ? 'update' : 'create');

// Track if there are changes (for update mode)
const hasChanges = computed(() => {
    if (formMode.value !== 'update') return true;
    return area.value !== props.sandData?.area ||
        height.value !== props.sandData?.height;
});

// Update local state when emitting to parent
const updateArea = (value: string) => {
    area.value = value;
    emit('update:area', value);
};

const updateHeight = (value: string) => {
    height.value = value;
    emit('update:height', value);
};

const handleOriginalValue = (field: string, value: string) => {
    if (field === 'area') originalArea.value = value;
    if (field === 'height') originalHeight.value = value;
};
const getFormDataJson = () => {
    return {
        projectId: props.projectID,
        area: stripMm(area.value.trim()),
        height: stripMm(height.value.trim()),
        area_original: originalArea.value,
        height_original: originalHeight.value,
    };
};

const resetForm = () => {
    area.value = '';
    height.value = '';
    originalArea.value = '';
    originalHeight.value = '';
};

/* ------------------------------------------
 * API INITIALIZATION
 * ------------------------------------------ */
onMounted(async () => {
    
    

    try {
        const response = await get(`/api/sand/ground_slab?projectId=${props.projectID}`);
        const fetchedArea = response.total_area;
        updateArea(fetchedArea);
    } catch (error) {
        console.error('Failed to fetch ground slab area:', error);
    }
});


/* ------------------------------------------
 * API INITIALIZATION
 * ------------------------------------------ */
const submitForm = async (event: Event) => {
    event.preventDefault();

    if (formMode.value === 'update' && !hasChanges.value) {
        showToast('info', 'No changes detected');
        return;
    }

    try {
        const formData = getFormDataJson();
        const response = formMode.value === 'update'
            ? await post(`/api/sand/update/${props.sandData?.id}`, formData)
            : await post('/api/sand/create', formData);

        showToast('success', `${formMode.value === 'update' ? 'Updated' : 'Created'} successfully`);
        emit('submit-response', response);
        if (formMode.value === 'create') resetForm();
        if (formMode.value === 'update') resetForm();
    } catch (error) {
        showToast('error', 'Submission failed');
        console.error('Submit error:', error);
    }
};

watch(
    () => props.sandData,
    (newSandData) => {
        area.value = newSandData?.area != null ? `${newSandData.area} mm` : '';
        height.value = newSandData?.height != null ? `${newSandData.height} mm` : '';
        originalArea.value = newSandData?.area_original || '';
        originalHeight.value = newSandData?.height_original || '';
    },
    { immediate: true }
);

</script>

<template>
    <form class="input-group-container" @submit="submitForm">
        <div class="group-name">
            <p>SAND INPUTS</p>
        </div>
        <div class="input-group onuman-insider-scrollbar onuman-input-height">
            <UnitConverterInput :value="area" :modelValue="area" inputId="area" @update:modelValue="updateArea"
                @update:originalValue="handleOriginalValue('area', $event)">
                <template #label>Area</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalArea" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalArea }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <UnitConverterInput :value="height" :modelValue="height" inputId="height" @update:modelValue="updateHeight"
                @update:originalValue="handleOriginalValue('height', $event)">
                <template #label>Height</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalHeight" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalHeight }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <div class="input-form-submit">
                <button type="submit" class="onuman-submit-btn btn-width" value="Submit">
                    {{ formMode === 'update' ? 'Update' : 'Submit' }}
                </button>
            </div>
        </div>
    </form>
</template>