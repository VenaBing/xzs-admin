import { post } from '@/utils/request'

export default {
  queryExamList: query => post('/teacher/exam/queryExamList', query),

  queryExerciseList: query => post('/teacher/exercise/queryExerciseList', query),
  queryExerciseDetail: query => post('/teacher/exercise/queryExerciseDetail', query)
}
