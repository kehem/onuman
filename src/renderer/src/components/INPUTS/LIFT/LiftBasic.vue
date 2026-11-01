<!-- components/INPUTS/COLUMN/LiftBasic.vue -->
<script setup lang="ts">
import UnitConverterInput from '../../INPUTS/UnitConverterInput.vue'


/* ------------------------------------------
 * PROPS: COLUMN BASIC INFORMATION AND ORIGINAL VALUES
 * ------------------------------------------ */
defineProps<{
    columnQty: string
    columnHeight: string
    clearCover: string
    columnWidth: string
    columnLength: string
    originalColumnHeight: string
    originalClearCover: string
    originalColumnWidth: string
    originalColumnLength: string
}>()

/* ------------------------------------------
 * EMITS: HANDLE VALUE UPDATES AND VALIDATION
 * ------------------------------------------ */
const emit = defineEmits<{
    (
        e: `update:${'columnQty' | 'columnHeight' | 'clearCover' | 'columnWidth' | 'columnLength'}`,
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

</script>

<template>
    <section>
        
        
        <fieldset class="fieldset-basic-inputs">
            <legend>Lift Basic Inputs</legend>

            <!-- ------------------------------------------
            COLUMN QUANTITY (ONLY NUMBERS ALLOWED)
            ------------------------------------------ -->
            <div class="input-group-item">
                <label for="column-qty">Lift Quantity</label>
                <input class="onuman-input2" type="text" maxlength="5" :value="columnQty" name="column-qty"
                    id="column-qty" placeholder="Type Lift Quantity" @input="onlyNumber($event, 'columnQty')" />
            </div>

            <!-- ------------------------------------------
            COLUMN HEIGHT
            ------------------------------------------ -->
            <UnitConverterInput :value="columnHeight" :modelValue="columnHeight" inputId="columnHeight"
                @update:modelValue="emit('update:columnHeight', $event)"
                @update:originalValue="handleOriginalValue('columnHeight', $event)">
                <template #label>Lift Height</template>
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
            COLUMN WIDTH
            ------------------------------------------ -->
            <UnitConverterInput :value="columnWidth" :modelValue="columnWidth" inputId="columnWidth"
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
            COLUMN LENGTH
            ------------------------------------------ -->
            <UnitConverterInput :value="columnLength" :modelValue="columnLength"
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