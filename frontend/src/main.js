import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './index.css'
import './assets/js/lucide.js'
import { createIcons, icons } from 'lucide'

router.afterEach(() => {
    setTimeout(() => setupLucide(), 50);
})

import App from './App.vue'
import router from './router'
import { setupLucide } from './assets/js/lucide.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
createIcons({ icons });