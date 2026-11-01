<!-- components/Dashboard/Currentpath.vue -->
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useToggleViewStore } from '../../stores/useToggleViewStore'
import ToolTipShort from '../Initializers/ToolTipShort.vue'

// PINIA STORE
const toggleStore = useToggleViewStore()

// PROPS & EMITS
const props = defineProps<{
  active: string
}>()

const emit = defineEmits<{
  (event: 'active', type: string): void
}>()

// ROUTER
const route = useRoute()
const router = useRouter()
const id = route.query.id

// PROJECT DESCRIPTION FROM URL
const project_name = route.query.projectName
const start_date = route.query.startDate
const end_date = route.query.endDate
const project_description = route.query.projectDescription
const client_name = route.query.clientName
const project_status = route.query.projectStatus
const total_floors = route.query.totalFloors
const total_units = route.query.totalUnits

// Emit all project details on mount
emit('active', JSON.stringify({
  project_name,
  start_date,
  end_date,
  project_description,
  client_name,
  project_status,
  total_floors,
  total_units
}))

// TRUNCATED DESCRIPTION
const truncatedDescription = (() => {
  if (!project_description) return 'N/A'
  const desc = project_description as string
  return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
})()

// REMAINING DAYS CALCULATION
const remaining_days = (() => {
  if (!end_date) return 'N/A'
  const today = new Date()
  const end = new Date(end_date as string)
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'Overdue'
  return `${diffDays} day(s)`
})()

// TOOLTIP TEXT
const tooltipText = `
  <div>
    <strong>Client:</strong> <span style='color: #f1f;'>${client_name}</span><br>
    <strong>Start Date:</strong> <span style='color: #f1f;'>${start_date}</span><br>
    <strong>End Date:</strong> <span style='color: #f1f;'>${end_date}</span><br>
    <strong>Total Floors:</strong> <span style='color: #f1f;'>${total_floors}</span><br>
    <strong>Total Units:</strong> <span style='color: #f1f;'>${total_units}</span><br>
    ${project_status !== 'Completed'
    ? `<strong>Remaining Days:</strong> <span style='color: #f1f;'>${remaining_days}</span><br>`
    : ''
  }
    <strong>Description:</strong> <span class="text-dotted-3" style='color: #f1f;'>${truncatedDescription}</span><br>
    <strong>Status:</strong> <span style='color: ${project_status === 'Completed' ? 'green' : 'yellow'};'>${project_status}</span>
  </div>
`

// PATH LIST
const pathList = [
  'Pile',
  'Share Wall',
  'Footing',
  'Column',
  'Sand Filling',
  'Beam',
  'Slab',
  'Brick',
]

// NAVIGATION
const goToProjectDashboard = () => {
  router.push(`/projects/${id}`)
}
const openFinish = () => {
  router.push(
    `/finish/plasterpaint?id=${encodeURIComponent(id as string)}&projectName=${encodeURIComponent(project_name as string)}&startDate=${encodeURIComponent(start_date as string)}&endDate=${encodeURIComponent(end_date as string)}&projectDescription=${encodeURIComponent(project_description as string)}&clientName=${encodeURIComponent(client_name as string)}&projectStatus=${encodeURIComponent(project_status as string)}&totalFloors=${encodeURIComponent(total_floors as string)}&totalUnits=${encodeURIComponent(total_units as string)}`
  )
}
const openInterior = () => {
  router.push(
    `/interior/cabinate?id=${encodeURIComponent(id as string)}&projectName=${encodeURIComponent(project_name as string)}&startDate=${encodeURIComponent(start_date as string)}&endDate=${encodeURIComponent(end_date as string)}&projectDescription=${encodeURIComponent(project_description as string)}&clientName=${encodeURIComponent(client_name as string)}&projectStatus=${encodeURIComponent(project_status as string)}&totalFloors=${encodeURIComponent(total_floors as string)}&totalUnits=${encodeURIComponent(total_units as string)}`
  )
}

// FORMAT PATHS
const formatPath = (label: string) => {
  const base = '/exterior/' + label.toLowerCase().replace(/\s+/g, '-')
  const query: Record<string, string | undefined> = {
    id: id as string | undefined,
    projectName: project_name as string | undefined,
    startDate: start_date as string | undefined,
    endDate: end_date as string | undefined,
    projectDescription: project_description as string | undefined,
    clientName: client_name as string | undefined,
    projectStatus: project_status as string | undefined,
    totalFloors: total_floors as string | undefined,
    totalUnits: total_units as string | undefined
  }
  const searchParams = Object.entries(query)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
    .join('&')
  return searchParams ? `${base}?${searchParams}` : base
}

// REMOVE OLD TOGGLE BAR STATE - Now using Pinia store
// const savedView = localStorage.getItem('currentView')
// const currentView = ref(savedView || 'graph')
// watch(currentView, (val) => {
//   localStorage.setItem('currentView', val)
// })
// const toggleView = (type: string) => {
//   currentView.value = type
// }
</script>

<template>
  <section class="project-summery">
    <!-- NAVIGATION SHORTCUTS -->
    <div class="direct-nav">
      <RouterLink to="" class="short-nav" @click.prevent="goToProjectDashboard"><i class="m-home5"
          title="Go to Project Dashboard"></i></RouterLink>
      <RouterLink to="" class="short-nav" @click.prevent="openFinish"><i class="m-external-link"
          title="Open Finish Work"></i> <span>Finish</span></RouterLink>
      <RouterLink to="" class="short-nav" @click.prevent="openInterior"><i class="m-external-link"
          title="Open Interior"></i> <span>Interior</span></RouterLink>
    </div>

    <!-- PROJECT NAME WITH TOOLTIP -->
    <div class="project-name">
      <ToolTipShort :text="tooltipText" placement="bottom">
        <i class="m-info3"></i>
      </ToolTipShort>
      <p>{{ project_name }}</p>
    </div>

    <!-- PATH LIST -->
    <ul class="path-container">
      <li v-for="item in pathList" :key="item">
        <router-link class="path" :class="{ active: item === props.active }" :to="formatPath(item)"
          @click="() => { emit('active', item) }">
          {{ item }}
        </router-link>
      </li>
    </ul>

    <!-- TOGGLE BAR - Updated to use Pinia store -->
    <div class="toggle-bar">
      <button class="toggle-option" :class="{ active: toggleStore.isDetailedView }"
        @click="toggleStore.setView('detailed')">
        <i class="m-layers1"></i>
        <span>Detailed</span>
      </button>
      <button class="toggle-option" :class="{ active: toggleStore.isGraphView }" @click="toggleStore.setView('graph')">
        <i class="m-chart1"></i>
        <span>Graph</span>
      </button>
    </div>
  </section>
</template>

<!-- Styles remain the same -->
<style scoped lang="scss">
@use '../../assets/styles/variables/index' as *;

.path-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 1.2rem;
  height: 2rem;
  border-top: 1px solid $d-border;
  border-bottom: 1px solid $d-border;
  box-shadow: $box-shadow;
  transition: all 0.3s ease;

  .path {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 2;

    &.active,
    &:hover {
      &::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: $d-primary;
        width: calc(100% + 1rem);
        height: calc(100% + 2px);
        border-radius: 2px;
        z-index: -1;
        transition: all 0.3s ease;
      }
    }
  }
}

.toggle-bar {
  position: absolute;
  right: 0.5rem;
  bottom: 0.25rem;
  display: inline-flex;
  border: 1px solid $d-border;
  border-radius: 0.4rem;
  overflow: hidden;
  background-color: $d-btn-1;
  box-shadow: $box-shadow;

  .toggle-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 0.2rem 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;

    p {
      font-size: 0.8rem;
    }

    &:hover {
      background-color: $d-card-hover;
    }

    &.active {
      background-color: $d-primary;
      color: $d-white;
    }

    i {
      font-size: 0.9rem;
    }
  }
}
</style>