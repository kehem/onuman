// src/renderer/src/main.ts
import './assets/styles/onuman.scss'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/Index'
import tabPlugin from './plugins/tabPlugin'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './assets/mastorsIcon/mastorsIcons.css'
import "../../mastorsCDN/mastorscdn.css";
import "./assets/styles/universal/_ModalBox.scss";


const app = createApp(App)
const pinia = createPinia()
// app.use(router)
app.use(pinia)
app.use(tabPlugin, { router })
app.use(router)
pinia.use(piniaPluginPersistedstate)
app.mount('#app')

