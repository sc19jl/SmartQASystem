// router

import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      alias: '/home',
      component: reverse => require(["@/views/home/Home"], reverse)
    }
  ]
})