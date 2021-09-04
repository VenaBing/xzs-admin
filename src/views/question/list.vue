<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="题目ID：">
        <el-input v-model="queryParam.questionId" clearable></el-input>
      </el-form-item>
      <el-form-item label="年级：">
        <el-select v-model="queryParam.gradeId" placeholder="年级"  @change="levelChange" clearable>
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学科：">
        <el-select v-model="queryParam.subjectId" clearable>
          <el-option v-for="item in subjectList" :key="item.subjectId" :value="item.subjectId" :label="item.subjectName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="题型：">
        <el-select v-model="queryParam.questionType" clearable>
          <el-option v-for="item in questionType" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <!-- <el-popover placement="bottom" trigger="click">
          <el-button type="success" size="mini">模版下载</el-button>
          <el-button type="success" size="mini">模版导入</el-button>
          <el-button slot="reference" type="primary" class="link-left">添加</el-button>
          <el-button slot="reference" type="primary" class="link-left">导入</el-button>
        </el-popover> -->
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="questionId" label="Id" width="90px"/>
      <el-table-column prop="subjectName" label="学科" width="120px"/>
      <el-table-column prop="questionType" label="题型" :formatter="questionTypeFormatter" width="70px"/>
      <el-table-column prop="questionTitle" label="题干" show-overflow-tooltip/>
      <el-table-column prop="fraction" label="分数" width="60px"/>
      <el-table-column prop="level" label="难度" width="60px"/>
      <el-table-column prop="createTime" label="创建时间" width="160px"/>
      <el-table-column label="操作" align="center" width="220px">
        <template slot-scope="{row}">
          <el-button size="mini"   @click="showQuestion(row)">预览</el-button>
          <el-button size="mini"  @click="editQuestion(row)">编辑</el-button>
          <el-button size="mini"  type="danger" @click="deleteQuestion(row)" class="link-left">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParam.pageNum" :limit.sync="queryParam.pageSize"
                @pagination="search"/>
    <el-dialog :visible.sync="questionShow.dialog" style="width: 100%;height: 100%">
      <QuestionShow :qType="questionShow.qType" :question="questionShow.question" :qLoading="questionShow.loading"/>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import QuestionShow from './components/Show'
import questionApi from '@/api/question'
import subjectApi from '@/api/subject'

export default {
  components: { Pagination, QuestionShow },
  data () {
    return {
      queryParam: {
        questionId: null,
        questionType: null,
        gradeId: null,
        subjectId: null,
        pageNum: 1,
        pageSize: 10
      },
      subjectFilter: null,
      listLoading: true,
      tableData: [],
      total: 0,
      questionShow: {
        qType: 0,
        dialog: false,
        question: null,
        loading: false
      },
      subjectList: [],
      levelEnum: JSON.parse(localStorage.getItem('levelEnum'))
    }
  },
  created () {
    // this.initSubject()
    this.search()
    this.listLoading = false
  },
  methods: {
    submitForm () {
      this.queryParam.pageIndex = 1
      this.search()
    },
    search (e) {
      if (e) {
        this.queryParam.pageNum = e.page
      }
      this.listLoading = true
      questionApi.queryQuestionList(this.queryParam).then(data => {
        const re = data.data
        this.tableData = re.list
        this.total = re.pageTotal
        this.queryParam.pageNum = re.pageNum
        this.listLoading = false
      })
    },
    levelChange (gradeId) {
      this.queryParam.subjectId = null
      subjectApi.pageList({ gradeId, isPage: 2 }).then(data => {
        if (data.resultCode === 10000) {
          this.subjectList = data.data.list
        } else {
          this.$message.error('请求失败')
        }
      })
    },
    addQuestion () {
      this.$router.push('/exam/question/edit/singleChoice')
    },
    showQuestion (row) {
      let _this = this
      this.questionShow.dialog = true
      this.questionShow.loading = true
      const form = {
        questionType: '',
        gradeLevel: '',
        subjectId: '',
        title: '',
        items: [],
        analyze: '',
        score: '',
        value: []
      }
      questionApi.queryQuestionDetail({ questionId: row.questionId }).then(re => {
        const { questionType, gradeId, subjectId, questionTitle, questionItemList, parsing, level, fraction, knowledgeList } = re.data
        form.questionType = questionType
        form.gradeLevel = gradeId
        form.subjectId = Number(subjectId)
        form.title = questionTitle
        questionItemList.forEach(list => {
          list.prefix = list.questionItemContent
          list.content = list.questionItemName
        })
        if (questionItemList.length > 0) {
          form.items = questionItemList
        }
        form.analyze = parsing
        form.score = fraction
        form.difficult = level
        knowledgeList.forEach(item => {
          form.value.push(item.knowledgeId)
        })
        this.questionShow.qType = questionType
        _this.questionShow.question = form
        _this.questionShow.loading = false
      })
    },
    editQuestion (row) {
      let url = this.enumFormat(this.editUrlEnum, row.questionType)
      this.$router.push({ path: url, query: { id: row.questionId } })
    },
    deleteQuestion (row) {
      let _this = this
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        questionApi.delQuestion({ questionId: row.questionId }).then(re => {
          if (re.resultCode === 10000) {
            _this.search()
            _this.$message.success(re.resultMsg)
          } else {
            _this.$message.error(re.resultMsg)
          }
        })
      })
    },
    questionTypeFormatter (row, column, cellValue, index) {
      return this.enumFormat(this.questionType, cellValue)
    },
    subjectFormatter (row, column, cellValue, index) {
      return this.subjectEnumFormat(cellValue)
    },
    ...mapActions('exam', { initSubject: 'initSubject' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      questionType: state => state.exam.question.typeEnum,
      editUrlEnum: state => state.exam.question.editUrlEnum
    }),
    ...mapGetters('exam', ['subjectEnumFormat']),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
