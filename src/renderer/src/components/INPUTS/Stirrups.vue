<!-- components/INPUTS/Stirrups.vue -->

<script setup lang="ts">
/* ------------------------------------------
 * IMPORT REQUIRED MODULES & COMPONENTS
 * ------------------------------------------ */
// import { watch } from 'vue';
import { Stirrup } from '../../Interfaces/Pile';
import Tooltip from '../../components/Initializers/ToolTip.vue';
import UnitConverterInput from '../INPUTS/UnitConverterInput.vue';

/* ------------------------------------------
 * DEFINE PROPS
 * ------------------------------------------ */
const props = defineProps<{
    spacing: string;
    spacing_original: string;
    rodDiameter: string;
    rodDiameter_original: string;
    midSpacing: string;
    midSpacing_original: string;
    midRodDiameter: string;
    midRodDiameter_original: string; 
    stirrups: Stirrup[];
}>();

/* ------------------------------------------
 * WATCH FOR PROP CHANGES (FOR DEBUGGING)
 * ------------------------------------------ */
// watch(
//     () => props,
//     (newVal, oldVal) => {
//         console.log('Props changed:', { newVal, oldVal });
//     },
//     { deep: true }
// );

/* ------------------------------------------
 * DEFINE EMITS
 * ------------------------------------------ */
const emit = defineEmits<{
    (e: 'update:spacing', value: string): void;
    (e: 'update:rodDiameter', value: string): void;
    (e: 'update:midSpacing', value: string): void;
    (e: 'update:midRodDiameter', value: string): void;
    (e: 'update:stirrups', value: Stirrup[]): void;
    (e: 'add-stirrup'): void;
    (e: 'remove-stirrup', index: number): void;
    (e: 'stirrup-originalDeduction', index: number, value: string): void;
    (e: 'stirrup-originalDiameter', index: number, value: string): void;
    (e: 'stirrup-originalLength', index: number, value: string): void;
    (e: 'stirrup-originalHeight', index: number, value: string): void;
    (e: 'spacing-original', value: string): void;
    (e: 'rodDiameter-original', value: string): void;
    (e: 'midSpacing-original', value: string): void;
    (e: 'midRodDiameter-original', value: string): void;
}>();

/* ------------------------------------------
 * UPDATE DYNAMIC STIRRUP FIELD
 * ------------------------------------------ */
const updateStirrupField = (index: number, field: keyof Stirrup, value: string) => {
    const updatedStirrups = [...props.stirrups];
    updatedStirrups[index] = { ...updatedStirrups[index], [field]: value };
    emit('update:stirrups', updatedStirrups);
};

/* ------------------------------------------
 * UPDATE ORIGINAL FIELD FOR STIRRUP
 * ------------------------------------------ */
// const updateStirrupOriginalField = (index: number, field: keyof Stirrup, value: string) => {
//     const updatedStirrups = [...props.stirrups];
//     const originalField = `${field}_original` as keyof Stirrup;
//     updatedStirrups[index] = { ...updatedStirrups[index], [originalField]: value };
//     emit('update:stirrups', updatedStirrups);
// };
</script>

<template>
    <fieldset class="fieldset-basic-inputs">
        <legend>Stirrup</legend>

        <div class="input-group-item">
            <div class="stirrup-container">

                <!-- ------------------------------------------
                     STATIC INPUTS FOR SUPPORT & MID SPACING
                ------------------------------------------- -->
                <div class="inner-stirrup">
                    <aside class="stirrup">
                        <!-- SUPPORT SPACING -->
                        <UnitConverterInput :modelValue="spacing" :originalValue="spacing_original" inputId="spacing"
                            @update:modelValue="emit('update:spacing', $event)"
                            @update:originalValue="emit('spacing-original', $event)">
                            <template #label>Support Spacing</template>
                            <template #error="{ error }">
                                <span class="error-message">{{ error }}</span>
                            </template>
                            <template #originalInput="{ original }">
                                <div v-if="original" class="original-value">
                                    Original: <span class="original-input">{{ original }}</span>
                                </div>
                            </template>
                        </UnitConverterInput>

                        <!-- SUPPORT ROD DIAMETER -->
                        <UnitConverterInput :modelValue="rodDiameter" :originalValue="rodDiameter_original"
                            inputId="rodDiameter" @update:modelValue="emit('update:rodDiameter', $event)"
                            @update:originalValue="emit('rodDiameter-original', $event)">
                            <template #label>Support Rod Diameter</template>
                            <template #error="{ error }">
                                <span class="error-message">{{ error }}</span>
                            </template>
                            <template #originalInput="{ original }">
                                <div v-if="original" class="original-value">
                                    Original: <span class="original-input">{{ original }}</span>
                                </div>
                            </template>
                        </UnitConverterInput>
                    </aside>

                    <aside class="stirrup">
                        <!-- MID SPACING -->
                        <UnitConverterInput :modelValue="midSpacing" :originalValue="midSpacing_original"
                            inputId="midSpacing" @update:modelValue="emit('update:midSpacing', $event)"
                            @update:originalValue="emit('midSpacing-original', $event)">
                            <template #label>Mid Spacing</template>
                            <template #error="{ error }">
                                <span class="error-message">{{ error }}</span>
                            </template>
                            <template #originalInput="{ original }">
                                <div v-if="original" class="original-value">
                                    Original: <span class="original-input">{{ original }}</span>
                                </div>
                            </template>
                        </UnitConverterInput>

                        <!-- MID ROD DIAMETER -->
                        <UnitConverterInput :modelValue="midRodDiameter" :originalValue="midRodDiameter_original"
                            inputId="midRodDiameter" @update:modelValue="emit('update:midRodDiameter', $event)"
                            @update:originalValue="emit('midRodDiameter-original', $event)">
                            <template #label>Mid Rod Diameter</template>
                            <template #error="{ error }">
                                <span class="error-message">{{ error }}</span>
                            </template>
                            <template #originalInput="{ original }">
                                <div v-if="original" class="original-value">
                                    Original: <span class="original-input">{{ original }}</span>
                                </div>
                            </template>
                        </UnitConverterInput>
                    </aside>
                </div>

                <!-- ------------------------------------------
                     ADD BUTTON (IF NO STIRRUPS EXIST)
                ------------------------------------------- -->
                <button v-if="stirrups.length === 0" type="button" class="onuman-btn" @click="emit('add-stirrup')">
                    <i class="m-plus2"></i> Add Stirrup
                </button>

                <!-- ------------------------------------------
                     DYNAMIC STIRRUP INPUTS (IF ANY EXIST)
                ------------------------------------------- -->
                <div v-if="stirrups.length > 0" class="dynamic-stirrup-container">
                    <div v-for="(stirrup, index) in stirrups" :key="index" class="dynamic-stirrup inner-stirrup">
                        <div class="stirrup-counter"><b>X{{ index + 3 }}</b> Stirrup</div>

                        <aside class="stirrup">
                            <!-- STIRRUP DEDUCTION -->
                            <UnitConverterInput :modelValue="stirrup.deduction"
                                :originalValue="stirrup.deduction_original" :inputId="`stirrupDeduction-${index}`"
                                @update:modelValue="updateStirrupField(index, 'deduction', $event)"
                                @update:originalValue="val => emit('stirrup-originalDeduction', index, val)">
                                <template #label>X{{ index + 3 }} Deduction</template>
                                <template #error="{ error }">
                                    <span class="error-message">{{ error }}</span>
                                </template>
                                <template #originalInput="{ original }">
                                    <div v-if="original" class="original-value">
                                        Original: <span class="original-input">{{ original }}</span>
                                    </div>
                                </template>
                            </UnitConverterInput>

                            <!-- STIRRUP DIAMETER -->
                            <UnitConverterInput :modelValue="stirrup.diameter"
                                :originalValue="stirrup.diameter_original" :inputId="`stirrupDiameter-${index}`"
                                @update:modelValue="updateStirrupField(index, 'diameter', $event)"
                                @update:originalValue="val => emit('stirrup-originalDiameter', index, val)">
                                <template #label>X{{ index + 3 }} Diameter</template>
                                <template #error="{ error }">
                                    <span class="error-message">{{ error }}</span>
                                </template>
                                <template #originalInput="{ original }">
                                    <div v-if="original" class="original-value">
                                        Original: <span class="original-input">{{ original }}</span>
                                    </div>
                                </template>
                            </UnitConverterInput>
                        </aside>

                        <!-- STIRRUP HEIGHT -->
                        <UnitConverterInput :modelValue="stirrup.height ?? ''"
                            :originalValue="stirrup.height_original ?? ''" :inputId="`stirrupHeight-${index}`"
                            @update:modelValue="updateStirrupField(index, 'height', $event)"
                            @update:originalValue="val => emit('stirrup-originalHeight', index, val)">
                            <template #label>X{{ index + 3 }} Height</template>
                            <template #error="{ error }">
                                <span class="error-message">{{ error }}</span>
                            </template>
                            <template #originalInput="{ original }">
                                <div v-if="original" class="original-value">
                                    Original: <span class="original-input">{{ original }}</span>
                                </div>
                            </template>
                        </UnitConverterInput>
                    </div>

                    <!-- ------------------------------------------
                         ACTION BUTTONS: ADD / REMOVE STIRRUP
                    ------------------------------------------- -->
                    <div class="onuman-action-btn">
                        <Tooltip content="<span style='color:turquoise;'>Remove</span> Stirrup" position="bottom">
                            <span class="onuman-minus-btn set-stirrup-bottom"
                                @click="emit('remove-stirrup', stirrups.length - 1)"></span>
                        </Tooltip>

                        <Tooltip content="<span style='color:turquoise;'>Add</span> Stirrup" position="bottom">
                            <span class="onuman-plus-btn set-stirrup-bottom" @click="emit('add-stirrup')"></span>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    </fieldset>
</template>
