<template>
  <div class="app-container">
    <el-form :model="form" ref="form" label-width="100px" v-loading="formLoading" :rules="rules">
      <el-form-item label="年级：" prop="gradeId" required>
        <el-select v-model="form.gradeId" placeholder="年级" @change="levelChange">
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeDesc"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学科：" prop="subjectId" required>
        <el-select v-model="form.subjectId" placeholder="学科">
          <el-option v-for="item in subjectList" :key="item.subjectId" :value="item.subjectId" :label="item.subjectName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="试卷类型：" prop="paperType" required>
        <el-select v-model="form.paperType" placeholder="试卷类型">
          <el-option v-for="item in paperTypeEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="试卷名称："  prop="paperName" required>
        <el-input v-model="form.paperName"/>
      </el-form-item>
      <el-form-item :key="index" :label="'标题'+(index+1)+'：'" required v-for="(titleItem,index) in titleItems">
        <el-input v-model="titleItem.name" style="width: 80%"/>
        <el-button type="text" class="link-left" style="margin-left: 20px" size="mini" @click="addQuestion(titleItem)">
          添加题目
        </el-button>
        <el-button type="text" class="link-left" size="mini" @click="titleItems.splice(index,1)">删除</el-button>
        <el-card class="exampaper-item-box" v-if="titleItem.questionItems.length!==0">
          <el-form-item :key="questionIndex" :label="'题目'+(questionIndex+1)+'：'"
                        v-for="(questionItem,questionIndex) in titleItem.questionItems" style="margin-bottom: 15px">
            <el-row>
              <el-col :span="23">
                <QuestionShow :qType="questionItem.questionType" :question="questionItem"/>
              </el-col>
              <el-col :span="1">
                <el-button type="text" size="mini" @click="titleItem.questionItems.splice(questionIndex,1)">删除
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-card>
      </el-form-item>
      <el-form-item label="建议时长：" prop="duration" required>
        <el-input v-model="form.duration" placeholder="分钟"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="success" @click="addTitle">添加标题</el-button>
      </el-form-item>
    </el-form>
    <el-dialog :visible.sync="questionPage.showDialog"  width="70%">
      <el-form :model="questionPage.queryParam" ref="queryForm" :inline="true">
        <el-form-item label="ID：">
          <el-input v-model="questionPage.queryParam.paperId"  clearable></el-input>
        </el-form-item>
        <el-form-item label="题型：">
          <el-select v-model="questionPage.queryParam.questionType" clearable>
            <el-option v-for="item in questionTypeEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryForm">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="questionPage.listLoading" :data="questionPage.tableData"
                @selection-change="handleSelectionChange" border fit highlight-current-row style="width: 100%">
        <el-table-column type="selection" width="35"></el-table-column>
        <el-table-column prop="questionId" label="Id" width="60px"/>
        <el-table-column prop="questionType" label="题型" :formatter="questionTypeFormatter" width="70px"/>
        <el-table-column prop="questionTitle" label="题干" show-overflow-tooltip/>
      </el-table>
      <pagination v-show="questionPage.total>0" :total="questionPage.total"
                  :page.sync="questionPage.queryParam.pageNum" :limit.sync="questionPage.queryParam.pageSize"
                  @pagination="search"/>
      <span slot="footer" class="dialog-footer">
          <el-button @click="questionPage.showDialog = false">取 消</el-button>
          <el-button type="primary" @click="confirmQuestionSelect">确定</el-button>
     </span>
    </el-dialog>
  </div>
</template>

<script>

import { mapState, mapActions, mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import QuestionShow from '../question/components/Show'
import examPaperApi from '@/api/examPaper'
import questionApi from '@/api/question'
import subjectApi from '@/api/subject'

export default {
  components: { Pagination, QuestionShow },
  data () {
    return {
      form: {
        gradeId: null,
        subjectId: null,
        paperType: 1,
        limitDateTime: [],
        paperName: '',
        duration: null,
        paperTitleList: []
      },
      levelEnum: JSON.parse(localStorage.getItem('levelEnum')),
      subjectFilter: null,
      formLoading: false,
      rules: {
        gradeId: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ],
        subjectId: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ],
        paperType: [
          { required: true, message: '请选择试卷类型', trigger: 'change' }
        ],
        paperName: [
          { required: true, message: '请输入试卷名称', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请输入建议时长', trigger: 'blur' }
        ]
      },
      questionPage: {
        multipleSelection: [],
        showDialog: false,
        queryParam: {
          paperId: null,
          questionType: null,
          // subjectId: 1,
          pageNum: 1,
          pageSize: 5
        },
        listLoading: true,
        tableData: [],
        total: 0
      },
      currentTitleItem: null,
      subjectList: [],
      titleItems: [],
      paperTitleList: [],
      questionIdList: [],
      idList: []
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
      examPaperApi.queryTestPaperDetail({ paperId: id }).then(re => {
        const data = re.data
        this.levelChange(data.gradeId)
        _this.form = data
        _this.formLoading = false
        data.paperTitleList.forEach(list => {
          let itemList = []
          if (list.questionList) {
            list.questionList.forEach(re => {
              const form = {
                value: []
              }
              form.questionType = re.questionType
              form.gradeLevel = re.gradeId
              form.subjectId = Number(re.subjectId)
              form.title = re.questionTitle
              if (re.questionItemList && re.questionItemList.length > 0) {
                re.questionItemList.forEach(list => {
                  list.prefix = list.questionItemContent
                  list.content = list.questionItemName
                })
                form.items = re.questionItemList
              } else {
                form.items = []
              }
              form.analyze = re.parsing
              if (re.questionAnswerList.length > 0) {
                re.questionAnswerList.forEach(list => {
                  if (re.questionType === 2) {
                    form.correctArray = list.questionAnswer.split(',')
                  } else {
                    form.correct = list.questionAnswer
                  }
                  form.score += list.fraction
                })
              }
              form.difficult = re.level
              if (re.knowledgeList && re.knowledgeList.length > 0) {
                re.knowledgeList.forEach(item => {
                  form.value.push(item.knowledgeId)
                })
              } else {
                form.value = []
              }
              form.questionId = list.questionId
              itemList.push(form)
            })
          }
          this.titleItems.push({
            name: list.paperTitle,
            questionItems: itemList
          })
        })
      })
    }
  },
  methods: {
    submitForm () {
      let _this = this
      let id = this.$route.query.id
      console.log(this.titleItems)
      this.titleItems.forEach(item => {
        item.questionItems.forEach(id => {
          this.idList.push(id.questionId)
        })
        this.paperTitleList.push({
          paperTitle: item.name,
          questionIdList: this.idList
        })
        this.idList = []
      })
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoading = true
          this.form.paperTitleList = this.paperTitleList
          if (id) {
            this.form.paperId = id
            examPaperApi.modifyTestPaper(this.form).then(re => {
              if (re.resultCode === 10000) {
                _this.$message.success(re.resultMsg)
                _this.delCurrentView(_this).then(() => {
                  _this.$router.push('/exam/paper/list')
                })
                this.resetForm()
              } else {
                _this.$message.error(re.resultMsg)
                this.formLoading = false
              }
            }).catch(e => {
              this.formLoading = false
            })
          } else {
            examPaperApi.addTestPaper(this.form).then(re => {
              if (re.resultCode === 10000) {
                _this.$message.success(re.resultMsg)
                _this.delCurrentView(_this).then(() => {
                  this.resetForm()
                  _this.$router.push('/exam/paper/list')
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
    addTitle () {
      this.titleItems.push({
        name: '',
        questionItems: []
      })
    },
    addQuestion (titleItem) {
      this.currentTitleItem = titleItem
      this.questionPage.showDialog = true
      this.search()
    },
    removeTitleItem (titleItem) {
      this.titleItems.remove(titleItem)
    },
    removeQuestion (titleItem, questionItem) {
      titleItem.questionItems.remove(questionItem)
    },
    queryForm () {
      this.questionPage.queryParam.pageNum = 1
      this.search()
    },
    confirmQuestionSelect () {
      let _this = this
      this.questionPage.multipleSelection.forEach(q => {
        questionApi.queryQuestionDetail({ questionId: q.questionId }).then(re => {
          const form = {
            value: []
          }
          form.questionType = re.data.questionType
          form.gradeLevel = re.data.gradeId
          form.subjectId = Number(re.data.subjectId)
          form.title = re.data.questionTitle
          if (re.data.questionItemList && re.data.questionItemList.length > 0) {
            re.data.questionItemList.forEach(list => {
              list.prefix = list.questionItemContent
              list.content = list.questionItemName
            })
            form.items = re.data.questionItemList
          } else {
            form.items = []
          }
          form.analyze = re.data.parsing
          if (re.data.questionAnswerList.length > 0) {
            re.data.questionAnswerList.forEach(list => {
              if (re.data.questionType === 2) {
                form.correctArray = list.questionAnswer.split(',')
              } else {
                form.correct = list.questionAnswer
              }
              form.score += list.fraction
            })
          }
          form.difficult = re.data.level
          if (re.data.knowledgeList && re.data.knowledgeList.length > 0) {
            re.data.knowledgeList.forEach(item => {
              form.value.push(item.knowledgeId)
            })
          } else {
            form.value = []
          }
          form.questionId = q.questionId
          _this.currentTitleItem.questionItems.push(form)
        })
      })
      this.questionPage.showDialog = false
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
    search (e) {
      if (e) {
        this.questionPage.queryParam.pageNum = e.page
      }
      this.questionPage.queryParam.subjectId = this.form.subjectId
      this.questionPage.listLoading = true
      questionApi.queryQuestionList(this.questionPage.queryParam).then(data => {
        const re = data.data
        this.questionPage.tableData = re.list
        this.questionPage.total = re.pageTotal
        this.questionPage.queryParam.pageNum = re.pageNum
        this.questionPage.listLoading = false
      })
    },
    handleSelectionChange (val) {
      this.questionPage.multipleSelection = val
    },
    questionTypeFormatter (row, column, cellValue, index) {
      return this.enumFormat(this.questionTypeEnum, cellValue)
    },
    subjectFormatter (row, column, cellValue, index) {
      return this.subjectEnumFormat(cellValue)
    },
    resetForm () {
      let lastId = this.form.id
      this.$refs['form'].resetFields()
      this.form = {
        id: null,
        level: null,
        subjectId: null,
        paperType: 1,
        limitDateTime: [],
        paperName: '',
        suggestTime: null
      }
      this.titleItems = []
      this.paperTitleList = []
      this.form.id = lastId
    },
    ...mapActions('exam', { initSubject: 'initSubject' }),
    ...mapActions('tagsView', { delCurrentView: 'delCurrentView' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      questionTypeEnum: state => state.exam.question.typeEnum,
      paperTypeEnum: state => state.exam.examPaper.paperTypeEnum
    }),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>

<style lang="scss">
  .exampaper-item-box {
    .q-title {
      margin: 0px 5px 0px 5px;
    }
    .q-item-content {
    }
  }
</style>
