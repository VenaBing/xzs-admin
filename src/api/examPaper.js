import { post } from '@/utils/request'

export default {
  queryTestPaperList: query => post('/teacher/paper/queryTestPaperList', query),
  addTestPaper: query => post('/teacher/paper/addTestPaper', query),
  modifyTestPaper: query => post('/teacher/paper/modifyTestPaper', query),
  queryTestPaperDetail: query => post('/teacher/paper/queryTestPaperDetail', query),
  delTestPaper: query => post('/teacher/paper/delTestPaper', query)
}
