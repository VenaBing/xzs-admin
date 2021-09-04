<template>
  <div class="app-container">
    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading"  :rules="rules">
      <el-form-item label="年级：" prop="gradeLevel" required>
        <el-select v-model="form.gradeLevel" placeholder="年级"  @change="levelChange">
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学科：" prop="subjectId" required>
        <el-select v-model="form.subjectId" placeholder="学科" @change="changeSubject">
          <el-option v-for="item in subjectList" :key="item.subjectId" :value="item.subjectId" :label="item.subjectName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="题干：" prop="title" required>
        <el-input v-model="form.title"   @focus="inputClick(form,'title')" />
      </el-form-item>
      <el-form-item label="选项：" required>
        <el-form-item :label="item.prefix" :key="item.prefix"  v-for="(item,index) in form.items"  label-width="50px" class="question-item-label">
          <el-input v-model="item.prefix"  style="width:50px;" />
          <el-input v-model="item.content"   @focus="inputClick(item,'content')"  class="question-item-content-input"/>
          <el-button type="danger" size="mini" class="question-item-remove" icon="el-icon-delete" @click="questionItemRemove(index)"></el-button>
        </el-form-item>
      </el-form-item>
      <el-form-item label="标答：" prop="correctArray" required>
        <el-checkbox-group v-model="form.correctArray">
          <el-checkbox v-for="item in form.items" :label="item.prefix" :key="item.prefix">{{item.prefix}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="解析：" prop="analyze" required>
        <el-input v-model="form.analyze"  @focus="inputClick(form,'analyze')" />
      </el-form-item>
      <el-form-item label="分数：" prop="score" required>
        <el-input-number v-model="form.score" :precision="1" :step="1" :max="100"></el-input-number>
      </el-form-item>
      <el-form-item label="难度：" required>
        <el-rate v-model="form.difficult" class="question-item-rate"></el-rate>
      </el-form-item>
      <el-form-item label="知识点：" >
        <treeselect v-model="form.value" :multiple="true" :options="treeData" :normalizer="normalizer" placeholder="知识点" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="success" @click="questionItemAdd">添加选项</el-button>
        <el-button type="success" @click="showQuestion">预览</el-button>
      </el-form-item>
    </el-form>
    <el-dialog  :visible.sync="richEditor.dialogVisible"  append-to-body :close-on-click-modal="false" style="width: 100%;height: 100%"   :show-close="false" center>
      <Ueditor @ready="editorReady"/>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editorConfirm">确 定</el-button>
        <el-button @click="richEditor.dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="questionShow.dialog" style="width: 100%;height: 100%">
      <QuestionShow :qType="questionShow.qType" :question="questionShow.question" :qLoading="questionShow.loading"/>
    </el-dialog>
  </div>
</template>

<script>
import QuestionShow from '../components/Show'
import Ueditor from '@/components/Ueditor'
import { mapGetters, mapState, mapActions } from 'vuex'
import questionApi from '@/api/question'
import knowledgeApi from '@/api/knowledge'
import subjectApi from '@/api/subject'
// import the component
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  components: {
    Ueditor, QuestionShow, Treeselect
  },
  data () {
    return {
      levelEnum: JSON.parse(localStorage.getItem('levelEnum')),
      form: {
        id: null,
        questionType: 2,
        gradeLevel: null,
        subjectId: null,
        title: '',
        items: [
          { id: null, prefix: 'A', content: '' },
          { id: null, prefix: 'B', content: '' },
          { id: null, prefix: 'C', content: '' },
          { id: null, prefix: 'D', content: '' }
        ],
        analyze: '',
        correct: '',
        correctArray: [],
        score: '',
        difficult: 0,
        value: []
      },
      subjectFilter: null,
      formLoading: false,
      rules: {
        gradeLevel: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ],
        subjectId: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入题干', trigger: 'blur' }
        ],
        analyze: [
          { required: true, message: '请输入解析', trigger: 'blur' }
        ],
        score: [
          { required: true, message: '请输入分数', trigger: 'blur' }
        ],
        correctArray: [
          { required: true, message: '请选择正确答案', trigger: 'change' }
        ]
      },
      richEditor: {
        dialogVisible: false,
        object: null,
        parameterName: '',
        instance: null
      },
      questionShow: {
        qType: 0,
        dialog: false,
        question: null,
        loading: false
      },
      subjectList: [],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'knowledgeName'
      },
      treeArr: [],
      knowledgeList: [],
      itemList: [],
      editIndex: 1
    }
  },
  created () {
    let id = this.$route.query.id
    let _this = this
    // this.initSubject(function () {
    //   _this.subjectFilter = _this.subjects
    // })
    if (id && parseInt(id) !== 0) {
      _this.formLoading = true
      questionApi.queryQuestionDetail({ questionId: id }).then(re => {
        const { gradeId, subjectId, questionTitle, questionItemList, questionAnswerList = [], parsing, level, fraction, knowledgeList } = re.data
        this.levelChange(gradeId)
        this.form.questionType = 2
        this.form.gradeLevel = gradeId
        this.changeSubject(subjectId)
        this.form.subjectId = Number(subjectId)
        this.form.title = questionTitle
        questionItemList.forEach(list => {
          list.prefix = list.questionItemContent
          list.content = list.questionItemName
        })
        if (questionItemList.length > 0) {
          this.form.items = questionItemList
        }
        this.form.analyze = parsing
        if (questionAnswerList.length > 0) {
          let answer = questionAnswerList[0].questionAnswer
          this.form.correctArray = answer.split(',')
          this.form.score = questionAnswerList[0].fraction
        }
        this.form.difficult = level
        knowledgeList.forEach(item => {
          this.form.value.push(item.knowledgeId)
        })
        _this.formLoading = false
      })
    }
  },
  methods: {
    changeSubject (subjectId) {
      knowledgeApi.queryKnowledgeTree({ subjectId, gradeId: this.form.gradeLevel }).then(data => {
        if (data.resultCode === 10000) {
          this.treeData = this.changeData(data.data)
          this.getArr(data.data)
          this.showTree = true
          if (this.editIndex !== 1) {
            this.form.value = []
          }
          this.editIndex++
        } else {
          this.$message.success('请求失败')
        }
      })
    },
    normalizer (node) {
      // 去掉children=null的属性
      if (node.children == null || node.children === 'null') {
        delete node.children
      }
    },
    changeData (data) {
      data.forEach(item => {
        item.id = item.knowledgeId
        item.label = item.knowledgeName
        if (item.children && item.children.length > 0) {
          this.changeData(item.children)
        }
      })
      return data
    },
    getArr (treeData) {
      treeData.forEach(tree => {
        let { gradeId, gradeName, knowledgeDesc, knowledgeId, knowledgeName, pid, pknowledgeName, subjectId, subjectName } = tree
        this.treeArr.push({ gradeId, gradeName, knowledgeDesc, knowledgeId, knowledgeName, pid, pknowledgeName, subjectId, subjectName })
        if (tree.children && tree.children.length > 0) {
          this.getArr(tree.children)
        }
      })
    },
    editorReady (instance) {
      this.richEditor.instance = instance
      let currentContent = this.richEditor.object[this.richEditor.parameterName]
      this.richEditor.instance.setContent(currentContent)
      // 光标定位到Ueditor
      this.richEditor.instance.focus(true)
    },
    inputClick (object, parameterName) {
      this.richEditor.object = object
      this.richEditor.parameterName = parameterName
      this.richEditor.dialogVisible = true
    },
    editorConfirm () {
      let content = this.richEditor.instance.getContent()
      this.richEditor.object[this.richEditor.parameterName] = content
      this.richEditor.dialogVisible = false
    },
    questionItemRemove (index) {
      this.form.items.splice(index, 1)
    },
    questionItemAdd () {
      let items = this.form.items
      let newLastPrefix
      if (items.length > 0) {
        let last = items[items.length - 1]
        newLastPrefix = String.fromCharCode(last.prefix.charCodeAt() + 1)
      } else {
        newLastPrefix = 'A'
      }
      items.push({ id: null, prefix: newLastPrefix, content: '' })
    },
    submitForm () {
      let _this = this
      let id = this.$route.query.id
      this.treeArr.forEach(tree => {
        this.form.value.forEach(val => {
          if (tree.knowledgeId === val) {
            this.knowledgeList.push({ knowledgeDesc: tree.knowledgeDesc, knowledgeId: tree.knowledgeId, knowledgeName: tree.knowledgeName })
          }
        })
      })
      this.form.items.forEach(item => {
        this.itemList.push({
          questionItemContent: item.prefix,
          questionItemName: item.content
        })
      })
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoading = true
          const params = {
            gradeId: this.form.gradeLevel,
            level: this.form.difficult,
            parsing: this.form.analyze,
            questionAnswerList: [{ questionAnswer: this.form.correctArray.join(','), fraction: this.form.score }],
            // questionAnswer: ,
            questionId: '',
            questionItemList: this.itemList,
            questionTitle: this.form.title,
            questionType: 2,
            subjectId: this.form.subjectId,
            type: 3,
            knowledgeIdList: this.form.value
          }
          if (id) {
            params.questionId = id
            questionApi.modifyQuestion(params).then(re => {
              if (re.resultCode === 10000) {
                _this.$message.success(re.resultMsg)
                _this.delCurrentView(_this).then(() => {
                  _this.$router.push('/list')
                  this.resetForm()
                })
              } else {
                _this.$message.error(re.resultMsg)
                this.formLoading = false
              }
            }).catch(e => {
              this.formLoading = false
            })
          } else {
            questionApi.addQuestion(params).then(re => {
              if (re.resultCode === 10000) {
                _this.$message.success(re.resultMsg)
                _this.delCurrentView(_this).then(() => {
                  _this.$router.push('/list')
                  this.resetForm()
                })
              } else {
                _this.$message.error(re.resultMsg)
                this.formLoading = false
              }
            }).catch(e => {
              this.formLoading = false
            })
          }
        } else {
          return false
        }
      })
    },
    levelChange (gradeId) {
      this.form.subjectId = null
      subjectApi.pageList({ gradeId, isPage: 2 }).then(data => {
        if (data.resultCode === 10000) {
          this.subjectList = data.data.list
        } else {
          this.$message.error('请求失败')
        }
      })
    },
    showQuestion () {
      this.questionShow.dialog = true
      this.questionShow.qType = this.form.questionType
      this.questionShow.question = this.form
    },
    resetForm () {
      let lastId = this.form.id
      this.$refs['form'].resetFields()
      this.form = {
        id: null,
        questionType: 2,
        gradeLevel: null,
        subjectId: null,
        title: '',
        items: [
          { id: null, prefix: 'A', content: '' },
          { id: null, prefix: 'B', content: '' },
          { id: null, prefix: 'C', content: '' },
          { id: null, prefix: 'D', content: '' }
        ],
        analyze: '',
        correct: '',
        correctArray: [],
        score: '',
        difficult: 0,
        value: []
      }
      this.form.id = lastId
    },
    ...mapActions('exam', { initSubject: 'initSubject' }),
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      questionTypeEnum: state => state.exam.question.typeEnum
    }),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
