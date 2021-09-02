<template>
  <div class="app-container">

    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading" :rules="rules">
      <el-form-item label="学科：" prop="subjectName" required>
        <el-input v-model="form.subjectName"></el-input>
      </el-form-item>
      <el-form-item label="年级：" required>
        <el-select v-model="form.gradeId" placeholder="年级">
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeDesc"></el-option>
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
import { mapGetters, mapActions } from 'vuex'
import subjectApi from '@/api/subject'

export default {
  data () {
    return {
      form: {
        subjectName: '',
        gradeId: 1
      },
      formLoading: false,
      levelEnum: JSON.parse(localStorage.getItem('levelEnum')),
      isEdit: false,
      rules: {
        subjectName: [
          { required: true, message: '请输入学科', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    let { gradeId, subjectId, subjectName } = this.$route.query
    if (subjectId) {
      this.form.subjectName = subjectName
      this.form.gradeId = Number(gradeId)
      this.form.subjectId = subjectId
      this.isEdit = true
    }
  },
  methods: {
    submitForm () {
      let _this = this
      let { subjectId } = this.$route.query
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoading = true
          if (this.isEdit) {
            this.form.subjectId = subjectId
            subjectApi.modifySubject(this.form).then(data => {
              if (data.resultCode === 10000) {
                _this.$message.success(data.resultMsg)
                _this.delCurrentView(_this).then(() => {
                  _this.$router.push('/education/subject/list')
                })
              } else {
                _this.$message.error(data.resultMsg)
                _this.formLoading = false
              }
            }).catch(e => {
              _this.formLoading = false
            })
          } else {
            subjectApi.addSubject(this.form).then(data => {
              if (data.resultCode === 10000) {
                _this.$message.success(data.resultMsg)
                _this.delCurrentView(_this).then(() => {
                  _this.$router.push('/education/subject/list')
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
      this.$refs['form'].resetFields()
      this.form = {
        subjectName: '',
        gradeId: 1
      }
    },
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
  },
  computed: {
    ...mapGetters('enumItem', [
      'enumFormat'
    ])
  }
}
</script>
