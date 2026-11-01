<!-- components/INPUTS/PileBasic.vue -->
<script setup lang="ts">
import Tooltip from '../../components/Initializers/ToolTip.vue'
import UnitConverterInput from '../INPUTS/UnitConverterInput.vue'

/* ------------------------------------------
 * PROPS: PILE BASIC INFORMATION AND ORIGINAL VALUES
 * ------------------------------------------ */
defineProps<{
    pileType: boolean
    pileName: string
    pileQty: string
    pileHeight: string
    pileWidth: string
    pileLength: string
    pileRadius: string
    originalPileHeight: string
    originalPileWidth: string
    originalPileLength: string
    originalPileRadius: string
}>()

/* ------------------------------------------
 * EMITS: HANDLE VALUE UPDATES AND VALIDATION
 * ------------------------------------------ */
const emit = defineEmits<{
    (
        e: `update:${'pileType' | 'pileName' | 'pileQty' | 'pileHeight' | 'pileWidth' | 'pileLength' | 'pileRadius'}`,
        value: string | boolean
    ): void
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
 * HANDLE PILE NAME INPUT
 * ------------------------------------------ */
// const handlePileNameChange = (event: Event) => {
//     const target = event.target as HTMLInputElement
//     emit('update:pileName', target.value)
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
    <fieldset class="fieldset-basic-inputs">
        <legend>Pile Basic Inputs</legend>

        <!-- ------------------------------------------
         PILE TYPE SELECTOR (CIRCULAR OR RECTANGULAR)
         ------------------------------------------ -->
        <div class="input-group-item type">
            <span class="type-label">
                <h4>Pile Shape</h4>
                <div class="disc-data">
                    <!-- CIRCULAR -->
                    <Tooltip class="disc-tooltip" content="Circular Type <span style='color: #1de0c6'>(Default)</span>"
                        position="top">
                        <input type="radio" name="pileType" :value="true" :checked="pileType === true" id="circle"
                            class="pileType" @change="emit('update:pileType', true)" required />
                        <span class="circle" :class="{ active: pileType }"></span>
                    </Tooltip>

                    <!-- RECTANGULAR -->
                    <Tooltip class="disc-tooltip" content="Rectangle Type" position="top">
                        <input type="radio" name="pileType" :value="false" :checked="pileType === false" id="rectangle"
                            class="pileType" @change="emit('update:pileType', false)" required />
                        <span class="ractangle" :class="{ active: !pileType }"></span>
                    </Tooltip>
                </div>
            </span>
        </div>

        <!-- ------------------------------------------
         PILE NAME
         ------------------------------------------ -->
        <!-- <div class="input-group-item">
            <label for="pile-name">Pile Name</label>
            <input class="onuman-input2" type="text" :value="pileName" name="pile-name" id="pile-name"
                placeholder="Type Pile Name" maxlength="100" @input="handlePileNameChange" />
        </div> -->

        <!-- ------------------------------------------
         PILE QUANTITY (ONLY NUMBERS ALLOWED)
         ------------------------------------------ -->
        <div class="input-group-item">
            <label for="pile-qty">Pile Quantity</label>
            <input class="onuman-input2" type="text" maxlength="5" :value="pileQty" name="pile-qty" id="pile-qty"
                placeholder="Type Pile Quantity" @input="onlyNumber($event, 'pileQty')" required />
        </div>

        <!-- ------------------------------------------
         PILE HEIGHT
         ------------------------------------------ -->
        <UnitConverterInput :value="pileHeight" :modelValue="pileHeight" inputId="pileHeight"
            @update:modelValue="emit('update:pileHeight', $event)"
            @update:originalValue="handleOriginalValue('pileHeight', $event)">
            <template #label>Pile Height</template>
            <template #error="{ error }">
                <span class="error-message">{{ error }}</span>
            </template>
            <template #originalInput="{ original }">
                <div v-if="original || originalPileHeight" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalPileHeight }}</span>
                </div>
            </template>
        </UnitConverterInput>

        <!-- ------------------------------------------
         PILE RADIUS (CIRCULAR TYPE ONLY)
         ------------------------------------------ -->
        <UnitConverterInput v-if="pileType" :value="pileRadius" :modelValue="pileRadius" inputId="pileRadius"
            @update:modelValue="emit('update:pileRadius', $event)"
            @update:originalValue="handleOriginalValue('pileRadius', $event)">
            <template #label>Pile Diameter</template>
            <template #error="{ error }">
                <span class="error-message">{{ error }}</span>
            </template>
            <template #originalInput="{ original }">
                <div v-if="original || originalPileRadius" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalPileRadius }}</span>
                </div>
            </template>
        </UnitConverterInput>

        <!-- ------------------------------------------
         PILE WIDTH (RECTANGLE ONLY)
         ------------------------------------------ -->
        <UnitConverterInput v-if="!pileType" :value="pileWidth" :modelValue="pileWidth" inputId="pileWidth"
            @update:modelValue="emit('update:pileWidth', $event)"
            @update:originalValue="handleOriginalValue('pileWidth', $event)">
            <template #label>Pile Width</template>
            <template #error="{ error }">
                <span class="error-message">{{ error }}</span>
            </template>
            <template #originalInput="{ original }">
                <div v-if="original || originalPileWidth" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalPileWidth }}</span>
                </div>
            </template>
        </UnitConverterInput>

        <!-- ------------------------------------------
         PILE LENGTH (RECTANGLE ONLY)
         ------------------------------------------ -->
        <UnitConverterInput v-if="!pileType" :value="pileLength" :modelValue="pileLength" inputId="pileLength"
            @update:modelValue="emit('update:pileLength', $event)"
            @update:originalValue="handleOriginalValue('pileLength', $event)">
            <template #label>Pile Length</template>
            <template #error="{ error }">
                <span class="error-message">{{ error }}</span>
            </template>
            <template #originalInput="{ original }">
                <div v-if="original || originalPileLength" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalPileLength }}</span>
                </div>
            </template>
        </UnitConverterInput>
    </fieldset>
</template>