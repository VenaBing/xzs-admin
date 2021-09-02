<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="学生年级：" >
        <el-select v-model="queryParam.gradeId" placeholder="全部" clearable  @change="levelChange">
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeDesc"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学生学科：" >
        <el-select v-model="queryParam.subjectId" placeholder="全部" clearable>
          <el-option v-for="item in subjectList" :key="item.subjectId" :value="item.subjectId" :label="item.subjectName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="题型类别：" >
        <el-select v-model="queryParam.questionType" placeholder="全部" clearable>
          <el-option v-for="item in questionTypeEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否正确：" >
        <el-select v-model="queryParam.subjectId" placeholder="全部" clearable>
          <el-option v-for="item in subjectList" :key="item.subjectId" :value="item.subjectId" :label="item.subjectName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学生姓名：" >
        <el-input v-model="queryParam.stuName" placeholder="请输入学生姓名" clearable></el-input>
      </el-form-item>
      <el-form-item label="题干名称：" >
        <el-input v-model="queryParam.paperName" placeholder="请输入题干名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="stuName" label="学生姓名"/>
      <el-table-column prop="gradeId" label="题目归属年级" :formatter="levelFormatter"/>
      <el-table-column prop="subjectName" label="题目归属学科"/>
      <el-table-column prop="questionType" label="题目类型" :formatter="questionTypeFormatter"/>
      <el-table-column label="题干名称">
        <template slot-scope="scope">
          <span v-html="scope.row.questionTitle" class="q-item-content"></span>
        </template>
      </el-table-column>
      <el-table-column prop="exerciseDate" label="答题时间"/>
      <el-table-column prop="questionAnswer" label="正确答案"/>
      <el-table-column prop="stuAnswer" label="学生答案"/>
      <el-table-column label="操作" align="center" width="80px">
        <template slot-scope="{row}">
          <el-button size="mini" @click="showQuestion(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParam.pageNum" :limit.sync="queryParam.pageSize" @pagination="search"/>
    <el-dialog :visible.sync="questionShow" class="answer-dialog-box" style="width: 100%;height: 100%">
      <QuestionShow :stuMsg="stuMs" :qType="detailMsg.questionType" :question="detailMsg" :qLoading="loading"/>
    </el-dialog>
  </div>
</template>

<script>
import QuestionShow from './component/Show'
import { mapGetters, mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import examPaperAnswerApi from '@/api/examPaperAnwser'
import subjectApi from '@/api/subject'

export default {
  components: { Pagination, QuestionShow },
  data () {
    return {
      levelEnum: JSON.parse(localStorage.getItem('levelEnum')),
      queryParam: {
        subjectId: '',
        gradeId: '',
        stuName: '',
        paperName: '',
        questionType: '',
        pageNum: 1,
        pageSize: 10
      },
      listLoading: false,
      tableData: [],
      total: 0,
      subjectList: [],
      detailMsg: {},
      stuMs: {},
      questionShow: false,
      loading: false
    }
  },
  created () {
    this.search()
  },
  methods: {
    search (e) {
      if (e) {
        this.queryParam.pageNum = e.page
      }
      this.listLoading = true
      examPaperAnswerApi.queryExerciseList(this.queryParam).then(data => {
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
          this.subjectList = data.data
        } else {
          this.$message.error(data.resultMsg)
        }
      })
    },
    showQuestion (row) {
      this.stuMs = row
      console.log(this.stuMs, '=====121')
      examPaperAnswerApi.queryExerciseDetail({ exerciseId: row.exerciseId }).then(data => {
        if (data.resultCode === 10000) {
          const re = data.data
          this.detailMsg = re.questionInfo
          // this.loading = true
          this.questionShow = true
        } else {
          this.$message.error(data.resultMsg)
        }
      })
    },
    submitForm () {
      this.queryParam.pageNum = 1
      this.search()
    },
    questionTypeFormatter (row, column, cellValue, index) {
      return this.enumFormat(this.questionType, cellValue)
    },
    levelFormatter  (row, column, cellValue, index) {
      const levelList = JSON.parse(localStorage.getItem('levelEnum'))
      for (let item of levelList) {
        if (item.gradeId === cellValue) {
          return item.gradeDesc
        }
      }
      return null
    }
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapGetters('exam', ['subjectEnumFormat']),
    ...mapState('exam', { subjects: state => state.subjects }),
    ...mapState('enumItem', {
      questionTypeEnum: state => state.exam.question.typeEnum,
      paperTypeEnum: state => state.exam.examPaper.paperTypeEnum,
      questionType: state => state.exam.question.typeEnum
    })
  }
}
</script>
<style lang="scss">
  .answer-dialog-box{
    .el-dialog{
      width: 80%;
    }
  }
</style>
