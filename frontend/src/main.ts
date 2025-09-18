import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 导入Pinia
import pinia from './store'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 导入Bootstrap样式
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 创建应用实例
const app = createApp(App)

// 使用Pinia
app.use(pinia)

// 使用Element Plus
app.use(ElementPlus)

// 挂载应用
app.mount('#app')
