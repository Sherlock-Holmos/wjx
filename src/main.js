import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import vant from 'vant';
import router from './router'

const app = createApp(App)
app.use(vant);
app.use(router)

app.mount('#app')
