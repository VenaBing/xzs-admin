<template>
  <div style="line-height:1.8" class="show-box-msg">
    <div class="stu-box">
      <span><span class="box-title">学生ID：</span>{{stuMsg.stuId}}</span>
      <span><span class="box-title">学生姓名：</span>{{stuMsg.stuName}}</span>
      <span><span class="box-title">学生性别：</span>{{stuMsg.gender === 1 ? '男' : '女'}}</span>
      <span><span class="box-title">学生年级：</span>{{levelFormatter(stuMsg.gradeId)}}</span>
      <span><span class="box-title">答题时间：</span>{{stuMsg.exerciseDate}}</span>
    </div>
    <div v-if="qType==1" >
        <div class="q-title" v-html="question.questionTitle"/>
        <div class="q-content">
          <el-radio-group v-model="question.content">
            <el-radio  v-for="item in question.items"  :key="item.prefix"  :label="item.prefix" >
              <span class="question-prefix">{{item.prefix}}.</span>
              <span v-html="item.content" class="q-item-span-content"></span>
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <div v-else-if="qType==2" >
        <div class="q-title" v-html="question.questionTitle"/>
        <div class="q-content">
          <el-checkbox-group v-model="question.contentArray" >
            <el-checkbox v-for="item in question.items" :label="item.prefix" :key="item.prefix" >
              <span class="question-prefix">{{item.prefix}}.</span>
              <span v-html="item.content"  class="q-item-span-content"></span>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div v-else-if="qType==3" >
        <div class="q-title" v-html="question.questionTitle" style="display: inline;margin-right: 10px"/>
        <span style="padding-right: 10px;">(</span>
        <el-radio-group v-model="question.content">
          <el-radio  v-for="item in question.items"  :key="item.prefix"  :label="item.prefix">
            <span v-html="item.content" class="q-item-span-content"></span>
          </el-radio>
        </el-radio-group>
        <span style="padding-left: 10px;">)</span>
      </div>
      <div v-else-if="qType==4" >
        <div class="q-title" v-html="question.questionTitle"/>
        <div v-if="question.contentArray!==null">
          <el-form-item :label="item.prefix" :key="item.prefix"  v-for="item in question.items"  label-width="50px" style="margin-top: 10px;margin-bottom: 10px;">
            <el-input v-model="question.contentArray[item.prefix-1]"  />
          </el-form-item>
        </div>
      </div>
      <div v-else-if="qType==5">
        <div class="q-title" v-html="question.questionTitle"/>
        <div>
          <el-input  v-model="question.content" type="textarea" rows="5" ></el-input>
        </div>
      </div>
    <div v-else>
    </div>
    <div class="question-result-box">
      <div><span>结果：</span>
        <el-tag type="success">
          {{ '正确' }}
        </el-tag>
      </div>
      <div><span>分数：</span>{{question.fraction}}</div>
      <div><span>难度：</span><el-rate v-model="question.level" class="question-item-rate"></el-rate></div>
    </div>
  </div>

</template>

<script>
export default {
  name: 'QuestionShow',
  props: {
    question: {
      type: Object,
      default: function () {
        return {}
      }
    },
    qLoading: {
      type: Boolean,
      default: false
    },
    qType: {
      type: Number,
      default: 0
    },
    stuMsg: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      questionDetail: null
    }
  },
  watch: {
  },
  mounted () {
    if (this.question) {
      this.questionDetail = this.question.questionInfo
    }
  },
  methods: {
    levelFormatter  (cellValue) {
      const levelList = JSON.parse(localStorage.getItem('levelEnum'))
      for (let item of levelList) {
        if (item.gradeId === cellValue) {
          return item.gradeDesc
        }
      }
      return null
    }
  }
}
</script>
<style lang="scss" scoped>
  .show-box-msg{
    .q-title{
      margin: 0;
    }
  }
  .stu-box{
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    .box-title{
      font-weight: bold;
    }
  }
</style>
