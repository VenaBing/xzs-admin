import Cookies from 'js-cookie'
import userApi from '@/api/user'
import CryptoJS from 'crypto-js'

// initial state
const state = {
  userName: Cookies.get('adminUserName'),
  userInfo: Cookies.get('adminUserInfo'),
  userLoginAccount: Cookies.get('userLoginAccount'),
  userLoginPsd: Cookies.get('userLoginPsd'),
  token: '',
  levelEnum: []
}

// actions
const actions = {
  initUserInfo ({ commit }) {
    userApi.getCurrentUser().then(re => {
      commit('setUserInfo', re.response)
    })
  },
  setToken ({ commit }, data) {
    commit('set_token', data)
  }
}

// mutations
const mutations = {
  setUserName (state, userName) {
    state.userName = userName
    Cookies.set('adminUserName', userName, { expires: 30 })
  },
  setUserInfo: (state, userInfo) => {
    state.userInfo = userInfo
    Cookies.set('adminUserInfo', userInfo, { expires: 30 })
  },
  setUserAccount: (state, accountNo) => {
    var accountText = CryptoJS.AES.encrypt(
      accountNo,
      'secretkey123'
    ).toString()
    state.userLoginAccount = accountNo
    Cookies.set('userLoginAccount', accountText, { expires: 30 })
  },
  setUserPsw: (state, accountPass) => {
    var pswText = CryptoJS.AES.encrypt(
      accountPass,
      'secretkey123'
    ).toString()
    state.userLoginPsd = accountPass
    Cookies.set('userLoginPsd', pswText, { expires: 30 })
  },
  removeUser: () => {
    Cookies.remove('userLoginAccount')
    Cookies.remove('userLoginPsd')
  },
  clearLogin (state) {
    Cookies.remove('adminUserName')
    Cookies.remove('adminUserInfo')
    Cookies.remove('userToken')
  },
  set_token: (state, token) => {
    state.token = token
    Cookies.set('userToken', token)
  },
  setLevelInfo: (state, data) => {
    state.levelEnum = data
    localStorage.setItem('levelEnum', JSON.stringify(data))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
