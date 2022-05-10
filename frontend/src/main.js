import Vue from 'vue'
import App from './App.vue'
import WebSocket from 'isomorphic-ws'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router'
import '@/assets/css/index.scss'
import axios from 'axios';
import locale from 'element-ui/lib/locale/lang/en'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

Vue.use(ElementUI,{locale});

Vue.prototype.$websocket = WebSocket
Vue.prototype.$axios = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
