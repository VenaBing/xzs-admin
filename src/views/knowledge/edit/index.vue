<template>
  <div class="app-container">
    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading" :rules="rules">
      <el-form-item label="年级：" prop="gradeId" required>
        <el-select v-model="form.gradeId" placeholder="年级" @change="changeGrade">
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeName"></el-option>
        </el-select>
      </el-form-item>
    <el-form-item label="学科：" prop="subjectName" required>
        <el-select v-model="form.subjectName" placeholder="学科" @change="changeSubject">
          <el-option v-for="item in subjectList" :key="item.subjectId" :value="item.subjectId" :label="item.subjectName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="知识点树：" required>
        <el-tree
            :data="treeData"
            node-key="knowledgeId"
            default-expand-all
            :expand-on-click-node="false"
            :render-content="renderContent">
        </el-tree>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="addTree">添加根节点</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <el-dialog title="" :visible.sync="dialogFormVisible">
        <el-form :model="form">
            <el-form-item label="知识点名称" :label-width="formLabelWidth">
            <el-input v-model="knowledgeName" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import subjectApi from '@/api/subject'
import knowledgeApi from '@/api/knowledge'

export default {
  data () {
    return {
      dialogFormVisible: false,
      formLabelWidth: '84px',
      form: {
        gradeId: null,
        subjectName: ''
      },
      levelEnum: JSON.parse(localStorage.getItem('levelEnum')),
      formLoading: false,
      subjectList: [],
      treeData: [],
      rules: {
        gradeId: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ],
        subjectName: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ]
      },
      subjectId: '',
      knowledgeName: '',
      pid: '',
      isNodePid: false
    }
  },
  created () {
    console.log(this.$route.query)
    let { id, subjectId, gradeId } = this.$route.query
    let _this = this
    if (id && parseInt(id) !== 0) {
      _this.formLoading = true
      knowledgeApi.queryKnowledgeTree({ knowledgeId: id, subjectId, gradeId }).then(re => {
        _this.form = re.data[0]
        this.changeGrade(gradeId)
        this.form.subjectName = Number(subjectId)
        this.changeSubject(subjectId)
        _this.formLoading = false
      })
    }
  },
  methods: {
    changeGrade (gradeId) {
      this.form.subjectName = ''
      subjectApi.pageList({ gradeId, isPage: 2 }).then(data => {
        if (data.resultCode === 10000) {
          this.subjectList = data.data.list
        } else {
          this.$message.error('请求失败')
        }
      })
    },
    changeSubject (subjectId) {
      this.subjectId = subjectId || this.subjectId
      knowledgeApi.queryKnowledgeTree({ subjectId: this.subjectId, gradeId: this.form.gradeId }).then(data => {
        if (data.resultCode === 10000) {
          this.treeData = data.data
        } else {
          this.$message.error('请求失败')
        }
      })
    },
    addTree () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.dialogFormVisible = true
          this.isNodePid = true
        } else {
          this.isNodePid = false
          return false
        }
      })
    },

    append (data) {
      this.pid = data.knowledgeId
      this.dialogFormVisible = true
    },

    remove (node, data) {
      const params = {
        knowledgeId: data.knowledgeId
      }
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        knowledgeApi.delKnowledge(params).then(data => {
          if (data.resultCode === 10000) {
            this.changeSubject()
            this.$message.success(data.resultMsg)
          } else {
            this.$message.error(data.resultMsg)
          }
        })
      })
    },
    renderContent (h, { node, data, store }) {
      return (
        <span class="custom-tree-node">
          <span>{data.knowledgeName}</span>
          <span style="margin-left: 30px">
            <el-button size="mini" type="text" on-click={ () => this.append(data) }>添加</el-button>
            <el-button size="mini" type="text" on-click={ () => this.remove(node, data) }>删除</el-button>
          </span>
        </span>)
    },
    submitForm () {
      let _this = this
      this.formLoading = true
      const form = {
        subjectId: this.subjectId,
        gradeId: this.form.gradeId,
        knowledgeName: this.knowledgeName,
        pid: this.isNodePid ? 0 : this.pid
      }
      knowledgeApi.addKnowledge(form).then(data => {
        if (data.resultCode === 10000) {
          this.dialogFormVisible = false
          _this.formLoading = false
          this.changeSubject()
          _this.$message.success(data.resultMsg)
        } else {
          _this.$message.error(data.resultMsg)
          _this.formLoading = false
        }
      }).catch(e => {
        _this.formLoading = false
      })
      this.isNodePid = false
      this.knowledgeName = ''
    },
    resetForm () {
      let lastId = this.form.id
      this.$refs['form'].resetFields()
      this.form = {
        id: null,
        name: '',
        level: 1,
        levelName: ''
      }
      this.form.id = lastId
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
