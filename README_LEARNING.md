# Vue 3 学习指南

> 配合 vuedemo 项目，从 0 到 1 学习 Vue 3

## 项目说明

这是一个交互式 Vue 3 学习项目，包含 5 个章节的实战示例：

1. **模板语法与指令** - 插值、v-if、v-for、v-bind、v-model
2. **响应式数据** - ref、reactive、computed、watch
3. **组件通信** - Props、自定义事件、插槽
4. **生命周期** - onMounted、onUpdated、onUnmounted
5. **Composition API** - 自定义 Hook、provide/inject

## 快速开始

```bash
# 安装依赖（已完成）
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 学习路径

### 阶段 1：基础准备（1-2周）

在开始 Vue 之前，确保掌握：
- HTML5 语义化标签
- CSS Flexbox/Grid 布局
- JavaScript ES6+ 语法
- Promise 和 async/await
- 数组方法（map、filter、reduce）

👉 查看 `stage1.md` 进行系统复习

### 阶段 2：Vue 核心概念（2-3周）

#### 第 1 章：模板语法与指令

**学习目标：**
- 理解 Vue 的声明式渲染
- 掌握常用指令的使用场景
- 理解响应式更新原理

**核心知识点：**
```vue
<!-- 文本插值 -->
<p>{{ message }}</p>

<!-- 条件渲染 -->
<p v-if="isVisible">显示</p>
<p v-show="isVisible">显示（display:none）</p>

<!-- 列表渲染 -->
<li v-for="item in items" :key="item.id">{{ item.name }}</li>

<!-- 属性绑定 -->
<div :class="{ active: isActive }" :style="{ color: textColor }"></div>

<!-- 双向绑定 -->
<input v-model="inputValue" />

<!-- 事件处理 -->
<button @click="handleClick">点击</button>
<input @keyup.enter="submit" />
```

**练习任务：**
- [ ] 实现一个待办事项列表（增删改查）
- [ ] 实现一个简单的计算器
- [ ] 实现一个动态表单验证

#### 第 2 章：响应式数据

**学习目标：**
- 理解 ref 和 reactive 的区别
- 掌握 computed 的使用和缓存机制
- 学会用 watch 监听数据变化

**核心知识点：**
```javascript
import { ref, reactive, computed, watch } from 'vue'

// ref：基本类型
const count = ref(0)
count.value++  // 在 script 中需要 .value

// reactive：对象类型
const user = reactive({ name: 'Tom', age: 18 })
user.age++  // 直接修改属性

// computed：计算属性（有缓存）
const double = computed(() => count.value * 2)

// watch：侦听器
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`)
})
```

**何时使用：**
- `ref`：基本类型（string、number、boolean）
- `reactive`：对象、数组
- `computed`：需要根据其他数据计算得出的值
- `watch`：数据变化时需要执行异步操作或复杂逻辑

**练习任务：**
- [ ] 实现一个购物车（商品数量、总价自动计算）
- [ ] 实现一个搜索框（输入时实时过滤列表）
- [ ] 实现一个表单（多个字段联动验证）

#### 第 3 章：组件通信

**学习目标：**
- 掌握父子组件通信方式
- 理解单向数据流
- 学会使用插槽实现内容分发

**核心知识点：**
```vue
<!-- 父组件 -->
<template>
  <ChildComponent
    :title="parentTitle"
    @update="handleUpdate"
  />
</template>

<!-- 子组件 -->
<script setup>
defineProps({
  title: { type: String, required: true }
})
const emit = defineEmits(['update'])
</script>

<!-- 插槽 -->
<template>
  <div class="card">
    <slot name="header">默认标题</slot>
    <slot>默认内容</slot>
  </div>
</template>
```

**通信方式总结：**
- Props：父 → 子（单向数据流）
- Emit：子 → 父（通过事件）
- Slot：父组件自定义子组件内容
- provide/inject：跨层级传值

**练习任务：**
- [ ] 实现一个可复用的 Modal 对话框组件
- [ ] 实现一个 Tabs 标签页组件
- [ ] 实现一个表单组件（Input、Select、Checkbox）

#### 第 4 章：生命周期

**学习目标：**
- 理解组件的生命周期流程
- 掌握常用生命周期钩子的使用场景
- 学会在合适的时机执行操作

**生命周期流程：**
```
setup()
  ↓
onBeforeMount（挂载前）
  ↓
onMounted（已挂载）← 最常用
  ↓
onUpdated（数据更新后）
  ↓
onUnmounted（卸载时）← 清理资源
```

**常用场景：**
```javascript
import { onMounted, onUnmounted } from 'vue'

onMounted(async () => {
  // 1. 发起数据请求
  const data = await fetchData()

  // 2. 操作 DOM
  inputRef.value.focus()

  // 3. 初始化第三方库
  chart.init(chartRef.value)
})

onUnmounted(() => {
  // 清理定时器、取消订阅、销毁实例
  clearInterval(timer)
  chart.destroy()
})
```

**练习任务：**
- [ ] 实现一个倒计时组件（自动清理定时器）
- [ ] 实现一个图表组件（初始化 ECharts）
- [ ] 实现一个无限滚动列表（监听滚动事件）

#### 第 5 章：Composition API

**学习目标：**
- 理解 Composition API 的优势
- 学会封装自定义 Hook
- 掌握 provide/inject 的使用

**自定义 Hook 示例：**
```javascript
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initial = 0) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)

  function increment() { count.value++ }
  function decrement() { count.value-- }

  return { count, double, increment, decrement }
}

// 在组件中使用
import { useCounter } from './useCounter'
const { count, double, increment } = useCounter(0)
```

**常用自定义 Hook：**
- `useFetch`：封装数据请求
- `useLocalStorage`：本地存储
- `useDebounce`：防抖
- `useEventListener`：事件监听

**练习任务：**
- [ ] 封装 useFetch（loading、error、data）
- [ ] 封装 useLocalStorage（自动持久化）
- [ ] 封装 useDebounce（搜索框防抖）

### 阶段 3：Vue 生态系统（2-3周）

#### Vue Router（路由管理）

```bash
npm install vue-router@4
```

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: User },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

#### Pinia（状态管理）

```bash
npm install pinia
```

```javascript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({ name: '', age: 0 }),
  actions: {
    updateName(name) { this.name = name }
  }
})
```

#### UI 组件库

推荐选择：
- **Element Plus**：适合后台管理系统
- **Ant Design Vue**：企业级应用
- **Naive UI**：轻量级、TypeScript 友好
- **Vant**：移动端

### 阶段 4：实战项目（3-4周）

#### 项目 1：个人博客系统
- 文章列表、详情、分类、标签
- Markdown 编辑器
- 评论功能
- 响应式布局

#### 项目 2：电商管理后台
- 用户管理、商品管理、订单管理
- 数据可视化（图表）
- 权限控制
- 表单验证

#### 项目 3：实时聊天应用
- WebSocket 实时通信
- 消息列表、发送、接收
- 在线状态
- 文件上传

## 学习资源

### 官方文档
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/zh/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)

### 视频教程
- 黑马程序员 Vue 3 教程
- 尚硅谷 Vue 3 教程
- Vue Mastery（英文）

### 练习平台
- [Vue SFC Playground](https://play.vuejs.org/)
- [CodeSandbox](https://codesandbox.io/)
- [StackBlitz](https://stackblitz.com/)

### 开源项目学习
- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)
- [vben-admin](https://github.com/vbenjs/vue-vben-admin)
- [naive-ui-admin](https://github.com/jekip/naive-ui-admin)

## 学习建议

1. **循序渐进**：不要跳过基础，每个章节都要动手实践
2. **多写代码**：看 10 遍不如写 1 遍，理论结合实践
3. **阅读源码**：理解 Vue 的响应式原理、虚拟 DOM
4. **做项目**：通过实际项目巩固所学知识
5. **持续学习**：关注 Vue 生态的最新动态

## 常见问题

### Q1: ref 和 reactive 如何选择？
- 基本类型用 `ref`
- 对象/数组用 `reactive`
- 需要整体替换对象时用 `ref`

### Q2: 什么时候用 computed，什么时候用 watch？
- `computed`：根据其他数据计算得出，有缓存
- `watch`：数据变化时执行副作用（请求、日志等）

### Q3: Options API 和 Composition API 哪个好？
- Vue 3 推荐 Composition API
- 逻辑复用更方便，TypeScript 支持更好
- Options API 仍然可用，适合简单组件

### Q4: 如何学习 Vue 源码？
1. 先掌握 Vue 的使用
2. 理解响应式原理（Proxy）
3. 学习虚拟 DOM 和 diff 算法
4. 阅读 Vue 3 源码（推荐从 reactivity 模块开始）

## 下一步

完成 vuedemo 的 5 个章节学习后：
1. 查看 `前端学习路线.md` 了解完整学习路径
2. 开始学习 Vue Router 和 Pinia
3. 选择一个 UI 组件库
4. 开始做实战项目

祝学习顺利！🚀
