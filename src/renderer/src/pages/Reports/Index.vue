<!-- /src/pages/Reports/Index.vue -->

<template>
  <DefaultLayouts>
    <div class="main-screen project-insider reports-page">
      <h1 class="text-center">Reports</h1>

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

            <ExcelWorkbookView v-if="workbook" :workbook="workbook" />
            <aside v-else class="report-response-await">
              <div v-if="isSubmittingReport" class="bounce-circle"></div>
              <span v-else>Select a project and generate a report to view its Excel workbook.</span>
            </aside>

            <section class="report-actions-enhanced" v-if="workbook || exportStatus.message">
              <ExportStatusBanner :exportStatus="exportStatus" @dismiss="handleStatusDismiss"
                @openFileLocation="handleOpenFileLocation" @openFile="handleOpenFile" />

              <ExportActionsComponent :hasExcelContent="!!excelBytes"
                :isExporting="isExporting"
                :isExportingExcel="isExportingExcel"
                @exportExcel="handleExcelExport" />

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
import ExcelWorkbookView from './Components/ExcelWorkbookView.vue';
import ExportStatusBanner from './IndexComponents/ExportStatusBanner.vue';
import ExportActionsComponent from './IndexComponents/ExportActionsComponent.vue';
import ExportHistoryComponent from './IndexComponents/ExportHistoryComponent.vue';
import { useApi } from '../../composables/useApi';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
import { useExportOperations } from '../../composables/Exports/useExportOperations';
import { useExportHelpers } from '../../composables/Exports/useExportHelpers';
import { filenameFromDisposition, parseExcelWorkbook } from './Utils/excelWorkbook';
import type { WorkbookSheet } from './Utils/excelWorkbook';
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
const { get, post, apiClient } = useApi();
const { container, leftPanel, rightPanel } = useSimpleColumnResize();
const {
  isExporting,
  isExportingExcel,
  exportStatus,
  exportHistory,
  exportToExcel
} = useExportOperations();
const {
  dismissStatus,
  openFileLocation,
  openFile
} = useExportHelpers();

// ------------------------------------------
// * REACTIVE VARIABLES
// ------------------------------------------
const projectList = ref<Project[]>([]);
const workbook = ref<WorkbookSheet | null>(null);
const excelBytes = ref<Uint8Array | null>(null);
const excelFilename = ref('onuman-report.xlsx');
const isSubmittingReport = ref(false);

// ------------------------------------------
// * ERROR DESCRIPTION (ACTIONABLE MESSAGES)
// ------------------------------------------
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const describeReportError = (error: unknown, view: string): string => {
  const errorRecord = isRecord(error) ? error : {};
  const response = isRecord(errorRecord.response) ? errorRecord.response : {};
  const responseData = isRecord(response.data) ? response.data : {};
  const status = typeof response.status === 'number' ? response.status : undefined;
  const serverError = typeof responseData.error === 'string' ? responseData.error : undefined;
  const errorMessage = typeof errorRecord.message === 'string' ? errorRecord.message : undefined;
  if (status === 404) {
    return `${view} is unavailable on this server (HTTP 404) - the backend must be updated to the latest onuman-private (it provides /api/report/final_report/document and the Excel writer).`;
  }
  if (status !== undefined && status >= 500) {
    return `${view} failed on the server (HTTP 500)${serverError ? `: ${serverError}` : ''} - make sure openpyxl is installed (pip install openpyxl) and the backend is up to date.`;
  }
  return `${view} failed: ${serverError || errorMessage || 'unknown error'}`;
};

// ------------------------------------------
// * API AND DATA FETCHING
// ------------------------------------------
const fetchProjectList = async (): Promise<void> => {
  try {
    const response = await get('/api/project_list');
    projectList.value = response.results;
  } catch (error: unknown) {
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
    workbook.value = null;
    excelBytes.value = null;
    exportStatus.value = { message: '', type: '', path: null };

    const reportDocument = await post<ReportDocument>(
      '/api/report/final_report/document',
      payload
    );
    const response = await apiClient.post<ArrayBuffer>(
      '/api/report/final_report/excel',
      reportDocument,
      { responseType: 'arraybuffer' }
    );
    const bytes = new Uint8Array(response.data);
    const parsedWorkbook = await parseExcelWorkbook(bytes);

    workbook.value = parsedWorkbook;
    excelBytes.value = bytes;
    excelFilename.value = filenameFromDisposition(
      response.headers['content-disposition'],
      'onuman-report.xlsx'
    );

  } catch (error: any) {
    console.error('Report generation error:', error);
    exportStatus.value = {
      message: describeReportError(error, 'Report generation'),
      type: 'error',
      path: null
    };
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

const handleExcelExport = async (): Promise<void> => {
  await exportToExcel(excelBytes.value, excelFilename.value);
};

// ------------------------------------------
// * LIFECYCLE HOOKS
// ------------------------------------------
onMounted(() => {
  fetchProjectList();
});
</script>

<style scoped lang="scss">
/* LAYOUT STYLES */
.onuman-input-height-2 {
  margin-top: 0;
  height: calc(100vh - 6.5rem);
}

.onuman-input-height {
  margin-top: 0;
  height: calc(100vh - 11.2rem);
}
</style>
