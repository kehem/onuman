<!-- pages/Dashboard/Index.vue -->
<template>
  <DefaultLayouts class="d-block relative">
    <section class="f-center h-100">
      <div class="main-screen w-95">
        <br>
        <!-- WELCOME USER (DATE & TIME) -->
        <div v-if="welcomeData" class="welcome-data">
          <strong class="user-name">Howdy, Shuvo !</strong>
          <div class="onuman-date-time">
            <time :datetime="new Date(welcomeData.date).toISOString()">{{ welcomeData.date }}</time>
            <time :datetime="'T' + welcomeData.time">{{ welcomeData.time }}</time>
          </div>
        </div>

        <!-- DASHBOARD METRICS -->
        <div class="dashboard-metrics">
          <div class="metric-card" @click="newProject">
            <div class="metric-icon"><i class="m-folder3"></i></div>
            <div class="metric-label">New Project</div>
            <div class="metric-shortcut">Ctrl+N</div>
          </div>

          <div class="metric-card" @click="currentMaterials">
            <div class="metric-icon"><i class="m-basket"></i></div>
            <div class="metric-label">Current Materials</div>
            <div class="metric-shortcut">Ctrl+M</div>
          </div>

          <div class="metric-card" @click="newReport">
            <div class="metric-icon"><i class="m-piechart"></i></div>
            <div class="metric-label">Report</div>
            <div class="metric-shortcut">Alt+R</div>
          </div>

          <div class="metric-card">
            <div class="metric-icon"><i class="m-document-diagrams"></i></div>
            <div class="metric-label">Project Analizer</div>
            <div class="metric-shortcut">Ctrl+Alt+N</div>
          </div>

          <div class="metric-card" @click="openFTP">
            <div class="metric-icon"><i class="m-upload4"></i></div>
            <div class="metric-label">FTP File Share</div>
            <div class="metric-shortcut">Ctrl+F</div>
          </div>

          <div class="metric-card" @click="openChat">
            <div class="metric-icon"><i class="m-chat1"></i></div>
            <div class="metric-label">Chat</div>
            <div class="metric-shortcut">Ctrl+T</div>
          </div>
        </div>
        <br>
        <!-- SORT -->
        <div class="f-between">
          <h2>All Projects</h2>
          <span class="f-center gap-10">
            Sort :
            <select name="sort" id="sort" class="onuman-select-box" v-model="sortBy" @change="handleSortChange">
              <option value="Default">Default</option>
              <option value="End Date">End Date</option>
              <option value="Start Date">Start Date</option>
              <option value="Status">Status</option>
              <option value="Building Type">Building Type</option>
              <option value="Total Floor">Total Floor</option>
              <option value="Total Unit">Total Unit</option>
            </select>
          </span>
        </div>

        <!-- LOADING SKELETON -->
        <div v-if="loading">
          <div class="project-container">
            <div v-for="n in 8" :key="n" class="skeleton-card">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-image"></div>
              <div class="skeleton skeleton-text"></div>
            </div>
          </div>
        </div>

        <!-- PROJECT LIST -->
        <div class="project-container" v-else-if="projectList && projectList.length > 0">
          <div class="card project" v-for="(item, index) in projectList" :key="index">
            <div class="project-header">
              <strong @click="goToProjectDetail(item)">{{ item.projectName }}</strong>
              <div class="project-menu">
                <button class="menu-trigger" @click="toggleMenu(index, $event)">
                  <i class="m-dots-three-vertical"></i>
                </button>
                <div class="dropdown-menu" :class="{ show: activeMenu === index }" @click.stop>
                  <button class="menu-item" v-if="item.isExterior" @click="openExterior(item, $event)">
                    <i class="m-shop"></i>
                    <p>Open Exterior</p>
                  </button>
                  <button class="menu-item" v-if="item.isFinish" @click="openFinish(item, $event)">
                    <i class="m-view-carousel"></i>
                    <p>Open Finish</p>
                  </button>
                  <button class="menu-item" v-if="item.isInterior" @click="openInterior(item, $event)">
                    <i class="m-inbox-filled text--md"></i>
                    <p>Open Interior</p>
                  </button>
                  <button class="menu-item" @click="updateProject(item, $event)">
                    <i class="m-recycle"></i>
                    <p>Update Project</p>
                  </button>
                  <!-- <button class="menu-item" @click="showMaterialCost(item, $event)">
                    <i class="m-pricetags"></i>
                    <p>Material Cost</p>
                  </button>
                  <button class="menu-item" @click="showMixRatio(item, $event)">
                    <i class="m-basket"></i>
                    <p>Mix Ratio</p>
                  </button> -->
                  <button class="menu-item danger" @click="deleteProject(item, $event)">
                    <i class="m-trash-2"></i>
                    <p>Delete Project</p>
                  </button>
                </div>
              </div>
            </div>

            <div class="project-status" :class="item.projectStatus">
              {{ item.projectStatus }}
            </div>

            <div class="project-image-container" @click="goToProjectDetail(item)">
              <div class="proj-image">
                <ProjectImage :src="item.projectImage" :alt="item.projectName">
                  <template #loading>
                    <div class="skeleton-card-img">
                      <div class="skeleton skeleton-image"></div>
                    </div>
                  </template>
                </ProjectImage>
              </div>
            </div>

            <div class="project-info">
              <div class="info-row">
                <span class="label">Client:</span>
                <span class="value">{{ item.clientName }}</span>
              </div>
              <div class="info-row">
                <span class="label">Floors:</span>
                <span class="value">{{ item.totalFloor }}</span>
              </div>
              <div class="info-row">
                <span class="label">Units:</span>
                <span class="value">{{ item.totalUnit }}</span>
              </div>
              <div class="info-row">
                <span class="label">End Date:</span>
                <span class="value">{{ formatDate(item.endDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div v-else>
          <div class="empty-state">
            <span v-if="hasError" class="empty-state">
              <div class="empty-icon"><i class="m-error"></i></div>
              <h2>Server Error</h2>
              <p>{{ errorMessage }}</p>
              <button type="button" class="button" @click="fetchData(currentPage)">Try Again</button>
            </span>

            <!-- No Projects State -->
            <div class="no-projects-state" v-else>
              <div class="empty-icon"><i class="m-readthedocs"></i></div>
              <h2>No Projects Found</h2>
              <p>Start by creating your first project to get started.</p>
              <button type="button" class="button" @click="newProject">Create New Project</button>
            </div>
          </div>
        </div>

        <!-- PAGINATION -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="pagination-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            Previous
          </button>

          <button v-for="page in visiblePages" :key="page" class="pagination-btn"
            :class="{ active: page === currentPage }" @click="changePage(page)">
            {{ page }}
          </button>

          <button class="pagination-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
            Next
          </button>

          <div class="pagination-info">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
            {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} projects
          </div>
        </div>
      </div>
    </section>

    <!-- MATERIAL COST POPUP -->
    <div class="popup-overlay" :class="{ show: showMaterialPopup }" @click="closeMaterialPopup">
      <div class="cr23-popui">
        <div class="popup-content" @click.stop>
          <div class="popup-header">
            <h3>
              Material Cost - <span class="proj-name-32cd">{{ selectedProject?.projectName }}</span>
            </h3>
            <button class="close-btn" @click="closeMaterialPopup">&times;</button>
          </div>
          <table class="popup-table" v-if="selectedProject?.materials">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Price (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="material in selectedProject.materials" :key="material.name">
                <td>{{ material.name }}</td>
                <td>{{ material.price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MIX RATIO POPUP -->
    <div class="popup-overlay" :class="{ show: showMixRatioPopup }" @click="closeMixRatioPopup">
      <div class="cr23-popui">
        <div class="popup-content" @click.stop>
          <div class="popup-header">
            <h3>
              Mix Ratio - <span class="proj-name-32cd">{{ selectedProject?.projectName }}</span>
            </h3>
            <button class="close-btn" @click="closeMixRatioPopup">&times;</button>
          </div>
          <table class="popup-table" v-if="selectedProject?.mixRatio">
            <thead>
              <tr>
                <th>Component</th>
                <th>Ratio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cement</td>
                <td>{{ selectedProject.mixRatio.cement }}</td>
              </tr>
              <tr>
                <td>Sand</td>
                <td>{{ selectedProject.mixRatio.sand }}</td>
              </tr>
              <tr>
                <td>Stone</td>
                <td>{{ selectedProject.mixRatio.stone }}</td>
              </tr>
              <tr>
                <td>Brick</td>
                <td>{{ selectedProject.mixRatio.brick }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="selectedProject?.mixRatio?.comment" class="mix-comment">
            <strong>Comment:</strong> {{ selectedProject.mixRatio.comment }}
          </div>
        </div>
      </div>
    </div>

    <BottomBar />
  </DefaultLayouts>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../../composables/Toast'
const { showToast } = useToast()
import DefaultLayouts from '../../layouts/DefaultLayouts.vue'
import BottomBar from '../../components/Dashboard/BottomBar.vue'
import ProjectImage from '../../components/Dashboard/ProjectImage.vue'
import { Project, WelcomeData } from '../../Interfaces/Project'
import { useApi } from '../../composables/useApi'
const { get, delete: del } = useApi()

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')

const loading = ref(true)
const activeMenu = ref<number | null>(null)
const showMaterialPopup = ref(false)
const showMixRatioPopup = ref(false)
const selectedProject = ref<Project | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(12)
const totalItems = ref(0)
const totalPages = ref(0)

// PROJECT DETAILS
const projectList = ref<Project[]>([])

// Add this reactive variable in your setup function
const sortBy = ref('Default')

const handleSortChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  sortBy.value = target.value
  applySorting()
}

// Separate function to apply sorting locally
const applySorting = () => {
  if (!projectList.value || projectList.value.length === 0) return

  let sortedData = [...projectList.value]

  switch (sortBy.value) {
    case 'End Date':
      sortedData.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      break
    case 'Start Date':
      sortedData.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      break
    case 'Status':
      sortedData.sort((a, b) => a.projectStatus.localeCompare(b.projectStatus))
      break
    case 'Building Type':
      sortedData.sort((a, b) => a.buildingType.localeCompare(b.buildingType))
      break
    case 'Total Floor':
      sortedData.sort((a, b) => b.totalFloor - a.totalFloor) // Descending
      break
    case 'Total Unit':
      sortedData.sort((a, b) => b.totalUnit - a.totalUnit) // Descending
      break
    case 'Default':
    default:
      sortedData.sort((a, b) => b.id - a.id) // Latest first
      break
  }

  projectList.value = sortedData
}

const fetchData = async (page: number = 1) => {
  try {
    loading.value = true
    hasError.value = false
    errorMessage.value = ''


    // Fetch data without sorting parameters
    const response = await get(`/api/project_list?page=${page}`)

    if (response.results) {
      projectList.value = response.results
      totalItems.value = response.count
      totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value)
    } else {
      // Handle case where response is the array directly
      projectList.value = response
      totalItems.value = response.length
      totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value)
    }

    // Apply current sorting after fetching data
    applySorting()

  } catch (error: any) {
    hasError.value = true
    errorMessage.value = error.response?.message || error.message || 'Failed to connect to server'
    showToast('error', errorMessage.value, 5000, 'right-bottom')
    projectList.value = []
  } finally {
    loading.value = false
  }
}


const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const toggleMenu = (index: number, event: Event) => {
  event.stopPropagation()
  activeMenu.value = activeMenu.value === index ? null : index
}

const closeMenus = (event?: Event) => {
  if (event && event.target) {
    const target = event.target as HTMLElement
    if (target.closest('.project-menu')) {
      return
    }
  }
  activeMenu.value = null
}

const goToProjectDetail = (item: Project) => {
  router.push(`/projects/${item.id}`)
}

const openExterior = (item: Project, event?: Event) => {
  if (event) event.stopPropagation()
  router.push(
    `exterior/pile?&id=${encodeURIComponent(item.id)}&projectName=${encodeURIComponent(item.projectName)}&startDate=${encodeURIComponent(item.startDate)}&endDate=${encodeURIComponent(item.endDate)}&projectDescription=${encodeURIComponent(item.projectDescription)}&clientName=${encodeURIComponent(item.clientName)}&projectStatus=${encodeURIComponent(item.projectStatus)}&totalFloors=${encodeURIComponent(item.totalFloor)}&totalUnits=${encodeURIComponent(item.totalUnit)}`
  )
  closeMenus()
}

const openFinish = (item: Project, event?: Event) => {
  if (event) event.stopPropagation()
  router.push(
    `/finish/plasterpaint?&id=${encodeURIComponent(item.id)}&projectName=${encodeURIComponent(item.projectName)}&startDate=${encodeURIComponent(item.startDate)}&endDate=${encodeURIComponent(item.endDate)}&projectDescription=${encodeURIComponent(item.projectDescription)}&clientName=${encodeURIComponent(item.clientName)}&projectStatus=${encodeURIComponent(item.projectStatus)}&totalFloors=${encodeURIComponent(item.totalFloor)}&totalUnits=${encodeURIComponent(item.totalUnit)}`
  )
  closeMenus()
}

const openInterior = (item: Project, event?: Event) => {
  if (event) event.stopPropagation()
  router.push(
    `interior/cabinate?&id=${encodeURIComponent(item.id)}&projectName=${encodeURIComponent(item.projectName)}&startDate=${encodeURIComponent(item.startDate)}&endDate=${encodeURIComponent(item.endDate)}&projectDescription=${encodeURIComponent(item.projectDescription)}&clientName=${encodeURIComponent(item.clientName)}&projectStatus=${encodeURIComponent(item.projectStatus)}&totalFloors=${encodeURIComponent(item.totalFloor)}&totalUnits=${encodeURIComponent(item.totalUnit)}`
  )
  closeMenus()
}

const updateProject = (item: Project, event?: Event) => {
  if (event) event.stopPropagation()
  router.push(`/addNewProject?projectId=${item.id}`)
  closeMenus()
}

// const showMaterialCost = (item: Project, event?: Event) => {
//   if (event) event.stopPropagation()
//   selectedProject.value = item
//   showMaterialPopup.value = true
//   closeMenus()
// }

// const showMixRatio = (item: Project, event?: Event) => {
//   if (event) event.stopPropagation()
//   selectedProject.value = item
//   showMixRatioPopup.value = true
//   closeMenus()
// }
const deleteProject = async (item: Project, event?: Event) => {
  if (event) event.stopPropagation()

  try {
    const confirm = window.electronAPI.showConfirmDialog;
    const confirmed = await confirm(
      `Are you sure you want to delete "${item.projectName}"?`,
      'Delete Project'
    )

    if (confirmed) {
      await del(`/api/project_delete/${item.id}`)
      showToast('success', 'Project deleted successfully!', 3000, 'right-bottom')
      fetchData(currentPage.value) // Refresh the list
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.message || error.message || 'Failed to delete project'
    showToast('error', errorMessage, 5000, 'right-bottom')
  } finally {
    closeMenus()
  }
}

// Popup functions
const closeMaterialPopup = () => {
  showMaterialPopup.value = false
  selectedProject.value = null
}

const closeMixRatioPopup = () => {
  showMixRatioPopup.value = false
  selectedProject.value = null
}

// Pagination functions
const changePage = (page: number) => {
  currentPage.value = page
  fetchData(page)
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

const welcomeData = ref<WelcomeData>({
  date: '',
  time: ''
})

// UPDATE TIME
const updateDateTime = () => {
  const now = new Date()
  const day = now.getDate().toString().padStart(2, '0')
  const month = now.toLocaleString('en-GB', { month: 'short' })
  const year = now.getFullYear()
  welcomeData.value.date = `${day} ${month}, ${year} `

  let hours = now.getHours()
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  welcomeData.value.time = `${hours}:${minutes} ${ampm} `
}

updateDateTime()

let intervalId: NodeJS.Timeout | null = null
onMounted(() => {
  fetchData()
  intervalId = setInterval(updateDateTime, 1000)
  // Close menus when clicking outside - FIXED with better event handling
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
  document.removeEventListener('click', closeMenus)
})

// NEW PROJECT
const newProject = () => {
  router.push('/addNewProject')
}
// CURRENT MATERIALS
const currentMaterials = () => {
  router.push('/materials')
}
// CURRENT MATERIALS
const newReport = () => {
  router.push('/reports')
}
// CURRENT MATERIALS
const openFTP = () => {
  router.push('/file-share')
}
// CHAT
const openChat = () => {
  router.push('/chat')
}
</script>
