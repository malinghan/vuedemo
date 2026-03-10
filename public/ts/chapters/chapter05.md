# 第5章：泛型（从"写死类型"到"可复用类型"）

## 学习目标

- [ ] 理解泛型 `<T>` 的本质和动机
- [ ] 会写泛型函数、泛型接口、泛型类
- [ ] 掌握泛型约束（extends）
- [ ] 掌握泛型默认值
- [ ] 在 Vue3 Hook 中使用泛型

---

## 5.1 为什么需要泛型

### 没有泛型的痛点

```ts
// 想写一个"返回第一个元素"的函数
function firstNumber(arr: number[]): number {
  return arr[0]
}

function firstString(arr: string[]): string {
  return arr[0]
}

// 每种类型都要写一遍？太蠢了
// 用 any？丢失了类型信息
function firstAny(arr: any[]): any {
  return arr[0]  // 返回 any，调用者不知道具体类型
}
```

### 泛型的解决方案

```ts
// 泛型：用 <T> 作为"类型占位符"
function first<T>(arr: T[]): T {
  return arr[0]
}

first<number>([1, 2, 3])     // 返回 number
first<string>(['a', 'b'])    // 返回 string
first([true, false])          // TS 自动推断 T = boolean
```

### 类比理解

```text
泛型像"可调尺码的模板"：

  普通函数：
  ┌──────────────┐
  │  固定尺码 M   │  ← 只能穿 M 码（只能处理一种类型）
  └──────────────┘

  泛型函数：
  ┌──────────────┐
  │  尺码: ___   │  ← 填什么尺码就是什么尺码
  │  (S/M/L/XL) │  ← 调用时决定具体类型
  └──────────────┘

  function identity<T>(value: T): T
                   ↑           ↑    ↑
                 尺码标签    穿进去  穿出来（类型一致）
```

### 泛型工作流程图

```text
定义时：function first<T>(arr: T[]): T
                         ↑
                    T 是占位符，不确定

调用时：first<number>([1, 2, 3])
              ↑
         T 被替换为 number
         → arr: number[], 返回: number

调用时：first<string>(['a', 'b'])
              ↑
         T 被替换为 string
         → arr: string[], 返回: string
```

---

## 5.2 泛型函数

```ts
// 基本泛型函数
function identity<T>(value: T): T {
  return value
}

// 多个泛型参数
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second]
}

const p = pair('hello', 42)  // 类型: [string, number]

// 泛型与数组
function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1]
}

function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse()
}

// 泛型与回调
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn)
}

const lengths = map(['hello', 'world'], (s) => s.length)
// lengths: number[]
```

---

## 5.3 泛型接口

```ts
// 泛型接口：API 响应的通用结构
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 使用时指定 T 的具体类型
interface User {
  id: number
  name: string
}

type UserResponse = ApiResponse<User>
// 等价于 { code: number; data: User; message: string }

type UserListResponse = ApiResponse<User[]>
// 等价于 { code: number; data: User[]; message: string }

// 泛型接口：键值存储
interface Storage<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): void
  delete(key: K): boolean
}
```

---

## 5.4 泛型类

```ts
// 泛型类：简单的栈结构
class Stack<T> {
  private items: T[] = []

  push(item: T): void {
    this.items.push(item)
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  get size(): number {
    return this.items.length
  }
}

const numStack = new Stack<number>()
numStack.push(1)
numStack.push(2)
numStack.pop()  // 返回 number | undefined

const strStack = new Stack<string>()
strStack.push('hello')
```

---

## 5.5 泛型约束（extends）

有时候泛型太"自由"了，需要加约束。

```ts
// ❌ 问题：T 可以是任何类型，不一定有 length 属性
function getLength<T>(value: T): number {
  // return value.length  // 报错：T 上不存在 length
}

// ✅ 解决：用 extends 约束 T 必须有 length 属性
function getLength<T extends { length: number }>(value: T): number {
  return value.length  // ✅ 安全访问
}

getLength('hello')      // ✅ string 有 length
getLength([1, 2, 3])    // ✅ 数组有 length
// getLength(123)        // ❌ number 没有 length
```

### 类比

```text
泛型约束像"招聘要求"：

  无约束：  function hire<T>(person: T)
            → 谁都能来，不管有没有技能

  有约束：  function hire<T extends { skill: string }>(person: T)
            → 必须有 skill 属性才能来

  extends 不是"继承"，而是"必须满足"
```

### 常见约束模式

```ts
// 约束 T 必须有某个属性
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'Tom', age: 18 }
getProperty(user, 'name')   // ✅ 返回 string
// getProperty(user, 'email')  // ❌ 'email' 不在 keyof User 中

// 约束 T 必须是某个接口的子类型
interface HasId {
  id: number
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id)
}
```

---

## 5.6 泛型默认值

```ts
// 泛型可以有默认值，调用时不传则使用默认类型
interface PaginatedResult<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 不指定 T，使用默认值 any
const result1: PaginatedResult = { items: [], total: 0, page: 1, pageSize: 10 }

// 指定 T
interface User { id: number; name: string }
const result2: PaginatedResult<User> = {
  items: [{ id: 1, name: 'Tom' }],
  total: 1,
  page: 1,
  pageSize: 10
}
```

---

## 5.7 Vue3 中的泛型 Hook

泛型在 Vue3 Composition API 中非常实用。

### useList Hook

```ts
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

// 泛型 Hook：管理列表数据
function useList<T>() {
  const list = ref<T[]>([]) as Ref<T[]>

  const isEmpty = computed(() => list.value.length === 0)
  const count = computed(() => list.value.length)

  function setList(data: T[]) {
    list.value = data
  }

  function addItem(item: T) {
    list.value.push(item)
  }

  function removeAt(index: number) {
    list.value.splice(index, 1)
  }

  return { list, isEmpty, count, setList, addItem, removeAt }
}

// 使用
interface Todo {
  id: number
  title: string
  done: boolean
}

const { list: todos, addItem, isEmpty } = useList<Todo>()
addItem({ id: 1, title: '学习泛型', done: false })  // ✅ 类型安全
// addItem({ id: 1, name: 'xxx' })  // ❌ 缺少 title 和 done
```

### useRequest Hook

```ts
import { ref } from 'vue'
import type { Ref } from 'vue'

interface RequestReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  run: () => Promise<void>
}

function useRequest<T>(requestFn: () => Promise<T>): RequestReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function run() {
    loading.value = true
    error.value = null
    try {
      data.value = await requestFn()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, run }
}

// 使用
interface User { id: number; name: string }

const { data: users, loading, run: fetchUsers } = useRequest<User[]>(
  () => fetch('/api/users').then(r => r.json())
)
// users 的类型是 Ref<User[] | null>
```

---

## 5.8 教学 Demo

```ts
// ============================================
// 第5章 Demo：泛型综合练习
// ============================================

// ---------- 1. 泛型工具函数 ----------

// 安全获取对象属性
function safeGet<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 数组去重
function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

// 数组分组
function groupBy<T, K extends string>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<K, T[]>)
}

// ---------- 2. 泛型接口实战 ----------

interface TreeNode<T> {
  value: T
  children: TreeNode<T>[]
}

// 文件树
type FileNode = TreeNode<{ name: string; size: number }>

const fileTree: FileNode = {
  value: { name: 'src', size: 0 },
  children: [
    {
      value: { name: 'main.ts', size: 1024 },
      children: []
    },
    {
      value: { name: 'utils', size: 0 },
      children: [
        {
          value: { name: 'format.ts', size: 512 },
          children: []
        }
      ]
    }
  ]
}

// 遍历树
function walkTree<T>(node: TreeNode<T>, visit: (value: T) => void): void {
  visit(node.value)
  node.children.forEach(child => walkTree(child, visit))
}

walkTree(fileTree, (file) => console.log(file.name))

// ---------- 3. 泛型与条件返回 ----------

function wrapInArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

wrapInArray(1)        // number[]
wrapInArray([1, 2])   // number[]
wrapInArray('hello')  // string[]
```

---

## 5.9 面试问题与答案

### Q1: 什么是泛型？为什么需要泛型？

**答**：泛型是"参数化的类型"，允许在定义函数、接口、类时不指定具体类型，而是在使用时再确定。

需要泛型的原因：
1. 避免为每种类型写重复代码（代码复用）
2. 保持类型安全（不用 any）
3. 让调用者决定具体类型（灵活性）

没有泛型，要么写重复代码，要么用 any 丢失类型信息。泛型是两者的完美平衡。

### Q2: 泛型约束（extends）是什么？和类的继承有什么区别？

**答**：泛型约束 `T extends Constraint` 表示 T 必须满足 Constraint 的结构。它不是类的继承，而是"结构兼容性检查"。

```ts
// 这里 extends 的含义是"T 必须有 length 属性"
function fn<T extends { length: number }>(value: T) {}
```

和类继承的区别：
- 类继承 `class A extends B`：A 是 B 的子类，有继承关系
- 泛型约束 `T extends X`：T 必须满足 X 的结构，是类型约束

### Q3: `keyof` 和泛型结合有什么用？

**答**：`keyof T` 获取类型 T 的所有属性名组成的联合类型。和泛型结合可以实现类型安全的属性访问：

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

这样 key 参数只能传 obj 实际存在的属性名，返回值类型也会自动匹配。

### Q4: 泛型的类型推断是怎么工作的？

**答**：TS 编译器会根据传入的参数自动推断泛型类型：

```ts
function identity<T>(value: T): T { return value }

identity(42)       // T 被推断为 number（根据参数 42）
identity('hello')  // T 被推断为 string（根据参数 'hello'）
```

推断规则：从函数参数的实际值反推 T 的类型。如果推断不出或推断不准确，可以手动指定 `identity<number>(42)`。

### Q5: Vue3 的 ref<T> 是怎么利用泛型的？

**答**：`ref<T>` 接受一个泛型参数来指定响应式数据的类型：

```ts
const count = ref<number>(0)      // Ref<number>
const name = ref<string>('Tom')   // Ref<string>
const user = ref<User | null>(null) // Ref<User | null>
```

如果不显式指定，TS 会从初始值推断。但当初始值是 `null` 或类型不够精确时，需要手动指定泛型。这是泛型在 Vue3 中最常见的用法。

---

## 5.10 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第5章 知识点总结                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  泛型本质：参数化的类型，定义时用占位符，使用时确定具体类型  │
│                                                          │
│  泛型函数：function fn<T>(arg: T): T                      │
│  泛型接口：interface Box<T> { value: T }                  │
│  泛型类：  class Stack<T> { ... }                         │
│                                                          │
│  泛型约束：T extends Constraint                           │
│    - 限制 T 必须满足某种结构                               │
│    - keyof T 获取属性名联合类型                            │
│    - K extends keyof T 限制 K 是 T 的属性名               │
│                                                          │
│  泛型默认值：<T = DefaultType>                            │
│                                                          │
│  Vue3 中的泛型：                                          │
│    - ref<T>()、reactive<T>()                              │
│    - 自定义 Hook：useList<T>()、useRequest<T>()           │
│                                                          │
│  最佳实践：                                               │
│    ✅ 用泛型代替 any，保持类型安全                          │
│    ✅ 用 extends 约束泛型范围                              │
│    ✅ 利用类型推断，不必每次都手动指定                      │
│    ✅ 泛型命名：T(Type), K(Key), V(Value), E(Element)     │
│    ❌ 不要过度泛型化，简单场景直接写具体类型                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第4章：联合类型与类型缩小](./chapter04.md)
> 下一章：[第6章：高级类型工具](./chapter06.md)
