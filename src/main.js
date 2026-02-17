import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router/index.ts'
import { useAuthStore } from './stores/auth.ts'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar observer de Firebase Auth antes de montar
const authStore = useAuthStore()
authStore.init()

app.mount('#app')
