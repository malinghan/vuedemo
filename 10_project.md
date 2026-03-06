# 10 · 实战项目：Todo App

> 综合运用前面所学，从零搭建一个完整的待办事项应用。

---

## 项目概览

### 功能清单

- ✅ 添加待办事项
- ✅ 标记完成/未完成
- ✅ 删除待办事项
- ✅ 筛选显示（全部/未完成/已完成）
- ✅ 统计未完成数量
- ✅ 清空已完成
- ✅ 数据持久化（localStorage）
- ✅ 响应式布局

### 技术栈

- Vue 3 + Composition API
- Pinia（状态管理）
- Vue Router（路由）
- Vite（构建工具）

---

## 项目初始化

### 1. 创建项目

```bash
npm create vite@latest todo-app -- --template vue
cd todo-app
npm install
```

### 2. 安装依赖

```bash
npm install pinia vue-router
npm install pinia-plugin-persistedstate
```

### 3. 目录结构

```
todo-app/
├─ src/
│  ├─ components/
│  │  ├─ TodoInput.vue      # 输入框组件
│  │  ├─ TodoItem.vue       # 单个待办项
│  │  ├─ TodoList.vue       # 待办列表
│  │  └─ TodoFilter.vue     # 筛选器
│  ├─ stores/
│  │  └─ todo.js            # Todo Store
│  ├─ views/
│  │  ├─ Home.vue           # 首页
│  │  └─ About.vue          # 关于页
│  ├─ router/
│  │  └─ index.js           # 路由配置
│  ├─ App.vue
│  └─ main.js
├─ index.html
└─ package.json
```

---

## 核心代码实现

### 1. 配置 Pinia 和 Router

```js
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.mount('#app')
```

### 2. 路由配置

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 3. Todo Store

```js
// stores/todo.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todo', () => {
  // 状态
  const todos = ref([])
  const filter = ref('all') // 'all' | 'active' | 'completed'
  const nextId = ref(1)

  // 计算属性
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(todo => !todo.completed)
      case 'completed':
        return todos.value.filter(todo => todo.completed)
      default:
        return todos.value
    }
  })

  const activeCount = computed(() => {
    return todos.value.filter(todo => !todo.completed).length
  })

  const completedCount = computed(() => {
    return todos.value.filter(todo => todo.completed).length
  })

  const allCompleted = computed(() => {
    return todos.value.length > 0 && activeCount.value === 0
  })

  // 方法
  function addTodo(text) {
    if (!text.trim()) return

    todos.value.push({
      id: nextId.value++,
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    })
  }

  function toggleTodo(id) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  function deleteTodo(id) {
    const index = todos.value.findIndex(t => t.id === id)
    if (index > -1) {
      todos.value.splice(index, 1)
    }
  }

  function editTodo(id, newText) {
    const todo = todos.value.find(t => t.id === id)
    if (todo && newText.trim()) {
      todo.text = newText.trim()
    }
  }

  function clearCompleted() {
    todos.value = todos.value.filter(todo => !todo.completed)
  }

  function toggleAll() {
    const shouldComplete = !allCompleted.value
    todos.value.forEach(todo => {
      todo.completed = shouldComplete
    })
  }

  function setFilter(newFilter) {
    filter.value = newFilter
  }

  return {
    todos,
    filter,
    filteredTodos,
    activeCount,
    completedCount,
    allCompleted,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    toggleAll,
    setFilter
  }
}, {
  persist: true // 持久化到 localStorage
})
```

### 4. 输入框组件

```vue
<!-- components/TodoInput.vue -->
<script setup>
import { ref } from 'vue'
import { useTodoStore } from '../stores/todo'

const todoStore = useTodoStore()
const inputText = ref('')

function handleSubmit() {
  todoStore.addTodo(inputText.value)
  inputText.value = ''
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="todo-input">
    <input
      v-model="inputText"
      type="text"
      placeholder="What needs to be done?"
      class="input"
    >
    <button type="submit" class="btn-add">Add</button>
  </form>
</template>

<style scoped>
.todo-input {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.input {
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #42b983;
}

.btn-add {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: #42b983;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #35a372;
}
</style>
```

### 5. 待办项组件

```vue
<!-- components/TodoItem.vue -->
<script setup>
import { ref } from 'vue'
import { useTodoStore } from '../stores/todo'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  }
})

const todoStore = useTodoStore()
const isEditing = ref(false)
const editText = ref(props.todo.text)

function handleToggle() {
  todoStore.toggleTodo(props.todo.id)
}

function handleDelete() {
  todoStore.deleteTodo(props.todo.id)
}

function startEdit() {
  isEditing.value = true
  editText.value = props.todo.text
}

function saveEdit() {
  todoStore.editTodo(props.todo.id, editText.value)
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
  editText.value = props.todo.text
}
</script>

<template>
  <li class="todo-item" :class="{ completed: todo.completed }">
    <div v-if="!isEditing" class="view">
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="handleToggle"
        class="checkbox"
      >
      <label @dblclick="startEdit" class="label">
        {{ todo.text }}
      </label>
      <button @click="handleDelete" class="btn-delete">×</button>
    </div>

    <div v-else class="edit">
      <input
        v-model="editText"
        @keyup.enter="saveEdit"
        @keyup.esc="cancelEdit"
        @blur="saveEdit"
        class="edit-input"
        autofocus
      >
    </div>
  </li>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.todo-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.todo-item.completed .label {
  color: #999;
  text-decoration: line-through;
}

.view {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.label {
  flex: 1;
  font-size: 16px;
  cursor: pointer;
  user-select: none;
}

.btn-delete {
  width: 32px;
  height: 32px;
  font-size: 24px;
  color: #ff6b6b;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.todo-item:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: #ffe0e0;
}

.edit-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  border: 2px solid #42b983;
  border-radius: 4px;
  outline: none;
}
</style>
```

### 6. 待办列表组件

```vue
<!-- components/TodoList.vue -->
<script setup>
import { storeToRefs } from 'pinia'
import { useTodoStore } from '../stores/todo'
import TodoItem from './TodoItem.vue'

const todoStore = useTodoStore()
const { filteredTodos } = storeToRefs(todoStore)
</script>

<template>
  <div class="todo-list">
    <div v-if="filteredTodos.length === 0" class="empty">
      <p>{{ todoStore.filter === 'completed' ? 'No completed todos' : 'No todos yet' }}</p>
    </div>

    <ul v-else class="list">
      <TodoItem
        v-for="todo in filteredTodos"
        :key="todo.id"
        :todo="todo"
      />
    </ul>
  </div>
</template>

<style scoped>
.todo-list {
  margin-bottom: 20px;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 18px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
```

### 7. 筛选器组件

```vue
<!-- components/TodoFilter.vue -->
<script setup>
import { storeToRefs } from 'pinia'
import { useTodoStore } from '../stores/todo'

const todoStore = useTodoStore()
const { filter, activeCount, completedCount } = storeToRefs(todoStore)

const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' }
]
</script>

<template>
  <div class="todo-filter">
    <div class="stats">
      <span>{{ activeCount }} item{{ activeCount !== 1 ? 's' : '' }} left</span>
    </div>

    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.value"
        @click="todoStore.setFilter(f.value)"
        :class="{ active: filter === f.value }"
        class="filter-btn"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="actions">
      <button
        v-if="completedCount > 0"
        @click="todoStore.clearCompleted"
        class="clear-btn"
      >
        Clear completed
      </button>
    </div>
  </div>
</template>

<style scoped>
.todo-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
}

.stats {
  color: #666;
}

.filters {
  display: flex;
  gap: 4px;
}

.filter-btn {
  padding: 6px 12px;
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #42b983;
}

.filter-btn.active {
  border-color: #42b983;
  background: white;
}

.clear-btn {
  padding: 6px 12px;
  color: #ff6b6b;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #ffe0e0;
}
</style>
```

### 8. 首页视图

```vue
<!-- views/Home.vue -->
<script setup>
import TodoInput from '../components/TodoInput.vue'
import TodoList from '../components/TodoList.vue'
import TodoFilter from '../components/TodoFilter.vue'
</script>

<template>
  <div class="home">
    <header class="header">
      <h1>📝 Todo App</h1>
      <p>A simple todo app built with Vue 3</p>
    </header>

    <main class="main">
      <TodoInput />
      <TodoList />
      <TodoFilter />
    </main>
  </div>
</template>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 48px;
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.main {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
```

### 9. 关于页面

```vue
<!-- views/About.vue -->
<template>
  <div class="about">
    <h1>About Todo App</h1>

    <section>
      <h2>Features</h2>
      <ul>
        <li>✅ Add, edit, delete todos</li>
        <li>✅ Mark as completed</li>
        <li>✅ Filter by status</li>
        <li>✅ Persistent storage</li>
        <li>✅ Responsive design</li>
      </ul>
    </section>

    <section>
      <h2>Tech Stack</h2>
      <ul>
        <li>Vue 3 (Composition API)</li>
        <li>Pinia (State Management)</li>
        <li>Vue Router</li>
        <li>Vite</li>
      </ul>
    </section>

    <section>
      <h2>Tips</h2>
      <ul>
        <li>Double-click a todo to edit it</li>
        <li>Press Enter to save, Esc to cancel</li>
        <li>Data is saved automatically</li>
      </ul>
    </section>

    <router-link to="/" class="back-link">← Back to Home</router-link>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  font-size: 36px;
  margin-bottom: 32px;
  color: #2c3e50;
}

h2 {
  font-size: 24px;
  margin: 24px 0 16px 0;
  color: #42b983;
}

section {
  margin-bottom: 32px;
}

ul {
  line-height: 1.8;
}

.back-link {
  display: inline-block;
  margin-top: 32px;
  padding: 12px 24px;
  color: white;
  background: #42b983;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s;
}

.back-link:hover {
  background: #35a372;
}
</style>
```

### 10. 根组件

```vue
<!-- App.vue -->
<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <nav class="nav">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.nav a:hover,
.nav a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}
</style>
```

---

## 运行项目

```bash
npm run dev
```

打开 http://localhost:5173，你应该能看到完整的 Todo App。

---

## 功能扩展建议

### 1. 优先级标记

```js
// stores/todo.js
const todos = ref([
  {
    id: 1,
    text: 'Learn Vue',
    completed: false,
    priority: 'high' // 'low' | 'medium' | 'high'
  }
])
```

### 2. 截止日期

```js
{
  id: 1,
  text: 'Submit report',
  completed: false,
  dueDate: '2024-03-15'
}
```

### 3. 分类标签

```js
{
  id: 1,
  text: 'Buy groceries',
  completed: false,
  tags: ['shopping', 'urgent']
}
```

### 4. 搜索功能

```vue
<script setup>
const searchQuery = ref('')

const searchedTodos = computed(() => {
  return filteredTodos.value.filter(todo =>
    todo.text.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <input v-model="searchQuery" placeholder="Search todos..." />
</template>
```

### 5. 拖拽排序

使用 `vue-draggable-next` 库实现拖拽排序。

### 6. 深色模式

```js
// stores/theme.js
export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  function toggleTheme() {
    isDark.value = !isDark.value
    document.body.classList.toggle('dark', isDark.value)
  }

  return { isDark, toggleTheme }
}, {
  persist: true
})
```

---

## 部署上线

### 1. 构建生产版本

```bash
npm run build
```

生成 `dist/` 目录。

### 2. 部署到 Vercel

```bash
npm install -g vercel
vercel
```

### 3. 部署到 Netlify

1. 登录 https://netlify.com
2. 拖拽 `dist/` 文件夹到页面
3. 完成！

### 4. 部署到 GitHub Pages

```bash
# 安装 gh-pages
npm install -D gh-pages

# 修改 vite.config.js
export default {
  base: '/todo-app/'
}

# 添加部署脚本到 package.json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# 部署
npm run deploy
```

---

## 性能优化

### 1. 虚拟滚动

当待办事项超过 1000 条时，使用虚拟滚动：

```bash
npm install vue-virtual-scroller
```

### 2. 懒加载路由

```js
// router/index.js
const routes = [
  {
    path: '/about',
    component: () => import('../views/About.vue') // 懒加载
  }
]
```

### 3. 防抖输入

```vue
<script setup>
import { useDebounceFn } from '@vueuse/core'

const debouncedAdd = useDebounceFn((text) => {
  todoStore.addTodo(text)
}, 300)
</script>
```

---

## 测试

### 单元测试

```bash
npm install -D vitest @vue/test-utils
```

```js
// stores/todo.spec.js
import { setActivePinia, createPinia } from 'pinia'
import { useTodoStore } from './todo'
import { describe, it, expect, beforeEach } from 'vitest'

describe('Todo Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds a todo', () => {
    const store = useTodoStore()
    store.addTodo('Test todo')

    expect(store.todos).toHaveLength(1)
    expect(store.todos[0].text).toBe('Test todo')
  })

  it('toggles a todo', () => {
    const store = useTodoStore()
    store.addTodo('Test todo')
    const id = store.todos[0].id

    store.toggleTodo(id)
    expect(store.todos[0].completed).toBe(true)

    store.toggleTodo(id)
    expect(store.todos[0].completed).toBe(false)
  })
})
```

---

## 小结

通过这个项目，你学会了：

- ✅ 使用 Pinia 管理全局状态
- ✅ 使用 Vue Router 实现路由
- ✅ 组件化开发思想
- ✅ 数据持久化
- ✅ 响应式布局
- ✅ 项目部署上线

---

## 下一步学习

### 进阶主题

1. **TypeScript**：为项目添加类型安全
2. **测试**：Vitest + Vue Test Utils
3. **UI 框架**：Element Plus / Ant Design Vue
4. **后端集成**：连接真实 API
5. **SSR**：Nuxt.js 服务端渲染

### 推荐项目

- 博客系统
- 电商网站
- 后台管理系统
- 聊天应用
- 数据可视化大屏

---

> 🎉 恭喜完成整个学习路线！继续实践，不断进步！
