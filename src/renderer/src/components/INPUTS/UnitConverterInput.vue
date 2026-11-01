<!-- components/INPUTS/UnitConverterInput.vue -->

<template>
    <div class="input-group-item">
        <label :for="inputId">
            <!-- SLOT FOR LABEL CONTENT -->
            <slot name="label" />

            <!-- SHOW ERROR SLOT IF THERE IS AN ERROR, OTHERWISE SHOW ORIGINAL INPUT SLOT -->
            <slot v-if="errorMessage" name="error" :error="errorMessage" />
            <slot v-else name="originalInput" :original="resultOriginalInputs" />
        </label>

        <!-- TEXT INPUT BOUND TO USER INPUT -->
        <input :id="inputId" class="onuman-input2" :class="{ 'red-border': errorMessage }" type="text"
            :placeholder="placeholder || 'Ex: 4ft 2in, 10sft, 5cft'" v-model="userInput" @change="handleInput"
            required />

        <!-- HELP TEXT FOR UNIT TYPES -->
        <div class="unit-help-text" v-if="showHelp">
            <small>
                <strong>Linear:</strong> mm, cm, m, in, ft, yd<br>
                <strong>Square:</strong> smm, scm, sm, sin, sft, syd<br>
                <strong>Cubic:</strong> cmm, ccm, cm, cin, cft, cyd
            </small>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUnitConverter } from '../../composables/useUnitConverter';
import { useUnitStore } from '../../stores/unitStore';

// DEFINE COMPONENT PROPERTIES
const props = defineProps<{
    modelValue: string;
    inputId: string;
    placeholder?: string;
    originalValue?: string;
    showHelp?: boolean;
    defaultUnit?: string; // Optional prop to override store unit
}>();

// DEFINE EMITTED EVENTS
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'update:originalValue', value: string): void;
}>();

// LOCAL STATE FOR USER INPUT
const userInput = ref<string>(props.modelValue || '');

// GET UNIT CONVERTER FUNCTION AND STORE
const { convertToMm } = useUnitConverter();
const unitStore = useUnitStore();

// STATE FOR ERROR MESSAGE AND ORIGINAL INPUT DISPLAY
const errorMessage = ref<string | null>(null);
const resultOriginalInputs = ref<string>(props.originalValue || '');

// HANDLE INPUT CHANGE AND PERFORM CONVERSION
const handleInput = () => {
    // Use provided defaultUnit prop or fall back to store's targetUnit
    const selectedUnit = props.defaultUnit || unitStore.targetUnit;

    const { result, originalInputs } = convertToMm(
        userInput.value,
        props.inputId,
        selectedUnit
    );

    if (result !== null) {
        // SUCCESSFUL CONVERSION
        emit('update:modelValue', result);
        errorMessage.value = null;
        resultOriginalInputs.value = originalInputs;
    } else {
        // CONVERSION FAILED - SET ERROR MESSAGE
        errorMessage.value = originalInputs; // Use the error message from converter
        resultOriginalInputs.value = userInput.value;
    }

    // EMIT UNCONVERTED/ORIGINAL INPUT VALUE
    emit('update:originalValue', resultOriginalInputs.value);
};

// WATCH FOR EXTERNAL CHANGES TO modelValue PROP AND UPDATE LOCAL STATE
watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue !== userInput.value) {
            userInput.value = newValue;
        }
    },
    { immediate: true }
);

// WATCH FOR EXTERNAL CHANGES TO originalValue PROP AND UPDATE LOCAL STATE
watch(
    () => props.originalValue,
    (newValue) => {
        if (newValue !== resultOriginalInputs.value) {
            resultOriginalInputs.value = newValue || '';
        }
    },
    { immediate: true }
);
</script>
