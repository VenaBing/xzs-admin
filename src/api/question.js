import { post } from '@/utils/request'

export default {
  addQuestion: query => post('/teacher/question/addQuestion', query),
  queryQuestionList: query => post('/teacher/question/queryQuestionList', query),
  queryQuestionDetail: query => post('/teacher/question/queryQuestionDetail', query),
  modifyQuestion: query => post('/teacher/question/modifyQuestion', query),
  delQuestion: query => post('/teacher/question/delQuestion', query)
}
