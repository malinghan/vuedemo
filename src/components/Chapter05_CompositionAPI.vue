<script setup>
import { ref, reactive, computed, watch, provide, inject } from 'vue'

// ===== 1. useCounter 自定义 Hook =====
function useCounter(initial = 0) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)
  function increment() { count.value++ }
  function decrement() { count.value-- }
  function reset() { count.value = initial }
  return { count, double, increment, decrement, reset }
}

const { count, double, increment, decrement, reset } = useCounter(0)

// ===== 2. useFetch 自定义 Hook =====
function useFetch(url) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchData() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(url)
      data.value = await res.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchData }
}

const { data: todos, loading, error, fetchData } = useFetch(
  'https://jsonplaceholder.typicode.com/todos?_limit=5'
)

// ===== 3. provide / inject =====
const theme = ref('light')
provide('theme', theme)

// ===== 4. 对比 Options API vs Composition API =====
</script>

<template>
  <div class="demo-page">

    <section class="demo-block">
      <h3>1. 自定义 Hook — useCounter</h3>
      <p>将逻辑封装成可复用的函数，在任意组件中使用</p>
      <div class="counter-display">
        <span class="num">{{ count }}</span>
        <span class="label">double = {{ double }}</span>
      </div>
      <div class="controls">
        <button @click="decrement">-1</button>
        <button @click="increment">+1</button>
        <button @click="reset" class="btn-gray">重置</button>
      </div>
      <pre class="code-preview">
// 封装逻辑
function useCounter(initial = 0) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, double, increment }
}

// 在组件中使用
const { count, double, increment } = useCounter(0)</pre>
    </section>

    <section class="demo-block">
      <h3>2. 自定义 Hook — useFetch</h3>
      <p>封装数据请求逻辑，包含 loading / error / data 状态</p>
      <button @click="fetchData" :disabled="loading">
        {{ loading ? '加载中...' : '获取 Todos 数据' }}
      </button>
      <p v-if="error" style="color:red">错误：{{ error }}</p>
      <ul v-if="todos" class="todo-list">
        <li v-for="todo in todos" :key="todo.id" :class="{ done: todo.completed }">
          {{ todo.completed ? '✓' : '○' }} {{ todo.title }}
        </li>
      </ul>
    </section>

    <section class="demo-block">
      <h3>3. provide / inject — 跨层级传值</h3>
      <p>当前主题：<strong>{{ theme }}</strong></p>
      <button @click="theme = theme === 'light' ? 'dark' : 'light'">切换主题</button>
      <div :class="['theme-box', theme]">
        这个盒子通过 inject 获取祖先组件的 theme 值
        <br><small>（实际项目中常用于全局配置、用户信息等）</small>
      </div>
      <pre class="code-preview">
// 祖先组件
provide('theme', theme)

// 任意后代组件（不管嵌套多深）
const theme = inject('theme')</pre>
    </section>

    <section class="demo-block">
      <h3>4. Options API vs Composition API 对比</h3>
      <div class="compare">
        <div class="compare-col">
          <h4>Options API（Vue 2 风格）</h4>
          <pre class="code-preview small">
export default {
  data() {
    return { count: 0 }
  },
  computed: {
    double() { return this.count * 2 }
  },
  methods: {
    increment() { this.count++ }
  },
  mounted() {
    console.log('mounted')
  }
}</pre>
        </div>
        <div class="compare-col">
          <h4>Composition API（Vue 3 推荐）</h4>
          <pre class="code-preview small">
&lt;script setup&gt;
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
function increment() { count.value++ }

onMounted(() => {
  console.log('mounted')
})
&lt;/script&gt;</pre>
        </div>
      </div>
      <p class="tip">Composition API 的优势：逻辑复用更方便、TypeScript 支持更好、相关逻辑可以放在一起</p>
    </section>

  </div>
</template>

<style scoped>
.demo-page { display: flex; flex-direction: column; gap: 24px; }
.demo-block { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.demo-block h3 { font-size: 15px; color: #42b883; margin-bottom: 12px; }
.tip { margin-top: 8px; padding: 8px 12px; background: #f0faf5; border-left: 3px solid #42b883; border-radius: 4px; font-size: 13px; }
.counter-display { display: flex; align-items: center; gap: 16px; margin: 12px 0; }
.num { font-size: 48px; font-weight: bold; color: #42b883; }
.label { font-size: 14px; color: #888; }
.controls { display: flex; gap: 8px; }
.todo-list { margin-top: 10px; padding-left: 0; list-style: none; }
.todo-list li { padding: 5px 0; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
.todo-list li.done { color: #aaa; text-decoration: line-through; }
.theme-box { margin-top: 12px; padding: 14px; border-radius: 6px; transition: all 0.3s; }
.theme-box.light { background: #fff; border: 1px solid #ddd; color: #333; }
.theme-box.dark { background: #1a1a2e; border: 1px solid #444; color: #eee; }
.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
.compare-col h4 { font-size: 13px; color: #666; margin-bottom: 8px; }
.code-preview { background: #1a1a2e; color: #a8d8a8; padding: 14px; border-radius: 6px; font-size: 12px; line-height: 1.6; overflow-x: auto; margin-top: 12px; white-space: pre; }
.code-preview.small { font-size: 11px; padding: 10px; margin-top: 0; }
button { padding: 6px 14px; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-right: 6px; }
button:hover:not(:disabled) { background: #33a06f; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-gray { background: #999; }
.btn-gray:hover { background: #777; }
</style>
