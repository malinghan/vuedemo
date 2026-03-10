# 第12章：综合案例实战

## 学习目标

- [ ] 能独立设计领域类型（类型建模）
- [ ] 能让组件 Props/Emits 强类型化
- [ ] 掌握泛型在异步请求中的实际用法
- [ ] 掌握判别联合表达状态机
- [ ] 理解泛型组件的设计思想（keyof 驱动列配置）
- [ ] 综合运用前11章所有知识点

> 本章给出 3 个综合案例，覆盖"类型建模、组件设计、业务状态、可复用 Hook"。

---

## 案例1：Todo 模块（类型建模 + 列表组件）

### 1.1 学习重点

```text
┌─────────────────────────────────────────────────┐
│  本案例覆盖的知识点：                              │
│                                                 │
│  ✅ interface 定义领域类型                        │
│  ✅ 联合字面量类型（priority）                    │
│  ✅ Pick / Partial / Omit 复用类型               │
│  ✅ defineProps<T> + defineEmits<T>              │
│  ✅ 组件间类型传递                                │
└─────────────────────────────────────────────────┘
```

### 1.2 领域类型设计

```ts
// types/todo.ts

// 核心领域类型
export interface Todo {
  id: number
  title: string
  done: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

// 创建 DTO：不需要 id 和 createdAt（后端/前端自动生成）
export type CreateTodoDTO = Pick<Todo, 'title' | 'priority'>

// 更新 DTO：除了 id 和 createdAt，其余都可选
export type UpdateTodoDTO = Partial<Omit<Todo, 'id' | 'createdAt'>>

// 筛选条件
export type TodoFilter = 'all' | 'active' | 'completed'

// 排序方式
export type TodoSortBy = 'createdAt' | 'priority' | 'title'

// 统计信息
export interface TodoStats {
  total: number
  active: number
  completed: number
  highPriority: number
}
```

### 类型复用关系图

```text
Todo（完整类型）
  │
  ├── Pick<Todo, 'title' | 'priority'>
  │   → CreateTodoDTO（创建时只需要 title 和 priority）
  │
  ├── Partial<Omit<Todo, 'id' | 'createdAt'>>
  │   → UpdateTodoDTO（更新时去掉不可改字段，其余可选）
  │
  └── 直接使用
      → 组件 Props、列表渲染、API 响应
```

### 1.3 API 层

```ts
// api/todo.ts
import type { Todo, CreateTodoDTO, UpdateTodoDTO } from '../types/todo'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

const BASE = '/api/todos'

export async function fetchTodos(): Promise<ApiResponse<Todo[]>> {
  const res = await fetch(BASE)
  return res.json()
}

export async function createTodo(dto: CreateTodoDTO): Promise<ApiResponse<Todo>> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  })
  return res.json()
}

export async function updateTodo(
  id: number,
  dto: UpdateTodoDTO
): Promise<ApiResponse<Todo>> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  })
  return res.json()
}

export async function deleteTodo(id: number): Promise<ApiResponse<null>> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  return res.json()
}
```

### 1.4 组件：TodoItem.vue

```vue
<script setup lang="ts">
import type { Todo } from '../types/todo'

// Props：接收一个 Todo 对象
const props = defineProps<{
  item: Todo
}>()

// Emits：事件参数有类型约束
const emit = defineEmits<{
  toggle: [id: number]
  remove: [id: number]
  edit: [id: number, updates: { title?: string; priority?: Todo['priority'] }]
}>()

// 优先级颜色映射
const priorityColors: Record<Todo['priority'], string> = {
  low: '#52c41a',
  medium: '#faad14',
  high: '#ff4d4f'
}
</script>

<template>
  <div class="todo-item" :class="{ done: item.done }">
    <input
      type="checkbox"
      :checked="item.done"
      @change="emit('toggle', item.id)"
    />
    <span class="title">{{ item.title }}</span>
    <span
      class="priority"
      :style="{ color: priorityColors[item.priority] }"
    >
      {{ item.priority }}
    </span>
    <button @click="emit('remove', item.id)">删除</button>
  </div>
</template>
```

### 1.5 组件：TodoList.vue

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Todo, TodoFilter, CreateTodoDTO, TodoStats } from '../types/todo'
import TodoItem from './TodoItem.vue'

// 数据
const todos = ref<Todo[]>([])
const filter = ref<TodoFilter>('all')
const newTitle = ref('')
const newPriority = ref<Todo['priority']>('medium')

// 计算属性：筛选后的列表
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

// 计算属性：统计信息
const stats = computed<TodoStats>(() => ({
  total: todos.value.length,
  active: todos.value.filter(t => !t.done).length,
  completed: todos.value.filter(t => t.done).length,
  highPriority: todos.value.filter(t => t.priority === 'high' && !t.done).length
}))

// 方法
function addTodo(): void {
  const title = newTitle.value.trim()
  if (!title) return

  const todo: Todo = {
    id: Date.now(),
    title,
    done: false,
    priority: newPriority.value,
    createdAt: new Date().toISOString()
  }

  todos.value.push(todo)
  newTitle.value = ''
}

function toggleTodo(id: number): void {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}

function removeTodo(id: number): void {
  todos.value = todos.value.filter(t => t.id !== id)
}
</script>

<template>
  <div>
    <h2>Todo List</h2>

    <!-- 添加区域 -->
    <div>
      <input v-model="newTitle" placeholder="新任务..." @keydown.enter="addTodo" />
      <select v-model="newPriority">
        <option value="low">低</option>
        <option value="medium">中</option>
        <option value="high">高</option>
      </select>
      <button @click="addTodo">添加</button>
    </div>

    <!-- 筛选 -->
    <div>
      <button
        v-for="f in (['all', 'active', 'completed'] as TodoFilter[])"
        :key="f"
        @click="filter = f"
      >
        {{ f }}
      </button>
    </div>

    <!-- 列表 -->
    <TodoItem
      v-for="todo in filteredTodos"
      :key="todo.id"
      :item="todo"
      @toggle="toggleTodo"
      @remove="removeTodo"
    />

    <!-- 统计 -->
    <p>
      总计: {{ stats.total }} |
      待完成: {{ stats.active }} |
      已完成: {{ stats.completed }} |
      高优先级: {{ stats.highPriority }}
    </p>
  </div>
</template>
```

---

## 案例2：通用 useRequest Hook（泛型 + 异步状态机）

### 2.1 学习重点

```text
┌─────────────────────────────────────────────────┐
│  本案例覆盖的知识点：                              │
│                                                 │
│  ✅ 泛型函数                                     │
│  ✅ 判别联合（Discriminated Union）               │
│  ✅ 异步状态机建模                                │
│  ✅ Vue3 Composition API + TS                    │
│  ✅ 错误处理类型                                  │
└─────────────────────────────────────────────────┘
```

### 2.2 状态机类型设计

```ts
// 用判别联合表达请求的四种状态
type RequestState<T> =
  | { status: 'idle' }                              // 初始状态
  | { status: 'loading' }                           // 加载中
  | { status: 'success'; data: T }                  // 成功，携带数据
  | { status: 'error'; message: string }            // 失败，携带错误信息
```

### 状态流转图

```text
     ┌──────┐
     │ idle │  ← 初始状态
     └──┬───┘
        │ run()
        ▼
  ┌──────────┐
  │ loading  │  ← 请求中
  └────┬─────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
┌─────────┐ ┌───────┐
│ success │ │ error │
│ + data  │ │ + msg │
└─────────┘ └───────┘
       │         │
       └────┬────┘
            │ run()（可重试）
            ▼
      ┌──────────┐
      │ loading  │
      └──────────┘
```

### 2.3 完整实现

```ts
// composables/useRequest.ts
import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

interface UseRequestReturn<T> {
  state: Ref<RequestState<T>>
  data: ComputedRef<T | null>
  loading: ComputedRef<boolean>
  error: ComputedRef<string | null>
  run: (...args: any[]) => Promise<void>
  reset: () => void
}

export function useRequest<T>(
  requestFn: (...args: any[]) => Promise<T>
): UseRequestReturn<T> {
  const state = ref<RequestState<T>>({ status: 'idle' }) as Ref<RequestState<T>>

  // 便捷的计算属性
  const data = computed<T | null>(() =>
    state.value.status === 'success' ? state.value.data : null
  )

  const loading = computed(() => state.value.status === 'loading')

  const error = computed<string | null>(() =>
    state.value.status === 'error' ? state.value.message : null
  )

  async function run(...args: any[]): Promise<void> {
    state.value = { status: 'loading' }
    try {
      const result = await requestFn(...args)
      state.value = { status: 'success', data: result }
    } catch (e) {
      const message = e instanceof Error ? e.message : '未知错误'
      state.value = { status: 'error', message }
    }
  }

  function reset(): void {
    state.value = { status: 'idle' }
  }

  return { state, data, loading, error, run, reset }
}
```

### 2.4 在组件中使用

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRequest } from '../composables/useRequest'

interface User {
  id: number
  name: string
  email: string
}

// API 函数
async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users')
  const json = await res.json()
  return json.data
}

// 使用 Hook —— T 被推断为 User[]
const { data: users, loading, error, run: loadUsers } = useRequest(fetchUsers)

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error }}</div>
    <div v-else-if="users">
      <div v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </div>
    </div>
    <div v-else>暂无数据</div>

    <button @click="loadUsers" :disabled="loading">刷新</button>
  </div>
</template>
```

### 2.5 进阶：带参数的请求

```ts
// 带参数的 API
async function searchUsers(keyword: string, page: number): Promise<User[]> {
  const res = await fetch(`/api/users?q=${keyword}&page=${page}`)
  const json = await res.json()
  return json.data
}

// 使用
const { data, loading, run } = useRequest(searchUsers)

// 调用时传参
run('Tom', 1)  // 搜索 Tom，第1页
```

---

## 案例3：可复用表格组件 DataTable\<T\>（泛型组件思想）

### 3.1 学习重点

```text
┌─────────────────────────────────────────────────┐
│  本案例覆盖的知识点：                              │
│                                                 │
│  ✅ 泛型组件（generic="T"）                      │
│  ✅ keyof 驱动列配置                              │
│  ✅ 同一组件支持不同数据模型                       │
│  ✅ 插槽类型（defineSlots）                       │
│  ✅ 排序/筛选的类型设计                           │
└─────────────────────────────────────────────────┘
```

### 3.2 列配置类型

```ts
// types/table.ts

// 列定义：key 受 T 的属性名约束
export interface Column<T> {
  key: keyof T                    // 只能是 T 的属性名
  title: string                   // 列标题
  width?: number                  // 列宽
  sortable?: boolean              // 是否可排序
  render?: (value: T[keyof T], row: T) => string  // 自定义渲染
}

// 排序状态
export interface SortState<T> {
  key: keyof T | null
  order: 'asc' | 'desc'
}
```

### keyof 约束图示

```text
interface User {
  id: number
  name: string
  age: number
}

Column<User> 的 key 只能是：
  ✅ 'id'
  ✅ 'name'
  ✅ 'age'
  ❌ 'email'    → 编译报错！User 没有 email 属性
  ❌ 'address'  → 编译报错！

  这就是 keyof 的价值：写错列名，编译期就能发现
```

### 3.3 泛型表格组件

```vue
<!-- DataTable.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'

// 列定义
interface Column<U> {
  key: keyof U
  title: string
  width?: number
  sortable?: boolean
}

// Props
interface Props {
  data: T[]
  columns: Column<T>[]
  rowKey: keyof T
  striped?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  striped: true
})

// Emits
const emit = defineEmits<{
  'row-click': [row: T, index: number]
}>()

// Slots
defineSlots<{
  cell(props: { row: T; column: Column<T>; value: any }): any
  empty(props: {}): any
}>()

// 排序状态
const sortKey = ref<keyof T | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

// 排序后的数据
const sortedData = computed(() => {
  if (!sortKey.value) return props.data

  const key = sortKey.value
  const order = sortOrder.value

  return [...props.data].sort((a, b) => {
    const va = a[key]
    const vb = b[key]
    if (va < vb) return order === 'asc' ? -1 : 1
    if (va > vb) return order === 'asc' ? 1 : -1
    return 0
  })
})

// 切换排序
function toggleSort(key: keyof T): void {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th
          v-for="col in columns"
          :key="String(col.key)"
          :style="col.width ? { width: col.width + 'px' } : {}"
          @click="col.sortable ? toggleSort(col.key) : undefined"
        >
          {{ col.title }}
          <span v-if="col.sortable && sortKey === col.key">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-if="sortedData.length">
        <tr
          v-for="(row, index) in sortedData"
          :key="String(row[rowKey])"
          :class="{ striped: striped && index % 2 === 1 }"
          @click="emit('row-click', row, index)"
        >
          <td v-for="col in columns" :key="String(col.key)">
            <slot name="cell" :row="row" :column="col" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </template>
      <tr v-else>
        <td :colspan="columns.length">
          <slot name="empty">暂无数据</slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### 3.4 使用泛型表格

```vue
<script setup lang="ts">
import DataTable from './DataTable.vue'

// 用户数据模型
interface User {
  id: number
  name: string
  age: number
  department: string
}

// 列配置 —— key 受 User 类型约束
const userColumns = [
  { key: 'id' as const, title: 'ID', width: 80, sortable: true },
  { key: 'name' as const, title: '姓名', sortable: true },
  { key: 'age' as const, title: '年龄', width: 100, sortable: true },
  { key: 'department' as const, title: '部门' }
]

const users: User[] = [
  { id: 1, name: '张三', age: 28, department: '技术部' },
  { id: 2, name: '李四', age: 32, department: '产品部' },
  { id: 3, name: '王五', age: 25, department: '技术部' }
]

function handleRowClick(row: User, index: number) {
  console.log(`点击了第 ${index + 1} 行:`, row.name)
}
</script>

<template>
  <!-- T 被推断为 User -->
  <DataTable
    :data="users"
    :columns="userColumns"
    row-key="id"
    @row-click="handleRowClick"
  >
    <template #cell="{ row, column, value }">
      <template v-if="column.key === 'age'">
        <span :style="{ color: value >= 30 ? 'red' : 'green' }">
          {{ value }} 岁
        </span>
      </template>
      <template v-else>
        {{ value }}
      </template>
    </template>
  </DataTable>
</template>
```

### 3.5 换一个数据模型，同一个组件

```vue
<script setup lang="ts">
// 商品数据模型 —— 完全不同的类型，同一个 DataTable 组件
interface Product {
  sku: string
  name: string
  price: number
  stock: number
}

const productColumns = [
  { key: 'sku' as const, title: 'SKU' },
  { key: 'name' as const, title: '商品名', sortable: true },
  { key: 'price' as const, title: '价格', sortable: true },
  { key: 'stock' as const, title: '库存', sortable: true }
]

const products: Product[] = [
  { sku: 'A001', name: 'MacBook Pro', price: 14999, stock: 50 },
  { sku: 'A002', name: 'iPhone 16', price: 7999, stock: 200 }
]
</script>

<template>
  <!-- T 被推断为 Product -->
  <DataTable :data="products" :columns="productColumns" row-key="sku" />
</template>
```

```text
同一个 DataTable 组件：
  - 传 User[] → 列的 key 只能是 User 的属性
  - 传 Product[] → 列的 key 只能是 Product 的属性
  - 写错 key → 编译报错

  这就是泛型组件的价值：一套代码，多种数据模型，类型安全
```

---

## 面试问题与答案

### Q1: 如何设计一个领域类型体系？Pick/Omit/Partial 怎么组合使用？

**答**：从核心实体类型出发，用工具类型派生变体：
```ts
interface Entity { id: number; name: string; createdAt: string; updatedAt: string }
type CreateDTO = Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>  // 创建时不需要自动字段
type UpdateDTO = Partial<Omit<Entity, 'id'>>                      // 更新时 id 不可改，其余可选
type Preview = Pick<Entity, 'id' | 'name'>                        // 列表展示只需要关键字段
```
核心原则：定义一个完整类型，其他类型从它派生，避免重复定义。

### Q2: 判别联合在实际项目中有哪些应用场景？

**答**：
1. 请求状态：idle/loading/success/error（本章案例2）
2. Redux/Pinia action：{ type: 'ADD', payload } | { type: 'DELETE', id }
3. 表单字段：TextInput | NumberInput | SelectInput（不同字段类型不同配置）
4. 路由状态：{ page: 'list' } | { page: 'detail', id: number }
5. WebSocket 消息：{ event: 'message', data } | { event: 'error', code }

### Q3: 泛型组件（generic）和普通组件有什么区别？什么时候用？

**答**：泛型组件通过 `generic="T"` 让 Props/Emits/Slots 的类型随传入数据变化。普通组件的类型是固定的。

使用场景：当组件是"容器型"的（表格、列表、选择器、树形控件），需要支持不同数据模型但保持类型安全时，用泛型组件。纯展示型或业务特定的组件不需要。

### Q4: useRequest 这样的泛型 Hook 设计有什么要点？

**答**：
1. 用泛型 `<T>` 让返回数据类型由调用者决定
2. 用判别联合建模状态（idle/loading/success/error），而不是多个独立的 boolean
3. 提供便捷的计算属性（data/loading/error）简化模板使用
4. 支持重试（run 可多次调用）和重置（reset）
5. 错误处理要类型安全（instanceof Error 检查）

### Q5: keyof 在表格组件中起什么作用？

**答**：`Column<T>` 的 `key: keyof T` 确保列配置的 key 只能是数据模型的实际属性名。如果写错了属性名（如 User 没有 email 但写了 `key: 'email'`），编译期就会报错。这比运行时才发现"列显示为空"要好得多。

---

## 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第12章 知识点总结                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  案例1 - Todo 模块：                                      │
│    类型建模：interface + Pick/Omit/Partial 派生           │
│    组件类型：defineProps<T> + defineEmits<T>              │
│    联合字面量：'low' | 'medium' | 'high'                 │
│                                                          │
│  案例2 - useRequest Hook：                               │
│    泛型 Hook：useRequest<T>(fn: () => Promise<T>)        │
│    判别联合：RequestState<T> 四种状态                      │
│    状态机思维：idle → loading → success/error             │
│                                                          │
│  案例3 - DataTable 泛型组件：                             │
│    泛型组件：generic="T"                                  │
│    keyof 约束：Column<T> 的 key 只能是 T 的属性           │
│    一套代码，多种数据模型                                  │
│                                                          │
│  综合能力：                                               │
│    ✅ 从业务需求出发设计类型                               │
│    ✅ 用工具类型减少重复                                   │
│    ✅ 用泛型实现可复用的 Hook 和组件                       │
│    ✅ 用判别联合建模状态                                   │
│    ✅ 全链路类型安全（类型 → API → Hook → 组件）           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 全教程回顾

```text
第1章  认识 TS        → TS 是什么，为什么用，怎么启用
第2章  基础类型        → number/string/boolean/any/unknown/never
第3章  函数与对象      → 函数标注、interface vs type
第4章  联合与缩小      → 联合类型、类型守卫、判别联合
第5章  泛型           → <T> 参数化类型、约束、Vue Hook
第6章  高级工具类型    → Partial/Pick/Omit/Record/映射类型
第7章  类与面向对象    → class/extends/implements/abstract
第8章  模块与声明文件  → import type、.d.ts、@types
第9章  Vue3+TS 核心   → ref/reactive/computed/watch 的 TS 写法
第10章 组件类型设计    → Props/Emits/Slots/Expose/泛型组件
第11章 工程化与迁移    → tsconfig/strict/渐进式迁移策略
第12章 综合案例实战    → Todo + useRequest + DataTable
```

> 恭喜你完成了全部 12 章的学习！建议回到项目中，把学到的知识应用到实际代码里。

---

> 上一章：[第11章：工程化与迁移策略](./chapter11.md)
