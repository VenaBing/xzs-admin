<template>
  <div>
    <div class="paper-box" v-if="showPaper">
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
      <el-form-item label="学生姓名：" >
        <el-input v-model="queryParam.stuName" placeholder="请输入学生姓名" clearable></el-input>
      </el-form-item>
      <el-form-item label="答卷名称：" >
        <el-input v-model="queryParam.paperName" placeholder="请输入答卷名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="examId" label="答卷ID" width="80" />
      <el-table-column prop="stuName" label="学生姓名"/>
      <el-table-column prop="gender" label="性别" width="60" :formatter="sexFormatter"/>
      <el-table-column prop="gradeName" label="学级"/>
      <el-table-column prop="mobile" label="学生手机号" width="120"/>
      <el-table-column prop="subjectName" label="答卷学科"/>
      <el-table-column prop="paperName" label="答卷名称"/>
      <el-table-column prop="examDate" label="答卷时间" width="120"/>
      <el-table-column label="操作" align="center" width="120px">
        <template slot-scope="{row}">
          <el-button size="mini" @click="showQuestion(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParam.pageNum" :limit.sync="queryParam.pageSize"
                @pagination="search"/>
    </div>
    <div v-else class="answer-box">
      <el-button type="primary" @click="showPaper = true">返回</el-button>
      <div class="stu-box">
        <div class="title">学生信息</div>
        <div class="stu-msg-box">
          <span><span class="box-title">试卷名称：</span>{{stuMsg.paperName}}</span>
          <span><span class="box-title">学生姓名：</span>{{stuMsg.stuName}}</span>
          <span><span class="box-title">答卷学科：</span>{{stuMsg.subjectName}}</span>
          <span><span class="box-title">学生年级：</span>{{stuMsg.gradeName}}</span>
          <span><span class="box-title">答题时间：</span>{{stuMsg.examDate}}</span>
        </div>
      </div>
      <div class="answer-list-box">
        <div class="title">答卷信息</div>
        <div class="answer-list" v-for="(item, index) in questionList" :key="index">
          <QuestionShow :showMsg="false" :question="item" :qType="item.questionType" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import examPaperAnswerApi from '@/api/examPaperAnwser'
import subjectApi from '@/api/subject'
import QuestionShow from '../answerQuestion/component/Show.vue'

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
        pageNum: 1,
        pageSize: 10
      },
      listLoading: false,
      tableData: [],
      total: 0,
      subjectList: [],
      stuMsg: {},
      questionList: [],
      showPaper: true
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
      examPaperAnswerApi.queryExamList(this.queryParam).then(data => {
        const re = data.data
        this.tableData = re.list
        this.total = re.pageTotal
        this.queryParam.pageNum = re.pageNum
        this.listLoading = false
      })
    },
    levelChange (gradeId) {
      this.form.subjectId = null
      subjectApi.pageList({ gradeId, isPage: 2 }).then(data => {
        if (data.resultCode === 10000) {
          this.subjectList = data.data.list
        } else {
          this.$message.error(data.resultMsg)
        }
      })
    },
    showQuestion (item) {
      examPaperAnswerApi.queryExamDetail({ examId: item.examId, paperId: item.paperId }).then(data => {
        const res = data.data
        this.stuMsg = res
        this.showPaper = false
        res.paperTitleList.forEach(list => {
          list.questionList.forEach(question => {
            question.answer = { content: null }
            const type = question.questionType
            if (type === 1 || type === 3 || type === 5) {
              question.answer.content = question.examAnswerList ? question.examAnswerList[0].questionAnswer : ''
            } else if (type === 2) {
              question.answer.content = question.examAnswerList[0].questionAnswer.split(',')
            } else {
              question.answer.content = question.examAnswerList.map(v => v.questionAnswer)
            }
            this.questionList.push(question)
          })
        })
      })
    },
    submitForm () {
      this.queryParam.pageNum = 1
      this.search()
    },
    sexFormatter  (row, column, cellValue, index) {
      return this.enumFormat(this.sexEnum, cellValue)
    }
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapGetters('exam', ['subjectEnumFormat']),
    ...mapState('exam', { subjects: state => state.subjects }),
    ...mapState('enumItem', {
      sexEnum: state => state.user.sexEnum
    })
  }
}
</script>
<style lang="scss" scoped>
  .answer-box{
    padding: 30px;
    .stu-box{
      margin: 20px 0 30px;
      padding: 20px;
      border: 1px  solid rgba(204, 204, 204, 1);
      box-shadow: 5px 5px 5px rgba(102, 68, 68, 0.33);
      border-radius: 8px;
      .stu-msg-box{
        display: flex;
        justify-content: space-between;
      }
      .box-title{
        font-weight: bold;
      }
    }
    .title{
      margin-bottom: 20px;
      font-size: 18px;
      font-weight: bold;
    }
    .answer-list-box{
      padding: 20px;
      border: 1px  solid rgba(204, 204, 204, 1);
      box-shadow: 5px 5px 5px rgba(102, 68, 68, 0.33);
      border-radius: 8px;
      .title{
        margin: 0;
      }
      .answer-list{
        padding: 20px 0;
        border-bottom: 1px  solid rgba(204, 204, 204, 1);
        &:first-child{
          padding-top: 0;
        }
        &:last-child{
          padding-bottom: 0;
          border: none;
        }
      }
    }
  }
</style>
