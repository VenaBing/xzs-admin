<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="用户名：">
        <el-input v-model="queryParam.accountNo"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <router-link :to="{path:'/user/teacher/edit'}" class="link-left">
          <el-button type="primary">添加</el-button>
        </router-link>
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="teacherId" label="Id" />
      <el-table-column prop="accountNo" label="用户名"/>
      <el-table-column prop="teacherName" label="真实姓名" />
      <el-table-column prop="gender" label="性别" width="60px;" :formatter="sexFormatter"/>
      <el-table-column prop="mobile" label="手机号"/>
      <el-table-column prop="createTime" label="创建时间" width="160px"/>
      <el-table-column label="状态" prop="status" width="70px">
        <template slot-scope="{row}">
          <el-tag :type="statusTagFormatter(row.status)">
            {{ statusFormatter(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="270px" label="操作" align="center">
        <template slot-scope="{row}">
          <el-button size="mini"  @click="changeStatus(row)" class="link-left">
            {{ statusBtnFormatter(row.status) }}
          </el-button>
          <router-link :to="{path:'/user/teacher/edit', query:{id:row.teacherId}}" class="link-left">
            <el-button size="mini" >编辑</el-button>
          </router-link>
          <!-- <router-link :to="{path:'/log/user/list', query:{userId:row.id}}" class="link-left">
            <el-button size="mini" >日志</el-button>
          </router-link> -->
          <el-button  size="mini" type="danger" @click="deleteUser(row)" class="link-left">删除</el-button>
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
import userApi from '@/api/user'

export default {
  components: { Pagination },
  data () {
    return {
      queryParam: {
        accountNo: '',
        pageNum: 1,
        pageSize: 10
      },
      listLoading: true,
      tableData: [],
      total: 0
    }
  },
  created () {
    this.search()
  },
  methods: {
    search (e) {
      this.listLoading = true
      if (e) {
        this.queryParam.pageNum = e.page
      }
      userApi.queryTeacherList(this.queryParam).then(data => {
        const re = data.data
        this.tableData = re.list
        this.total = re.pageTotal
        this.queryParam.pageNum = re.pageNum
        this.listLoading = false
      })
    },
    changeStatus (row) {
      let _this = this
      userApi.modifyTeacherInfo({ teacherId: row.teacherId, status: row.status === 1 ? 2 : 1 }).then(re => {
        if (re.resultCode === 10000) {
          // row.status = re.response
          this.search()
          _this.$message.success(re.resultMsg)
        } else {
          _this.$message.error(re.resultMsg)
        }
      })
    },
    deleteUser (row) {
      let _this = this
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userApi.delTeacherInfo({ teacherId: row.teacherId }).then(re => {
          if (re.resultCode === 1000) {
            _this.search()
            _this.$message.success(re.resultMsg)
          } else {
            _this.$message.error(re.resultMsg)
          }
        })
      })
    },
    submitForm () {
      this.queryParam.pageNum = 1
      this.search()
    },
    levelFormatter  (row, column, cellValue, index) {
      return this.enumFormat(this.levelEnum, cellValue)
    },
    sexFormatter  (row, column, cellValue, index) {
      return this.enumFormat(this.sexEnum, cellValue)
    },
    statusFormatter (status) {
      return this.enumFormat(this.statusEnum, status)
    },
    statusTagFormatter (status) {
      return this.enumFormat(this.statusTag, status)
    },
    statusBtnFormatter (status) {
      return this.enumFormat(this.statusBtn, status)
    }
  },
  computed: {
    ...mapGetters('enumItem', [
      'enumFormat'
    ]),
    ...mapState('enumItem', {
      sexEnum: state => state.user.sexEnum,
      statusEnum: state => state.user.statusEnum,
      statusTag: state => state.user.statusTag,
      statusBtn: state => state.user.statusBtn,
      levelEnum: state => state.user.levelEnum
    })
  }
}
</script>
