<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="年级：">
        <el-select v-model="queryParam.gradeId" placeholder="年级" clearable="">
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeDesc"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <!-- <router-link :to="{path:'/education/subject/edit'}" class="link-left">
          <el-button type="primary">添加</el-button>
        </router-link> -->
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="knowledgeName" label="学科" />
      <el-table-column prop="gradeNames" label="年级"/>
      <!-- <el-table-column prop="knowledge" label="一级知识点数" /> -->
      <el-table-column width="220px" label="操作" align="center">
        <template slot-scope="{row}">
          <router-link :to="{path:'/knowledge/list/index', query:{id:row.knowledgeId, gradeId: row.gradeId, subjectId: row.subjectId}}" class="link-left">
            <el-button size="mini">编辑</el-button>
          </router-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParam.pageNum" :limit.sync="queryParam.pageSize"
                @pagination="search"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import queryKnowledge from '@/api/knowledge'
import subjectApi from '@/api/subject'

export default {
  components: { Pagination },
  data () {
    return {
      queryParam: {
        gradeId: null,
        pageNum: 1,
        pageSize: 10
      },
      listLoading: true,
      tableData: [],
      total: 0,
      levelEnum: JSON.parse(localStorage.getItem('levelEnum'))
    }
  },
  created () {
    this.search()
    this.listLoading = false
  },
  methods: {
    search (e) {
      if (e) {
        this.queryParam.pageNum = e.page
      }
      this.listLoading = true
      queryKnowledge.queryKnowledgeList(this.queryParam).then(data => {
        const gradeList = JSON.parse(localStorage.getItem('levelEnum'))
        const re = data.data
        re.list.forEach(list => {
          gradeList.forEach((item) => {
            if (item.gradeId === list.gradeId) {
              list.gradeNames = item.gradeDesc
            }
          })
        })
        this.tableData = re.list
        this.total = re.pageTotal
        this.queryParam.pageNum = re.pageNum
        this.listLoading = false
      })
    },
    submitForm () {
      this.queryParam.pageNum = 1
      this.search()
    },
    delSubject (row) {
      let _this = this
      subjectApi.deleteSubject(row.id).then(re => {
        if (re.code === 1) {
          _this.search()
          _this.$message.success(re.message)
        } else {
          _this.$message.error(re.message)
        }
      })
    }
  },
  computed: {
    ...mapGetters('enumItem', [
      'enumFormat'
    ])
  }
}
</script>
