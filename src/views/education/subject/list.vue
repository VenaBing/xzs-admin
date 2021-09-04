<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="年级：">
        <el-select v-model="queryParam.gradeId" placeholder="年级" clearable="">
          <el-option v-for="item in levelEnum" :key="item.gradeId" :value="item.gradeId" :label="item.gradeName"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="subjectId" label="Id" />
      <el-table-column prop="subjectName" label="学科"/>
      <el-table-column prop="gradeName" label="年级" />
      <el-table-column width="220px" label="操作" align="center">
        <template slot-scope="{row}">
          <router-link :to="{path:'/education/add/index', query:{gradeId:row.gradeId, subjectId:row.subjectId, subjectName:row.subjectName}}" class="link-left">
            <el-button size="mini">编辑</el-button>
          </router-link>
          <el-button   size="mini" type="danger" @click="delSubject(row)" class="link-left">删除</el-button>
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
import subjectApi from '@/api/subject'

export default {
  components: { Pagination },
  data () {
    return {
      queryParam: {
        gradeId: null,
        pageNum: 1,
        pageSize: 10,
        isPage: 1
      },
      listLoading: true,
      tableData: [],
      total: 0,
      levelEnum: JSON.parse(localStorage.getItem('levelEnum'))
    }
  },
  created () {
    this.search()
  },
  methods: {
    search () {
      this.listLoading = true
      subjectApi.pageList(this.queryParam).then(data => {
        const gradeList = JSON.parse(localStorage.getItem('levelEnum'))
        const re = data.data.list
        re.forEach(list => {
          gradeList.forEach((item) => {
            if (item.gradeId === list.gradeId) {
              list.gradeName = item.gradeName
            }
          })
        })
        this.tableData = re
        this.total = data.data.pageTotal || 0
        this.queryParam.pageNum = data.data.pageNum
        this.listLoading = false
      })
    },
    submitForm () {
      this.queryParam.pageNum = 1
      this.search()
    },
    delSubject (row) {
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let _this = this
        subjectApi.delSubject({ subjectId: row.subjectId }).then(re => {
          if (re.resultCode === 10000) {
            _this.search()
            _this.$message.success(re.resultMsg)
          } else {
            _this.$message.error(re.resultMsg)
          }
        })
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
