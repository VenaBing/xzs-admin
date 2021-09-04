<template>
  <div style="line-height:1.8">
    <div class="stu-box" v-if="showMsg">
      <span><span class="box-title">学生姓名：</span>{{stuMsg.stuName}}</span>
      <span><span class="box-title">学生性别：</span>{{stuMsg.gender === 1 ? '男' : '女'}}</span>
      <span><span class="box-title">学生年级：</span>{{stuMsg.gradeName}}</span>
      <span><span class="box-title">答题时间：</span>{{stuMsg.exerciseDate}}</span>
    </div>
    <div v-if="qType==1||qType==2||qType==3||qType==4||qType==5">
      <div class="question--origin">
        <QuestionEdit
          disabled
          :qIndex="0"
          :qType="question.questionType"
          :question="question"
          :answer="question.answer"/>
      </div>
      <div class="question-answer-show-item" style="margin-top: 15px">
        <span class="question-show-item">结果：</span>
        <el-tag type="danger">错误</el-tag>
      </div>
      <div class="question-answer-show-item">
        <span class="question-show-item">分数：</span>
        <span>{{score || 0}}</span>
      </div>
      <div class="question-answer-show-item">
        <span class="question-show-item">难度：</span>
        <el-rate disabled v-model="question.level" class="question-show-item"></el-rate>
      </div>
      <br/>
      <div v-if="!showMsg" class="question-answer-show-item" style="line-height: 1.8">
        <span class="question-show-item">解析：</span>
        <span v-html="question.parsing" class="q-item-span-content" />
      </div>
      <div  v-if="!showMsg" class="question-answer-show-item">
        <span class="question-show-item">正确答案：{{question.questionAnswerList&&question.questionAnswerList.map(v => v.questionAnswer).join(', ')}}</span>
      </div>
    </div>
    <div v-else>
    </div>
  </div>

</template>

<script>
import QuestionEdit from './QuestionEdit'

export default {
  name: 'QuestionShow',
  components: { QuestionEdit },
  props: {
    question: {
      type: Object,
      default: function () {
        return {}
      }
    },
    stuMsg: {
      type: Object,
      default: function () {
        return {}
      }
    },
    qType: {
      type: Number,
      default: 0
    },
    showMsg: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    console.log(this.showMsg, '=====74')
    if (this.question && this.question.exerciseAnswerList) {
      if (this.question.questionType !== 4) {

      }
    }
  },
  computed: {
    score () {
      return !(this.question && this.question.exerciseAnswerList && this.question.exerciseAnswerList.length) ? 0
        : this.type !== 4 ? this.question.fraction
          : this.question.exerciseAnswerList.reduce((total, v) => total + (v.isCorrect === 1 ? v.fraction : 0), 0)
    }
  }
}
</script>
<style lang="scss" scoped>
  .q-title-box{
    font-weight: bold;
    font-size: 18px;
  }
  .question-answer-show-item{
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    &:last-child{
      margin: 0;
    }
  }
  .stu-box{
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    .box-title{
      font-weight: bold;
    }
  }
</style>
