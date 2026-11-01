<!-- /src/Reports/components/ProjectSelectionNew.vue -->
<!-- PROJECT SELECTION COMPONENT -->
<template>
    <section class="report-section">
        <!-- PROJECT DROPDOWN -->
        <div>
            <label for="projects">Select Projects</label>
            <select class="onuman-select-box base-height-need" name="projects" id="projects"
                v-model="selectedProjectId">
                <option :value="null" disabled>-- Select Project --</option>
                <option v-for="item in projectList" :key="item.id" :value="item.id">
                    {{ item.projectName }}
                </option>
            </select>
        </div>

        <!-- OPERATIONS SELECTION -->
        <fieldset class="fieldset-basic-inputs" v-if="selectedProject">
            <legend>Select Options</legend>
            <div class="preset-checker make-distance padding">
                <div class="checkbox" v-for="(item, index) in OPERATIONS" :key="index">
                    <input type="checkbox" :id="`operation-${item}`" :value="item" v-model="selectedOperations" />
                    <label :for="`operation-${item}`">{{ item }}</label>
                </div>
            </div>
        </fieldset>
    </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { OPERATIONS } from '../Types/ReportFormTypes';
import type { Project, AVAILABLE_DATA } from '../Types/ReportFormTypes';

// COMPONENT PROPS
interface Props {
    projectList: Project[];
    selectedProjectId: number | null;
    selectedOperations: string[];
    availableChecked: AVAILABLE_DATA | null;
}

const props = defineProps<Props>();

// COMPONENT EMITS
const emit = defineEmits<{
    'update:selectedProjectId': [value: number | null];
    'update:selectedOperations': [value: string[]];
}>();

// COMPUTED PROPERTIES
const selectedProject = computed(() =>
    props.projectList.find((project) => project.id === props.selectedProjectId)
);

const selectedProjectId = computed({
    get: () => props.selectedProjectId,
    set: (value) => emit('update:selectedProjectId', value)
});

const selectedOperations = computed({
    get: () => props.selectedOperations,
    set: (value) => emit('update:selectedOperations', value)
});

// --- AUTO-CHECK OPTIONS BASED ON availableChecked.categories ---
watch(
    () => props.availableChecked,
    (newVal) => {
        if (!newVal?.categories) return;

        const autoSelected: string[] = [];
        for (const [key, val] of Object.entries(newVal.categories)) {
            if (val) autoSelected.push(key.charAt(0).toUpperCase() + key.slice(1));
        }

        emit('update:selectedOperations', autoSelected);
    },
    { immediate: true, deep: true }
);
</script>
