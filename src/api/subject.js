import { post } from '@/utils/request'

export default {
  pageList: query => post('/teacher/subject/querySubjectList', query),
  addSubject: query => post('/teacher/subject/addSubject', query),
  modifySubject: query => post('/teacher/subject/modifySubject', query),
  delSubject: query => post('/teacher/subject/delSubject', query)
}
