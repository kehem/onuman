<!-- components/INPUTS/BEAM/PileBasic.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import Tooltip from '../../../components/Initializers/ToolTip.vue'
import UnitConverterInput from '../../INPUTS/UnitConverterInput.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const total_floors = Number(route.query.totalFloors);


const selected = ref<number[]>([])

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
 * PROPS: BEAM BASIC INFORMATION AND ORIGINAL VALUES
 * ------------------------------------------ */
const props = defineProps<{
    beamType: 'grade' | 'floor' | 'lintel'
    beamName: string
    beamQty: string
    beamHeight: string
    clearCover: string
    beamWidth: string
    beamLength: string
    beamRadius: string
    originalBeamHeight: string
    originalClearCover: string
    originalBeamWidth: string
    originalBeamLength: string
    originalBeamRadius: string
    selectedFloors: number[]
}>()

watch(
    () => props.selectedFloors,
    (newVal) => {
        console.log('Received selectedFloors from parent:', newVal)
        selected.value = [...newVal]
    },
    { immediate: true }
)

/* ------------------------------------------
 * EMITS: HANDLE VALUE UPDATES AND VALIDATION
 * ------------------------------------------ */
const emit = defineEmits<{
    (
        e: `update:${'beamType' | 'beamName' | 'beamQty' | 'beamHeight' | 'clearCover' | 'beamWidth' | 'beamLength' | 'beamRadius'}`,
        value: string
    ): void
    (e: 'update:selectedFloors', value: number[]): void

    (e: 'input:validate', event: Event, field: string): void
    (e: 'update:originalValue', field: string, value: string): void
}>()


/* ------------------------------------------
 * EMIT ORIGINAL VALUE TO PARENT
 * ------------------------------------------ */
const handleOriginalValue = (field: string, value: string) => {
    emit('update:originalValue', field, value)
}

/* ------------------------------------------
 * SANITIZE INPUT: ALLOW NUMERIC INPUT ONLY
 * ------------------------------------------ */
const onlyNumber = (event: Event, field: string) => {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
    if (value.startsWith('.')) value = '0' + value;

    emit(`update:${field}` as any, value);
    emit('input:validate', event, field);
}


/* ------------------------------------------
 * HANDLE BEAM NAME INPUT
 * ------------------------------------------ */
// const handlePileNameChange = (event: Event) => {
//     const target = event.target as HTMLInputElement
//     emit('update:beamName', target.value)
// }

/* ------------------------------------------
 * DEV: WATCH FOR PROP CHANGES
 * ------------------------------------------ */
// watch(
//     () => ({ ...props }),
//     (newProps) => {
//         console.log('PileBasic.vue received props:', newProps)
//     },
//     { deep: true, immediate: true }
// )
</script>

<template>
    <section class="report-section">

        <!-- ------------------------------------------
                    BEAM TYPE
        ------------------------------------------ -->
        <fieldset class="fieldset-basic-inputs">
            <legend>Beam Type</legend>
            <div class="input-group extended">
                <!-- FLOOR BEAM -->
                <Tooltip content="<span style='color: #ffa500'>Floor Beam</span>" position="top">
                    <input type="radio" :value="'floor'" :checked="beamType === 'floor'" name="beamType" id="floorBeam"
                        @change="emit('update:beamType', 'floor')" required>
                    <label for="floorBeam">Floor</label>
                </Tooltip>

                <!-- LINTEL BEAM -->
                <Tooltip content="<span style='color: #ff6666'>Lintel Beam</span>" position="top">
                    <input type="radio" :value="'lintel'" :checked="beamType === 'lintel'" name="beamType"
                        id="lintelBeam" @change="emit('update:beamType', 'lintel')" required>
                    <label for="lintelBeam">Lintel</label>
                </Tooltip>
                
                <!-- GRADE BEAM -->
                <Tooltip content="<span style='color: #1de0c6'>Grade Beam</span>" position="top">
                    <input type="radio" :value="'grade'" :checked="beamType === 'grade'" name="beamType" id="gradeBeam"
                        @change="emit('update:beamType', 'grade')" required>
                    <label for="gradeBeam">Grade</label>
                </Tooltip>

            </div>
        </fieldset>

        <!-- ------------------------------------------
                    BEAM FLOOR SELECTION
        ------------------------------------------ -->
        <fieldset class="fieldset-basic-inputs" v-if="beamType !== 'grade'">
            <legend>Select Floor's</legend>
            <div class="preset-checker make-distance">
                <Tooltip :content="`Floor ${item}`" position="top" v-for="(item, index) in total_floors" :key="index">
                    <!-- FLOOR ${index} -->
                    <div class="checkbox">
                        <input type="checkbox" :id="`floor-${item}`" :value="item" :checked="selected.includes(item)"
                            @change="toggleFloor(item)" />

                        <label :for="`floor-${item}`">{{ item }}</label>
                    </div>
                </Tooltip>
            </div>
        </fieldset>

        <fieldset class="fieldset-basic-inputs">
            <legend>Beam Basic Inputs</legend>
            <!-- ------------------------------------------
            BEAM QUANTITY (ONLY NUMBERS ALLOWED)
            ------------------------------------------ -->
            <div class="input-group-item">
                <label for="beam-qty">Beam Quantity</label>
                <input class="onuman-input2" type="text" maxlength="5" :value="beamQty" name="beam-qty" id="beam-qty"
                    placeholder="Type Beam Quantity" @input="onlyNumber($event, 'beamQty')" required />
            </div>

            <!-- ------------------------------------------
            BEAM HEIGHT
            ------------------------------------------ -->
            <UnitConverterInput :value="beamHeight" :modelValue="beamHeight" inputId="beamHeight"
                @update:modelValue="emit('update:beamHeight', $event)"
                @update:originalValue="handleOriginalValue('beamHeight', $event)">
                <template #label>Beam Height</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalBeamHeight" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalBeamHeight }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- ------------------------------------------
            BEAM WIDTH (RECTANGLE ONLY)
            ------------------------------------------ -->
            <UnitConverterInput :value="beamWidth" :modelValue="beamWidth" inputId="beamWidth"
                @update:modelValue="emit('update:beamWidth', $event)"
                @update:originalValue="handleOriginalValue('beamWidth', $event)">
                <template #label>Beam Width</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalBeamWidth" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalBeamWidth }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- ------------------------------------------
            BEAM LENGTH (RECTANGLE ONLY)
            ------------------------------------------ -->
            <UnitConverterInput :value="beamLength" :modelValue="beamLength" inputId="beamLength"
                @update:modelValue="emit('update:beamLength', $event)"
                @update:originalValue="handleOriginalValue('beamLength', $event)">
                <template #label>Beam Length</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalBeamLength" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalBeamLength }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- ------------------------------------------
                            CLEAR COVER
            ------------------------------------------ -->
            <UnitConverterInput :value="clearCover" :modelValue="clearCover" inputId="clearCover"
                @update:modelValue="emit('update:clearCover', $event)"
                @update:originalValue="handleOriginalValue('clearCover', $event)">
                <template #label>Clear Cover</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalClearCover" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalClearCover }}</span>
                    </div>
                </template>
            </UnitConverterInput>

        </fieldset>
    </section>
</template>