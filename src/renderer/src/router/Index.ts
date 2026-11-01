// src/router/Index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '../pages/Welcome/Index.vue'
import License from '../pages/Welcome/License.vue'
import PrivacyPolicy from '../pages/Welcome/PrivacyPolicy.vue'
import CompanyInfo from '../pages/Welcome/CompanyInfo.vue'
import Welcome from '../pages/Welcome/welcome.vue'
import Dashboard from '../pages/Dashboard/Index.vue'
import NewProject from '../pages/Dashboard/NewProject.vue'
import Pile from '../pages/Exterior/Pile.vue'
import Column from '../pages/Exterior/Column.vue'
import Beam from '../pages/Exterior/Beam.vue'
import Footing from '../pages/Exterior/Footing.vue'
import Brick from '../pages/Exterior/Brick.vue'
import PlasterPaint from '../pages/Finish/PlasterPaint.vue'
import WGG from '../pages/Finish/WGG.vue'
import Door from '../pages/Finish/Door.vue'
import Slab from '../pages/Exterior/Slab.vue'
import Reports from '../pages/Reports/Index.vue'
import SandFilling from '../pages/Exterior/Sand-Filling.vue'
import LiftShareWall from '../pages/Exterior/Lift-Share-Wall.vue'
import FileShare from '../pages/Welcome/FileShare.vue'
import Tiles from '../pages/Finish/Tiles.vue'
import ProjectHome from '../pages/Dashboard/ProjectHome.vue'
import NotFound from '../components/Dashboard/NotFound.vue'
import Materials from '../pages/Materials/Index.vue'
import Chat from '../pages/Dashboard/Chat.vue'
import Profiles from '../pages/Dashboard/Profiles.vue'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index,
    icon: 'm-home'
  },
  {
    path: '/license',
    name: 'License',
    component: License,
    icon: 'm-license'
  },
  {
    path: '/PrivacyPolicy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
    icon: 'm-privacy'
  },
  {
    path: '/CompanyInfo',
    name: 'CompanyInfo',
    component: CompanyInfo,
    icon: 'm-company'
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: Welcome,
    icon: 'm-welcome'
  },
  {
    path: '/file-share',
    name: 'file-share',
    component: FileShare,
    icon: 'm-file'
  },
  {
    path: '/dashboard/',
    name: 'Dashboard',
    component: Dashboard,
    icon: 'm-dashboard'
  },
  {
    path: '/addNewProject',
    name: 'addNewProject',
    component: NewProject,
    icon: 'm-add'
  },
  {
    path: '/chat',
    name: 'chat',
    component: Chat,
    icon: 'm-chat'
  },
  {
    path: '/reports',
    name: 'reports',
    component: Reports,
    icon: 'm-reports'
  },
  {
    path: '/materials',
    name: 'Materials',
    component: Materials,
    icon: 'm-materials'
  },
  {
    path: '/profiles/',
    name: 'Profiles',
    component: Profiles,
    icon: 'm-user11'
  },

  // EXTERIOR
  {
    path: '/exterior/pile',
    name: 'pile',
    component: Pile,
    icon: 'm-pile'
  },
  {
    path: '/exterior/column',
    name: 'column',
    component: Column,
    icon: 'm-column'
  },
  {
    path: '/exterior/footing',
    name: 'footing',
    component: Footing,
    icon: 'm-footing'
  },
  {
    path: '/exterior/beam',
    name: 'beam',
    component: Beam,
    icon: 'm-beam'
  },
  {
    path: '/exterior/brick',
    name: 'brick',
    component: Brick,
    icon: 'm-brick'
  },
  {
    path: '/exterior/slab',
    name: 'slab',
    component: Slab,
    icon: 'm-slab'
  },
  {
    path: '/exterior/sand-filling',
    name: 'sand-filling',
    component: SandFilling,
    icon: 'm-sand'
  },
  {
    path: '/exterior/share-wall',
    name: 'share-wall',
    component: LiftShareWall,
    icon: 'm-wall'
  },

  // FINISH
  {
    path: '/finish/plasterpaint',
    name: 'plasterpaint',
    component: PlasterPaint,
    icon: 'm-paint'
  },
  {
    path: '/finish/wgg',
    name: 'wgg',
    component: WGG,
    icon: 'm-wgg'
  },
  {
    path: '/finish/Door',
    name: 'Door',
    component: Door,
    icon: 'm-door'
  },
  {
    path: '/finish/tiles',
    name: 'tiles',
    component: Tiles,
    icon: 'm-tiles'
  },
  {
    path: '/projects/:id',
    name: 'project',
    component: ProjectHome,
    icon: 'm-project'
  },
  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    icon: 'm-404'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
