import { post } from '@/utils/request'

export default {
  queryKnowledgeList: query => post(`/teacher/knowledge/queryKnowledgeList`, query),
  queryKnowledgeTree: query => post(`/teacher/knowledge/queryKnowledgeTree`, query),
  addKnowledge: query => post(`/teacher/knowledge/addKnowledge`, query),
  delKnowledge: query => post(`/teacher/knowledge/delKnowledge`, query)
}
