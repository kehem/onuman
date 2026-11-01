<!-- src/pages/Dashboard/NewProject.vue -->
<template>
  <DefaultLayouts class="d-block relative">
    <section class="f-center onuman-main-scrollbar">
      <br><br><br>

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="main-screen skeleton-container" style="width: 60%;">
        <div class="skeleton-header">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-divider"></div>
        </div>

        <div class="g-res-2-col-container gap-10">
          <!-- LEFT COLUMN SKELETON -->
          <aside class="skeleton-column">
            <div class="skeleton-input-group">
              <div class="skeleton skeleton-label"></div>
              <div class="skeleton skeleton-input"></div>
            </div>

            <div class="skeleton-input-group">
              <div class="skeleton skeleton-fieldset">
                <div class="skeleton-dual-input">
                  <div class="skeleton skeleton-input-small"></div>
                  <div class="skeleton skeleton-input-small"></div>
                </div>
              </div>
            </div>

            <div class="skeleton-input-group">
              <div class="skeleton skeleton-label"></div>
              <div class="skeleton skeleton-textarea"></div>
            </div>
          </aside>

          <!-- RIGHT COLUMN SKELETON -->
          <aside class="skeleton-column">
            <div class="skeleton-input-group">
              <div class="skeleton skeleton-fieldset-large">
                <div class="skeleton skeleton-input"></div>
                <div class="skeleton skeleton-input"></div>
                <div class="skeleton skeleton-input"></div>
              </div>
            </div>

            <div class="skeleton-input-group">
              <div class="skeleton skeleton-label"></div>
              <div class="skeleton skeleton-file-input"></div>
              <div class="skeleton skeleton-image-preview"></div>
            </div>

          </aside>
        </div>
      </div>
      <br /><br />

      <!-- MAIN FORM -->
      <form v-if="!isLoading" method="post" @submit.prevent="submitAddProject" class="main-screen w-95" ref="mainForm">
        <br />
        <h1 class="text-center">{{ isEditMode ? 'UPDATE PROJECT' : 'CREATE A PROJECT' }}</h1>
        <br />
        <hr />
        <br /><br />

        <div class="g-res-2-col-container stratched-container gap-10">
          <!-- LEFT COLUMN -->
          <aside>
            <!-- PROJECT NAME -->
            <div class="onuman-input-box">
              <label for="projectName">Project Name</label>
              <input type="text" class="onuman-input3" id="projectName" name="projectName"
                placeholder="Enter your project name" v-model="projectFormData.projectName" />
            </div>
            <br />

            <!-- PROJECT DURATION -->
            <div class="onuman-input-box">
              <fieldset class="f gap-10">
                <legend id="office-address-legend">Project Duration</legend>
                <div class="sub-input">
                  <label for="startDate">Start Date</label>
                  <DatePicker v-model:selectedDate="selectedDate" @change="updateEndDate" />
                </div>
                <div class="sub-input">
                  <label for="endDate">End Date</label>
                  <DatePicker v-model:selectedDate="selectedEndDate" />
                </div>
              </fieldset>
            </div>
            <br />

            <!-- CLIENT DETAILS -->
            <div class="onuman-input-box">
              <fieldset class="f gap-05 f-col">
                <legend id="office-address-legend">Client Details</legend>
                <div class="sub-input">
                  <label for="clientName">Client Name</label>
                  <input type="text" placeholder="Enter the client name" class="onuman-input2" name="clientName"
                    v-model="projectFormData.clientName" />
                </div>

                <div class="sub-input">
                  <label for="clientAddress">Client Address</label>
                  <input type="text" placeholder="Enter the client address" class="onuman-input2" name="clientAddress"
                    v-model="projectFormData.clientAddress" />
                </div>

                <div class="sub-input">
                  <label for="clientPhone">Client Phone No.</label>
                  <input type="tel" placeholder="+1-123-456-7890" class="onuman-input2" name="clientPhone"
                    v-model="clientPhoneNumber" @input="formatPhoneNumber(clientPhoneNumber)" maxlength="17" />
                  <span v-if="!isValidPhone && clientPhoneNumber" class="error-message" id="client-phone-error">
                    Please enter a valid phone number (e.g., +1-123-456-7890)
                  </span>
                </div>
              </fieldset>
            </div>
            <br />

            <!-- PROJECT DESCRIPTION (OPTIONAL) -->
            <div class="onuman-input-box">
              <label for="projectDescription">Project Description</label>
              <textarea type="text" class="onuman-input3" id="projectDescription" name="projectDescription"
                placeholder="Enter your project description (optional)" v-model="projectFormData.projectDescription" />
            </div>
            <br />
          </aside>

          <!-- RIGHT COLUMN -->
          <aside>
            <!-- BUILDING DETAILS -->
            <div class="onuman-input-box">
              <fieldset class="f gap-05 f-col">
                <legend id="office-address-legend">Building Details</legend>

                <Tooltip content="Add a proper type of the building" position="top" id="country-tooltip">
                  <OnumanCombobox id="onuman-combobox-country" name="buildingType" :options="buildingType.sort()"
                    placeholder="Select Building type" v-model:selected="selectedBuildingType" role="combobox" />
                </Tooltip>

                <fieldset class="fieldset-basic-inputs row-dir centerted">
                  <legend>Total Stories</legend>
                  <div class="preset-checker col-dir">
                    <label for="under-ground">Under Ground Stories</label>
                    <select class="onuman-select-box" id="under-ground" v-model="projectFormData.totalUnderGroundFloors">
                      <option value="No Underground">No Underground</option>
                      <option value="-1">-1</option>
                      <option value="-2">-2</option>
                      <option value="-3">-3</option>
                      <option value="-4">-4</option>
                      <option value="-5">-5</option>
                    </select>
                  </div>
                  <div class="preset-checker col-dir">
                    <label for="upper-ground">Upper Ground Stories</label>
                    <select class="onuman-select-box" id="upper-ground" v-model="projectFormData.totalUpperGroundFloors">
                      <option value="0">0 - Ground Floor</option>
                      <option value="1">1 - Story</option>
                      <option value="2">2 - Story</option>
                      <option value="3">3 - Story</option>
                      <option value="4">4 - Story</option>
                      <option value="5">5 - Story</option>
                      <option value="6">6 - Story</option>
                      <option value="7">7 - Story</option>
                      <option value="8">8 - Story</option>
                      <option value="9">9 - Story</option>
                      <option value="10">10 - Story</option>
                      <option value="11">11 - Story</option>
                      <option value="12">12 - Story</option>
                      <option value="13">13 - Story</option>
                      <option value="14">14 - Story</option>
                      <option value="15">15 - Story</option>
                      <option value="16">16 - Story</option>
                      <option value="17">17 - Story</option>
                      <option value="18">18 - Story</option>
                      <option value="19">19 - Story</option>
                      <option value="20">20 - Story</option>
                      <option value="21">21 - Story</option>
                      <option value="22">22 - Story</option>
                      <option value="23">23 - Story</option>
                      <option value="24">24 - Story</option>
                      <option value="25">25 - Story</option>
                      <option value="26">26 - Story</option>
                      <option value="27">27 - Story</option>
                      <option value="28">28 - Story</option>
                      <option value="29">29 - Story</option>
                      <option value="30">30 - Story</option>
                    </select>
                  </div>
                </fieldset>

                <div class="sub-input">
                  <label for="totalUnit">Total Units</label>
                  <input type="text" maxlength="3" placeholder="Enter total units of the building" class="onuman-input2"
                    name="totalUnit" id="totalUnit" inputmode="numeric" pattern="[0-9]*"
                    v-model="projectFormData.totalUnit" @input="onNumberInputOld" />
                </div>
              </fieldset>
            </div>
            <br />

            <!-- SUPPORT IMAGE (OPTIONAL) -->
            <div class="support-image">
              <label class="optional-section-label">Project Image</label>

              <!-- UPLOAD PROGRESS -->
              <div v-if="isUploading" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>

              <!-- UPLOADING ANIMATION -->
              <div v-if="isUploading" class="uploading-indicator">
                <div class="uploading-spinner"></div>
                <span>Uploading...</span>
              </div>

              <!-- PREVIEW -->
              <div class="support-image-preview">
                <img v-if="imageUrl || imageURL" :src="imageURL || imageUrl" alt="Support Image" loading="lazy" />
                <button v-if="imageUrl || imageURL" type="button" class="remove-image" @click="removeImage">
                  <i class="m-cross1"></i>
                </button>
              </div><br>

              <!-- INPUT FILE -->
              <div class="upload-wrapper" v-if="(!imageUrl && !imageURL) || isUploading">
                <input type="file" id="support-image" name="support-image" @change="handleFileChange"
                  :disabled="isUploading" />
              </div>


            </div>
            <br />

            <!-- SUBMIT BUTTON -->
            <hr />
            <div class="f-end-center">
              <button type="submit" class="btn btn-primary m-t-10">
                {{ isEditMode ? 'Update Project' : 'Create Project' }}
              </button>
            </div>
          </aside>
        </div><br><br>
      </form>
    </section>
    <BottomBar />
  </DefaultLayouts>
</template>

<script setup lang="ts">
/* ========================================
   IMPORTS
======================================== */
import { ref, reactive, onMounted, watch } from 'vue'
import DefaultLayouts from '../../layouts/DefaultLayouts.vue'
import DatePicker from '../../components/UI/DatePicker.vue'
import OnumanCombobox from '../../components/Initializers/OnumanCombobox.vue'
import Tooltip from '../../components/Initializers/ToolTip.vue'
import BottomBar from '../../components/Dashboard/BottomBar.vue'
import { useToast } from '../../composables/Toast'
import { useApi } from '../../composables/useApi'
import { useValidators } from '../../composables/useValidators'
import { useImageUploader } from '../../composables/useImageUploader'
import { useRouter, useRoute } from 'vue-router'

/* ========================================
   COMPOSABLES INITIALIZATION
======================================== */
const { get, post, put } = useApi()
const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const {
  handleFileChange,
  isUploading,
  uploadProgress,
  imageURL,
} = useImageUploader()

/* ========================================
   REACTIVE DATA & REFS
======================================== */

// LOADING STATE
const isLoading = ref(true)

// EDIT MODE CONFIGURATION
const isEditMode = ref(false)
const projectId = ref<string | null>(null)

// PROJECT FORM DATA
const projectFormData = reactive({
  projectName: '',
  clientName: '',
  clientAddress: '',
  projectDescription: '',
  totalUnit: '',
  totalUnderGroundFloors: 'No Underground',
  totalUpperGroundFloors: '0'
})

// IMAGE HANDLING
const imageUrl = ref<string | undefined>(undefined)

// DATE HANDLING
const selectedDate = ref<Date | null>(new Date())
const selectedEndDate = ref<Date | null>(null)

// PHONE VALIDATION
const clientPhoneNumber = ref<string>('')
const { usePhoneValidator } = useValidators()
const { isValidPhone, formatPhoneNumber } = usePhoneValidator(clientPhoneNumber)

// BUILDING TYPE SELECTION
const selectedBuildingType = ref<string>('')
const buildingType = ref<string[]>([])

// FORM REFERENCE
const mainForm = ref<HTMLFormElement | null>(null)
const localStorageKey = 'onumanFormData'

/* ========================================
   UTILITY FUNCTIONS
======================================== */

// AUTO SET END DATE FUNCTION
const updateEndDate = () => {
  if (selectedDate.value && !isEditMode.value) {
    const endDate = new Date(selectedDate.value)
    endDate.setDate(endDate.getDate() + 30)
    selectedEndDate.value = endDate
  }
}

// NUMBER INPUT FORMATTER
function onNumberInputOld(event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/[^0-9]/g, '').slice(0, 3)
  input.value = value

  // UPDATE REACTIVE DATA
  if (input.name === 'totalUnit') {
    projectFormData.totalUnit = value
  }
}

// REMOVE IMAGE FUNCTION
const removeImage = () => {
  imageUrl.value = '';
  imageURL.value = '';
};

/* ========================================
   FORM VALIDATION
======================================== */
const validateForm = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // CHECK ALL REQUIRED FIELDS
  if (!projectFormData.projectName?.trim()) {
    errors.push('Project Name field is required')
  }

  if (!projectFormData.clientName?.trim()) {
    errors.push('Client Name field is required')
  }

  if (!projectFormData.clientAddress?.trim()) {
    errors.push('Client Address field is required')
  }

  if (!selectedEndDate.value) {
    errors.push('End Date field is required')
  }

  if (!selectedBuildingType.value?.trim()) {
    errors.push('Building Type field is required')
  }

  if (!projectFormData.totalUnit?.trim()) {
    errors.push('Total Units field is required')
  }

  // VALIDATE PHONE NUMBER IF PROVIDED
  if (clientPhoneNumber.value && !isValidPhone.value) {
    errors.push('Client Phone Number format is invalid')
  }

  // VALIDATE DATE RANGE
  if (selectedDate.value && selectedEndDate.value && selectedDate.value >= selectedEndDate.value) {
    errors.push('End Date must be after Start Date')
  }

  return { isValid: errors.length === 0, errors }
}

/* ========================================
   LOCAL STORAGE HANDLING
======================================== */
const saveFormToLocalStorage = () => {
  if (isEditMode.value || !mainForm.value) return

  const formObject = {
    ...projectFormData,
    clientPhone: clientPhoneNumber.value,
    buildingType: selectedBuildingType.value
  }

  localStorage.setItem(localStorageKey, JSON.stringify(formObject))
}

const loadFormFromLocalStorage = () => {
  if (isEditMode.value || !mainForm.value) return
  const saved = localStorage.getItem(localStorageKey)
  if (!saved) return

  try {
    const savedData = JSON.parse(saved)

    // LOAD FORM DATA
    Object.assign(projectFormData, {
      projectName: savedData.projectName || '',
      clientName: savedData.clientName || '',
      clientAddress: savedData.clientAddress || '',
      projectDescription: savedData.projectDescription || '',
      totalUnit: savedData.totalUnit || '',
      totalUnderGroundFloors: savedData.totalUnderGroundFloors || 'No Underground',
      totalUpperGroundFloors: savedData.totalUpperGroundFloors || '0'
    })

    // LOAD OTHER FIELDS
    clientPhoneNumber.value = savedData.clientPhone || ''
    selectedBuildingType.value = savedData.buildingType || ''
  } catch (e) {
    console.warn('Failed to parse saved form:', e)
  }
}

const attachFormAutoSave = () => {
  if (isEditMode.value || !mainForm.value) return

  const handleFormChange = () => {
    if (!isEditMode.value) {
      saveFormToLocalStorage()
    }
  }

  // ADD EVENT LISTENERS FOR FORM INPUTS
  mainForm.value.addEventListener('input', handleFormChange)
  mainForm.value.addEventListener('change', handleFormChange)
}

/* ========================================
   PROJECT DATA LOADING (EDIT MODE)
======================================== */
const loadProjectData = async (id: string) => {
  try {
    const response = await get(`/api/project_data/${id}`)
    const projectData = response

    // POPULATE FORM DATA
    projectFormData.projectName = projectData.projectName || ''
    projectFormData.clientName = projectData.clientName || ''
    projectFormData.clientAddress = projectData.clientAddress || ''
    projectFormData.projectDescription = projectData.projectDescription || ''
    projectFormData.totalUnit = projectData.totalUnit?.toString() || ''
    projectFormData.totalUnderGroundFloors = projectData.totalUnderGroundFloors || 'No Underground'
    projectFormData.totalUpperGroundFloors = projectData.totalUpperGroundFloors?.toString() || '0'

    // SET DATES
    if (projectData.startDate) {
      selectedDate.value = new Date(projectData.startDate)
    }
    if (projectData.endDate) {
      selectedEndDate.value = new Date(projectData.endDate)
    }

    // SET PHONE NUMBER
    clientPhoneNumber.value = projectData.clientPhone || ''

    // SET BUILDING TYPE
    selectedBuildingType.value = projectData.buildingType || ''

    // SET PROJECT IMAGE
    imageUrl.value = projectData.projectImage || null

  } catch (error) {
    showToast('error', 'Failed to load project data')
    console.error('Failed to load project data:', error)
    router.push('/dashboard')
  }
}

/* ========================================
   FORM SUBMISSION
======================================== */
const submitAddProject = async () => {
  const validation = validateForm()

  if (!validation.isValid) {
    validation.errors.forEach((error, index) => {
      setTimeout(() => showToast('error', error, 5000), index * 100)
    })
    return
  }

  // PREPARE FORM DATA
  const formObject = {
    projectName: projectFormData.projectName,
    clientName: projectFormData.clientName,
    clientAddress: projectFormData.clientAddress,
    projectDescription: projectFormData.projectDescription || '',
    startDate: selectedDate.value?.toISOString().split('T')[0] || '',
    endDate: selectedEndDate.value?.toISOString().split('T')[0] || '',
    buildingType: selectedBuildingType.value || '',
    clientPhone: clientPhoneNumber.value || '',
    projectImage: imageUrl.value || imageURL.value || '',
    totalUnit: parseInt(projectFormData.totalUnit, 10) || 0,
    totalUnderGroundFloors: projectFormData.totalUnderGroundFloors === 'No Underground' 
      ? 0 
      : parseInt(projectFormData.totalUnderGroundFloors, 10) || 0,
    totalUpperGroundFloors: parseInt(projectFormData.totalUpperGroundFloors, 10) || 0
  }

  try {
    if (isEditMode.value && projectId.value) {
      // UPDATE EXISTING PROJECT
      await put(`/api/edit_project/${projectId.value}`, formObject)
      showToast('success', 'Project updated successfully', 10000, 'right-bottom')
    } else {
      // CREATE NEW PROJECT
      await post('/api/create_project', formObject)
      showToast('success', 'Project created successfully', 10000, 'right-bottom')
      localStorage.removeItem(localStorageKey)
    }

    router.push('/dashboard')
  } catch (error) {
    const errorMessage = isEditMode.value
      ? 'Encountered an error while updating project'
      : 'Encountered an error while creating project'
    showToast('error', errorMessage, 5000, 'right-bottom')
    console.error('Project operation error:', error)
  }
}

/* ========================================
   WATCHERS
======================================== */
watch(selectedDate, () => {
  if (!isEditMode.value) {
    updateEndDate()
  }
})

/* ========================================
   LIFECYCLE HOOKS
======================================== */
onMounted(async () => {
  const response = await get('/api/building_types');
  buildingType.value = response;

  // CHECK IF WE'RE IN EDIT MODE
  const queryProjectId = route.query.projectId as string
  if (queryProjectId) {
    isEditMode.value = true
    projectId.value = queryProjectId
    await loadProjectData(queryProjectId)
  } else {
    // FOR NEW PROJECTS, AUTO-SET END DATE TO 30 DAYS FROM START DATE
    updateEndDate()
  }

  // SETUP FORM AUTO-SAVE FOR NEW PROJECTS
  if (!isEditMode.value) {
    loadFormFromLocalStorage()
    attachFormAutoSave()
  }

  // SIMULATE LOADING
  setTimeout(() => {
    isLoading.value = false
  }, 1200)
})
</script>
<style scoped lang="scss">
@use 'sass:color';
$d-bg: #383838;
$d-border: #4d4d4d;

input {
  height: 2.1rem;
}

.tooltip-container {
  width: 100%;
}

.onuman-input-box {
  padding: 0;
}

.error-message {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.2rem;
  display: block;
}

.support-image-preview {
  width: 13rem;
  aspect-ratio: 1;
  margin: 0 auto;
  position: relative;
  display: block;
  background-color: color.adjust($d-bg, $lightness: 2%);
  border: 1px solid $d-border;

  img {
    width: 100%;
    height: inherit;
    object-fit: cover;
    object-position: center;
  }
}
</style>