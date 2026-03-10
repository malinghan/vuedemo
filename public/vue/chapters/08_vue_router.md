# 08 · Vue Router — 单页应用路由

> 类比：Vue Router 是网站的**导航系统**。
> 用户点击链接，不刷新页面，只切换显示的组件（像切换 App 的不同页面）。

**学习目标**
- [ ] 理解 SPA 和路由的概念
- [ ] 会配置路由和嵌套路由
- [ ] 掌握路由跳转和参数传递
- [ ] 会用路由守卫做权限控制

**预计学习时长**：2 天

---

## 1. 什么是 SPA 和路由

### 类比：多页书 vs 卷轴

**传统多页应用（MPA）：**
```
点击链接 → 浏览器请求新页面 → 服务器返回完整 HTML → 页面刷新
（像翻书，每次都要翻到新的一页）
```

**单页应用（SPA）：**
```
点击链接 → JS 切换显示的组件 → 不刷新页面
（像卷轴，只是滚动到不同位置）
```

**路由的作用：**
```
URL 变化
    │
    ▼
Vue Router 匹配路由规则
    │
    ▼
渲染对应组件
    │
    ▼
浏览器历史记录更新（可前进/后退）
```

---

## 2. 安装和配置

```bash
npm install vue-router@4
```

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    component: About
  },
  {
    path: '/user/:id',  // 动态路由
    name: 'user',
    component: () => import('../views/User.vue')  // 懒加载
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .mount('#app')
```

```vue
<!-- src/App.vue -->
<template>
  <nav>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/about">关于</RouterLink>
  </nav>

  <!-- 路由出口：匹配的组件渲染在这里 -->
  <RouterView />
</template>
```

---

## 3. 路由模式

```
Hash 模式（默认）
URL: http://example.com/#/user/123
├── 兼容性好（IE9+）
├── URL 有 # 号（不美观）
└── 不需要服务器配置

History 模式（推荐）
URL: http://example.com/user/123
├── URL 美观
├── 需要服务器配置（404 fallback）
└── 兼容性稍差（IE10+）
```

```javascript
// Hash 模式
import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// History 模式
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(),
  routes
})
```

---

## 4. 路由跳转

### 4.1 声明式导航

```vue
<template>
  <!-- 基础用法 -->
  <RouterLink to="/">首页</RouterLink>
  <RouterLink to="/about">关于</RouterLink>

  <!-- 命名路由 -->
  <RouterLink :to="{ name: 'user', params: { id: 123 } }">用户</RouterLink>

  <!-- 带查询参数 -->
  <RouterLink :to="{ path: '/search', query: { q: 'vue' } }">搜索</RouterLink>

  <!-- 自定义样式 -->
  <RouterLink to="/" active-class="active" exact-active-class="exact-active">
    首页
  </RouterLink>
</template>

<style>
.active { color: #42b883; }
.exact-active { font-weight: bold; }
</style>
```

### 4.2 编程式导航

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToUser(id) {
  // 字符串路径
  router.push('/user/' + id)

  // 对象形式
  router.push({ path: '/user/' + id })

  // 命名路由 + 参数
  router.push({ name: 'user', params: { id } })

  // 带查询参数
  router.push({ path: '/search', query: { q: 'vue' } })
}

function goBack() {
  router.back()     // 后退
  router.forward()  // 前进
  router.go(-2)     // 后退 2 步
}

function replace() {
  router.replace('/about')  // 替换当前历史记录（不能后退）
}
</script>
```

---

## 5. 动态路由和参数

### 类比：快递单号

动态路由就像**快递单号**：路径模板固定，具体单号（参数）不同。

```
路由规则：/user/:id
匹配：
  /user/123  → id = 123
  /user/456  → id = 456
  /user/abc  → id = 'abc'
```

```javascript
// 路由配置
{
  path: '/user/:id',
  component: User
}

{
  path: '/post/:category/:id',
  component: Post
}
```

```vue
<!-- User.vue -->
<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 访问路由参数
const userId = computed(() => route.params.id)

// 访问查询参数
const page = computed(() => route.query.page || 1)

// 监听参数变化
watch(() => route.params.id, async (newId) => {
  const data = await fetchUser(newId)
  // ...
})
</script>

<template>
  <div>
    <h1>用户 ID: {{ userId }}</h1>
    <p>页码: {{ page }}</p>
  </div>
</template>
```

**params vs query：**

```
params（路径参数）
URL: /user/123
获取: route.params.id  // '123'
特点: 必须在路由规则中定义 :id

query（查询参数）
URL: /search?q=vue&page=2
获取: route.query.q     // 'vue'
     route.query.page  // '2'
特点: 不需要在路由规则中定义
```

---

## 6. 嵌套路由

### 类比：文件夹结构

嵌套路由就像**文件夹套文件夹**：父路由包含子路由。

```
/user
├── /user/profile    → 个人资料
├── /user/posts      → 我的文章
└── /user/settings   → 设置
```

```javascript
// 路由配置
{
  path: '/user',
  component: User,
  children: [
    {
      path: '',  // 默认子路由：/user
      component: UserHome
    },
    {
      path: 'profile',  // /user/profile
      component: UserProfile
    },
    {
      path: 'posts',    // /user/posts
      component: UserPosts
    }
  ]
}
```

```vue
<!-- User.vue（父路由组件） -->
<template>
  <div class="user">
    <h1>用户中心</h1>
    <nav>
      <RouterLink to="/user">首页</RouterLink>
      <RouterLink to="/user/profile">资料</RouterLink>
      <RouterLink to="/user/posts">文章</RouterLink>
    </nav>

    <!-- 子路由出口 -->
    <RouterView />
  </div>
</template>
```

---

## 7. 路由守卫

### 类比：门卫

路由守卫是**门卫**：进入某个页面前检查权限，不符合条件就拦截。

```
用户访问 /admin
    │
    ▼
beforeEach 全局守卫
    │  检查是否登录
    │  未登录 → 跳转到 /login
    │  已登录 ↓
    ▼
beforeEnter 路由独享守卫
    │  检查是否是管理员
    │  不是 → 跳转到 /403
    │  是 ↓
    ▼
进入 /admin 页面
```

### 7.1 全局守卫

```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  // to: 要去的路由
  // from: 来自的路由
  // next: 必须调用，决定是否放行

  const isLoggedIn = localStorage.getItem('token')

  // 需要登录的页面
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')  // 跳转到登录页
  } else {
    next()  // 放行
  }
})

router.afterEach((to, from) => {
  // 页面跳转后执行（不能阻止跳转）
  document.title = to.meta.title || '默认标题'
})
```

### 7.2 路由独享守卫

```javascript
{
  path: '/admin',
  component: Admin,
  beforeEnter: (to, from, next) => {
    const isAdmin = checkAdmin()
    if (isAdmin) {
      next()
    } else {
      next('/403')
    }
  }
}
```

### 7.3 组件内守卫

```vue
<script setup>
import { onBeforeRouteEnter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'

// 进入路由前（无法访问 this）
onBeforeRouteEnter((to, from, next) => {
  // 可以在这里发起数据请求
  next()
})

// 路由参数变化时（如 /user/1 → /user/2）
onBeforeRouteUpdate((to, from, next) => {
  // 重新加载数据
  next()
})

// 离开路由前
onBeforeRouteLeave((to, from, next) => {
  const answer = window.confirm('确定离开吗？未保存的数据会丢失。')
  if (answer) {
    next()
  } else {
    next(false)  // 取消跳转
  }
})
</script>
```

---

## 8. 路由元信息

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,   // 需要登录
      title: '管理后台',
      roles: ['admin']      // 需要的角色
    }
  }
]

// 在守卫中使用
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // 检查登录状态
  }
  document.title = to.meta.title || '默认标题'
  next()
})
```

---

## 9. 懒加载

### 类比：按需点菜

不懒加载：一次性把所有菜都上桌（打包体积大，首屏慢）
懒加载：点哪个菜才上哪个（按需加载，首屏快）

```javascript
// ❌ 不懒加载：所有组件打包在一起
import Home from './views/Home.vue'
import About from './views/About.vue'

// ✅ 懒加载：访问时才加载
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
]
```

---

## 10. 综合练习

### 练习 1：基础路由（必做）

创建以下页面和路由：
- `/` 首页
- `/about` 关于
- `/user/:id` 用户详情（显示 ID）

### 练习 2：嵌套路由（必做）

```
/dashboard
├── /dashboard/home
├── /dashboard/profile
└── /dashboard/settings
```

### 练习 3：登录守卫（进阶）

- `/login` 登录页
- `/admin` 管理页（需要登录）
- 未登录访问 `/admin` 自动跳转到 `/login`
- 登录后跳转回原页面

---

## 自测题

- [ ] SPA 和传统多页应用的区别？
- [ ] Hash 模式和 History 模式的区别？
- [ ] `params` 和 `query` 的区别？
- [ ] 什么时候用路由守卫？
- [ ] 如何实现路由懒加载？

---

## 学习资源

| 资源 | 链接 | 说明 |
|------|------|------|
| Vue Router 官方文档 | https://router.vuejs.org/zh/ | 最权威 |
| Vue Router 示例 | https://github.com/vuejs/router/tree/main/packages/playground | 官方示例 |

---

> 下一步 → [09 · Pinia 状态管理](./09_vue_pinia.md)
