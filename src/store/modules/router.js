import { constantRoutes } from '@/router'

let state = {
  routes: []
}

const mutations = {
  initRoutes: (state, routes) => {
    state.routes = routes
  }
}

const actions = {
  generateRoutes: ({ commit }, accountType) => {
    console.log(accountType)
    const authedList = filterAsyncRoutes(constantRoutes, accountType)

    return new Promise(resolve => {
      commit('initRoutes', authedList)
      resolve(constantRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

function filterAsyncRoutes (routes, accountType) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(tmp, accountType)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, accountType)
      }
      res.push(tmp)
    }
  })
  return res
}

function hasPermission (route, accountType) {
  if (route.meta && route.meta.accountType) {
    const routeaAccountType = route.meta.accountType
    return routeaAccountType.includes(accountType)
  } else {
    return true
  }
}
