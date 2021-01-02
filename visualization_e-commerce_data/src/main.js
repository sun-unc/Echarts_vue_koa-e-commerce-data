import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import echarts from 'echarts'
// 引入echarts主题
import 'echarts/lib/theme/chalk'
import 'echarts/lib/theme/vintage'
//  引入全局样式文件
import './assets/css/global.less'
// 引入字体文件
import './assets/font/iconfont.css'
import SocketService from '@/utils/socket_service'
// 对服务端进行WebSocket的连接
SocketService.Instance.connect()
//  请求基准路径配值
axios.defaults.baseURL = 'http://192.168.1.110:8888/api/'
//  将axios挂载到vue原型中
//  在别的组件中通过this.$http调用
Vue.prototype.$http = axios
// 把echarts挂载到 Vue原型上，以便在全局访问
Vue.prototype.$echarts = echarts
// 其他组件
Vue.prototype.$socket = SocketService.Instance
// 引入echarts主题
Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
