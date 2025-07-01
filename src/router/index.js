// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Welcome.vue')
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/main',
    name: 'MainPage',
    component: () => import('@/views/MainPage.vue')
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: () => import('@/views/UserCenter.vue')
  },
  {
    path: '/select-scenario',
    name: 'SelectScenario',
    component: () => import('@/views/SelectScenario.vue')
  },
  {
    path: '/create-questionnaire',
    name: 'CreateQuestionnaire',
    component: () => import('@/views/CreateQuestionnaire.vue')
  },
  {
    path: '/questionnaire-set',
    name: 'QuestionnaireSet',
    component: () => import('@/views/QuestionnaireSet.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router