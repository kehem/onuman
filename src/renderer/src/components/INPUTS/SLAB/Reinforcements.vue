<!-- components/INPUTS/SLUB/Reinforcements.vue -->
<script setup lang="ts">
/* ------------------------------------------
 * IMPORTS
 * ------------------------------------------ */
import { ref, onMounted, computed } from 'vue';
import { HeightOption } from '../../../Interfaces/Inputs';
import Tooltip from '../../Initializers/ToolTip.vue';
import UnitConverterInput from '../UnitConverterInput.vue';
import { useApi } from '../../../composables/useApi';
const { get } = useApi()

/* ------------------------------------------
 * INTERFACE FOR REINFORCEMENT STRUCTURE
 * ------------------------------------------ */
interface Reinforcement {
    id?: string
    support?: boolean
    length: string
    length_original: string
    horizontal_diameter: number
    horizontal_distance: string
    horizontal_distance_original: string
    width: string
    width_original: string
    vertical_diameter: number
    vertical_distance: string
    vertical_distance_original: string
}

/* ------------------------------------------
 * PROPS AND EMITS DEFINITIONS
 * ------------------------------------------ */
const props = defineProps<{
    reinforcements: Reinforcement[];
    isArea: boolean;
    crankBar?: boolean;
    topBar?: boolean;
    crankBarSupport?: boolean;
    topBarSupport?: boolean;
    slabWidth?: string;
    slabLength?: string;
    slabWidthOriginal?: string;
    slabLengthOriginal?: string;
    inputMode?: string;
}>();

const emit = defineEmits<{
    (e: 'update:reinforcements', value: Reinforcement[]): void;
    (e: 'add-reinforcement'): void;
    (e: 'remove-reinforcement', index: number): void;
    (e: 'reinforcement-horizontal_diameter', diameter: number): void;
    (e: 'reinforcement-horizontal_distance', horizontal_distance: string): void;
    (e: 'reinforcement-horizontal_distance_original', index: number, horizontal_distance_original: string): void;
    (e: 'reinforcement-width', width: string): void;
    (e: 'reinforcement-width_original', index: number, width_original: string): void;
    (e: 'reinforcement-vertical_diameter', diameter: number): void;
    (e: 'reinforcement-vertical_distance', vertical_distance: string): void;
    (e: 'reinforcement-vertical_distance_original', index: number, vertical_distance_original: string): void;
    (e: 'reinforcement-length', length: string): void;
    (e: 'reinforcement-length_original', index: number, length_original: string): void;
    (e: 'update:crankBar', value: boolean): void;
    (e: 'update:topBar', value: boolean): void;
    (e: 'update:crankBarSupport', value: boolean): void;
    (e: 'update:topBarSupport', value: boolean): void;
}>();

/* ------------------------------------------
 * LOCAL STATES AND COMPUTED
 * ------------------------------------------ */
const diameterOptions = ref<HeightOption[]>([]);
const crankBar = computed(() => props.crankBar || false);
const topBar = computed(() => props.topBar || false);

/* ------------------------------------------
 * CONVERTS UNIT STRING VALUES AND DIVIDE BY 3
 * ------------------------------------------ */
const divideValueByThree = (value: string): string => {
    if (!value || !value.trim()) return '';

    const valueStr = value.trim();

    // HANDLE "2ft 5in" FORMAT
    const compoundMatch = valueStr.match(/^(\d+(?:\.\d+)?)\s*(\w+)\s+(\d+(?:\.\d+)?)\s*(\w+)$/i);
    if (compoundMatch) {
        const [, num1, unit1, num2, unit2] = compoundMatch;
        const dividedNum1 = (parseFloat(num1) / 3).toFixed(2);
        const dividedNum2 = (parseFloat(num2) / 3).toFixed(2);
        return `${dividedNum1}${unit1} ${dividedNum2}${unit2}`;
    }

    // HANDLE "10ft", "100mm" FORMAT
    const singleMatch = valueStr.match(/^(\d+(?:\.\d+)?)\s*(\w+)$/i);
    if (singleMatch) {
        const [, num, unit] = singleMatch;
        const dividedNum = (parseFloat(num) / 3).toFixed(2);
        return `${dividedNum}${unit}`;
    }

    // PURE NUMBER CASE
    const numberMatch = valueStr.match(/^(\d+(?:\.\d+)?)$/);
    if (numberMatch) {
        const dividedNum = (parseFloat(numberMatch[1]) / 3).toFixed(2);
        return dividedNum;
    }

    return valueStr;
};

/* ------------------------------------------
 * REMOVE "mm" FROM VALUE
 * ------------------------------------------ */
const stripMm = (val: string | number | undefined | null): string => {
    if (val === null || val === undefined) return '';
    return String(val).replace(/mm/i, '').trim();
};

/* ------------------------------------------
 * CRANK BAR AUTO-CALCULATION BASED ON WIDTH
 * ------------------------------------------ */
const crankBarData = computed(() => {
    if (!crankBar.value || !props.reinforcements.length) return [];

    return props.reinforcements.map((reinforcement) => {
        let sourceWidth = 0;
        let sourceWidthOriginal = '';

        if (props.inputMode === 'manual') {
            sourceWidth = parseFloat(stripMm(props.slabWidth)) || 0;
            sourceWidthOriginal = props.slabWidthOriginal || '';
        } else {
            sourceWidth = parseFloat(stripMm(reinforcement.width)) || 0;
            sourceWidthOriginal = reinforcement.width_original || '';
        }

        let calculatedOriginal = '';
        if (sourceWidthOriginal) {
            calculatedOriginal = divideValueByThree(sourceWidthOriginal);
        }

        return {
            ...reinforcement,
            width: (sourceWidth / 3).toFixed(2) + ' mm',
            width_original: calculatedOriginal,
        };
    });
});

/* ------------------------------------------
 * TOP BAR AUTO-CALCULATION BASED ON LENGTH
 * ------------------------------------------ */
const topBarData = computed(() => {
    if (!topBar.value || !props.reinforcements.length) return [];

    return props.reinforcements.map((reinforcement) => {
        let sourceLength = 0;
        let sourceLengthOriginal = '';

        if (props.inputMode === 'manual') {
            sourceLength = parseFloat(stripMm(props.slabLength)) || 0;
            sourceLengthOriginal = props.slabLengthOriginal || '';
        } else {
            sourceLength = parseFloat(stripMm(reinforcement.length)) || 0;
            sourceLengthOriginal = reinforcement.length_original || '';
        }

        let calculatedOriginal = '';
        if (sourceLengthOriginal) {
            calculatedOriginal = divideValueByThree(sourceLengthOriginal);
        }

        return {
            ...reinforcement,
            length: (sourceLength / 3).toFixed(2) + ' mm',
            length_original: calculatedOriginal,
        };
    });
});

/* ------------------------------------------
 * FETCH BAR OPTIONS FROM API
 * ------------------------------------------ */
onMounted(async () => {
    
    

    try {
        const data= await get<HeightOption[]>('/api/bar_list');
        diameterOptions.value = data;
    } catch (e) {
        // SILENT FAIL ON ERROR
    }
});

/* ------------------------------------------
 * FIELD UPDATER FOR REINFORCEMENTS
 * ------------------------------------------ */
const updateReinforcementField = (
    index: number,
    field: keyof Reinforcement,
    value: string | number | boolean
) => {
    const updated = [...props.reinforcements];

    const stringVal = String(value);
    const numberVal = typeof value === 'string' ? parseFloat(value) : Number(value);
    const booleanVal = Boolean(value);

    if (!updated[index]) return;

    switch (field) {
        case 'horizontal_diameter':
            if (!isNaN(numberVal)) {
                updated[index] = { ...updated[index], horizontal_diameter: numberVal };
                emit('reinforcement-horizontal_diameter', numberVal);
            }
            break;

        case 'vertical_diameter':
            if (!isNaN(numberVal)) {
                updated[index] = { ...updated[index], vertical_diameter: numberVal };
                emit('reinforcement-vertical_diameter', numberVal);
            }
            break;

        case 'horizontal_distance':
            updated[index] = { ...updated[index], horizontal_distance: stringVal };
            emit('reinforcement-horizontal_distance', stringVal);
            emit('reinforcement-horizontal_distance_original', index, stringVal);
            break;

        case 'vertical_distance':
            updated[index] = { ...updated[index], vertical_distance: stringVal };
            emit('reinforcement-vertical_distance', stringVal);
            emit('reinforcement-vertical_distance_original', index, stringVal);
            break;

        case 'width':
            updated[index] = { ...updated[index], width: stringVal };
            emit('reinforcement-width', stringVal);
            emit('reinforcement-width_original', index, stringVal);
            break;

        case 'length':
            updated[index] = { ...updated[index], length: stringVal };
            emit('reinforcement-length', stringVal);
            emit('reinforcement-length_original', index, stringVal);
            break;

        case 'horizontal_distance_original':
        case 'vertical_distance_original':
        case 'width_original':
        case 'length_original':
            updated[index] = { ...updated[index], [field]: stringVal };
            break;

        case 'support':
            updated[index] = { ...updated[index], support: booleanVal };
            break;

        default:
            updated[index] = { ...updated[index], [field]: stringVal };
            break;
    }

    emit('update:reinforcements', updated);
};

/* ------------------------------------------
 * SUPPORT CHECKBOX HANDLERS
 * ------------------------------------------ */
const handleCrankBarChange = (checked: boolean) => {
    emit('update:crankBar', checked);
};

const handleTopBarChange = (checked: boolean) => {
    emit('update:topBar', checked);
};

const handleCrankBarSupportChange = (checked: boolean) => {
    emit('update:crankBarSupport', checked);
};

const handleTopBarSupportChange = (checked: boolean) => {
    emit('update:topBarSupport', checked);
};
</script>


<template>
    <fieldset class="fieldset-basic-inputs">
        <legend>Long Reinforcements</legend>
        <div v-for="(reinforcement, index) in props.reinforcements" :key="reinforcement.id"
            class="input-group-item cas78aXwe354">
            <div class="inaline">
                <!-- HEADER -->
                <div class="reinforcement-divider">
                    <div class="reinforcement-counter">Reinforcement {{ index + 1 }}</div>
                    <div class="reinforcement-checked">
                        <Tooltip content="Reinforcement <span style='color:turquoise;'>Check for Support</span>"
                            position="left">
                            <span class="checkbox">
                                <input type="checkbox" :checked="reinforcement.support"
                                    :name="`checked-reinforcement-${index + 1}`"
                                    :id="`checked-reinforcement-${index + 1}`"
                                    @change="updateReinforcementField(index, 'support', ($event.target as HTMLInputElement).checked)" />
                            </span>
                        </Tooltip>
                    </div>
                </div>

                <!-- HORIZONTAL -->
                <fieldset class="fieldset-basic-inputs">
                    <legend>HORIZONTAL</legend>

                    <!-- Width input - show for area mode or when manual mode doesn't have SlabBasic width -->
                    <UnitConverterInput v-if="isArea || (inputMode === 'manual' && !slabWidth)"
                        v-model="reinforcements[index].width" :inputId="`rodwidth-${index}`"
                        :originalValue="reinforcements[index].width_original"
                        @update:originalValue="updateReinforcementField(index, 'width_original', $event)">
                        <template #label>Width</template>
                        <template #error="{ error }">
                            <span class="error-message">{{ error }}</span>
                        </template>
                        <template #originalInput="{ original }">
                            <div v-if="original" class="original-value">
                                Original: <br />
                                <span class="original-input">{{ original }}</span>
                            </div>
                        </template>
                    </UnitConverterInput>


                    <!-- Show SlabBasic width info when in manual mode -->
                    <div v-else-if="inputMode === 'manual' && slabWidth" class="input-group-item">
                        <label>Width (From SlabBasic)</label>
                        <input class="onuman-input2" type="text" :value="slabWidth" readonly
                            style="background-color: #f5f5f5; color: #666;" />
                        <small style="color: #666; font-size: 0.85em;">
                            Using width from SlabBasic inputs
                        </small>
                    </div>

                    <div class="input-group-item combobox-wrapper">
                        <label :for="`reinforcement-horizontal-${index}`">Diameter</label>
                        <select :id="`reinforcement-horizontal-${index}`" class="onuman-select-box"
                            :value="reinforcements[index].horizontal_diameter"
                            @change="updateReinforcementField(index, 'horizontal_diameter', ($event.target as HTMLSelectElement).value)">
                            <option value="" disabled>Select Diameter (bar)</option>
                            <option v-for="d in diameterOptions" :key="`${d.bar}-${d.suta}`" :value="Number(d.bar)">
                                #{{ d.suta }} ({{ d.bar }} mm)
                            </option>
                        </select>
                    </div>

                    <UnitConverterInput v-model="reinforcements[index].horizontal_distance"
                        :inputId="`horizontal_roddistance-${index}`"
                        :originalValue="reinforcements[index].horizontal_distance_original"
                        @update:originalValue="updateReinforcementField(index, 'horizontal_distance_original', $event)">
                        <template #label>Distance</template>
                        <template #error="{ error }">
                            <span class="error-message">{{ error }}</span>
                        </template>
                        <template #originalInput="{ original }">
                            <div v-if="original" class="original-value">
                                Original: <br />
                                <span class="original-input">{{ original }}</span>
                            </div>
                        </template>
                    </UnitConverterInput>
                </fieldset>

                <!-- VERTICAL -->
                <fieldset class="fieldset-basic-inputs">
                    <legend>VERTICAL</legend>

                    <!-- Length input - show for area mode or when manual mode doesn't have SlabBasic length -->
                    <UnitConverterInput v-if="isArea || (inputMode === 'manual' && !slabLength)"
                        v-model="reinforcements[index].length" :inputId="`rodlength-${index}`"
                        :originalValue="reinforcements[index].length_original"
                        @update:originalValue="updateReinforcementField(index, 'length_original', $event)">
                        <template #label>Length</template>
                        <template #error="{ error }">
                            <span class="error-message">{{ error }}</span>
                        </template>
                        <template #originalInput="{ original }">
                            <div v-if="original" class="original-value">
                                Original: <br />
                                <span class="original-input">{{ original }}</span>
                            </div>
                        </template>
                    </UnitConverterInput>

                    <!-- Show SlabBasic length info when in manual mode -->
                    <div v-else-if="inputMode === 'manual' && slabLength" class="input-group-item">
                        <label>Length (From SlabBasic)</label>
                        <input class="onuman-input2" type="text" :value="slabLength" readonly
                            style="background-color: #f5f5f5; color: #666;" />
                        <small style="color: #666; font-size: 0.85em;">
                            Using length from SlabBasic inputs
                        </small>
                    </div>

                    <div class="input-group-item combobox-wrapper">
                        <label :for="`reinforcement-vertical-${index}`">Diameter</label>
                        <select :id="`reinforcement-vertical-${index}`" class="onuman-select-box"
                            :value="reinforcements[index].vertical_diameter"
                            @change="updateReinforcementField(index, 'vertical_diameter', ($event.target as HTMLSelectElement).value)">
                            <option value="" disabled>Select Diameter (bar)</option>
                            <option v-for="d in diameterOptions" :key="`${d.bar}-${d.suta}`" :value="Number(d.bar)">
                                #{{ d.suta }} ({{ d.bar }} mm)
                            </option>
                        </select>
                    </div>

                    <UnitConverterInput v-model="reinforcements[index].vertical_distance"
                        :inputId="`rodvertical_distance-${index}`"
                        :originalValue="reinforcements[index].vertical_distance_original"
                        @update:originalValue="updateReinforcementField(index, 'vertical_distance_original', $event)">
                        <template #label>Distance</template>
                        <template #error="{ error }">
                            <span class="error-message">{{ error }}</span>
                        </template>
                        <template #originalInput="{ original }">
                            <div v-if="original" class="original-value">
                                Original: <br />
                                <span class="original-input">{{ original }}</span>
                            </div>
                        </template>
                    </UnitConverterInput>
                </fieldset>
            </div>

            <!-- ACTIONS -->
            <div v-if="index === props.reinforcements.length - 1" class="onuman-action-btn">
                <Tooltip content="<span style='color:turquoise;'>Remove</span> Reinforcement" position="bottom">
                    <span class="onuman-minus-btn" @click="emit('remove-reinforcement', index)"></span>
                </Tooltip>
                <Tooltip content="<span style='color:turquoise;'>Add New</span> Reinforcement" position="bottom">
                    <span class="onuman-plus-btn" @click="emit('add-reinforcement')"></span>
                </Tooltip>
            </div>
        </div>

        <!-- CRANK BAR SECTION -->
        <div v-if="crankBar" v-for="(crankReinforcement, index) in crankBarData"
            :key="`crank-${crankReinforcement.id}-${index}`" class="input-group-item cas78aXwe354">
            <div class="inaline">
                <!-- HEADER -->
                <div class="reinforcement-divider">
                    <div class="reinforcement-counter">Crank Bar - {{ index + 1 }}</div>
                    <div class="reinforcement-checked">
                        <Tooltip content="Reinforcement <span style='color:turquoise;'>Check for Support</span>"
                            position="left">
                            <span class="checkbox">
                                <input type="checkbox" :checked="props.crankBarSupport"
                                    :name="`checked-crank-${index + 1}`" :id="`checked-crank-${index + 1}`"
                                    @change="handleCrankBarSupportChange(($event.target as HTMLInputElement).checked)" />
                            </span>
                        </Tooltip>
                    </div>
                </div>

                <UnitConverterInput :modelValue="crankReinforcement.width" :inputId="`crank-rodwidth-${index}`"
                    :originalValue="crankReinforcement.width_original" readonly>
                    <template #label>Width (Auto: {{ inputMode === 'manual' ? 'SlabBasic' : 'Reinforcement' }} /
                        3)</template>
                    <template #error="{ error }">
                        <span class="error-message">{{ error }}</span>
                    </template>
                    <template #originalInput="{ original }">
                        <div v-if="original" class="original-value">
                            Original: <br />
                            <span class="original-input">{{ original }}</span>
                        </div>
                    </template>
                </UnitConverterInput>

                <div class="input-group-item combobox-wrapper">
                    <label :for="`crank-horizontal-${index}`">Diameter</label>
                    <select :id="`crank-horizontal-${index}`" class="onuman-select-box"
                        :value="crankReinforcement.horizontal_diameter">
                        <option value="" disabled>Select Diameter (bar)</option>
                        <option v-for="d in diameterOptions" :key="`${d.bar}-${d.suta}`" :value="Number(d.bar)">
                            #{{ d.suta }} ({{ d.bar }} mm)
                        </option>
                    </select>
                </div>

                <UnitConverterInput :modelValue="crankReinforcement.horizontal_distance"
                    :inputId="`crank-horizontal_roddistance-${index}`"
                    :originalValue="crankReinforcement.horizontal_distance_original" readonly>
                    <template #label>Distance</template>
                    <template #error="{ error }">
                        <span class="error-message">{{ error }}</span>
                    </template>
                    <template #originalInput="{ original }">
                        <div v-if="original" class="original-value">
                            Original: <br />
                            <span class="original-input">{{ original }}</span>
                        </div>
                    </template>
                </UnitConverterInput>
            </div>

            <!-- CRANK BAR ACTIONS -->
            <div class="onuman-action-btn">
                <Tooltip content="<span style='color:turquoise;'>Remove</span> Crank Bar" position="bottom">
                    <span class="onuman-minus-btn" @click="handleCrankBarChange(false)"></span>
                </Tooltip>
            </div>
        </div>

        <!-- TOP BAR SECTION -->
        <div v-if="topBar" v-for="(topReinforcement, index) in topBarData" :key="`top-${topReinforcement.id}-${index}`"
            class="input-group-item cas78aXwe354">
            <div class="inaline">
                <!-- HEADER -->
                <div class="reinforcement-divider">
                    <div class="reinforcement-counter">Top Bar - {{ index + 1 }}</div>
                    <div class="reinforcement-checked">
                        <Tooltip content="Reinforcement <span style='color:turquoise;'>Check for Support</span>"
                            position="left">
                            <span class="checkbox">
                                <input type="checkbox" :checked="props.topBarSupport" :name="`checked-top-${index + 1}`"
                                    :id="`checked-top-${index + 1}`"
                                    @change="handleTopBarSupportChange(($event.target as HTMLInputElement).checked)" />
                            </span>
                        </Tooltip>
                    </div>
                </div>

                <UnitConverterInput :modelValue="topReinforcement.length" :inputId="`top-rodlength-${index}`"
                    :originalValue="topReinforcement.length_original" readonly>
                    <template #label>Length (Auto: {{ inputMode === 'manual' ? 'SlabBasic' : 'Reinforcement' }} /
                        3)</template>
                    <template #error="{ error }">
                        <span class="error-message">{{ error }}</span>
                    </template>
                    <template #originalInput="{ original }">
                        <div v-if="original" class="original-value">
                            Original: <br />
                            <span class="original-input">{{ original }}</span>
                        </div>
                    </template>
                </UnitConverterInput>

                <div class="input-group-item combobox-wrapper">
                    <label :for="`top-vertical-${index}`">Diameter</label>
                    <select :id="`top-vertical-${index}`" class="onuman-select-box"
                        :value="topReinforcement.vertical_diameter">
                        <option value="" disabled>Select Diameter (bar)</option>
                        <option v-for="d in diameterOptions" :key="`${d.bar}-${d.suta}`" :value="Number(d.bar)">
                            #{{ d.suta }} ({{ d.bar }} mm)
                        </option>
                    </select>
                </div>

                <UnitConverterInput :modelValue="topReinforcement.vertical_distance"
                    :inputId="`top-rodvertical_distance-${index}`"
                    :originalValue="topReinforcement.vertical_distance_original" readonly>
                    <template #label>Distance</template>
                    <template #error="{ error }">
                        <span class="error-message">{{ error }}</span>
                    </template>
                    <template #originalInput="{ original }">
                        <div v-if="original" class="original-value">
                            Original: <br />
                            <span class="original-input">{{ original }}</span>
                        </div>
                    </template>
                </UnitConverterInput>
            </div>

            <!-- TOP BAR ACTIONS -->
            <div class="onuman-action-btn">
                <Tooltip content="<span style='color:turquoise;'>Remove</span> Top Bar" position="bottom">
                    <span class="onuman-minus-btn" @click="handleTopBarChange(false)"></span>
                </Tooltip>
            </div>
        </div>

        <!-- CRANK BAR -->
        <span class="preset-checker">
            <Tooltip content="Check if this is a <span style='color: #4c8'>Crank bar</span>" position="top">
                <div class="checkbox">
                    <input type="checkbox" id="preset-checker2" name="preset-checker2" :checked="crankBar"
                        @change="handleCrankBarChange(($event.target as HTMLInputElement).checked)" />
                    <label for="preset-checker2">Is Crank Bar ?</label>
                </div>
            </Tooltip>
        </span>

        <!-- TOP BAR -->
        <span class="preset-checker">
            <Tooltip content="Check if this is a <span style='color: #4c8'>Top bar</span>" position="top">
                <div class="checkbox">
                    <input type="checkbox" id="preset-checker1" name="preset-checker1" :checked="topBar"
                        @change="handleTopBarChange(($event.target as HTMLInputElement).checked)" />
                    <label for="preset-checker1">Is Top Bar ?</label>
                </div>
            </Tooltip>
        </span>
    </fieldset>
</template>

<style scoped lang="scss">
.inaline {
    flex-direction: column !important;

    .fieldset-basic-inputs {
        flex: 1;
    }
}

.error-message {
    color: #e29118;
    font-size: 0.9em;
    margin-top: 0.5em;
}
</style>