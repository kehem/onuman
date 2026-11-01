<!-- src/components/OUTPUTS/Tabs.vue -->
<template>
    <section class="tab-group">
        <!-- RENDER MAIN TABS ONLY IF PROVIDED, HAS ITEMS, AND NO EXCEPTIONS ARE MET -->
        <div v-if="mainTabs && mainTabs.length && !shouldHideMainTabs" class="main-tabs tabular">
            <h2 class="tab-title">Select Floor</h2>
            <div class="tab" v-for="item in mainTabs" :key="item" :class="{ active: selectedMainTab === item }"
                @click="selectMainTab(item)">
                <span>{{ item }}</span>
            </div>
        </div>

        <!-- RENDER SUB TABS ONLY IF PROVIDED AND HAS ITEMS -->
        <div v-if="subTabs && subTabs.length" class="sub-tabs tabular">
            <h2 class="tab-title">{{ itemType }}</h2>
            <div class="tab" v-for="item in subTabs" :key="item" :class="{ active: selectedSubTab === item }"
                @click="selectSubTab(item)">
                <span>{{ item }}</span>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

// ============================================================================
// COMPONENT PROPS DEFINITION
// ============================================================================
const props = defineProps<{
    mainTabs?: number[];           // ARRAY OF MAIN TAB NUMBERS (FLOORS)
    subTabs?: string[];            // ARRAY OF SUB TAB STRINGS (COLUMN TYPES)
    itemType?: string;             // DISPLAY NAME FOR SUB TABS SECTION
    exceptions?: string;           // COMMA-SEPARATED LIST OF EXCEPTION VALUES
    initialMainTab?: number | null; // INITIAL ACTIVE MAIN TAB
    initialSubTab?: string | null;  // INITIAL ACTIVE SUB TAB
}>();

// ============================================================================
// COMPONENT EVENTS DEFINITION
// ============================================================================
const emit = defineEmits<{
    (e: 'update:selectedMainTab', value: number): void;
    (e: 'update:selectedSubTab', value: string): void;
}>();

// ============================================================================
// REACTIVE STATE VARIABLES
// ============================================================================
const selectedMainTab = ref<number | null>(null);  // CURRENTLY SELECTED MAIN TAB
const selectedSubTab = ref<string | null>(null);   // CURRENTLY SELECTED SUB TAB

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

// CHECK IF MAIN TABS SHOULD BE HIDDEN BASED ON ACTIVE SUB TAB AND EXCEPTIONS
const shouldHideMainTabs = computed(() => {
    // RETURN FALSE IF NO EXCEPTIONS OR NO SELECTED SUB TAB
    if (!props.exceptions || !selectedSubTab.value) return false;

    // PARSE EXCEPTIONS STRING INTO ARRAY (COMMA-SEPARATED VALUES)
    const exceptionList = props.exceptions
        .split(',')
        .map(item => item.trim().toLowerCase());

    // GET CURRENT SELECTED SUB TAB IN LOWERCASE FOR COMPARISON
    const currentSubTab = selectedSubTab.value.toLowerCase();

    // RETURN TRUE IF CURRENT SUB TAB MATCHES ANY EXCEPTION
    return exceptionList.includes(currentSubTab);
});

// ============================================================================
// WATCHERS FOR INITIAL VALUES
// ============================================================================

// WATCH FOR INITIAL MAIN TAB VALUES AND SET THEM IF PROVIDED
watch(
    () => props.initialMainTab,
    (initialTab) => {
        if (initialTab !== null && initialTab !== undefined) {
            selectedMainTab.value = initialTab;

            // EMIT ONLY IF THIS IS DIFFERENT FROM CURRENT SELECTION
            if (selectedMainTab.value !== initialTab) {
                emit('update:selectedMainTab', initialTab);
            }
        }
    },
    { immediate: true }
);

// WATCH FOR INITIAL SUB TAB VALUES AND SET THEM IF PROVIDED
watch(
    () => props.initialSubTab,
    (initialTab) => {
        if (initialTab !== null && initialTab !== undefined) {
            selectedSubTab.value = initialTab;

            // EMIT ONLY IF THIS IS DIFFERENT FROM CURRENT SELECTION
            if (selectedSubTab.value !== initialTab) {
                emit('update:selectedSubTab', initialTab);
            }
        }
    },
    { immediate: true }
);

// ============================================================================
// WATCHERS FOR FALLBACK BEHAVIOR
// ============================================================================

// WATCH MAIN TABS AND SET FIRST ITEM AS SELECTED IF NONE IS SELECTED
// ONLY IF MAIN TABS ARE NOT HIDDEN DUE TO EXCEPTIONS
watch(
    () => props.mainTabs,
    (tabs) => {
        const shouldSetDefault = tabs &&
            tabs.length &&
            selectedMainTab.value === null &&
            !props.initialMainTab &&
            !shouldHideMainTabs.value;

        if (shouldSetDefault) {
            selectedMainTab.value = tabs[0];
            emit('update:selectedMainTab', tabs[0]);
        }
    },
    { immediate: true }
);

// WATCH SUB TABS AND SET FIRST ITEM AS SELECTED IF NONE IS SELECTED
watch(
    () => props.subTabs,
    (tabs) => {
        const shouldSetDefault = tabs &&
            tabs.length &&
            selectedSubTab.value === null &&
            !props.initialSubTab;

        if (shouldSetDefault) {
            selectedSubTab.value = tabs[0];
            emit('update:selectedSubTab', tabs[0]);
        }
    },
    { immediate: true }
);

// ============================================================================
// COMPONENT METHODS
// ============================================================================

// FUNCTION TO SELECT A MAIN TAB AND EMIT THE SELECTION
function selectMainTab(tab: number) {
    if (selectedMainTab.value !== tab) {
        selectedMainTab.value = tab;
        emit('update:selectedMainTab', tab);
    }
}

// FUNCTION TO SELECT A SUB TAB AND EMIT THE SELECTION  
function selectSubTab(tab: string) {
    if (selectedSubTab.value !== tab) {
        selectedSubTab.value = tab;
        emit('update:selectedSubTab', tab);
    }
}
</script>