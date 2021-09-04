<template>
  <div style="line-height:1.8">
    <div v-if="qType==1 || qType==3" v-loading="qLoading">
      <div class="q-title-box">
        <span>{{qIndex + 1}}.</span>
        <span class="q-title" v-html="question.questionTitle"/>
      </div>
      <div class="q-content">
        <el-radio-group :disabled='disabled' v-model="answer.content" >
          <el-radio :class="{'question--error': disabled}" v-for="item in question.questionItemList"  :key="item.questionItemId"  :label="item.questionItemName" >
            <span class="question-prefix">{{item.questionItemContent}}.</span>
            <span v-html="item.questionItemName" class="q-item-span-content"></span>
          </el-radio>
        </el-radio-group>
      </div>
    </div>
    <div v-else-if="qType==2" v-loading="qLoading">
      <div class="q-title-box">
        <span>{{qIndex + 1}}.</span>
        <span class="q-title" v-html="question.questionTitle"/>
      </div>
      <div class="q-content">
        <el-checkbox-group :disabled='disabled' v-model="answer.content" >
          <el-checkbox :class="{'question--error': disabled}" v-for="item in question.questionItemList" :label="item.questionItemName" :key="item.questionItemId"  >
            <span class="question-prefix">{{item.questionItemContent}}.</span>
            <span v-html="item.questionItemName" class="q-item-span-content"></span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div v-else-if="qType==4" v-loading="qLoading">
      <div class="q-title-box">
        <span>{{qIndex + 1}}.</span>
        <span ref="questionType4" class="q-title" v-html="question.questionTitle"/>
      </div>
    </div>
    <div v-else-if="qType==5" v-loading="qLoading">
      <div class="q-title-box">
        <span>{{qIndex + 1}}.</span>
        <span class="q-title" v-html="question.questionTitle"/>
      </div>
      <div>
        <!-- <Ueditor :disabled='disabled' v-model="answer.content"/> -->
        <div class="q-answer" v-html="answer.content"/>
      </div>
    </div>
    <el-dialog
      :visible="showDialog"
      :show-close='false'
      :close-on-press-escape='false'
      :close-on-click-modal='false'
    >
      <Ueditor v-if="showDialog" v-model="dangerousHTML" height='200px' />
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button @click="confirm" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
// import Ueditor from '../../../components/Ueditor'
import Ueditor from '@/components/Ueditor'

export default {
  components: { Ueditor },
  name: 'QuestionShow',
  props: {
    question: {
      type: Object,
      required: true
    },
    answer: {
      type: Object,
      default: function () {
        return { id: null, content: '', contentArray: [] }
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
    qIndex: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      listNode: [],
      activeI: -1,
      dangerousHTML: ''
    }
  },
  computed: {
    showDialog () {
      return this.activeI > -1
    }
  },
  mounted () {
    console.log(this.answer)
    if (this.qType === 4) {
      // 填空题
      const listNodes = Array.from(this.$refs.questionType4.children)
      this.listNode = listNodes.filter(node => {
        const classNames = node.getAttribute('class')
        return classNames.indexOf('gapfilling-span') > -1
      })
      this.listNode.forEach((item, i) => {
        item.innerHTML = this.answer.content[i]
        if (!this.disabled) {
          item.addEventListener('click', () => this.insetHTML(item, i))
        }
      })
    }
  },
  methods: {
    insetHTML (node, i) {
      this.activeI = i
      this.dangerousHTML = node.innerHTML
    },
    confirm () {
      this.listNode[this.activeI].innerHTML = this.dangerousHTML
      this.$set(this.answer.content, this.activeI, this.dangerousHTML)
      this.activeI = -1
      this.dangerousHTML = ''
    },
    cancel () {
      this.activeI = -1
      this.dangerousHTML = ''
    }
  },
  watch: {
    'answer.content': {
      handler (newValue, oldval) {
        if (newValue && newValue.length) {
          this.answer.completed = true
        }
      },
      deep: true
    }
  }
}
</script>
<style lang="scss" scoped>
  .q-title-box{
    font-weight: bold;
    font-size: 18px;
  }
  .q-answer{
    width: 100%;
    max-height: 300px;
    overflow: auto;
    img,p{
      width: 100%;
    }
  }
</style>
