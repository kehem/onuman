<!-- components/INPUTS/SLAB/SlabBasic.vue -->

<script setup lang="ts">
/* ------------------------------------------
 * IMPORTS
 * ------------------------------------------ */
import { ref, watch, computed } from 'vue'
import Tooltip from '../../../components/Initializers/ToolTip.vue'
import UnitConverterInput from '../../INPUTS/UnitConverterInput.vue'
import { useRoute } from 'vue-router'

/* ------------------------------------------
 * ROUTE AND FLOOR INFO
 * ------------------------------------------ */
const route = useRoute()
const total_floors = Number(route.query.totalFloors)

/* ------------------------------------------
 * REFS AND COMPUTEDS
 * ------------------------------------------ */
const selected = ref<number[]>([])

const inputMode = computed({
    get: () => props.inputMode,
    set: (value) => emit('update:inputMode', value)
})

/* ------------------------------------------
 * PROPS
 * ------------------------------------------ */
const props = defineProps<{
    slabType: 'Main' | 'Sun Shade' | 'False' | 'Ground';
    area: string;
    width: string;
    length: string;
    thickness: string;
    quantity: string;
    originalArea: string;
    originalLength: string;
    originalWidth: string;
    originalThickness: string;
    selectedFloors: number[];
    inputMode: 'area' | 'manual';
}>()

/* ------------------------------------------
 * EMITS
 * ------------------------------------------ */
const emit = defineEmits<{
    (e: `update:${'slabType' | 'area' | 'width' | 'length' | 'thickness' | 'quantity'}`, value: string): void;
    (e: 'update:selectedFloors', value: number[]): void;
    (e: 'input:validate', event: Event, field: string): void;
    (e: 'update:originalValue', field: string, value: string): void;
    (e: 'update:inputMode', value: 'area' | 'manual'): void;
}>()

/* ------------------------------------------
 * SLAB TYPE OPTIONS
 * ------------------------------------------ */
const slabTypes = ['Main', 'Sun Shade', 'False', 'Ground']

/* ------------------------------------------
 * HANDLE FLOOR CHECK TOGGLE
 * ------------------------------------------ */
const toggleFloor = (floor: number) => {
    const index = selected.value.indexOf(floor)
    if (index > -1) {
        selected.value.splice(index, 1)
    } else {
        selected.value.push(floor)
    }
    emit('update:selectedFloors', [...selected.value])
}

/* ------------------------------------------
 * SYNC EXTERNAL SELECTED FLOOR CHANGES
 * ------------------------------------------ */
watch(
    () => props.selectedFloors,
    (newVal) => {
        selected.value = [...newVal]
    },
    { immediate: true }
)

/* ------------------------------------------
 * HANDLE ORIGINAL VALUE CHANGE
 * ------------------------------------------ */
const handleOriginalValue = (field: string, value: string) => {
    emit('update:originalValue', field, value)
}

/* ------------------------------------------
 * FILTER INPUT FOR NUMBERS ONLY
 * ------------------------------------------ */
const onlyNumber = (event: Event, field: string) => {
    const target = event.target as HTMLInputElement
    let value = target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
    if (value.startsWith('.')) value = '0' + value
    target.value = value

    emit(`update:${field}` as any, value)
    emit('input:validate', event, field)
}

/* ------------------------------------------
 * HANDLE SWITCH BETWEEN AREA / MANUAL MODE
 * ------------------------------------------ */
const handleInputModeChange = (mode: 'area' | 'manual') => {
    inputMode.value = mode
    emit('update:inputMode', mode)
}
</script>


<template>
    <section class="report-section">
        <fieldset class="fieldset-basic-inputs">
            <legend>Slab Basic Inputs</legend>
            <!-- ------------------------------------------
            SLAB TYPE SELECTOR (CIRCULAR OR RECTANGULAR)
            ------------------------------------------ -->
            <div class="input-group-item combobox-wrapper">
                <label for="slabType">Slab Type</label>
                <select id="slabType" class="onuman-select-box" :value="slabType"
                    @change="emit('update:slabType', ($event.target as HTMLSelectElement).value)">
                    <option v-for="type in slabTypes" :key="type" :value="type">
                        {{ type }}
                    </option>
                </select>
            </div>


        <!-- ------------------------------------------
                    SLAB FLOOR SELECTION
        ------------------------------------------ -->
            <fieldset class="fieldset-basic-inputs" v-if="slabType !== 'Ground'">
                <legend>Select Floor's</legend>
                <div class="preset-checker make-distance">
                    <Tooltip :content="`Floor ${item}`" position="top" v-for="(item, index) in total_floors"
                        :key="index">
                        <!-- FLOOR ${index} -->
                        <div class="checkbox">
                            <input type="checkbox" :id="`floor-${item}`" :value="item"
                                :checked="selected.includes(item)" @change="toggleFloor(item)" />

                            <label :for="`floor-${item}`">{{ item }}</label>
                        </div>
                    </Tooltip>
                </div>
            </fieldset>

            <!-- AREA / MANUAL TOGGLE -->
            <div class="section">
                <fieldset class="fieldset-basic-inputs">
                    <legend>Input Type</legend>
                    <div class="input-group extended">
                        <!-- AREA -->
                        <Tooltip content="<span style='color: #1de0c6'>Direct Input Area</span>" position="top">
                            <input type="radio" :value="'area'" :checked="inputMode === 'area'" name="inputMode"
                                id="chooiceArea" @change="handleInputModeChange('area')" required>

                            <label for="chooiceArea">Area</label>
                        </Tooltip>
                        <!-- MANUAL -->
                        <Tooltip content="<span style='color: #1de0c6'>Manually Input Length Width</span>"
                            position="top">
                            <input type="radio" :value="'manual'" :checked="inputMode === 'manual'" name="inputMode"
                                id="longColumn" @change="handleInputModeChange('manual')">
                            <label for="longColumn">Manual</label>
                        </Tooltip>
                    </div>

                    <!-- IF AREA (DEFAULT) -->
                    <UnitConverterInput v-if="inputMode === 'area'" :value="area" :modelValue="area" inputId="area"
                        @update:modelValue="emit('update:area', $event)"
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

                    <!-- IF MANUAL -->
                    <div v-if="inputMode === 'manual'" class="manual-inputs">
                        <UnitConverterInput :value="length" :modelValue="length" inputId="length"
                            @update:modelValue="emit('update:length', $event)"
                            @update:originalValue="handleOriginalValue('length', $event)">
                            <template #label>Length</template>
                            <template #error="{ error }">
                                <span class="error-message">{{ error }}</span>
                            </template>
                            <template #originalInput="{ original }">
                                <div v-if="original || originalLength" class="original-value">
                                    Original:<br />
                                    <span class="original-input">{{ original || originalLength }}</span>
                                </div>
                            </template>
                        </UnitConverterInput>

                        <UnitConverterInput :value="width" :modelValue="width" inputId="width"
                            @update:modelValue="emit('update:width', $event)"
                            @update:originalValue="handleOriginalValue('width', $event)">
                            <template #label>Width</template>
                            <template #error="{ error }">
                                <span class="error-message">{{ error }}</span>
                            </template>
                            <template #originalInput="{ original }">
                                <div v-if="original || originalWidth" class="original-value">
                                    Original:<br />
                                    <span class="original-input">{{ original || originalWidth }}</span>
                                </div>
                            </template>
                        </UnitConverterInput>
                    </div>
                </fieldset>
            </div>

            <!-- ------------------------------------------
            SLAB QUANTITY (ONLY NUMBERS ALLOWED)
            ------------------------------------------ -->
            <div class="input-group-item">
                <label for="slab-qty">Quantity</label>
                <input class="onuman-input2" type="text" maxlength="5" :value="quantity" name="slab-qty" id="slab-qty"
                    placeholder="Type Quantity" @input="onlyNumber($event, 'quantity')" />
            </div>

            <!-- ------------------------------------------
            SLAB HEIGHT
            ------------------------------------------ -->
            <UnitConverterInput :value="thickness" :modelValue="thickness" inputId="thickness"
                @update:modelValue="emit('update:thickness', $event)"
                @update:originalValue="handleOriginalValue('thickness', $event)">
                <template #label>Thickness</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalThickness" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalThickness }}</span>
                    </div>
                </template>
            </UnitConverterInput>

        </fieldset>
    </section>
</template>