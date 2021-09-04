import Vue from 'vue'
import Cookies from 'js-cookie'
import App from './App.vue'
import { router } from './router'
import store from './store'
import 'normalize.css/normalize.css'
import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css
import './icons' // icon
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style

Vue.use(Element, {
  size: 'medium' // set element-ui default size
})

Vue.config.productionTip = false

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiltList = ['/login']

router.beforeEach(async (to, from, next) => {
  const isLogin = Cookies.get('userToken')
  const routesInited = store.state.router.routes.length > 0
  if (isLogin) {
    if (!routesInited) {
      await store.dispatch('router/generateRoutes', store.state.user.accountType)
    }
    if (to.path === '/login') {
      next('/')
    } else {
      next()
    }
  } else {
    if (whiltList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

Vue.prototype.$$router = router

new Vue({
  router: router,
  store: store,
  render: h => h(App)
}).$mount('#app')
