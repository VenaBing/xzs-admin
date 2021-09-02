import { post, postWithLoadTip } from '@/utils/request'

export default {
  login: query => postWithLoadTip(`/teacher/account/login`, query),
  logout: query => post(`/teacher/account/logout`, query)
}
