# 第9章：Vue3 + TypeScript 核心写法

## 学习目标

- [ ] 熟练 `ref<T> / reactive<T> / computed<T> / watch` 的 TS 写法
- [ ] 会给事件处理函数加类型（Event, MouseEvent 等）
- [ ] 会给 DOM 引用加类型（HTMLInputElement 等）
- [ ] 掌握异步请求的类型设计（ApiResponse\<T\>）
- [ ] 理解 provide/inject 的类型写法
- [ ] 形成组件内"类型优先"的开发习惯

---

## 9.1 响应式数据的类型

### ref\<T\>

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 简单类型：TS 自动推断，不需要手动标注
const count = ref(0)          // Ref<number>
const name = ref('Tom')       // Ref<string>

// 复杂类型或初始值为 null：需要手动指定泛型
const user = ref<User | null>(null)

// 使用时注意 .value
count.value++                 // ✅
user.value = { id: 1, name: 'Tom' }  // ✅

interface User {
  id: number
  name: string
}
</script>
```

### reactive\<T\>

```vue
<script setup lang="ts">
import { reactive } from 'vue'

interface FormState {
  userName: string
  age: number
  tags: string[]
}

// reactive 推荐用 interface 标注
const form = reactive<FormState>({
  userName: '',
  age: 18,
  tags: []
})

// 直接访问属性，不需要 .value
form.userName = 'Tom'  // ✅
form.tags.push('vue')  // ✅
</script>
```

### ref vs reactive 类型对比

```text
┌──────────────┬─────────────────────┬──────────────────────┐
│              │ ref<T>              │ reactive<T>          │
├──────────────┼─────────────────────┼──────────────────────┤
│ 基本类型     │ ✅ ref<number>(0)   │ ❌ 不支持基本类型     │
│ 对象类型     │ ✅ ref<User>(...)   │ ✅ reactive<User>    │
│ 访问方式     │ .value              │ 直接访问              │
│ 类型标注     │ 泛型 ref<T>()       │ 泛型 reactive<T>()   │
│ 可以为 null  │ ✅ ref<T | null>    │ ❌ 不推荐             │
│ 解构         │ 不丢失响应式         │ ⚠️ 解构会丢失响应式   │
└──────────────┴─────────────────────┴──────────────────────┘
```

### computed\<T\>

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// 返回值类型自动推断
const fullName = computed(() => `${firstName.value}${lastName.value}`)
// 类型: ComputedRef<string>

// 也可以手动指定
const count = ref(0)
const doubleCount = computed<number>(() => count.value * 2)

// 可写计算属性
const name = computed<string>({
  get: () => `${firstName.value}${lastName.value}`,
  set: (val) => {
    firstName.value = val[0]
    lastName.value = val.slice(1)
  }
})
</script>
```

---

## 9.2 watch / watchEffect 的类型

```vue
<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Tom')

// 监听单个 ref
watch(count, (newVal, oldVal) => {
  // newVal 和 oldVal 自动推断为 number
  console.log(`${oldVal} → ${newVal}`)
})

// 监听多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  // newCount: number, newName: string
  console.log(newCount, newName)
})

// 监听 getter 函数
watch(
  () => count.value * 2,
  (doubled) => {
    // doubled: number
    console.log('doubled:', doubled)
  }
)

// watchEffect：自动收集依赖，不需要指定监听源
watchEffect(() => {
  console.log(`count is ${count.value}`)
})

// 监听对象的深层属性
interface User { name: string; age: number }
const user = ref<User>({ name: 'Tom', age: 18 })

watch(
  () => user.value.age,
  (newAge) => console.log('age changed:', newAge)
)
</script>
```

---

## 9.3 事件处理的类型

### 常见事件类型

```text
┌──────────────────┬──────────────────────────────┐
│ 事件             │ 类型                          │
├──────────────────┼──────────────────────────────┤
│ click            │ MouseEvent                   │
│ input            │ Event（target 需断言）         │
│ change           │ Event                        │
│ submit           │ Event                        │
│ keydown/keyup    │ KeyboardEvent                │
│ focus/blur       │ FocusEvent                   │
│ drag             │ DragEvent                    │
│ scroll           │ Event                        │
└──────────────────┴──────────────────────────────┘
```

### 实际写法

```vue
<script setup lang="ts">
// 点击事件
function handleClick(e: MouseEvent) {
  console.log(e.clientX, e.clientY)
}

// 输入事件 —— 需要断言 target 类型
function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  console.log(target.value)
}

// 键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    console.log('回车键')
  }
}

// 表单提交
function handleSubmit(e: Event) {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)
  console.log(Object.fromEntries(formData))
}
</script>

<template>
  <button @click="handleClick">点击</button>
  <input @input="handleInput" @keydown="handleKeydown" />
  <form @submit="handleSubmit">
    <button type="submit">提交</button>
  </form>
</template>
```

---

## 9.4 DOM 引用的类型

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// DOM 元素引用
const inputRef = ref<HTMLInputElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  // 使用可选链，因为可能为 null
  inputRef.value?.focus()

  const ctx = canvasRef.value?.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, 100, 100)
  }
})
</script>

<template>
  <input ref="inputRef" />
  <canvas ref="canvasRef" width="200" height="200"></canvas>
</template>
```

### 常见 DOM 元素类型

```text
HTMLInputElement    → <input>
HTMLTextAreaElement  → <textarea>
HTMLSelectElement    → <select>
HTMLButtonElement    → <button>
HTMLDivElement       → <div>
HTMLCanvasElement    → <canvas>
HTMLFormElement      → <form>
HTMLAnchorElement    → <a>
HTMLImageElement     → <img>
HTMLVideoElement     → <video>
```

---

## 9.5 异步请求的类型设计

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 通用 API 响应类型
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 业务类型
interface TodoItem {
  id: number
  title: string
  done: boolean
}

// 请求函数：返回值有完整类型
async function fetchTodos(): Promise<ApiResponse<TodoItem[]>> {
  const res = await fetch('/api/todos')
  return res.json()
}

// 组件中使用
const todos = ref<TodoItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetchTodos()
    if (res.code === 200) {
      todos.value = res.data  // ✅ 类型安全
    } else {
      error.value = res.message
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '未知错误'
  } finally {
    loading.value = false
  }
})
</script>
```

---

## 9.6 provide / inject 的类型

```vue
<!-- 父组件 -->
<script setup lang="ts">
import { provide, ref } from 'vue'
import type { InjectionKey } from 'vue'

interface ThemeConfig {
  color: string
  fontSize: number
}

// 用 InjectionKey 定义类型安全的 key
export const themeKey: InjectionKey<ThemeConfig> = Symbol('theme')

const theme = ref<ThemeConfig>({
  color: '#333',
  fontSize: 14
})

provide(themeKey, theme.value)
</script>
```

```vue
<!-- 子组件 -->
<script setup lang="ts">
import { inject } from 'vue'
import { themeKey } from './Parent.vue'

// inject 自动推断类型为 ThemeConfig | undefined
const theme = inject(themeKey)

// 提供默认值，类型变为 ThemeConfig（不再是 undefined）
const themeWithDefault = inject(themeKey, {
  color: '#000',
  fontSize: 16
})
</script>
```

### provide/inject 类型流图

```text
父组件
  │
  │  provide(themeKey, value)
  │  themeKey: InjectionKey<ThemeConfig>
  │
  ▼
子组件
  │
  │  inject(themeKey)
  │  → 自动推断为 ThemeConfig | undefined
  │
  │  inject(themeKey, defaultValue)
  │  → 自动推断为 ThemeConfig
```

---

## 9.7 教学 Demo：完整的 TS 组件

```vue
<!-- TodoApp.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// -------- 类型定义 --------
interface Todo {
  id: number
  title: string
  done: boolean
}

type FilterType = 'all' | 'active' | 'completed'

// -------- 响应式数据 --------
const todos = ref<Todo[]>([])
const newTitle = ref('')
const filter = ref<FilterType>('all')
const inputRef = ref<HTMLInputElement | null>(null)

// -------- 计算属性 --------
const filteredTodos = computed<Todo[]>(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(t => !t.done)
    case 'completed':
      return todos.value.filter(t => t.done)
    default:
      return todos.value
  }
})

const stats = computed(() => ({
  total: todos.value.length,
  active: todos.value.filter(t => !t.done).length,
  completed: todos.value.filter(t => t.done).length
}))

// -------- 方法 --------
function addTodo(): void {
  const title = newTitle.value.trim()
  if (!title) return

  todos.value.push({
    id: Date.now(),
    title,
    done: false
  })
  newTitle.value = ''
  inputRef.value?.focus()
}

function toggleTodo(id: number): void {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.done = !todo.done
  }
}

function removeTodo(id: number): void {
  todos.value = todos.value.filter(t => t.id !== id)
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    addTodo()
  }
}

// -------- 监听器 --------
watch(
  () => stats.value.completed,
  (newCount, oldCount) => {
    if (newCount > oldCount) {
      console.log('又完成了一个任务！')
    }
  }
)
</script>

<template>
  <div>
    <h2>Todo App (TypeScript)</h2>

    <div>
      <input
        ref="inputRef"
        v-model="newTitle"
        placeholder="输入新任务..."
        @keydown="handleKeydown"
      />
      <button @click="addTodo">添加</button>
    </div>

    <div>
      <button
        v-for="f in (['all', 'active', 'completed'] as FilterType[])"
        :key="f"
        :class="{ active: filter === f }"
        @click="filter = f"
      >
        {{ f }}
      </button>
    </div>

    <ul>
      <li v-for="todo in filteredTodos" :key="todo.id">
        <input type="checkbox" :checked="todo.done" @change="toggleTodo(todo.id)" />
        <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
          {{ todo.title }}
        </span>
        <button @click="removeTodo(todo.id)">删除</button>
      </li>
    </ul>

    <p>总计: {{ stats.total }} | 待完成: {{ stats.active }} | 已完成: {{ stats.completed }}</p>
  </div>
</template>
```

---

## 9.8 面试问题与答案

### Q1: ref 和 reactive 在 TypeScript 中有什么区别？怎么选？

**答**：
- `ref<T>`：适合基本类型和可能为 null 的对象，访问需要 `.value`，解构不丢失响应式
- `reactive<T>`：适合对象/数组，直接访问属性，但解构会丢失响应式，不能整体替换

选择策略：基本类型 → ref；表单对象 → reactive；可能为 null → ref；需要解构 → ref。

### Q2: Vue3 中事件处理函数的参数类型怎么写？

**答**：根据事件类型选择对应的 Event 子类：
- `@click` → `MouseEvent`
- `@input` → `Event`（需要 `e.target as HTMLInputElement` 断言）
- `@keydown` → `KeyboardEvent`
- `@submit` → `Event`

模板中的 `$event` 会自动推断类型，但 `<script>` 中定义的处理函数需要手动标注参数类型。

### Q3: 如何给模板 ref 加类型？

**答**：
```ts
const inputRef = ref<HTMLInputElement | null>(null)
```
初始值为 `null`（组件挂载前 DOM 不存在），类型是 `HTMLElement子类 | null`。使用时用可选链 `inputRef.value?.focus()` 或在 `onMounted` 中使用。

### Q4: provide/inject 怎么实现类型安全？

**答**：使用 `InjectionKey<T>` 作为 key：
```ts
const key: InjectionKey<MyType> = Symbol('key')
provide(key, value)           // value 必须是 MyType
const val = inject(key)       // 自动推断为 MyType | undefined
const val2 = inject(key, def) // 有默认值时推断为 MyType
```

### Q5: computed 需要手动标注返回类型吗？

**答**：大多数情况不需要，TS 能从回调函数的返回值自动推断。但以下情况建议手动标注：
1. 返回类型复杂，推断结果不够精确
2. 可写计算属性（get/set 形式）
3. 团队规范要求显式标注

---

## 9.9 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第9章 知识点总结                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  响应式类型：                                             │
│    ref<T>()      → Ref<T>，用 .value 访问                │
│    reactive<T>() → T，直接访问属性                        │
│    computed<T>() → ComputedRef<T>                        │
│                                                          │
│  事件类型：                                               │
│    MouseEvent / KeyboardEvent / FocusEvent / Event       │
│    e.target as HTMLInputElement（需要断言）                │
│                                                          │
│  DOM 引用：                                               │
│    ref<HTMLXxxElement | null>(null)                       │
│    onMounted 中使用，注意判空                              │
│                                                          │
│  异步请求：                                               │
│    ApiResponse<T> 通用响应类型                            │
│    async function(): Promise<ApiResponse<T>>             │
│                                                          │
│  provide/inject：                                        │
│    InjectionKey<T> 实现类型安全                            │
│                                                          │
│  开发习惯：                                               │
│    ✅ 先定义 interface，再写逻辑                           │
│    ✅ 能推断的不手动写，复杂的显式标注                      │
│    ✅ 事件处理函数标注参数类型                              │
│    ✅ DOM ref 初始值为 null                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第8章：模块与声明文件](./chapter08.md)
> 下一章：[第10章：Vue3组件类型设计](./chapter10.md)
