<!-- src/pages/Dashboard/ProjectHome.vue -->
<template>
  <DefaultLayouts class="d-block relative">
    <section class="modern-dashboard">
      <div class="dashboard-container">

        <!-- LOADING STATE -->
        <div v-if="loading" class="loading-state">
          <div class="skeleton-hero">
            <div class="skeleton skeleton-breadcrumb"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-status"></div>
          </div>
          <div class="skeleton-grid">
            <div class="skeleton skeleton-card-large"></div>
            <div class="skeleton skeleton-card-medium"></div>
            <div class="skeleton skeleton-card-medium"></div>
          </div>
        </div>

        <!-- PROJECT DASHBOARD CONTENT -->
        <div v-else-if="projectData">

          <!-- HERO SECTION -->
          <div class="hero-section">
            <div class="hero-header">
              <nav class="breadcrumb">
                <button class="breadcrumb-item" type="button" @click="goBack">
                  <i class="m-home5"></i>
                  Dashboard
                </button>
                <i class="m-chevron-right breadcrumb-separator"></i>
                <span class="breadcrumb-current">{{ projectData.projectName }}</span>
              </nav>

              <div class="hero-actions">
                <div class="action-group">
                  <button class="hero-btn secondary" :class="{ 'bounce-anim': isMaterialsFilled }"
                    @click="showMaterialCost">
                    <i class="m-pricetags"></i>
                    Materials
                  </button>
                  <button class="hero-btn secondary" @click="showMixRatio">
                    <i class="m-basket"></i>
                    Mix Ratio
                  </button>
                  <button class="hero-btn primary" @click="updateProject">
                    <i class="m-recycle"></i>
                    Update Project
                  </button>
                </div>
              </div>
            </div>

            <section class="hero-content">
              <div class="f-between-center">
                <span>
                  <div class="project-meta">
                    <h1 class="project-title">{{ projectData.projectName }}</h1>
                    <div class="status-row">
                      <div class="status-badge" :class="projectData.projectStatus">
                        <div class="status-indicator"></div>
                        {{ projectData.projectStatus }}
                      </div>
                      <div class="project-timeline">
                        <span class="timeline-item">
                          <i class="m-calendar3"></i>
                          {{ formatDate(projectData.startDate) }} - {{ formatDate(projectData.endDate) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </span>
                <!-- DASHBOARD METRICS -->
                <div class="dashboard-metrics-12d">
                  <div class="dashboard-metrics-12d">
                    <div class="metric-card exterior" :class="{ disabled: !canOpenExterior }" @click="openExterior">
                      <div class="metric-icon">
                        <i v-if="!canOpenExterior" class="m-lock6"></i>
                        <i v-else class="m-external-link"></i>
                      </div>
                      <div class="metric-label">
                        Open Exterior
                        <span v-if="!canOpenExterior" class="item-required">* Materials Required</span>
                      </div>
                    </div>

                    <div class="metric-card finish" :class="{ disabled: !canOpenFinish }" @click="openFinish">
                      <div class="metric-icon">
                        <i v-if="!canOpenFinish" class="m-lock6"></i>
                        <i v-else class="m-external-link"></i>
                      </div>
                      <div class="metric-label">
                        Open Finish
                        <span v-if="!canOpenFinish" class="item-required">* Materials Required</span>
                      </div>
                    </div>

                    <div class="metric-card interior" :class="{ disabled: !canOpenInterior }" @click="openInterior">
                      <div class="metric-icon">
                        <i v-if="!canOpenInterior" class="m-lock6"></i>
                        <i v-else class="m-external-link"></i>
                      </div>
                      <div class="metric-label">
                        Open Interior
                        <span v-if="!canOpenInterior" class="item-required">* Materials Required</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="progress-section">
                <div class="progress-header">
                  <span class="progress-label">Project Progress</span>
                  <span class="progress-value">{{ getProgressPercentage() }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: getProgressPercentage() + '%' }"></div>
                </div>
                <div class="progress-info">
                  <span class="days-remaining">{{ getDaysRemaining() }} days remaining</span>
                </div>
              </div>
            </section>
          </div>

          <!-- MAIN GRID -->
          <div class="main-grid">

            <!-- PROJECT OVERVIEW CARD -->
            <div class="overview-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="m-view-carousel"></i>
                  Project Overview
                </h3>
              </div>

              <div class="project-visual">
                <div class="project-image">
                  <div v-if="imageLoading" class="image-skeleton">
                    <div class="skeleton skeleton-image"></div>
                  </div>
                  <img v-show="!imageLoading" :src="projectData.projectImage" :alt="projectData.projectName"
                    @load="handleImageLoad" @error="handleImageError" class="project-img" />
                  <div class="image-overlay">
                    <div class="overlay-stats">
                      <div class="stat-chip">
                        <i class="m-shop1"></i>
                        {{ projectData.buildingType }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="project-description">
                <h4>Description</h4>
                <p>
                  {{ isExpanded ? projectData?.projectDescription : truncatedDescription }}
                <p v-if="showToggleButton" @click="toggleDescription" class="see-more-btn">
                  {{ isExpanded ? 'Show Less' : 'Show More' }}
                </p>
                </p>

              </div>

            </div>

            <!-- CLIENT INFO CARD -->
            <div class="info-card client-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="m-user"></i>
                  Client Information
                </h3>
              </div>
              <div class="info-content">
                <div class="client-avatar">
                  <div class="avatar-circle">
                    <i class="m-user"></i>
                  </div>
                </div>
                <div class="client-details">
                  <div class="info-row">
                    <span class="info-label">Name</span>
                    <span class="info-value">{{ projectData.clientName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Phone</span>
                    <span class="info-value">{{ projectData.clientPhone }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Address</span>
                    <span class="info-value">{{ projectData.clientAddress }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- PROJECT SPECS CARD -->
            <div class="info-card specs-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="m-chart-pie1"></i>
                  Project Specifications
                </h3>
              </div>
              <div class="specs-grid">
                <div class="spec-item">
                  <div class="spec-icon">
                    <i class="m-layers"></i>
                  </div>
                  <div class="spec-content">
                    <span class="spec-value">{{ projectData.totalFloor }}</span>
                    <span class="spec-label">Total Floors</span>
                  </div>
                </div>
                <div class="spec-item">
                  <div class="spec-icon">
                    <i class="m-home5"></i>
                  </div>
                  <div class="spec-content">
                    <span class="spec-value">{{ projectData.totalUnit }}</span>
                    <span class="spec-label">Units</span>
                  </div>
                </div>
                <div class="spec-item">
                  <div class="spec-icon">
                    <i class="m-pricetags"></i>
                  </div>
                  <div class="spec-content">
                    <span class="spec-value">{{ projectData.materials?.length || 0 }}</span>
                    <span class="spec-label">Materials</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ERROR STATE -->
        <div class="error-state" v-else-if="error">
          <div class="error-content">
            <div class="error-icon">
              <i class="m-alert-triangle"></i>
            </div>
            <h2 class="error-title">Project Not Found</h2>
            <p class="error-message">{{ error }}</p>
            <button class="error-button" @click="goBack">
              <i class="m-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- MATERIAL COST MODAL -->
    <div class="modal-overlay-32cds" :class="{ active: showMaterialPopup }">
      <div class="modal-container-sdf23 grty67pytj" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="m-pricetags"></i>
            Material Costs
          </h3>
          <button class="modal-close" @click="closeMaterialPopup">
            <i class="m-cross1"></i>
          </button>
        </div>
        <div class="modal-content-er34 onuman-scrollbar">
          <form @submit="sendSelectedMaterial" class="materials-table">
            <section class="tabs">
              <div class="tab asdf2345scfas-asdfasd" :class="{ active: activeTab === 'exterior' }"
                @click="setActiveTab('exterior')">
                Exterior
              </div>
              <div class="tab asdf2345scfas-asdfasd" :class="{ active: activeTab === 'finish' }"
                @click="setActiveTab('finish')">
                Finish
              </div>
              <div class="tab asdf2345scfas-asdfasd" :class="{ active: activeTab === 'interior' }"
                @click="setActiveTab('interior')">
                Interior
              </div>
            </section><br>

            <section class="formatted-table responsive-table" v-if="filteredMaterials.length > 0">
              <table class="onuman-table text-center row-border-all col-border-all hover-border">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Company</th>
                    <th>Unit</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="subMaterial in filteredMaterials" :key="subMaterial.id">
                    <td>{{ subMaterial.name }}</td>
                    <td>
                      <select class="onuman-select-box" :value="getSelectedMaterial(subMaterial.id)"
                        @change="handleCompanyChange($event, subMaterial.id)">
                        <option value="">Select Company</option>
                        <option v-for="material in subMaterial.materials" :key="material.id" :value="material.id">
                          {{ material.company_name }}
                        </option>
                      </select>
                    </td>
                    <td>
                      {{ getMaterialUnit(subMaterial.id) }}
                    </td>
                    <td>
                      {{ getMaterialPrice(subMaterial.id) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section v-else class="no-materials">
              <p>No materials available for {{ activeTab }} category.</p>
            </section>

            <button type="submit" class="onuman-btn submit-asdkq3">Submit</button>
          </form>
        </div>
      </div>
    </div>






















    <!-- MIX RATIO MODAL -->
    <div class="modal-overlay-32cds" :class="{ active: showMixRatioPopup }">
      <div class="modal-container-sdf23 asdl56p7fwscd" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="m-basket"></i>
            Mix Ratio Details
          </h3>
          <button class="modal-close" @click="closeMixRatioPopup">
            <i class="m-cross1"></i>
          </button>
        </div>
        <div class="modal-content-er34 onuman-scrollbar">
          <form @submit.prevent="sendMixRatio" class="materials-table">
            <section class="tabs">
              <div class="tab asdf2345scfas-asdfasd" :class="{ active: activeTab === 'exterior' }"
                @click="setActiveTab('exterior')">
                Exterior
              </div>
              <div class="tab asdf2345scfas-asdfasd" :class="{ active: activeTab === 'finish' }"
                @click="setActiveTab('finish')">
                Finish
              </div>
              <div class="tab asdf2345scfas-asdfasd" :class="{ active: activeTab === 'interior' }"
                @click="setActiveTab('interior')">
                Interior
              </div>
            </section><br>

            <section class="formatted-table responsive-table">
              <table class="onuman-table text-center row-border-all col-border-all hover-border">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="[key] in ratioEntries" :key="key">
                    <td>{{ key }}</td>
                    <td>
                      <input type="number" step="0.1" v-model.number="(currentMixRatio as any)[key]"
                        placeholder="Type Mix Ratio" class="onuman-input3" />
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Comment Section -->
              <div v-if="currentMixRatio">
                <label for="comment">Comment:</label>
                <textarea id="comment" v-model="currentMixRatio.comment" placeholder="Add any comments..."
                  class="onuman-input3" style="width: 100%; resize: vertical;"></textarea>
              </div>

            </section>

            <button type="submit" class="onuman-btn submit-asdkq3">Submit</button>
          </form>
        </div>
      </div>
    </div>

    <BottomBar />
  </DefaultLayouts>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '../../composables/Toast'
const { showToast } = useToast()
import DefaultLayouts from '../../layouts/DefaultLayouts.vue'
import BottomBar from '../../components/Dashboard/BottomBar.vue'
import { useApi } from '../../composables/useApi'
const { get, put } = useApi()
import { Material, RootObject, MixRatioItem } from '../../Interfaces/ViewMaterialsData'
const router = useRouter()
const route = useRoute()

// Reactive variables
const loading = ref(true)
const error = ref('')
const imageLoading = ref(true)
const showMaterialPopup = ref(false)
const showMixRatioPopup = ref(false)

// Project data interface
interface ProjectData {
  id: number
  company: number
  projectName: string
  startDate: string
  endDate: string
  clientName: string
  clientAddress: string
  clientPhone: string
  buildingType: string
  totalFloor: number
  totalUnit: number
  projectImage: string
  onumanStart: string
  projectDescription: string
  projectStatus: string
  materials: Array<{
    name: string
    price: string
  }>
  mixRatio: {
    cement: number
    sand: number
    stone: number
    brick: number
    comment: string
  }
}


const materials = ref<RootObject | null>(null)
const activeTab = ref<'exterior' | 'interior' | 'finish'>('exterior')
const selectedMaterials = ref<{ [key: number]: number }>({}) // subMaterialId -> materialId
const isSubmitting = ref(false)
const isMaterialsFilled = ref(false)

// Computed properties
const filteredMaterials = computed(() => {
  if (!materials.value || !materials.value.sub_materials) return []
  return materials.value.sub_materials.filter(subMaterial => subMaterial.type === activeTab.value)
})

// Methods
const setActiveTab = (tab: 'exterior' | 'interior' | 'finish') => {
  activeTab.value = tab
}

const getSelectedMaterial = (subMaterialId: number): number | string => {
  return selectedMaterials.value[subMaterialId] || ''
}

const getSelectedMaterialDetails = (subMaterialId: number): Material | null => {
  const selectedMaterialId = selectedMaterials.value[subMaterialId]
  if (!selectedMaterialId || !materials.value) return null

  // Find the material across all sub_materials
  for (const subMaterial of materials.value.sub_materials) {
    const material = subMaterial.materials.find(m => m.id === selectedMaterialId)
    if (material) return material
  }
  return null
}

const handleCompanyChange = (event: Event, subMaterialId: number) => {
  const target = event.target as HTMLSelectElement
  const materialId = parseInt(target.value)

  if (materialId) {
    selectedMaterials.value[subMaterialId] = materialId
    updateSelectedArray()
  } else {
    delete selectedMaterials.value[subMaterialId]
    updateSelectedArray()
  }
}

const updateSelectedArray = () => {
  if (materials.value) {
    materials.value.selected = Object.values(selectedMaterials.value)
  }
}

const initializeSelectedMaterials = () => {
  if (!materials.value || !materials.value.sub_materials) return

  selectedMaterials.value = {}

  for (const selectedId of materials.value.selected) {
    for (const subMaterial of materials.value.sub_materials) {
      const material = subMaterial.materials.find(m => m.id === selectedId)
      if (material) {
        selectedMaterials.value[subMaterial.id] = selectedId
        break
      }
    }
  }
}


const getMaterialUnit = (subMaterialId: number): string => {
  const details = getSelectedMaterialDetails(subMaterialId)
  if (!details) return '-'
  return details.quantity ? `${details.unit} (${details.quantity})` : details.unit
}

const getMaterialPrice = (subMaterialId: number): string => {
  const details = getSelectedMaterialDetails(subMaterialId)
  return details?.price ? `${details.price} BDT` : '-'
}

// Fetch project data
const fetchMaterial = async () => {
  try {
    loading.value = true
    const projectId = route.params.id

    if (!projectId) {
      error.value = 'Project ID not provided'
      return
    }

    const response = await get(`/api/project_materials/${projectId}`)
    materials.value = response
    initializeSelectedMaterials()

  } catch (err: any) {
    const errorMessage = err.response?.message || err.message || 'Failed to fetch project data'
    error.value = errorMessage
    showToast('error', errorMessage, 5000, 'right-bottom')
  } finally {
    loading.value = false
  }
}

const sendSelectedMaterial = async (event: Event) => {
  event.preventDefault();
  try {
    isSubmitting.value = true

    // Get only the material IDs from selectedMaterials
    const selectedIds = Object.values(selectedMaterials.value)

    const payload = {
      selected: selectedIds
    }

    const projectId = route.params.id
    if (!projectId) {
      throw new Error('Project ID not provided')
    }

    // Send to the same API endpoint
    const response = await put(`/api/project_materials/${projectId}`, payload)

    // Only update if response has the expected structure
    if (response && response.sub_materials) {
      materials.value = response
      initializeSelectedMaterials()
    } else if (response) {
      // If response doesn't have sub_materials, just update the selected array
      if (materials.value) {
        materials.value.selected = response.selected || selectedIds
      }
    }

    showToast('success', 'Materials updated successfully!', 3000, 'right-bottom')
    closeMaterialPopup()

  } catch (err: any) {
    const errorMessage = err.response?.message || err.message || 'Failed to update materials'
    showToast('error', errorMessage, 5000, 'right-bottom')
    console.error('Error updating materials:', err)
  } finally {
    isSubmitting.value = false
  }
}
watch(materials, (newMaterials) => {
  if (newMaterials) {
    initializeSelectedMaterials()
  }
}, { deep: true })














const MixRatio = ref<MixRatioItem[]>([])
const currentMixRatio = computed<MixRatioItem | null>(() => {
  return MixRatio.value.find(item => item.type === activeTab.value) || null
})
const ratioEntries = computed(() => {
  if (!currentMixRatio.value) return []
  return Object.entries(currentMixRatio.value)
    .filter(([key]) => key !== 'type' && key !== 'comment')
})


const fetchMixRatio = async () => {
  try {
    loading.value = true
    const projectId = route.params.id
    if (!projectId) {
      error.value = 'Project ID not provided'
      return
    }
    const response = await get(`/api/default_mix_ratio/${projectId}`)
    MixRatio.value = response
  } catch (err: any) {
    const errorMessage = err.response?.message || err.message || 'Failed to fetch project data'
    error.value = errorMessage
    showToast('error', errorMessage, 5000, 'right-bottom')
  } finally {
    loading.value = false
  }
}
// SEND MIX RATIO
const sendMixRatio = async () => {
  try {
    loading.value = true
    const projectId = route.params.id
    if (!projectId) {
      error.value = 'Project ID not provided'
      return
    }

    const payload = {
      mix_ratios: MixRatio.value
    }
    await put(`/api/default_mix_ratio/${projectId}`, payload)
    showToast('success', 'Mix ratio updated successfully', 3000, 'right-bottom')
    closeMixRatioPopup()
  } catch (err: any) {
    const errorMessage = err.response?.message || err.message || 'Failed to update mix ratio'
    error.value = errorMessage
    showToast('error', errorMessage, 5000, 'right-bottom')
  } finally {
    loading.value = false
  }
}













const projectData = ref<ProjectData | null>(null)

// Fetch project data
const fetchProjectData = async () => {
  try {
    loading.value = true
    const projectId = route.params.id

    if (!projectId) {
      error.value = 'Project ID not provided'
      return
    }

    const response = await get(`/api/project_data/${projectId}`)
    projectData.value = response

  } catch (err: any) {
    const errorMessage = err.response?.message || err.message || 'Failed to fetch project data'
    error.value = errorMessage
    showToast('error', errorMessage, 5000, 'right-bottom')
  } finally {
    loading.value = false
  }
}

// Image handling
const handleImageLoad = () => {
  imageLoading.value = false
}

const handleImageError = () => {
  imageLoading.value = false
}

// Navigation functions
const goBack = () => {
  router.push('/dashboard')
}
const isExpanded = ref(false)
const toggleDescription = () => {
  isExpanded.value = !isExpanded.value
}

const truncatedDescription = computed(() => {
  const description = projectData.value?.projectDescription || ''
  return description.length > 150 ? description.slice(0, 150) + '...' : description
})

const showToggleButton = computed(() => {
  return (projectData.value?.projectDescription?.length || 0) > 150
})


const updateProject = () => {
  if (projectData.value) {
    router.push(`/addNewProject?projectId=${projectData.value.id}`)
  }
}

const createProjectParams = (projectData: ProjectData) => {
  return new URLSearchParams({
    id: projectData.id.toString(),
    projectName: projectData.projectName,
    startDate: projectData.startDate,
    endDate: projectData.endDate,
    projectDescription: projectData.projectDescription,
    clientName: projectData.clientName,
    projectStatus: projectData.projectStatus,
    totalFloors: projectData.totalFloor.toString(),
    totalUnits: projectData.totalUnit.toString()
  }).toString()
}







// 1. ADD COMPUTED PROPERTIES FOR MATERIAL VALIDATION
const hasMaterialsForType = (type: 'exterior' | 'interior' | 'finish') => {
  if (!materials.value || !materials.value.sub_materials || !materials.value.selected) return false

  // Get sub_materials for the specific type
  const typeMaterials = materials.value.sub_materials.filter(subMaterial => subMaterial.type === type)
  if (typeMaterials.length === 0) return false

  // Check if ALL materials are selected for this type
  const allMaterialsSelected = typeMaterials.every(subMaterial => {
    return materials.value!.selected.some(selectedId =>
      subMaterial.materials.some(material => material.id === selectedId)
    )
  })

  return allMaterialsSelected
}



const canOpenExterior = computed(() => hasMaterialsForType('exterior'))
const canOpenFinish = computed(() => hasMaterialsForType('finish'))
const canOpenInterior = computed(() => hasMaterialsForType('interior'))
const openExterior = () => {
  if (!projectData.value) return

  if (!canOpenExterior.value) {
    isMaterialsFilled.value = true
    setTimeout(() => {
      isMaterialsFilled.value = false
    }, 1000);
    showToast('error', 'Please select materials for Exterior before proceeding', 4000, 'right-bottom')
    return
  }

  const params = createProjectParams(projectData.value)
  router.push(`/exterior/pile?${params}`)
}

const openFinish = () => {
  if (!projectData.value) return

  if (!canOpenFinish.value) {
    isMaterialsFilled.value = true
    setTimeout(() => {
      isMaterialsFilled.value = false
    }, 1000);
    showToast('error', 'Please select materials for Finish before proceeding', 4000, 'right-bottom')
    return
  }

  const params = createProjectParams(projectData.value)
  router.push(`/finish/plasterpaint?${params}`)
}

const openInterior = () => {
  if (!projectData.value) return

  if (!canOpenInterior.value) {
    isMaterialsFilled.value = true
    setTimeout(() => {
      isMaterialsFilled.value = false
    }, 1000);
    showToast('error', 'Please select materials for Interior before proceeding', 4000, 'right-bottom')
    return
  }

  const params = createProjectParams(projectData.value)
  router.push(`/interior/cabinate?${params}`)
}

// Popup functions
const showMaterialCost = () => {
  showMaterialPopup.value = true
}

const showMixRatio = () => {
  showMixRatioPopup.value = true
}

const closeMaterialPopup = () => {
  showMaterialPopup.value = false
}

const closeMixRatioPopup = () => {
  showMixRatioPopup.value = false
}

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getDaysRemaining = () => {
  if (!projectData.value) return 0
  const endDate = new Date(projectData.value.endDate)
  const today = new Date()
  const timeDiff = endDate.getTime() - today.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
  return daysDiff > 0 ? daysDiff : 0
}

const getProgressPercentage = () => {
  if (!projectData.value) return 0
  const startDate = new Date(projectData.value.startDate)
  const endDate = new Date(projectData.value.endDate)
  const today = new Date()

  const totalDays = endDate.getTime() - startDate.getTime()
  const passedDays = today.getTime() - startDate.getTime()

  if (passedDays < 0) return 0
  if (passedDays > totalDays) return 100

  return Math.round((passedDays / totalDays) * 100)
}


// Lifecycle
onMounted(async () => {
  await fetchProjectData()
  await fetchMaterial();
  await fetchMixRatio();
})
</script>
