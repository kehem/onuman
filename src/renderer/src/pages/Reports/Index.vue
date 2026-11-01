<!-- /src/pages/Reports/Index.vue -->

<template>
  <DefaultLayouts>
    <div class="main-screen project-insider">
      <br><br>
      <h1 class="text-center">Reports</h1><br>

      <section class="flex-col-container" ref="container">
        <!-- LEFT PANEL - FORM COMPONENT -->
        <aside ref="leftPanel" class="onuman-insider-scrollbar">
          <ReportFormComponent :projectList="projectList" :isLoading="isSubmittingReport"
            :AvailableChecked="availableChecked" @submit="handleFormSubmit"
            @update:selected-project-id="handleProjectIdChange" />
        </aside>

        <!-- RIGHT PANEL - REPORT RESULTS -->
        <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">
          <section class="report-result">
            <aside class="report-response" v-html="HTMLResponse" v-if="HTMLResponse"></aside>
            <aside v-else class="report-response-await">
              <div class="bounce-circle"></div>
            </aside>

            <!-- ENHANCED INTERACTIVE REPORT ACTIONS -->
            <section class="report-actions-enhanced" v-if="HTMLResponse">

              <!-- EXPORT STATUS BANNER COMPONENT -->
              <ExportStatusBanner :exportStatus="exportStatus" @dismiss="handleStatusDismiss"
                @openFileLocation="handleOpenFileLocation" @openFile="handleOpenFile" />

              <!-- EXPORT ACTIONS COMPONENT -->
              <ExportActionsComponent :hasContent="!!HTMLResponse" :isExporting="isExporting"
                :isExportingPDF="isExportingPDF" :isExportingExcel="isExportingExcel" :isExportingWord="isExportingWord"
                @exportPDF="handlePDFExport" @exportExcel="handleExcelExport" @exportWord="handleWordExport"
                @preview="handlePreviewExport" />

              <!-- EXPORT HISTORY COMPONENT -->
              <ExportHistoryComponent :exportHistory="exportHistory" :maxItems="3" />
            </section>

          </section>
        </aside>
      </section>
    </div>
    <BottomBar />
  </DefaultLayouts>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import ReportFormComponent from './Components/ReportFormComponent.vue';
import ExportStatusBanner from './IndexComponents/ExportStatusBanner.vue';
import ExportActionsComponent from './IndexComponents/ExportActionsComponent.vue';
import ExportHistoryComponent from './IndexComponents/ExportHistoryComponent.vue';
import { useApi } from '../../composables/useApi';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
import { useExportOperations } from '../../composables/Exports/useExportOperations';
import { useExportHelpers } from '../../composables/Exports/useExportHelpers';
import type {
  Project,
  FormSubmissionPayload,
  AVAILABLE_DATA
} from './Types/ReportFormTypes';
import {
  normalize,
  BASE_ITEMS,
  PROPERTIES,
} from './Types/ReportFormTypes';


// ------------------------------------------
// * COMPOSABLES
// ------------------------------------------
const { get, post } = useApi();
const { container, leftPanel, rightPanel } = useSimpleColumnResize();
const {
  isExporting,
  isExportingPDF,
  isExportingExcel,
  isExportingWord,
  exportStatus,
  exportHistory,
  exportToPDF,
  exportToExcel,
  exportToWord,
  exportToPreview
} = useExportOperations();
const {
  dismissStatus,
  openFileLocation,
  openFile,
  loadExternalReportCSS,
  handleExportError
} = useExportHelpers();

// ------------------------------------------
// * REACTIVE VARIABLES
// ------------------------------------------
const projectList = ref<Project[]>([]);
const HTMLResponse = ref('');
const isSubmittingReport = ref(false);

// ------------------------------------------
// * API AND DATA FETCHING
// ------------------------------------------
const fetchProjectList = async (): Promise<void> => {
  try {
    const response = await get('/api/project_list');
    projectList.value = response.results;
  } catch (error: any) {
    console.error('Failed to fetch project list:', error);
    exportStatus.value = {
      message: 'Failed to fetch project list',
      type: 'error',
      path: null
    };
  }
};

// ------------------------------------------
// * GET DEFAULT SELECTED DATA ACCORDING PROJECT ID
// ------------------------------------------

const selectedProjectId = ref<number | null>(null);
const handleProjectIdChange = (projectId: number | null) => {
  selectedProjectId.value = projectId;
};

// Updated to use proper typing and initial value
const availableChecked = ref<AVAILABLE_DATA | null>(null);

watch(selectedProjectId, async (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    await fetchAvailable();
  } else if (!newProjectId) {
    // Clear available data when no project is selected
    availableChecked.value = null;
  }
});

const fetchAvailable = async () => {
  if (!selectedProjectId.value) {
    availableChecked.value = null;
    return;
  }

  try {
    const response = await get(`/api/report/report_exists?projectId=${selectedProjectId.value}`);

    // MASTERING STRUCTURED DATA
    availableChecked.value = masteringFetchAvailable(response);
    console.log('Processed available data:', availableChecked.value);

  } catch (error: any) {
    console.error('Failed to fetch available data:', error);
    availableChecked.value = null;
    exportStatus.value = {
      message: 'Failed to check report availability',
      type: 'error',
      path: null
    };
  }
};

/**
 * Process the API response to determine which categories are available
 * based on base_items and keys data
 */
const masteringFetchAvailable = (response: any): AVAILABLE_DATA => {
  const categories = {
    exterior: false,
    interior: false,
    finish: false,
  };

  // Initialize processed response
  const processedResponse: AVAILABLE_DATA = {
    base_items: response.base_items || {},
    floor: response.floor || [],
    keys: response.keys || {},
    categories
  };

  // Helper function to find matching item and update category
  const findAndUpdateCategory = (apiKey: string, itemsList: readonly string[]) => {
    const normalizedApiKey = normalize(apiKey);

    for (const item of itemsList) {
      const [category, name] = item.split(':');
      const normalizedName = normalize(name);

      if (normalizedApiKey === normalizedName) {
        if (categories.hasOwnProperty(category.toLowerCase())) {
          categories[category.toLowerCase() as keyof typeof categories] = true;
        }
        return true;
      }
    }
    return false;
  };

  // Check base_items for category availability
  if (response.base_items) {
    for (const [apiKey, isAvailable] of Object.entries(response.base_items)) {
      if (isAvailable) {
        findAndUpdateCategory(apiKey, BASE_ITEMS);
      }
    }
  }

  // Check keys for category availability
  if (response.keys) {
    for (const [apiKey, isAvailable] of Object.entries(response.keys)) {
      if (isAvailable) {
        findAndUpdateCategory(apiKey, [...BASE_ITEMS, ...PROPERTIES]);
      }
    }
  }

  // Update the categories in the processed response
  processedResponse.categories = categories;

  return processedResponse;
};

// ------------------------------------------
// * FORM SUBMISSION HANDLER
// ------------------------------------------
const handleFormSubmit = async (payload: FormSubmissionPayload): Promise<void> => {
  if (!payload.projectId) {
    exportStatus.value = {
      message: 'Please select a project',
      type: 'error',
      path: null
    };
    return;
  }

  try {
    isSubmittingReport.value = true;
    HTMLResponse.value = ''; // CLEAR PREVIOUS RESPONSE

    const response = await post('/api/report/final_report', payload);
    HTMLResponse.value = response;

  } catch (error: any) {
    handleExportError(error, 'Report submission', exportStatus);
  } finally {
    isSubmittingReport.value = false;
  }
};

// ------------------------------------------
// * EXPORT EVENT HANDLERS
// ------------------------------------------
const handleStatusDismiss = (): void => {
  dismissStatus(exportStatus);
};

const handleOpenFileLocation = async (path: string): Promise<void> => {
  await openFileLocation(path, exportStatus);
};

const handleOpenFile = async (path: string): Promise<void> => {
  await openFile(path, exportStatus);
};

const handlePDFExport = async (): Promise<void> => {
  await exportToPDF(HTMLResponse.value);
};

const handleExcelExport = async (): Promise<void> => {
  await exportToExcel(HTMLResponse.value);
};

const handleWordExport = async (): Promise<void> => {
  await exportToWord(HTMLResponse.value);
};

const handlePreviewExport = async (): Promise<void> => {
  await exportToPreview(HTMLResponse.value);
};

// ------------------------------------------
// * LIFECYCLE HOOKS
// ------------------------------------------
onMounted(() => {
  // LOAD EXTERNAL REPORT CSS
  loadExternalReportCSS();

  // FETCH PROJECT DATA
  fetchProjectList();
});
</script>

<style scoped lang="scss">
/* LAYOUT STYLES */
.onuman-input-height-2 {
  margin-top: 0;
  height: calc(100vh - 8.7rem);
}

.onuman-input-height {
  margin-top: 0;
  height: calc(100vh - 11.2rem);
}
</style>
