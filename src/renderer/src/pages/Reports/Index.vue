<!-- /src/pages/Reports/Index.vue -->

<template>
  <DefaultLayouts>
    <div class="main-screen project-insider reports-page">
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

            <!-- VIEW SWITCH: WORKBOOK (MIRRORS THE .XLSX) / HTML REPORT -->
            <div class="report-view-switch" v-if="HTMLResponse && reportDocument">
              <button type="button" class="view-switch-btn" :class="{ active: viewMode === 'workbook' }"
                @click="viewMode = 'workbook'">Workbook</button>
              <button type="button" class="view-switch-btn" :class="{ active: viewMode === 'html' }"
                @click="viewMode = 'html'">Report</button>
            </div>

            <!-- WORKBOOK VIEW (EXACTLY WHAT THE .XLSX CONTAINS) -->
            <ReportWorkbookView v-if="showWorkbook && reportDocument" :document="reportDocument" />

            <!-- CLASSIC HTML REPORT -->
            <aside class="report-response" v-else-if="showHtml" v-html="HTMLResponse"></aside>
            <aside v-else class="report-response-await">
              <div class="bounce-circle"></div>
            </aside>

            <!-- ENHANCED INTERACTIVE REPORT ACTIONS -->
            <section class="report-actions-enhanced" v-if="HTMLResponse || reportDocument">

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
import { ref, computed, onMounted, watch } from 'vue';
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import ReportFormComponent from './Components/ReportFormComponent.vue';
import ReportWorkbookView from './Components/ReportWorkbookView.vue';
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
  ReportDocument,
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
const reportDocument = ref<ReportDocument | null>(null);
const viewMode = ref<'workbook' | 'html'>('workbook');
const lastFormPayload = ref<FormSubmissionPayload | null>(null);
const isSubmittingReport = ref(false);

// WORKBOOK VIEW IS SHOWN WHEN A REPORT DOCUMENT IS AVAILABLE
const showWorkbook = computed(
  () => viewMode.value === 'workbook' && !!reportDocument.value
);
// HTML REPORT FALLS BACK AUTOMATICALLY WHEN NO DOCUMENT WAS RETURNED
const showHtml = computed(
  () => (viewMode.value === 'html' || !reportDocument.value) && !!HTMLResponse.value
);

// ------------------------------------------
// * ERROR DESCRIPTION (ACTIONABLE MESSAGES)
// ------------------------------------------
const describeReportError = (error: any, view: string): string => {
  const status = error?.response?.status;
  const serverError = error?.response?.data?.error;
  if (status === 404) {
    return `${view} is unavailable on this server (HTTP 404) - the backend must be updated to the latest onuman-private (it provides /api/report/final_report/document and the Excel writer).`;
  }
  if (status >= 500) {
    return `${view} failed on the server (HTTP 500)${serverError ? `: ${serverError}` : ''} - make sure openpyxl is installed (pip install openpyxl) and the backend is up to date.`;
  }
  return `${view} failed: ${serverError || error?.message || 'unknown error'}`;
};

// REWRITE RELATIVE REPORT ASSET LINKS (LOGO / STATIC) TO THE API HOST
const rewriteReportAssets = (html: string): string => {
  const base = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  if (!base) return html;
  return html.replace(/(src|href)=(["'])\//g, `$1=$2${base}/`);
};

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
    reportDocument.value = null;
    lastFormPayload.value = payload;

    // FETCH THE HTML REPORT AND THE REPORT DOCUMENT (EXCEL SOURCE) TOGETHER
    const [htmlResult, documentResult] = await Promise.allSettled([
      post('/api/report/final_report', payload),
      post('/api/report/final_report/document', payload)
    ]);

    if (htmlResult.status === 'fulfilled') {
      HTMLResponse.value = rewriteReportAssets(htmlResult.value);
    }
    if (documentResult.status === 'fulfilled') {
      reportDocument.value = documentResult.value;
    }

    if (htmlResult.status === 'rejected' && documentResult.status === 'rejected') {
      throw htmlResult.reason;
    }
    if (htmlResult.status === 'rejected' || documentResult.status === 'rejected') {
      const failed =
        (htmlResult.status === 'rejected' ? htmlResult.reason : undefined) ??
        (documentResult.status === 'rejected' ? documentResult.reason : undefined);
      const view = htmlResult.status === 'rejected'
        ? 'The HTML report'
        : 'The workbook view and Excel export';
      exportStatus.value = {
        message: describeReportError(failed, view),
        type: 'error',
        path: null
      };
    }

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
  // EXPORTS THE REAL .XLSX BUILT BY THE BACKEND FROM THE REPORT DOCUMENT
  if (!reportDocument.value && lastFormPayload.value) {
    // RETRY THE DOCUMENT FETCH IN CASE IT FAILED AT SUBMIT TIME
    try {
      reportDocument.value = await post(
        '/api/report/final_report/document',
        lastFormPayload.value
      );
    } catch (error: any) {
      exportStatus.value = {
        message: describeReportError(error, 'The Excel workbook'),
        type: 'error',
        path: null
      };
      return;
    }
  }
  await exportToExcel(reportDocument.value);
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
