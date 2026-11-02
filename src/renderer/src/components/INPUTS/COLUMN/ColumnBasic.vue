<!-- components/INPUTS/COLUMN/ColumnBasic.vue -->
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
 * PROPS: COLUMN BASIC INFORMATION AND ORIGINAL VALUES
 * ------------------------------------------ */
const props = defineProps<{
    columnType: boolean
    columnShape: boolean
    columnName: string
    columnQty: string
    columnHeight: string
    clearCover: string
    columnWidth: string
    columnLength: string
    columnRadius: string
    originalColumnHeight: string
    originalClearCover: string
    originalColumnWidth: string
    originalColumnLength: string
    originalColumnRadius: string
    selectedFloors: number[]
}>()

watch(
    () => props.selectedFloors,
    (newVal) => {
        selected.value = [...newVal]
    },
    { immediate: true }
)

/* ------------------------------------------
 * EMITS: HANDLE VALUE UPDATES AND VALIDATION
 * ------------------------------------------ */
const emit = defineEmits<{
    (e: 'update:columnType', value: boolean): void
    (e: 'update:columnShape', value: boolean): void
    (e: 'update:columnName', value: string): void
    (e: 'update:columnQty', value: string): void
    (e: 'update:columnHeight', value: string): void
    (e: 'update:clearCover', value: string): void
    (e: 'update:columnWidth', value: string): void
    (e: 'update:columnLength', value: string): void
    (e: 'update:columnRadius', value: string): void
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
    const target = event.target as HTMLInputElement
    let value = target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
    if (value.startsWith('.')) value = '0' + value
    target.value = value

    emit(`update:${field}` as any, value)
    emit('input:validate', event, field)
}


/* ------------------------------------------
 * HANDLE COLUMN NAME INPUT
 * ------------------------------------------ */
// const handlePileNameChange = (event: Event) => {
//     const target = event.target as HTMLInputElement
//     emit('update:columnName', target.value)
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
                    COLUMN TYPE
        ------------------------------------------ -->
        <fieldset class="fieldset-basic-inputs">
            <legend>Column Type</legend>
            <div class="input-group extended">
                <!-- SHORT COLUMN -->
                <Tooltip content="<span style='color: #1de0c6'>Short Column</span>" position="top">
                    <input type="radio" :value="true" :checked="columnType === true" name="columnType" id="shortColumn"
                        @change="emit('update:columnType', true)" required>
                    <label for="shortColumn">Short</label>
                </Tooltip>
                <!-- LONG COLUMN -->
                <Tooltip content="<span style='color: #1de0c6'>Long Column</span>" position="top">
                    <input type="radio" :value="false" :checked="columnType === false" name="columnType" id="longColumn"
                        @change="emit('update:columnType', false)">
                    <label for="longColumn">Long</label>
                </Tooltip>
            </div>
        </fieldset>
        <!-- ------------------------------------------
                    COLUMN FLOOR SELECTION
        ------------------------------------------ -->
        <fieldset class="fieldset-basic-inputs" v-if="columnType === false">
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
            <legend>Column Basic Inputs</legend>
            <!-- ------------------------------------------
            COLUMN TYPE SELECTOR (CIRCULAR OR RECTANGULAR)
            ------------------------------------------ -->

            <div class="input-group-item type">
                <span class="type-label">
                    <h4>Column Shape</h4>
                    <div class="disc-data">
                        <!-- CIRCULAR -->
                        <Tooltip class="disc-tooltip"
                            content="Circular Type <span style='color: #1de0c6'>(Default)</span>" position="top">
                            <input type="radio" name="columnShape" :value="true" :checked="columnShape === true"
                                id="circle" class="pileType" @change="emit('update:columnShape', true)" required />
                            <span class="circle" :class="{ active: columnShape }"></span>
                        </Tooltip>
                        <!-- RECTANGULAR -->
                        <Tooltip class="disc-tooltip" content="Rectangle Type" position="top">
                            <input type="radio" name="columnShape" :value="false" :checked="columnShape === false"
                                id="rectangle" class="pileType" @change="emit('update:columnShape', false)" required />
                            <span class="ractangle" :class="{ active: !columnShape }"></span>
                        </Tooltip>
                    </div>
                </span>
            </div>

            <!-- ------------------------------------------
            COLUMN QUANTITY (ONLY NUMBERS ALLOWED)
            ------------------------------------------ -->
            <div class="input-group-item">
                <label for="column-qty">Column Quantity</label>
                <input class="onuman-input2" type="text" maxlength="5" :value="columnQty" name="column-qty"
                    id="column-qty" placeholder="Type Column Quantity" @input="onlyNumber($event, 'columnQty')" />
            </div>

            <!-- ------------------------------------------
            COLUMN HEIGHT
            ------------------------------------------ -->
            <UnitConverterInput :value="columnHeight" :modelValue="columnHeight" inputId="columnHeight"
                @update:modelValue="emit('update:columnHeight', $event)"
                @update:originalValue="handleOriginalValue('columnHeight', $event)">
                <template #label>Column Height</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalColumnHeight" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalColumnHeight }}</span>
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

            <!-- ------------------------------------------
                COLUMN RADIUS (CIRCULAR TYPE ONLY)
            ------------------------------------------ -->
            <UnitConverterInput v-if="columnShape" :value="columnRadius" :modelValue="columnRadius"
                inputId="columnRadius" @update:modelValue="emit('update:columnRadius', $event)"
                @update:originalValue="handleOriginalValue('columnRadius', $event)">
                <template #label>Column Diameter</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalColumnRadius" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalColumnRadius }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- ------------------------------------------
            COLUMN WIDTH (RECTANGLE ONLY)
            ------------------------------------------ -->
            <UnitConverterInput v-if="!columnShape" :value="columnWidth" :modelValue="columnWidth" inputId="columnWidth"
                @update:modelValue="emit('update:columnWidth', $event)"
                @update:originalValue="handleOriginalValue('columnWidth', $event)">
                <template #label>Column Width</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalColumnWidth" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalColumnWidth }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- ------------------------------------------
            COLUMN LENGTH (RECTANGLE ONLY)
            ------------------------------------------ -->
            <UnitConverterInput v-if="!columnShape" :value="columnLength" :modelValue="columnLength"
                inputId="columnLength" @update:modelValue="emit('update:columnLength', $event)"
                @update:originalValue="handleOriginalValue('columnLength', $event)">
                <template #label>Column Length</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalColumnLength" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalColumnLength }}</span>
                    </div>
                </template>
            </UnitConverterInput>
        </fieldset>
    </section>
</template>