import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    // Vue 学习
    {
      path: '/vue/tutorial',
      name: 'vue-tutorial',
      component: () => import('../views/vue/Tutorial.vue')
    },
    {
      path: '/vue/demo',
      name: 'vue-demo',
      component: () => import('../views/vue/Demo.vue')
    },
    // TS 学习
    {
      path: '/ts/tutorial',
      name: 'ts-tutorial',
      component: () => import('../views/ts/Tutorial.vue')
    },
    {
      path: '/ts/demo',
      name: 'ts-demo',
      component: () => import('../views/ts/Demo.vue')
    }
  ]
})

export default router
