<!-- components/INPUTS/TILES/TilesBasic.vue -->
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
 * PROPS: TILES BASIC INFORMATION AND ORIGINAL VALUES
 * ------------------------------------------ */
const props = defineProps<{
    type: 'floor' | 'wall' | 'stair'
    name: string
    qty: string
    area: string
    amount: string
    labour_bill: string
    width: string
    length: string
    height: string
    stair_height: string
    originalHeight: string
    originalWidth: string
    originalLength: string
    originalArea: string
    originalStairHeight: string
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
    (e: 'update:type', value: 'floor' | 'wall' | 'stair'): void
    (e: 'update:name', value: string): void
    (e: 'update:qty', value: string): void
    (e: 'update:area', value: string): void
    (e: 'update:height', value: string): void
    (e: 'update:stair_height', value: string): void
    (e: 'update:amount', value: string): void
    (e: 'update:labour_bill', value: string): void
    (e: 'update:width', value: string): void
    (e: 'update:length', value: string): void
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
 * HANDLE TILES NAME INPUT (Allow text for name field)
 * ------------------------------------------ */
const handleNameChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:name', target.value)
}
</script>

<template>
    <section>
        <!-- ------------------------------------------
                    TILES FLOOR SELECTION
        ------------------------------------------ -->
        <br>
        <fieldset class="fieldset-basic-inputs">
            <legend>Select Floor's</legend>
            <div class="preset-checker make-distance">
                <Tooltip :content="`Floor ${item}`" position="top" v-for="(item, index) in total_floors" :key="index">
                    <div class="checkbox">
                        <input type="checkbox" :id="`floor-${item}`" :value="item" :checked="selected.includes(item)"
                            @change="toggleFloor(item)" />
                        <label :for="`floor-${item}`">{{ item }}</label>
                    </div>
                </Tooltip>
            </div>
        </fieldset>
        <br>

        <!-- ------------------------------------------
            BASE INFO
        ------------------------------------------ -->
        <fieldset class="fieldset-basic-inputs">
            <legend>Base Info</legend>

            <!-- TILES NAME -->
            <div class="input-group-item">
                <label for="name">Tiles Name</label>
                <input class="onuman-input2" type="text" maxlength="200" :value="name" name="name" id="name"
                    placeholder="Ex: Kitchen Tiles" @input="handleNameChange" required />
            </div>
            <!-- LABOUR CHARGE -->
            <div class="input-group-item">
                <label for="labour_bill">Labour Charge (PSF)</label>
                <input class="onuman-input2" type="text" maxlength="10" :value="labour_bill" name="labour_bill"
                    id="labour_bill" placeholder="Per Square Feet (taka)" @input="onlyNumber($event, 'labour_bill')"
                    required />
            </div>

        </fieldset><br>

        <!-- ------------------------------------------
                    TILES TYPE
        ------------------------------------------ -->
        <fieldset class="fieldset-basic-inputs">
            <legend>Tiles Type</legend>
            <div class="input-group extended">
                <!-- FLOOR TILES -->
                <Tooltip content="<span style='color: #1de0c6'>Floor Tiles</span>" position="top">
                    <input type="radio" :value="'floor'" :checked="type === 'floor'" name="type" id="floorTiles"
                        @change="emit('update:type', 'floor')" required>
                    <label for="floorTiles">Floor</label>
                </Tooltip>

                <!-- WALL TILES -->
                <Tooltip content="<span style='color: #ffa500'>Wall Tiles</span>" position="top">
                    <input type="radio" :value="'wall'" :checked="type === 'wall'" name="type" id="wallTiles"
                        @change="emit('update:type', 'wall')" required>
                    <label for="wallTiles">Wall</label>
                </Tooltip>

                <!-- STAIR TILES -->
                <Tooltip content="<span style='color: #ff6666'>Stair Tiles</span>" position="top">
                    <input type="radio" :value="'stair'" :checked="type === 'stair'" name="type" id="stairTiles"
                        @change="emit('update:type', 'stair')" required>
                    <label for="stairTiles">Stair</label>
                </Tooltip>
            </div>
        </fieldset>
        <br>

        <fieldset class="fieldset-basic-inputs">
            <legend>Tiles Basic Inputs</legend>

            <!-- TILES AREA (for floor type) -->
            <UnitConverterInput v-if="type === 'floor'" :value="area" :modelValue="area" inputId="area"
                @update:modelValue="emit('update:area', $event)"
                @update:originalValue="handleOriginalValue('Area', $event)">
                <template #label>Tiles Area</template>
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

            <!-- TILES WIDTH (for wall and stair types) -->
            <UnitConverterInput v-if="type !== 'floor'" :value="width" :modelValue="width" inputId="width"
                @update:modelValue="emit('update:width', $event)"
                @update:originalValue="handleOriginalValue('Width', $event)">
                <template #label>Tiles Width</template>
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

            <!-- TILES LENGTH (for wall and stair types) -->
            <UnitConverterInput v-if="type !== 'floor'" :value="length" :modelValue="length" inputId="length"
                @update:modelValue="emit('update:length', $event)"
                @update:originalValue="handleOriginalValue('Length', $event)">
                <template #label>Tiles Length</template>
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

            <!-- TILES HEIGHT-->
            <UnitConverterInput v-if="type !== 'floor'" :value="height" :modelValue="height" inputId="height"
                @update:modelValue="emit('update:height', $event)"
                @update:originalValue="handleOriginalValue('Height', $event)">
                <template #label>Tiles Height</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalHeight" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalHeight }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- STAIR TOP HEIGHT-->
            <UnitConverterInput v-if="type === 'stair'" :value="stair_height" :modelValue="stair_height" inputId="stair_height"
                @update:modelValue="emit('update:stair_height', $event)"
                @update:originalValue="handleOriginalValue('StairHeight', $event)">
                <template #label>Stair Top Height</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalStairHeight" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalStairHeight }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- TILES QUANTITY (for stair type only) -->
            <div class="input-group-item" v-if="type === 'stair'">
                <label for="qty">Tiles Quantity</label>
                <input class="onuman-input2" type="text" maxlength="10" :value="qty" name="qty" id="qty"
                    placeholder="Type Tiles Quantity" @input="onlyNumber($event, 'qty')" required />
            </div>

            <!-- TILES AMOUNT -->
            <div class="input-group-item">
                <label for="amount">Tiles Amount</label>
                <input class="onuman-input2" type="text" maxlength="10" :value="amount" name="amount" id="amount"
                    placeholder="Type Tiles Amount" @input="onlyNumber($event, 'amount')" required />
            </div>

        </fieldset>
    </section>
</template>