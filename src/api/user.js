import { post } from '@/utils/request'

export default {
  queryStudentList: query => post('/teacher/student/queryStudentList', query),
  addStudentInfo: query => post('/teacher/student/addStudentInfo', query),
  delStudentInfo: query => post('/teacher/student/delStudentInfo', query),
  modifyStudentInfo: query => post('/teacher/student/modifyStudentInfo', query),

  addTeacherInfo: query => post('/teacher/teacher/addTeacherInfo', query),
  queryTeacherList: query => post('/teacher/teacher/queryTeacherList', query),
  delTeacherInfo: query => post('/teacher/teacher/delTeacherInfo', query),
  modifyTeacherInfo: query => post('/teacher/teacher/modifyTeacherInfo', query),

  createUser: query => post('/api/admin/user/edit', query),
  selectUser: id => post('/api/admin/user/select/' + id),
  getCurrentUser: () => post('/api/admin/user/current'),
  updateUser: query => post('/api/admin/user/update', query),
  changeStatus: id => post('/api/admin/user/changeStatus/' + id),
  deleteUser: id => post('/api/admin/user/delete/' + id),
  selectByUserName: query => post('/api/admin/user/selectByUserName', query)
}
