<template>
  <div class="app-container">

    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading" :rules="rules">
      <el-form-item label="用户名："  prop="accountNo" required>
        <el-input v-model="form.accountNo"></el-input>
      </el-form-item>
      <el-form-item label="密码："  required>
        <el-input v-model="form.accountPass"></el-input>
      </el-form-item>
      <el-form-item label="真实姓名：" prop="teacherName" required>
        <el-input v-model="form.teacherName"></el-input>
      </el-form-item>
      <el-form-item label="年龄：">
        <el-input v-model="form.age"></el-input>
      </el-form-item>
      <el-form-item label="性别：">
        <el-select v-model="form.gender" placeholder="性别" clearable>
          <el-option v-for="item in sexEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="出生日期：">
        <el-date-picker v-model="form.birthday" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" />
      </el-form-item>
      <el-form-item label="手机：">
        <el-input v-model="form.mobile"></el-input>
      </el-form-item>
      <!-- <el-form-item label="年级：" prop="gradeId" required>
        <el-select v-model="form.gradeId" placeholder="年级">
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeDesc"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="状态：" required>
        <el-select v-model="form.status" placeholder="状态">
          <el-option v-for="item in statusEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import userApi from '@/api/user'

export default {
  data () {
    return {
      form: {
        accountNo: '',
        accountPass: '',
        teacherName: '',
        status: 1,
        age: '',
        gender: '',
        birthday: null,
        mobile: null
        // gradeId: null
      },
      formLoading: false,
      rules: {
        accountNo: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        teacherName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        gradeId: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ]
      },
      levelEnum: JSON.parse(localStorage.getItem('levelEnum'))
    }
  },
  created () {
    let id = this.$route.query.id
    let _this = this
    if (id && parseInt(id) !== 0) {
      _this.formLoading = true
      userApi.queryTeacherList({ teacherId: id }).then(re => {
        _this.form = re.data.list[0]
        _this.formLoading = false
      })
    }
  },
  methods: {
    submitForm () {
      let _this = this
      let id = this.$route.query.id
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoading = true
          if (id) {
            userApi.modifyTeacherInfo(this.form).then(data => {
              if (data.resultCode === 10000) {
                _this.$message.success(data.resultMsg)
                _this.delCurrentView(_this).then(() => {
                  _this.$router.push('/user/teacher/list')
                })
              } else {
                _this.$message.error(data.resultMsg)
                _this.formLoading = false
              }
            }).catch(e => {
              _this.formLoading = false
            })
          } else {
            userApi.addTeacherInfo(this.form).then(data => {
              if (data.resultCode === 10000) {
                _this.$message.success(data.resultMsg)
                _this.delCurrentView(_this).then(() => {
                  _this.$router.push('/user/teacher/list')
                })
              } else {
                _this.$message.error(data.resultMsg)
                _this.formLoading = false
              }
            }).catch(e => {
              _this.formLoading = false
            })
          }
        } else {
          return false
        }
      })
    },
    resetForm () {
      let lastId = this.form.id
      this.$refs['form'].resetFields()
      this.form = {
        id: null,
        userName: '',
        password: '',
        realName: '',
        role: 1,
        status: 1,
        age: '',
        sex: '',
        birthDay: null,
        phone: null,
        userLevel: null
      }
      this.form.id = lastId
    },
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
  },
  computed: {
    ...mapGetters('enumItem', [
      'enumFormat'
    ]),
    ...mapState('enumItem', {
      sexEnum: state => state.user.sexEnum,
      roleEnum: state => state.user.roleEnum,
      statusEnum: state => state.user.statusEnum
    })
  }
}
</script>
