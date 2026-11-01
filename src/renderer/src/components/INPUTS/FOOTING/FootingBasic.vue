<!-- components/INPUTS/FootingBasic.vue -->

<script setup lang="ts">
import Tooltip from '../../../components/Initializers/ToolTip.vue'
import UnitConverterInput from '../../INPUTS/UnitConverterInput.vue'

/* ------------------------------------------
 * PROPS: FOOTING SHAPE INFO
 * ------------------------------------------ */
defineProps<{
    footingShape: 'Circle' | 'Rectangle' | 'Trapezoid'
    footingName: string
    footingQty: string
    footingHeight: string
    footingWidth: string
    footingLength: string
    footingRadius: string
    footingBaseTop: string
    originalFootingHeight: string
    originalFootingWidth: string
    originalFootingLength: string
    originalFootingRadius: string
    originalFootingBaseTop: string
}>()

// import { watch } from 'vue'

// watch(
//     () => ({ ...props }),
//     (newVal, oldVal) => {
//         console.log('FootingBasic props changed:', { newVal, oldVal })
//     },
//     { deep: true }
// )

/* ------------------------------------------
 * EMITS: HANDLE VALUE UPDATES AND VALIDATION
 * ------------------------------------------ */
const emit = defineEmits<{
    (
        e: `update:${'footingShape' | 'footingName' | 'footingQty' | 'footingHeight' | 'footingWidth' | 'footingLength' | 'footingRadius' | 'footingBaseTop'}`,
        value: string
    ): void
    (e: 'input:validate', event: Event, field: string): void
    (e: 'update:originalValue', field: string, value: string): void
}>()

/* ------------------------------------------
 * ORIGINAL VALUE EMIT
 * ------------------------------------------ */
const handleOriginalValue = (field: string, value: string) => {
    emit('update:originalValue', field, value)
}

/* ------------------------------------------
 * SANITIZE INPUT: NUMERIC ONLY
 * ------------------------------------------ */
const onlyNumber = (event: Event, field: string) => {
    const target = event.target as HTMLInputElement
    let value = target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1')
    if (value.startsWith('.')) value = '0' + value
    target.value = value

    emit(`update:${field}` as any, value)
    emit('input:validate', event, field)
}
</script>

<template>
    <fieldset class="fieldset-basic-inputs">
        <legend>Footing Basic Inputs</legend>

        <!-- FOOTING SHAPE RADIO -->
        <div class="input-group-item type">
            <span class="type-label">
                <h4>Shape</h4>
                <div class="disc-data">
                    <!-- Circle -->
                    <Tooltip class="disc-tooltip" content="Circular Shape (Default)" position="top">
                        <input class="pileType" type="radio" name="footingShape" value="Circle"
                            :checked="footingShape === 'Circle'" @change="emit('update:footingShape', 'Circle')" />
                        <span class="circle" :class="{ active: footingShape === 'Circle' }"></span>
                    </Tooltip>

                    <!-- Rectangle -->
                    <Tooltip class="disc-tooltip" content="Rectangle Shape" position="top">
                        <input class="pileType" type="radio" name="footingShape" value="Rectangle"
                            :checked="footingShape === 'Rectangle'"
                            @change="emit('update:footingShape', 'Rectangle')" />
                        <span class="ractangle" :class="{ active: footingShape === 'Rectangle' }"></span>
                    </Tooltip>

                    <!-- Trapezoid -->
                    <Tooltip class="disc-tooltip" content="Trapezoid Shape" position="top">
                        <input class="pileType" type="radio" name="footingShape" value="Trapezoid"
                            :checked="footingShape === 'Trapezoid'"
                            @change="emit('update:footingShape', 'Trapezoid')" />
                        <span class="trapezoid" :class="{ active: footingShape === 'Trapezoid' }"></span>
                    </Tooltip>
                </div>
            </span>
        </div>

        <!-- FOOTING QUANTITY -->
        <div class="input-group-item">
            <label for="footing-qty">Footing Quantity</label>
            <input class="onuman-input2" type="text" maxlength="5" :value="footingQty" name="footing-qty"
                id="footing-qty" placeholder="Shape Footing Quantity" @input="onlyNumber($event, 'footingQty')"
                required />
        </div>

        <!-- FOOTING HEIGHT (All Shapes) -->
        <UnitConverterInput :value="footingHeight" :modelValue="footingHeight" inputId="footingHeight"
            @update:modelValue="emit('update:footingHeight', $event)"
            @update:originalValue="handleOriginalValue('footingHeight', $event)">
            <template #label>Footing Height</template>
            <template #error="{ error }"><span class="error-message">{{ error }}</span></template>
            <template #originalInput="{ original }">
                <div v-if="original || originalFootingHeight" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalFootingHeight }}</span>
                </div>
            </template>
        </UnitConverterInput>

        <!-- RADIUS (Circle only) -->
        <UnitConverterInput v-if="footingShape === 'Circle'" :value="footingRadius" :modelValue="footingRadius"
            inputId="footingRadius" @update:modelValue="emit('update:footingRadius', $event)"
            @update:originalValue="handleOriginalValue('footingRadius', $event)">
            <template #label>Footing Diameter</template>
            <template #error="{ error }"><span class="error-message">{{ error }}</span></template>
            <template #originalInput="{ original }">
                <div v-if="original || originalFootingRadius" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalFootingRadius }}</span>
                </div>
            </template>
        </UnitConverterInput>

        <!-- WIDTH (Rectangle only) -->
        <UnitConverterInput v-if="footingShape === 'Rectangle' || footingShape === 'Trapezoid' " :value="footingWidth" :modelValue="footingWidth"
            inputId="footingWidth" @update:modelValue="emit('update:footingWidth', $event)"
            @update:originalValue="handleOriginalValue('footingWidth', $event)">
            <template #label v-if="footingShape === 'Rectangle'">Footing Width</template>
            <template #label v-else-if="footingShape === 'Trapezoid'">Footing Base (Bottom)</template>

            <template #error="{ error }"><span class="error-message">{{ error }}</span></template>
            <template #originalInput="{ original }">
                <div v-if="original || originalFootingWidth" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalFootingWidth }}</span>
                </div>
            </template>
        </UnitConverterInput>

        <!-- LENGTH (Rectangle only) -->
        <UnitConverterInput v-if="footingShape === 'Rectangle'" :value="footingLength" :modelValue="footingLength"
            inputId="footingLength" @update:modelValue="emit('update:footingLength', $event)"
            @update:originalValue="handleOriginalValue('footingLength', $event)">
            <template #label>Footing Length</template>
            <template #error="{ error }"><span class="error-message">{{ error }}</span></template>
            <template #originalInput="{ original }">
                <div v-if="original || originalFootingLength" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalFootingLength }}</span>
                </div>
            </template>
        </UnitConverterInput>

        <!-- BASE BOTTOM (Trapezoid only) -->
        <!-- <UnitConverterInput v-if="footingShape === 'Trapezoid'" :value="footingWidth" :modelValue="footingWidth"
            inputId="footingWidth" @update:modelValue="emit('update:footingWidth', $event)"
            @update:originalValue="handleOriginalValue('footingWidth', $event)">
            <template #label>Footing Base (Bottom)</template>
            <template #error="{ error }"><span class="error-message">{{ error }}</span></template>
            <template #originalInput="{ original }">
                <div v-if="original || originalFootingWidth" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalFootingWidth }}</span>
                </div>
            </template>
        </UnitConverterInput> -->

        <!-- BASE TOP (Trapezoid only) -->
        <UnitConverterInput v-if="footingShape === 'Trapezoid'" :value="footingBaseTop" :modelValue="footingBaseTop"
            inputId="footingBaseTop" @update:modelValue="emit('update:footingBaseTop', $event)"
            @update:originalValue="handleOriginalValue('footingBaseTop', $event)">
            <template #label>Footing Base (Top)</template>
            <template #error="{ error }"><span class="error-message">{{ error }}</span></template>
            <template #originalInput="{ original }">
                <div v-if="original || originalFootingBaseTop" class="original-value">
                    Original:<br />
                    <span class="original-input">{{ original || originalFootingBaseTop }}</span>
                </div>
            </template>
        </UnitConverterInput>

    </fieldset>
</template>
