# 第4章：联合类型、类型缩小与守卫

## 学习目标

- [ ] 理解联合类型 `A | B` 和交叉类型 `A & B`
- [ ] 掌握 `typeof / in / instanceof` 类型守卫
- [ ] 理解判别联合（Discriminated Union）—— 重点
- [ ] 会写自定义类型守卫（`is` 关键字）
- [ ] 理解类型缩小（Type Narrowing）的流程

---

## 4.1 联合类型（Union Type）

联合类型表示"多选一"：值可以是 A 类型，也可以是 B 类型。

```ts
// id 可以是 number 或 string
let id: number | string

id = 101      // ✅
id = 'abc'    // ✅
// id = true  // ❌ boolean 不在联合类型中
```

### 类比

```text
联合类型像"多功能插座"：

  ┌──────────────────┐
  │  number | string │
  │                  │
  │  🔌 number 能插  │
  │  🔌 string 能插  │
  │  ❌ boolean 不行  │
  └──────────────────┘

  插座接受多种插头，但不是所有插头都行
```

### 联合类型的限制

```ts
function printId(id: number | string) {
  // ❌ 不能直接调用 string 或 number 的专有方法
  // console.log(id.toUpperCase())  // 报错：number 没有 toUpperCase

  // ✅ 只能调用两种类型共有的方法
  console.log(id.toString())  // number 和 string 都有 toString
}
```

---

## 4.2 交叉类型（Intersection Type）

交叉类型表示"全都要"：值必须同时满足 A 和 B。

```ts
type Named = { name: string }
type Aged = { age: number }

// 交叉类型：同时拥有 name 和 age
type Person = Named & Aged

const p: Person = {
  name: 'Tom',
  age: 18
  // 缺少任何一个属性都会报错
}
```

### 联合 vs 交叉 对比图

```text
联合类型 A | B（或的关系）        交叉类型 A & B（且的关系）

  ┌─────┐   ┌─────┐              ┌─────────────┐
  │  A  │   │  B  │              │  A  ∩  B    │
  │     │   │     │              │  同时满足    │
  │ 或  │   │ 或  │              │  A 和 B     │
  └─────┘   └─────┘              └─────────────┘

  值是 A 或 B 之一               值必须同时是 A 和 B
```

---

## 4.3 类型缩小（Type Narrowing）

联合类型的值不能直接使用某个分支的方法，需要先"缩小"类型范围。

### typeof 守卫

```ts
function printId(id: number | string) {
  if (typeof id === 'string') {
    // 这个分支里，TS 知道 id 是 string
    console.log(id.toUpperCase())
  } else {
    // 这个分支里，TS 知道 id 是 number
    console.log(id.toFixed(2))
  }
}
```

### typeof 缩小流程图

```text
id: number | string
       │
       ├── typeof id === 'string'
       │         │
       │         ▼
       │    id: string  ← 类型被缩小了
       │
       └── else
                 │
                 ▼
            id: number  ← 排除 string，剩下 number
```

### in 守卫

```ts
interface Fish {
  swim: () => void
}

interface Bird {
  fly: () => void
}

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    // TS 知道 animal 是 Fish
    animal.swim()
  } else {
    // TS 知道 animal 是 Bird
    animal.fly()
  }
}
```

### instanceof 守卫

```ts
function formatDate(value: string | Date): string {
  if (value instanceof Date) {
    // TS 知道 value 是 Date
    return value.toISOString()
  } else {
    // TS 知道 value 是 string
    return value
  }
}
```

### 三种守卫对比

```text
┌──────────────┬──────────────────┬──────────────────┐
│   守卫方式    │   适用场景        │   示例            │
├──────────────┼──────────────────┼──────────────────┤
│ typeof       │ 基本类型判断      │ typeof x === 'string' │
│ in           │ 对象属性判断      │ 'swim' in animal │
│ instanceof   │ 类实例判断        │ x instanceof Date │
└──────────────┴──────────────────┴──────────────────┘
```

---

## 4.4 判别联合（Discriminated Union）—— 重点

判别联合是 TS 中最实用的模式之一。核心思想：给联合类型的每个成员加一个"标签字段"，通过标签来区分。

### 经典场景：请求状态

```ts
// 每个状态都有一个 status 字段作为"标签"
type LoadingState = { status: 'loading' }
type SuccessState = { status: 'success'; data: string[] }
type ErrorState   = { status: 'error'; message: string }

// 联合类型
type FetchState = LoadingState | SuccessState | ErrorState

function render(state: FetchState): string {
  switch (state.status) {
    case 'loading':
      return '加载中...'
    case 'success':
      // TS 自动知道这里有 data 属性
      return `共 ${state.data.length} 条数据`
    case 'error':
      // TS 自动知道这里有 message 属性
      return `错误: ${state.message}`
  }
}
```

### 判别联合工作原理图

```text
FetchState = LoadingState | SuccessState | ErrorState
                │
                ▼
         检查 state.status
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
 'loading'   'success'   'error'
    │           │           │
    ▼           ▼           ▼
 只有 status  有 data     有 message
              属性        属性

  TS 根据 status 的值，自动缩小类型
  → 每个分支里只能访问对应类型的属性
```

### 更多实际场景

```ts
// 场景1：表单操作
type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'RESET' }
  | { type: 'SUBMIT' }

function handleAction(action: FormAction) {
  switch (action.type) {
    case 'SET_FIELD':
      console.log(`设置 ${action.field} = ${action.value}`)
      break
    case 'RESET':
      console.log('重置表单')
      break
    case 'SUBMIT':
      console.log('提交表单')
      break
  }
}

// 场景2：几何图形
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number }

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'rectangle':
      return shape.width * shape.height
    case 'triangle':
      return (shape.base * shape.height) / 2
  }
}
```

### 穷尽检查（Exhaustive Check）

```ts
// 如果后续新增了一个 Shape 类型但忘记处理，编译器会报错
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'rectangle':
      return shape.width * shape.height
    case 'triangle':
      return (shape.base * shape.height) / 2
    default:
      // 如果所有 case 都覆盖了，shape 类型是 never
      // 如果漏了某个 case，这里会报错
      const _exhaustive: never = shape
      return _exhaustive
  }
}
```

---

## 4.5 自定义类型守卫（is 关键字）

当内置守卫不够用时，可以自定义。

```ts
interface Fish {
  name: string
  swim: () => void
}

interface Bird {
  name: string
  fly: () => void
}

// 自定义类型守卫：返回值是 "参数 is 类型"
function isFish(animal: Fish | Bird): animal is Fish {
  return 'swim' in animal
}

function move(animal: Fish | Bird) {
  if (isFish(animal)) {
    // TS 知道 animal 是 Fish
    animal.swim()
  } else {
    // TS 知道 animal 是 Bird
    animal.fly()
  }
}
```

### 实际应用：过滤 null/undefined

```ts
// 过滤数组中的 null 值
function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

const items: (string | null)[] = ['a', null, 'b', null, 'c']
const validItems: string[] = items.filter(isNotNull)
// validItems: ['a', 'b', 'c']，类型是 string[]（不是 (string | null)[]）
```

### 类比

```text
自定义类型守卫像"专业鉴定师"：

  typeof / in / instanceof 是"通用检测仪"
  自定义守卫是"专业鉴定师"，能做更复杂的判断

  关键：返回值类型写 "参数 is 类型"
  告诉 TS："如果我返回 true，那这个参数就是这个类型"
```

---

## 4.6 教学 Demo

```ts
// ============================================
// 第4章 Demo：联合类型与类型缩小综合练习
// ============================================

// ---------- 1. 判别联合：通知系统 ----------
type Notification =
  | { type: 'info'; title: string; message: string }
  | { type: 'warning'; title: string; message: string; level: 1 | 2 | 3 }
  | { type: 'error'; title: string; error: Error }
  | { type: 'success'; title: string; duration?: number }

function showNotification(notification: Notification): string {
  const { type, title } = notification

  switch (type) {
    case 'info':
      return `ℹ️ [${title}] ${notification.message}`
    case 'warning':
      return `⚠️ [${title}] 级别${notification.level}: ${notification.message}`
    case 'error':
      return `❌ [${title}] ${notification.error.message}`
    case 'success':
      return `✅ [${title}] 持续 ${notification.duration ?? 3000}ms`
    default:
      const _check: never = type
      return _check
  }
}

// 测试
console.log(showNotification({
  type: 'warning',
  title: '磁盘空间',
  message: '剩余不足 10%',
  level: 2
}))

// ---------- 2. 自定义类型守卫 ----------
interface TextInput {
  kind: 'text'
  value: string
  maxLength: number
}

interface NumberInput {
  kind: 'number'
  value: number
  min: number
  max: number
}

interface SelectInput {
  kind: 'select'
  value: string
  options: string[]
}

type FormField = TextInput | NumberInput | SelectInput

// 自定义守卫
function isNumberInput(field: FormField): field is NumberInput {
  return field.kind === 'number'
}

function validateField(field: FormField): boolean {
  switch (field.kind) {
    case 'text':
      return field.value.length <= field.maxLength
    case 'number':
      return field.value >= field.min && field.value <= field.max
    case 'select':
      return field.options.includes(field.value)
  }
}

// ---------- 3. 交叉类型实战 ----------
type Timestamped = {
  createdAt: string
  updatedAt: string
}

type SoftDeletable = {
  deletedAt: string | null
  isDeleted: boolean
}

type BaseEntity = {
  id: number
}

// 组合出完整的实体类型
type FullEntity = BaseEntity & Timestamped & SoftDeletable

const entity: FullEntity = {
  id: 1,
  createdAt: '2026-01-01',
  updatedAt: '2026-03-08',
  deletedAt: null,
  isDeleted: false
}

// ---------- 4. 过滤 null 的类型守卫 ----------
function isDefined<T>(value: T | null | undefined): value is T {
  return value != null
}

const rawScores: (number | null)[] = [95, null, 88, null, 72]
const scores: number[] = rawScores.filter(isDefined)
console.log(scores)  // [95, 88, 72]
```

---

## 4.7 面试问题与答案

### Q1: 联合类型和交叉类型有什么区别？

**答**：
- 联合类型 `A | B`：值是 A 或 B 之一（或的关系）。使用时只能访问 A 和 B 的公共成员，除非通过类型缩小。
- 交叉类型 `A & B`：值同时满足 A 和 B（且的关系）。结果类型拥有 A 和 B 的所有成员。

对于对象类型：联合是"选一个"，交叉是"合并所有"。
对于基本类型：`string & number` 结果是 `never`（不可能同时是两种基本类型）。

### Q2: 什么是判别联合？为什么它很重要？

**答**：判别联合（Discriminated Union）是一种模式：联合类型的每个成员都有一个相同名称但不同字面量值的属性（判别属性/标签）。

重要性：
1. TS 能根据标签自动缩小类型，每个分支里可以安全访问对应属性
2. switch/case 配合穷尽检查，新增类型成员时编译器会提醒你处理
3. 是 Redux action、状态机、API 响应等场景的最佳实践

### Q3: 自定义类型守卫（is）和普通的 boolean 返回有什么区别？

**答**：
```ts
// 普通 boolean 返回 —— TS 不会缩小类型
function isFishBool(a: Fish | Bird): boolean {
  return 'swim' in a
}
if (isFishBool(animal)) {
  // animal 仍然是 Fish | Bird，TS 不知道具体是哪个
}

// 类型守卫 is —— TS 会缩小类型
function isFish(a: Fish | Bird): a is Fish {
  return 'swim' in a
}
if (isFish(animal)) {
  // animal 被缩小为 Fish
}
```

`is` 关键字告诉 TS 编译器：如果函数返回 true，参数就是指定类型。这让 TS 能在 if 分支中正确缩小类型。

### Q4: 如何实现穷尽检查（exhaustive check）？

**答**：在 switch 的 default 分支中，将变量赋给 `never` 类型：
```ts
default:
  const _check: never = value
```
如果所有 case 都覆盖了，value 的类型会被缩小为 `never`，赋值成功。如果漏了某个 case，value 不是 `never`，编译报错。这样新增联合成员时，编译器会强制你处理所有情况。

### Q5: typeof 能判断哪些类型？有什么局限？

**答**：typeof 能判断的类型：`string`、`number`、`boolean`、`undefined`、`symbol`、`bigint`、`function`、`object`。

局限：
1. `typeof null === 'object'`（JS 历史遗留 bug）
2. 不能区分不同的对象类型（数组、Date、自定义对象都是 `object`）
3. 不能判断 interface 定义的类型

对于对象类型的区分，需要用 `in`、`instanceof` 或自定义类型守卫。

---

## 4.8 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第4章 知识点总结                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  联合类型 A | B：值是 A 或 B 之一                          │
│  交叉类型 A & B：值同时满足 A 和 B                         │
│                                                          │
│  类型缩小（Narrowing）：                                  │
│    - typeof：判断基本类型                                  │
│    - in：判断对象是否有某属性                               │
│    - instanceof：判断是否是某个类的实例                     │
│    - 自定义守卫：function isX(v): v is X                   │
│                                                          │
│  判别联合（Discriminated Union）：                         │
│    - 每个成员有一个"标签"字段（相同 key，不同字面量值）      │
│    - switch(tag) 自动缩小类型                              │
│    - 配合 never 做穷尽检查                                 │
│    - 最佳实践：状态机、Redux action、API 响应               │
│                                                          │
│  最佳实践：                                               │
│    ✅ 优先用判别联合建模状态                                │
│    ✅ 用穷尽检查确保所有情况都处理                          │
│    ✅ 用自定义守卫封装复杂判断逻辑                          │
│    ✅ filter + 类型守卫过滤 null/undefined                  │
│    ❌ 避免用 as 断言代替类型缩小                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第3章：函数与对象类型](./chapter03.md)
> 下一章：[第5章：泛型](./chapter05.md)
