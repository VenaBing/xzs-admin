import { post } from '@/utils/request'

export default {
  queryGradeList: query => post(`/teacher/grade/queryGradeList`, query)
}
