<!-- /src/Reports/components/ItemControls.vue -->

<!-- ITEM CONTROLS COMPONENT (WASTAGE & MATERIAL) -->
<template>
    <div>
        <!-- WASTAGE CONTROL -->
        <span class="new-popup-sect" v-if="showWastageControl">
            <div id="wastage-counter" @dblclick="editWastage">
                <template v-if="isEditingWastage">
                    <input type="number" v-model="wastageValue" class="onuman-input2" @blur="saveWastage" />
                </template>
                <template v-else>
                    <span class="warning c-pointer">({{ wastageValue }}%)</span>
                </template>
            </div>
        </span>

        <!-- CASTING MATERIAL CONTROL -->
        <span class="new-popup-sect dea21scfz" v-if="showMaterialControl">
            <div @dblclick="editMaterial" id="material-editor">
                <template v-if="isEditingMaterial">
                    <div class="input-group extended" v-for="material in MATERIALS" :key="material.trim()">
                        <input type="radio" :id="`material-${material.trim()}`" :value="material.trim()"
                            v-model="materialValue" />
                        <label :for="`material-${material.trim()}`">{{ material }}</label>
                    </div>
                </template>
                <template v-else>
                    <span class="warning c-pointer">({{ materialValue }})</span>
                </template>
            </div>
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { MATERIALS } from '../Types/ReportFormTypes';

// COMPONENT PROPS
interface Props {
    wastage: number;
    materialsName: string;
    showWastageControl: boolean;
    showMaterialControl: boolean;
}

const props = defineProps<Props>();

// COMPONENT EMITS
const emit = defineEmits<{
    'update:wastage': [value: number];
    'update:materialsName': [value: string];
}>();

// REACTIVE VARIABLES
const isEditingWastage = ref(false);
const isEditingMaterial = ref(false);

// COMPUTED PROPERTIES
const wastageValue = computed({
    get: () => props.wastage,
    set: (value) => emit('update:wastage', value)
});

const materialValue = computed({
    get: () => props.materialsName,
    set: (value) => {
        emit('update:materialsName', value);
        isEditingMaterial.value = false;
    }
});

// METHODS
const editWastage = () => {
    isEditingWastage.value = true;
};

const saveWastage = () => {
    isEditingWastage.value = false;
};

const editMaterial = () => {
    isEditingMaterial.value = true;
};
</script>