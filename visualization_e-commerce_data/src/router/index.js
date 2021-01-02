import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    component: () => import('@/views/IndexPage')
  },
  {
    path: '/sellerpage',
    name: 'SallerPage',
    component: () => import('@/views/SellerPage')
  },
  {
    path: '/trendpage',
    name: 'TrendPage',
    component: () => import('@/views/TrendPage')
  },
  {
    path: '/mappage',
    name: 'MapPage',
    component: () => import('@/views/MapPage')
  },
  {
    path: '/rankpage',
    name: 'RankPage',
    component: () => import('@/views/RankPage')
  },
  {
    path: '/hotpage',
    name: 'HotPage',
    component: () => import('@/views/HotPage')
  },
  {
    path: '/stockpage',
    name: 'StockPage',
    component: () => import('@/views/StockPage')
  }
]

const router = new VueRouter({
  routes
})

export default router
