<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="试卷ID：">
        <el-input v-model="queryParam.paperId" clearable></el-input>
      </el-form-item>
      <el-form-item label="年级：">
        <el-select v-model="queryParam.gradeId" placeholder="年级" @change="levelChange" clearable>
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeDesc"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学科：" >
        <el-select v-model="queryParam.subjectId"  clearable>
          <el-option v-for="item in subjectList" :key="item.subjectId" :value="item.subjectId" :label="item.subjectName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <!-- <router-link :to="{path:'/exam/paper/edit'}" class="link-left">
          <el-button type="primary">添加</el-button>
        </router-link> -->
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="paperId" label="Id" width="90px"/>
      <el-table-column prop="subjectName" label="学科" width="120px" />
      <el-table-column prop="paperName" label="名称"  />
      <el-table-column prop="createTime" label="创建时间" width="160px"/>
      <el-table-column  label="操作" align="center"  width="160px">
        <template slot-scope="{row}">
          <el-button size="mini" @click="$router.push({path:'/exam/paper/edit',query:{id:row.paperId}})" >编辑</el-button>
          <el-button size="mini" type="danger"  @click="deletePaper(row)" class="link-left">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParam.pageIndex" :limit.sync="queryParam.pageSize"
                @pagination="search"/>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import examPaperApi from '@/api/examPaper'
import subjectApi from '@/api/subject'

export default {
  components: { Pagination },
  data () {
    return {
      queryParam: {
        paperId: null,
        gradeId: null,
        subjectId: null,
        pageNum: 1,
        pageSize: 10
      },
      subjectFilter: null,
      levelEnum: JSON.parse(localStorage.getItem('levelEnum')),
      listLoading: true,
      tableData: [],
      subjectList: [],
      total: 0
    }
  },
  created () {
    // this.initSubject()
    this.search()
  },
  methods: {
    submitForm () {
      this.queryParam.pageNum = 1
      this.search()
    },
    search (e) {
      if (e) {
        this.queryParam.pageNum = e.page
      }
      this.listLoading = true
      examPaperApi.queryTestPaperList(this.queryParam).then(data => {
        const re = data.data
        this.tableData = re.list
        this.total = re.pageTotal
        this.queryParam.pageNum = re.pageNum
        this.listLoading = false
      })
    },
    deletePaper (row) {
      let _this = this
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        examPaperApi.delTestPaper({ paperId: row.paperId }).then(re => {
          if (re.resultCode === 10000) {
            _this.search()
            _this.$message.success(re.resultMsg)
          } else {
            _this.$message.error(re.resultMsg)
          }
        })
      })
    },
    levelChange (gradeId) {
      this.queryParam.subjectId = null
      subjectApi.pageList({ gradeId, isPage: 2 }).then(data => {
        if (data.resultCode === 10000) {
          this.subjectList = data.data.list
        } else {
          this.$message.error(data.resultMsg)
        }
      })
    },
    subjectFormatter  (row, column, cellValue, index) {
      return this.subjectEnumFormat(cellValue)
    },
    ...mapActions('exam', { initSubject: 'initSubject' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapGetters('exam', ['subjectEnumFormat']),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
