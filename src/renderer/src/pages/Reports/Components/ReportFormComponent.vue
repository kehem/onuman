<!-- /src/components/ReportFormComponent.vue -->
<!-- MAIN REPORT FORM COMPONENT -->
<template>
    <form class="input-group-container sadnoawr32sad" @submit="submitForm">
        <div class="group-name">Select Report Options</div>
        <aside class="input-group onuman-insider-scrollbar sdcf-df234r onuman-input-height">

            <!-- PROJECT SELECTION -->
            <ProjectSelection :project-list="projectList" :selected-project-id="selectedProjectId"
                :selected-operations="selectedOperations" :availableChecked="AvailableChecked"
                @update:selected-project-id="handleProjectIdUpdate"
                @update:selected-operations="selectedOperations = $event" />

            <!-- EXTERIOR SECTION -->
            <fieldset class="fieldset-basic-inputs" v-if="selectedOperations.length">
                <legend class="sdfw43zq1">
                    <strong class="success uppercase">{{ operationLegend }}</strong>
                </legend>

                <!-- FLOOR AND PROPERTY SELECTION -->
                <FloorPropertySelection :selected-base-items="selectedBaseItems" :selected-floors="selectedFloors"
                    :selected-properties="selectedProperties" :total-floors="totalFloors" :show-property="showProperty"
                    :selected-operations="selectedOperations" @update:selected-base-items="selectedBaseItems = $event"
                    :availableChecked="AvailableChecked" @update:selected-floors="selectedFloors = $event"
                    @update:selected-properties="selectedProperties = $event" />


                <!-- REPORT OPTIONS -->
                <ReportOptions :selected-option="selectedOption" :selected-items="selectedItems"
                    :selected-report-summery-items="selectedReportSummeryItems" :wastage="wastage"
                    :materials-name="materialsName" @update:selected-option="selectedOption = $event"
                    @update:selected-items="selectedItems = $event"
                    @update:selected-report-summery-items="selectedReportSummeryItems = $event"
                    @update:wastage="wastage = $event" @update:materials-name="materialsName = $event" />

                <!-- SPECIFIC ITEMS SELECTION -->
                <SpecificItemsSelection :selected-option="selectedOption" :selected-items="selectedItems"
                    :selected-base-items="selectedBaseItems" :selected-properties="selectedProperties"
                    :wastage="wastage" :materials-name="materialsName" @update:selected-items="selectedItems = $event"
                    @update:wastage="wastage = $event" @update:materials-name="materialsName = $event" />
            </fieldset>

            <!-- SUBMIT BUTTON -->
            <input type="submit" value="Submit" class="onuman-submit-btn" style="min-height: 2rem;"
                :disabled="isLoading" />
        </aside>
    </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type {
    Project,
    FormSubmissionPayload,
    SelectOptionType,
    AVAILABLE_DATA
} from '../Types/ReportFormTypes';

// IMPORT CHILD COMPONENTS
import ProjectSelection from './ProjectSelectionNew.vue';
import FloorPropertySelection from './FloorPropertySelection.vue';
import ReportOptions from './ReportOptions.vue';
import SpecificItemsSelection from './SpecificItemsSelection.vue';

// COMPONENT PROPS
interface Props {
    projectList: Project[];
    isLoading: boolean;
    AvailableChecked: AVAILABLE_DATA | null;
}

const props = defineProps<Props>();


// COMPONENT EMITS
const emit = defineEmits<{
    submit: [payload: FormSubmissionPayload];
    'update:selected-project-id': [projectId: number | null];
}>();

// ------------------------------------------
// * REACTIVE VARIABLES
// ------------------------------------------
const selectedProjectId = ref<number | null>(null);
const selectedProperties = ref<string[]>([]);
const selectedItems = ref<string[]>([]);
const selectedBaseItems = ref<string[]>([]);
const selectedReportSummeryItems = ref<string[]>([]);
const selectedOperations = ref<string[]>([]);
const selectedOption = ref<SelectOptionType>('all');
const selectedFloors = ref<number[]>([]);
const wastage = ref<number>(5);
const materialsName = ref<string>('');

// ------------------------------------------
// * COMPUTED PROPERTIES
// ------------------------------------------
const selectedProject = computed(() =>
    props.projectList.find((project) => project.id === selectedProjectId.value)
);

const totalFloors = computed(() =>
    selectedProject.value
        ? Array.from({ length: selectedProject.value.totalFloor }, (_, i) => i + 1)
        : []
);
// PROJECT ID UPDATE HANDLER
const handleProjectIdUpdate = (projectId: number | null) => {
    selectedProjectId.value = projectId;
    emit('update:selected-project-id', projectId);
};

const showProperty = computed(() => selectedFloors.value.length > 0);

// ------------------------------------------
// * METHODS
// ------------------------------------------

// FORM SUBMISSION
const normalize = (val: string) => val.toLowerCase().replace(/\s+/g, '_');

const submitForm = (e: Event) => {
    e.preventDefault();

    const formattedItems = selectedItems.value
        .filter(item => {
            if (selectedOption.value === 'specific') {
                return /^[^:]+:[^:]+$/.test(item);
            } else {
                return /^:[^:]+$/.test(item);
            }
        })
        .map(item => normalize(item.replace(/^:/, '')));

    const formattedBaseItems = selectedBaseItems.value
        .filter(item => {
            if (selectedOption.value === 'specific') {
                return /^[^:]+:[^:]+$/.test(item);
            } else {
                return /^:[^:]+$/.test(item);
            }
        })
        .map(item => normalize(item.replace(/^:/, '')));

    const payload: FormSubmissionPayload = {
        projectId: selectedProjectId.value,
        operations: selectedOperations.value.map(normalize),
        floors: selectedFloors.value,
        properties: selectedProperties.value.map(normalize),
        items: formattedBaseItems.length > 0 && formattedItems.length > 0
            ? formattedBaseItems.concat(formattedItems)
            : formattedBaseItems.length > 0
                ? formattedBaseItems
                : formattedItems,
        baseItems: selectedBaseItems.value.map(normalize),
        reportSummeryItems: selectedReportSummeryItems.value.map(normalize),
        wastage: wastage.value,
        material: materialsName.value.toLowerCase(),
    };

    emit('submit', payload);
};


const operationLegend = computed(() => {
    const allOperations = ['Exterior', 'Interior', 'Finish'];
    if (selectedOperations.value.length === allOperations.length) {
        return 'ALL';
    }
    return selectedOperations.value.join(', ');
});


// ------------------------------------------
// * WATCHERS
// ------------------------------------------
watch(selectedItems, () => {
    if (selectedItems.value.some(i => i.endsWith(':Casting')) && !materialsName.value) {
        materialsName.value = 'Brick';
    }
});
</script>

<style scoped lang="scss">
/* LAYOUT STYLES */
.onuman-input-height-2 {
    margin-top: 0;
    height: calc(100vh - 8.7rem);
}

.onuman-input-height {
    margin-top: 0;
    height: calc(100vh - 11.2rem);
}
</style>