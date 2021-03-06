import axios from 'axios'
import vue from 'vue'
import store from '@/store'
import Cookies from 'js-cookie'

const request = function (loadtip, query) {
  let loading
  if (Cookies.get('userToken')) {
    query.headers.token = Cookies.get('userToken')
  }
  query.baseURL = process.env.VUE_APP_BASE_URL
  if (loadtip) {
    loading = vue.prototype.$loading({
      lock: false,
      text: '正在加载中…',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.5)'
    })
  }
  return axios.request(query)
    .then(res => {
      if (res.headers.token) {
        store.dispatch('user/setToken', res.headers.token)
      }
      if (loadtip) {
        loading.close()
      }
      if (res.data.code === 401) {
        // vue.prototype.$$router.push({ path: '/login' })
        store.dispatch('user/logout')
        return Promise.reject(res.data)
      } else if (res.data.code === 500) {
        return Promise.reject(res.data)
      } else if (res.data.code === 501) {
        return Promise.reject(res.data)
      } else if (res.data.code === 502) {
        // vue.prototype.$$router.push({ path: '/login' })
        return Promise.reject(res.data)
      } else if (res.data.resultCode === -99999) {
        // vue.prototype.$$router.push({ path: '/login' })
        store.dispatch('user/logout')
        return Promise.reject(res.data.resultMsg)
      } else {
        return Promise.resolve(res.data)
      }
    })
    .catch(e => {
      if (loadtip) {
        loading.close()
      }
      vue.prototype.$message.error(e)
      return Promise.reject(e)
    })
}

const post = function (url, params) {
  const query = {
    baseURL: process.env.VUE_APP_URL,
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'application/json', 'request-ajax': true }
  }
  return request(false, query)
}

const postWithLoadTip = function (url, params) {
  const query = {
    baseURL: process.env.VUE_APP_URL,
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'application/json', 'request-ajax': true }
  }
  return request(true, query)
}

const postWithOutLoadTip = function (url, params) {
  const query = {
    baseURL: process.env.VUE_APP_URL,
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'application/json', 'request-ajax': true }
  }
  return request(false, query)
}

const get = function (url, params) {
  const query = {
    baseURL: process.env.VUE_APP_URL,
    url: url,
    method: 'get',
    withCredentials: true,
    timeout: 30000,
    params: params,
    headers: { 'request-ajax': true }
  }
  return request(false, query)
}

const form = function (url, params) {
  const query = {
    baseURL: process.env.VUE_APP_URL,
    url: url,
    method: 'post',
    withCredentials: true,
    timeout: 30000,
    data: params,
    headers: { 'Content-Type': 'multipart/form-data', 'request-ajax': true }
  }
  return request(false, query)
}

export {
  post,
  postWithLoadTip,
  postWithOutLoadTip,
  get,
  form
}
