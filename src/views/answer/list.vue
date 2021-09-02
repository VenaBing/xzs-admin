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
      <el-table-column prop="paperId" label="学级"/>
      <el-table-column prop="mobile" label="学生手机号" width="120"/>
      <el-table-column prop="subjectName" label="答卷学科"/>
      <el-table-column prop="paperName" label="答卷名称"/>
      <el-table-column prop="examDate" label="答卷时间" width="120"/>
      <!-- <el-table-column  label="得分" width="100px" >
        <template slot-scope="{row}">
          {{row.userScore}} / {{row.paperScore}}
        </template>
      </el-table-column>
      <el-table-column  label="题目对错" width="80px" >
        <template slot-scope="{row}">
          {{row.questionCorrect}} / {{row.questionCount}}
        </template>
      </el-table-column>
      <el-table-column prop="doTime" label="耗时" width="100px"/>
      <el-table-column prop="createTime" label="提交时间" width="160px"/> -->
      <el-table-column label="操作" align="center" width="120px">
        <template slot-scope="{row}">
          <el-button size="mini" @click="showQuestion(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParam.pageNum" :limit.sync="queryParam.pageSize"
                @pagination="search"/>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import examPaperAnswerApi from '@/api/examPaperAnwser'
import subjectApi from '@/api/subject'

export default {
  components: { Pagination },
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
      subjectList: []
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
