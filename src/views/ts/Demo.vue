<script setup>
import { ref, shallowRef } from 'vue'

// TS 演示案例 —— 纯 Vue 组件实现，展示 TS 核心概念
const current = ref(0)

const demos = [
  { id: 0, title: '基础类型', desc: 'number / string / boolean / any / unknown' },
  { id: 1, title: '函数与接口', desc: '函数标注、interface vs type' },
  { id: 2, title: '联合类型与类型守卫', desc: '判别联合、typeof / in 守卫' },
  { id: 3, title: '泛型', desc: '泛型函数、泛型约束、Vue Hook 泛型' },
  { id: 4, title: '工具类型', desc: 'Partial / Pick / Omit / Record' },
  { id: 5, title: 'Vue3 + TS 实战', desc: 'ref / Props / Emits 类型写法' },
]
</script>

<template>
  <div class="ts-demo-page">
    <div class="page-header">
      <h1>TypeScript 演示案例</h1>
      <p>交互式代码示例，直观理解 TS 核心概念</p>
    </div>

    <div class="demo-tabs">
      <button
        v-for="d in demos"
        :key="d.id"
        :class="['tab', { active: current === d.id }]"
        @click="current = d.id"
      >
        {{ d.title }}
      </button>
    </div>

    <div class="demo-container">
      <!-- Demo 0: 基础类型 -->
      <div v-if="current === 0" class="demo-section">
        <h2>基础类型演示</h2>
        <div class="code-compare">
          <div class="code-panel">
            <h3>TypeScript 代码</h3>
            <pre class="code-block"><code>// 基本类型标注
let age: number = 18
let name: string = 'Tom'
let isAdmin: boolean = false

// 数组
let tags: string[] = ['vue', 'ts']

// 元组：固定长度 + 固定类型
let result: [number, string] = [200, 'ok']

// 枚举
enum Role {
  Visitor = 'visitor',
  Editor = 'editor',
  Admin = 'admin'
}
const role: Role = Role.Editor

// any vs unknown
let v1: any = 'hello'
v1.toFixed()  // 不报错，但运行时可能崩溃

let v2: unknown = 'hello'
// v2.toFixed()  // ❌ 报错！必须先类型缩小
if (typeof v2 === 'string') {
  v2.toUpperCase()  // ✅ 安全
}</code></pre>
          </div>
          <div class="code-panel">
            <h3>类比理解</h3>
            <pre class="code-block hint"><code>类型就像"容器标签"：

┌──────────┐  ┌──────────┐
│  number  │  │  string  │
│  18      │  │  "Tom"   │
│  3.14    │  │  "hello" │
└──────────┘  └──────────┘
贴了 number 标签 → 只能放数字

any    = 保安直接放行（危险）
unknown = 先验身份再放行（安全）

元组 [A, B] = 套餐组合
  🍔 + 🥤 顺序固定

枚举 = 一组命名常量
  Role.Admin 比 'admin' 更安全</code></pre>
          </div>
        </div>
      </div>

      <!-- Demo 1: 函数与接口 -->
      <div v-if="current === 1" class="demo-section">
        <h2>函数与接口演示</h2>
        <div class="code-compare">
          <div class="code-panel">
            <h3>函数类型标注</h3>
            <pre class="code-block"><code>// 基本函数
function add(a: number, b: number): number {
  return a + b
}

// 可选参数 + 默认参数
function greet(
  name: string,
  title?: string,
  greeting = 'Hello'
): string {
  return title
    ? `${greeting}, ${title} ${name}`
    : `${greeting}, ${name}`
}

greet('Tom')            // "Hello, Tom"
greet('Tom', 'Mr.')     // "Hello, Mr. Tom"

// 函数类型表达式
type MathFn = (a: number, b: number) => number
const multiply: MathFn = (a, b) => a * b</code></pre>
          </div>
          <div class="code-panel">
            <h3>interface vs type</h3>
            <pre class="code-block"><code>// interface —— 定义对象形状
interface User {
  id: number
  name: string
  age?: number           // 可选
  readonly createdAt: string  // 只读
}

// interface 可以继承
interface Admin extends User {
  permissions: string[]
}

// type —— 类型别名
type Status = 'active' | 'inactive'
type Point = { x: number; y: number }

// 选择策略：
// 对象结构 → interface
// 联合/交叉/工具类型 → type</code></pre>
          </div>
        </div>
      </div>

      <!-- Demo 2: 联合类型 -->
      <div v-if="current === 2" class="demo-section">
        <h2>联合类型与类型守卫</h2>
        <div class="code-compare">
          <div class="code-panel">
            <h3>判别联合（最实用模式）</h3>
            <pre class="code-block"><code>// 每个状态有一个 "标签" 字段
type LoadingState = { status: 'loading' }
type SuccessState = {
  status: 'success'
  data: string[]
}
type ErrorState = {
  status: 'error'
  message: string
}

type FetchState =
  | LoadingState
  | SuccessState
  | ErrorState

function render(state: FetchState) {
  switch (state.status) {
    case 'loading':
      return '加载中...'
    case 'success':
      // TS 知道这里有 data
      return `共 ${state.data.length} 条`
    case 'error':
      // TS 知道这里有 message
      return `错误: ${state.message}`
  }
}</code></pre>
          </div>
          <div class="code-panel">
            <h3>类型缩小流程</h3>
            <pre class="code-block hint"><code>FetchState
    │
    ├── status === 'loading'
    │   → 只有 status 字段
    │
    ├── status === 'success'
    │   → 有 data: string[]
    │
    └── status === 'error'
        → 有 message: string

TS 根据 status 的值自动缩小类型
每个分支里只能访问对应的属性

typeof  → 判断基本类型
in      → 判断对象有没有某属性
instanceof → 判断类实例

自定义守卫：
function isFish(a): a is Fish {
  return 'swim' in a
}</code></pre>
          </div>
        </div>
      </div>

      <!-- Demo 3: 泛型 -->
      <div v-if="current === 3" class="demo-section">
        <h2>泛型演示</h2>
        <div class="code-compare">
          <div class="code-panel">
            <h3>泛型函数与约束</h3>
            <pre class="code-block"><code>// 泛型 = 参数化的类型
function first&lt;T&gt;(arr: T[]): T {
  return arr[0]
}

first&lt;number&gt;([1, 2, 3])  // number
first(['a', 'b'])          // string（自动推断）

// 泛型约束
function getLength&lt;T extends { length: number }&gt;(
  value: T
): number {
  return value.length
}

getLength('hello')    // ✅ string 有 length
getLength([1, 2, 3])  // ✅ 数组有 length
// getLength(123)     // ❌ number 没有 length

// keyof 约束
function getValue&lt;T, K extends keyof T&gt;(
  obj: T, key: K
): T[K] {
  return obj[key]
}

const user = { name: 'Tom', age: 18 }
getValue(user, 'name')  // string
getValue(user, 'age')   // number</code></pre>
          </div>
          <div class="code-panel">
            <h3>Vue3 泛型 Hook</h3>
            <pre class="code-block"><code>// useList&lt;T&gt; —— 泛型列表管理
function useList&lt;T&gt;() {
  const list = ref&lt;T[]&gt;([])

  function add(item: T) {
    list.value.push(item)
  }

  function remove(index: number) {
    list.value.splice(index, 1)
  }

  return { list, add, remove }
}

// 使用时指定类型
interface Todo {
  id: number
  title: string
  done: boolean
}

const { list, add } = useList&lt;Todo&gt;()
add({ id: 1, title: '学泛型', done: false })

// 类比：
// 普通函数 = 固定尺码衣服
// 泛型函数 = 可调尺码模板
//   调用时决定具体尺码</code></pre>
          </div>
        </div>
      </div>

      <!-- Demo 4: 工具类型 -->
      <div v-if="current === 4" class="demo-section">
        <h2>工具类型演示</h2>
        <div class="code-compare">
          <div class="code-panel">
            <h3>五大核心工具类型</h3>
            <pre class="code-block"><code>interface User {
  id: number
  name: string
  email: string
  age: number
}

// Partial —— 全部变可选
type UserDraft = Partial&lt;User&gt;
// { id?: number; name?: string; ... }

// Required —— 全部变必选
type StrictUser = Required&lt;User&gt;

// Pick —— 只取指定属性
type UserPreview = Pick&lt;User, 'id' | 'name'&gt;
// { id: number; name: string }

// Omit —— 去掉指定属性
type CreateDTO = Omit&lt;User, 'id'&gt;
// { name: string; email: string; age: number }

// Record —— 批量生成键值对
type UserMap = Record&lt;string, User&gt;

// 组合使用
type UpdateDTO = Partial&lt;Omit&lt;User, 'id'&gt;&gt;
// 去掉 id，其余全部可选</code></pre>
          </div>
          <div class="code-panel">
            <h3>类比 + 实现原理</h3>
            <pre class="code-block hint"><code>工具类型像"照片编辑工具"：

原图（User）
  ├── Partial  → 加半透明（全部可选）
  ├── Required → 去半透明（全部必选）
  ├── Pick     → 裁剪（只保留指定）
  ├── Omit     → 遮挡（去掉指定）
  └── Record   → 批量生成

Partial 的实现原理：
type Partial&lt;T&gt; = {
  [K in keyof T]?: T[K]
}

解读：
  [K in keyof T]  遍历所有 key
  ?:               加上可选标记
  T[K]             保持原值类型

keyof User → 'id' | 'name' | 'email' | 'age'
User['name'] → string</code></pre>
          </div>
        </div>
      </div>

      <!-- Demo 5: Vue3 + TS -->
      <div v-if="current === 5" class="demo-section">
        <h2>Vue3 + TypeScript 实战</h2>
        <div class="code-compare">
          <div class="code-panel">
            <h3>Props / Emits 类型</h3>
            <pre class="code-block"><code>&lt;script setup lang="ts"&gt;
// Props 类型声明
interface Props {
  title: string
  count?: number
  tags?: string[]
}

const props = withDefaults(
  defineProps&lt;Props&gt;(), {
    count: 0,
    tags: () => []  // 引用类型用工厂函数
  }
)

// Emits 类型声明
const emit = defineEmits&lt;{
  'update:modelValue': [value: string]
  'submit': [data: { name: string }]
  'cancel': []
}&gt;()

// 事件处理
function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

// DOM ref
const inputRef = ref&lt;HTMLInputElement | null&gt;(null)
onMounted(() =&gt; inputRef.value?.focus())
&lt;/script&gt;</code></pre>
          </div>
          <div class="code-panel">
            <h3>组件类型流</h3>
            <pre class="code-block hint"><code>父组件
  │
  │ &lt;Child
  │   :title="title"     ← Props 入参
  │   v-model="value"    ← 双向绑定
  │   @submit="onSubmit" ← Emits 出参
  │   ref="childRef"     ← Expose
  │ &gt;
  │   &lt;template #default="{ item }"&gt;
  │     {{ item.name }}  ← Slots 参数
  │   &lt;/template&gt;
  │ &lt;/Child&gt;
  │
  ▼
子组件
  defineProps&lt;Props&gt;()
  defineEmits&lt;Emits&gt;()
  defineSlots&lt;Slots&gt;()
  defineExpose({ validate, reset })

  所有类型编译期检查
  运行时零开销</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ts-demo-page {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.page-header p {
  color: #888;
  font-size: 14px;
}

.demo-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 18px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.15s;
}

.tab:hover {
  border-color: #3178c6;
  color: #3178c6;
}

.tab.active {
  background: #3178c6;
  border-color: #3178c6;
  color: #fff;
}

.demo-container {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.demo-section h2 {
  font-size: 22px;
  color: #1a1a2e;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #3178c6;
}

.code-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.code-panel h3 {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 600;
}

.code-block {
  background: #f8f9fc;
  border: 1px solid #e2e6ed;
  border-radius: 8px;
  padding: 16px 20px;
  overflow-x: auto;
  margin: 0;
}

.code-block code {
  font-family: 'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace;
  font-size: 12.5px;
  line-height: 1.65;
  color: #2e3440;
  white-space: pre;
}

.code-block.hint {
  background: #f4f7fb;
  border: 1px solid #e0e8f5;
}

.code-block.hint code {
  color: #555;
}

@media (max-width: 900px) {
  .code-compare {
    grid-template-columns: 1fr;
  }
}
</style>
