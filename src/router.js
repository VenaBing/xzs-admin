import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'

Vue.use(Router)

const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    hidden: true,
    component: () => import('@/views/login/index'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '主页', icon: 'home', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    name: 'UserPage',
    meta: {
      title: '用户管理',
      icon: 'users',
      accountType: [1, 2]
    },
    children: [
      {
        path: 'student/list',
        component: () => import('@/views/user/student/list'),
        name: 'UserStudentPageList',
        meta: { title: '学生管理', noCache: true, accountType: [1, 2] }
      },
      {
        path: 'student/edit',
        component: () => import('@/views/user/student/edit'),
        name: 'UserStudentEdit',
        meta: { title: '学生创编', noCache: true, activeMenu: '/user/student/list' },
        hidden: true
      },
      {
        path: 'teacher/list',
        component: () => import('@/views/user/teacher/list'),
        name: 'UserTeacherPageList',
        meta: { title: '教师管理', noCache: true, accountType: [1] }
      },
      {
        path: 'teacher/edit',
        component: () => import('@/views/user/teacher/edit'),
        name: 'UserTeacherEdit',
        meta: { title: '教师创编', noCache: true, activeMenu: '/user/teacher/list' },
        hidden: true
      }
      // {
      //   path: 'admin/list',
      //   component: () => import('@/views/user/admin/list'),
      //   name: 'UserAdminPageList',
      //   meta: { title: '管理员列表', noCache: true }
      // },
      // {
      //   path: 'admin/edit',
      //   component: () => import('@/views/user/admin/edit'),
      //   name: 'UserAdminEdit',
      //   meta: { title: '管理员创编', noCache: true, activeMenu: '/user/admin/list' },
      //   hidden: true
      // }
    ]
  },
  {
    path: '/education',
    component: Layout,
    name: 'EducationPage',
    meta: {
      title: '学科管理',
      icon: 'education'
    },
    alwaysShow: true,
    children: [
      {
        path: 'add/index',
        component: () => import('@/views/education/add/index'),
        name: 'EducationSubjectEditPage',
        meta: { title: '学科创编', noCache: true }
      },
      {
        path: 'subject/list',
        component: () => import('@/views/education/subject/list'),
        name: 'EducationSubjectPage',
        meta: { title: '学科列表', noCache: true }
      }
    ]
  },
  {
    path: '/knowledge',
    component: Layout,
    name: 'Knowledge',
    meta: {
      title: '知识点管理',
      icon: 'star'
    },
    alwaysShow: true,
    children: [
      {
        path: 'list/index',
        component: () => import('@/views/knowledge/edit/index'),
        name: 'KnowledgeSubjectEditPage',
        meta: { title: '知识点创编', noCache: true }
      },
      {
        path: 'edit/list',
        component: () => import('@/views/knowledge/list/index'),
        name: 'KnowledgeSubjectPage',
        meta: { title: '知识点列表', noCache: true }
      }
    ]
  },
  {
    path: '/exam',
    component: Layout,
    name: 'ExamPage',
    meta: {
      title: '卷题管理',
      icon: 'exam'
    },
    children: [
      {
        path: 'paper/list',
        component: () => import('@/views/exam/paper/list'),
        name: 'ExamPaperPageList',
        meta: { title: '试卷列表', noCache: true }
      },
      {
        path: 'paper/edit',
        component: () => import('@/views/exam/paper/edit'),
        name: 'ExamPaperEdit',
        meta: { title: '试卷创编', noCache: true, activeMenu: '/exam/paper/list' }
      }
    ]
  },
  {
    path: '/question',
    component: Layout,
    name: 'QuestionPage',
    meta: {
      title: '题库管理',
      icon: 'question'
    },
    alwaysShow: true,
    children: [
      {
        path: '/list',
        component: () => import('@/views/question/list'),
        name: 'ExamQuestionPageList',
        meta: { title: '题目列表', noCache: true }
      },
      {
        path: 'edit/singleChoice',
        component: () => import('@/views/question/edit/single-choice'),
        name: 'singleChoicePage',
        meta: { title: '单选题编辑', noCache: true, activeMenu: '/question/list' }
      },
      {
        path: 'edit/multipleChoice',
        component: () => import('@/views/question/edit/multiple-choice'),
        name: 'multipleChoicePage',
        meta: { title: '多选题编辑', noCache: true, activeMenu: '/question/list' }
      },
      {
        path: 'edit/trueFalse',
        component: () => import('@/views/question/edit/true-false'),
        name: 'trueFalsePage',
        meta: { title: '判断题编辑', noCache: true, activeMenu: '/question/list' }
      },
      {
        path: 'edit/gapFilling',
        component: () => import('@/views/question/edit/gap-filling'),
        name: 'gapFillingPage',
        meta: { title: '填空题编辑', noCache: true, activeMenu: '/question/list' }
      },
      {
        path: 'edit/shortAnswer',
        component: () => import('@/views/question/edit/short-answer'),
        name: 'shortAnswerPage',
        meta: { title: '简答题编辑', noCache: true, activeMenu: '/question/list' }
      }
    ]
  },
  {
    path: '/answerPaper',
    component: Layout,
    name: 'AnswerPaper',
    meta: {
      title: '答卷管理',
      icon: 'task'
    },
    alwaysShow: true,
    children: [
      {
        path: 'answer',
        component: () => import('@/views/answer/list'),
        name: 'AnswerListPage',
        meta: { title: '答卷列表', noCache: true }
      }
    ]
  },
  {
    path: '/answerQuestion',
    component: Layout,
    name: 'AnswerQuestion',
    meta: {
      title: '答题管理',
      icon: 'task'
    },
    alwaysShow: true,
    children: [
      {
        path: 'answerQuestion',
        component: () => import('@/views/answerQuestion/list'),
        name: 'AnswerQuestionListPage',
        meta: { title: '答题列表', noCache: true }
      }
    ]
  },
  // {
  //   path: '/task',
  //   component: Layout,
  //   name: 'TaskPage',
  //   meta: {
  //     title: '任务管理',
  //     icon: 'task'
  //   },
  //   alwaysShow: true,
  //   children: [
  //     {
  //       path: 'list',
  //       component: () => import('@/views/task/list'),
  //       name: 'TaskListPage',
  //       meta: { title: '任务列表', noCache: true }
  //     },
  //     {
  //       path: 'edit',
  //       component: () => import('@/views/task/edit'),
  //       name: 'TaskEditPage',
  //       meta: { title: '任务创建', noCache: true }
  //     }
  //   ]
  // },
  // {
  //   path: '/answer',
  //   component: Layout,
  //   name: 'AnswerPage',
  //   meta: {
  //     title: '成绩管理',
  //     icon: 'answer'
  //   },
  //   alwaysShow: true,
  //   children: [
  //     {
  //       path: 'list',
  //       component: () => import('@/views/answer/list'),
  //       name: 'AnswerPageList',
  //       meta: { title: '答卷列表', noCache: true }
  //     }
  //   ]
  // },
  // {
  //   path: '/message',
  //   component: Layout,
  //   name: 'MessagePage',
  //   meta: {
  //     title: '消息中心',
  //     icon: 'message'
  //   },
  //   alwaysShow: true,
  //   children: [
  //     {
  //       path: 'list',
  //       component: () => import('@/views/message/list'),
  //       name: 'MessageListPage',
  //       meta: { title: '消息列表', noCache: true }
  //     },
  //     {
  //       path: 'send',
  //       component: () => import('@/views/message/send'),
  //       name: 'MessageSendPage',
  //       meta: { title: '消息发送', noCache: true }
  //     }
  //   ]
  // },
  // {
  //   path: '/log',
  //   component: Layout,
  //   name: 'LogPage',
  //   meta: {
  //     title: '日志中心',
  //     icon: 'log'
  //   },
  //   alwaysShow: true,
  //   children: [
  //     {
  //       path: 'user/list',
  //       component: () => import('@/views/log/list'),
  //       name: 'LogUserPage',
  //       meta: { title: '用户日志', noCache: true }
  //     }
  //   ]
  // },
  {
    path: '/profile',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人简介', icon: 'user', noCache: true }
      }
    ]
  },
  { path: '*',
    hidden: true,
    component: () => import('@/views/error-page/404'),
    meta: { title: '404', noCache: true }
  }
]

const router = new Router({
  routes: constantRoutes
})

export {
  constantRoutes,
  router
}
