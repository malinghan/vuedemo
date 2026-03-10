# 第3章：函数与对象类型

## 学习目标

- [ ] 掌握函数参数与返回值的类型标注
- [ ] 理解可选参数、默认参数、剩余参数
- [ ] 掌握函数重载的写法
- [ ] 熟练使用 `interface` 和 `type` 定义对象类型
- [ ] 理解 `interface` 与 `type` 的区别和选择策略
- [ ] 会写可选属性、只读属性、索引签名

---

## 3.1 函数类型标注

### 基本写法

```ts
// 函数声明 —— 参数和返回值都标注类型
function add(a: number, b: number): number {
  return a + b
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b

// 返回值可以省略（TS 自动推断）
function subtract(a: number, b: number) {
  return a - b  // TS 自动推断返回 number
}
```

### 类比理解

```text
函数类型标注就像"快递单"：

  ┌─────────────────────────────┐
  │  快递单（函数签名）           │
  │                             │
  │  寄件人: number (参数 a)     │
  │  寄件人: number (参数 b)     │
  │  收件人: number (返回值)     │
  │                             │
  │  如果寄的不是 number → 拒收  │
  └─────────────────────────────┘
```

### 可选参数

```ts
// 可选参数用 ? 标记，必须放在必选参数后面
function greet(name: string, title?: string): string {
  if (title) {
    return `${title} ${name}`
  }
  return `Hello, ${name}`
}

greet('Tom')           // ✅ "Hello, Tom"
greet('Tom', 'Mr.')    // ✅ "Mr. Tom"
```

### 默认参数

```ts
// 默认参数自带类型推断，不需要额外标注
function createUser(name: string, role: string = 'visitor') {
  return { name, role }
}

createUser('Tom')           // { name: 'Tom', role: 'visitor' }
createUser('Tom', 'admin')  // { name: 'Tom', role: 'admin' }
```

### 剩余参数

```ts
// 剩余参数是一个数组
function sum(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0)
}

sum(1, 2, 3)       // 6
sum(10, 20, 30, 40) // 100
```

### 参数类型图示

```text
function example(
  required: string,      ← 必选参数（必须传）
  optional?: number,     ← 可选参数（可以不传，类型是 number | undefined）
  defaultVal = 'hello',  ← 默认参数（不传时用默认值）
  ...rest: boolean[]     ← 剩余参数（收集多余参数为数组）
)

调用规则：
  example('a')                    ✅
  example('a', 1)                 ✅
  example('a', 1, 'world')       ✅
  example('a', 1, 'world', true, false) ✅
```

---

## 3.2 函数类型表达式

可以把"函数的类型"单独定义出来。

```ts
// 用 type 定义函数类型
type MathFn = (a: number, b: number) => number

const add: MathFn = (a, b) => a + b
const sub: MathFn = (a, b) => a - b

// 用在回调参数中
function calculate(a: number, b: number, fn: MathFn): number {
  return fn(a, b)
}

calculate(10, 5, add)  // 15
calculate(10, 5, sub)  // 5
```

### void 返回值

```ts
// 函数没有返回值时，标注 void
function log(msg: string): void {
  console.log(msg)
}

// 回调函数的 void 返回值有特殊行为：允许返回任何值（但会被忽略）
type Callback = (item: string) => void
const cb: Callback = (item) => item.length  // ✅ 不报错，返回值被忽略
```

---

## 3.3 函数重载

当一个函数根据不同参数类型返回不同类型时，用重载。

```ts
// 重载签名（声明多种调用方式）
function format(value: number): string
function format(value: string): string
function format(value: Date): string

// 实现签名（实际逻辑）
function format(value: number | string | Date): string {
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  return value.toISOString()
}

format(3.14159)              // "3.14"
format('  hello  ')          // "hello"
format(new Date())           // "2026-03-08T..."
```

### 类比

```text
函数重载像"餐厅的多语言菜单"：

  中文菜单 → 返回中文描述
  英文菜单 → 返回英文描述
  日文菜单 → 返回日文描述

  厨房（实现）只有一个，但对外提供多种"点菜方式"
```

---

## 3.4 对象类型：interface

`interface` 用于定义对象的"形状"（有哪些属性、什么类型）。

```ts
interface User {
  id: number
  name: string
  age?: number              // 可选属性
  readonly createdAt: string // 只读属性（赋值后不能修改）
}

const user: User = {
  id: 1,
  name: 'Alice',
  createdAt: '2026-03-08'
}

user.name = 'Bob'          // ✅ 可以修改
// user.createdAt = 'xxx'  // ❌ 只读属性不能修改
```

### interface 继承（extends）

```ts
interface Person {
  name: string
  age: number
}

// Employee 继承 Person 的所有属性，并添加新属性
interface Employee extends Person {
  company: string
  salary: number
}

const emp: Employee = {
  name: 'Tom',
  age: 30,
  company: 'Acme',
  salary: 15000
}
```

### interface 合并（声明合并）

```ts
// 同名 interface 会自动合并（这是 interface 独有的特性）
interface Config {
  host: string
}

interface Config {
  port: number
}

// 等价于：
// interface Config { host: string; port: number }

const config: Config = {
  host: 'localhost',
  port: 3000
}
```

---

## 3.5 对象类型：type

`type` 是类型别名，可以给任何类型起名字。

```ts
// 定义对象类型
type Point = {
  x: number
  y: number
}

// 定义联合类型
type Status = 'loading' | 'success' | 'error'

// 定义函数类型
type Formatter = (input: string) => string

// 定义交叉类型（合并多个类型）
type Named = { name: string }
type Aged = { age: number }
type Person = Named & Aged  // { name: string; age: number }
```

---

## 3.6 interface vs type 怎么选

### 对比表

```text
┌──────────────┬──────────────────┬──────────────────┐
│   特性        │   interface      │   type           │
├──────────────┼──────────────────┼──────────────────┤
│ 定义对象      │ ✅               │ ✅               │
│ 继承/扩展     │ extends          │ &（交叉类型）     │
│ 声明合并      │ ✅（自动合并）    │ ❌（会报错）      │
│ 联合类型      │ ❌               │ ✅               │
│ 映射类型      │ ❌               │ ✅               │
│ 基本类型别名  │ ❌               │ ✅               │
│ 元组          │ ❌               │ ✅               │
└──────────────┴──────────────────┴──────────────────┘
```

### 选择策略

```text
┌─────────────────────────────────────────────┐
│  interface 像"合同模板"                       │
│  - 适合定义对象结构                           │
│  - 适合需要被继承/实现的场景                   │
│  - 适合库的公共 API（支持声明合并）            │
│                                             │
│  type 像"类型表达式"                          │
│  - 适合联合类型、交叉类型                     │
│  - 适合工具类型、映射类型                     │
│  - 适合给基本类型/元组起别名                  │
│                                             │
│  简单原则：                                  │
│  定义对象 → 优先 interface                    │
│  其他场景 → 用 type                           │
└─────────────────────────────────────────────┘
```

---

## 3.7 索引签名

当对象的 key 不确定时，用索引签名。

```ts
// 字符串索引签名
interface StringMap {
  [key: string]: string
}

const headers: StringMap = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
}

// 数字索引签名
interface NumberMap {
  [index: number]: string
}

const colors: NumberMap = {
  0: 'red',
  1: 'green',
  2: 'blue'
}

// 混合：固定属性 + 索引签名
interface Config {
  name: string                    // 固定属性
  version: number                 // 固定属性
  [key: string]: string | number  // 其他任意属性（类型必须兼容固定属性的类型）
}
```

---

## 3.8 教学 Demo

```ts
// ============================================
// 第3章 Demo：函数与对象类型综合练习
// ============================================

// ---------- 1. 定义用户接口 ----------
interface User {
  id: number
  name: string
  email: string
  age?: number
  readonly registeredAt: string
}

// ---------- 2. 定义 API 响应类型 ----------
type ApiResponse<T> = {
  code: number
  data: T
  message: string
}

// ---------- 3. 函数：创建用户 ----------
function createUser(name: string, email: string, age?: number): User {
  return {
    id: Date.now(),
    name,
    email,
    age,
    registeredAt: new Date().toISOString()
  }
}

// ---------- 4. 函数重载：格式化用户信息 ----------
function formatUser(user: User): string
function formatUser(name: string, email: string): string
function formatUser(userOrName: User | string, email?: string): string {
  if (typeof userOrName === 'string') {
    return `${userOrName} <${email}>`
  }
  return `${userOrName.name} <${userOrName.email}>`
}

const user = createUser('Alice', 'alice@example.com', 25)
console.log(formatUser(user))                    // "Alice <alice@example.com>"
console.log(formatUser('Bob', 'bob@example.com')) // "Bob <bob@example.com>"

// ---------- 5. 接口继承 ----------
interface AdminUser extends User {
  permissions: string[]
}

const admin: AdminUser = {
  id: 1,
  name: 'SuperAdmin',
  email: 'admin@example.com',
  registeredAt: '2026-01-01',
  permissions: ['read', 'write', 'delete']
}

// ---------- 6. 索引签名：动态表单 ----------
interface FormData {
  [fieldName: string]: string | number | boolean
}

const loginForm: FormData = {
  username: 'tom',
  password: '123456',
  rememberMe: true
}

// ---------- 7. 函数类型作为参数 ----------
type FilterFn<T> = (item: T) => boolean

function filterUsers(users: User[], predicate: FilterFn<User>): User[] {
  return users.filter(predicate)
}

const users: User[] = [
  createUser('Alice', 'a@test.com', 25),
  createUser('Bob', 'b@test.com', 17),
  createUser('Charlie', 'c@test.com', 30)
]

const adults = filterUsers(users, (u) => (u.age ?? 0) >= 18)
console.log(adults.length)  // 2
```

---

## 3.9 面试问题与答案

### Q1: interface 和 type 有什么区别？什么时候用哪个？

**答**：核心区别：
1. `interface` 支持声明合并（同名自动合并），`type` 不行
2. `type` 支持联合类型、交叉类型、映射类型、元组等，`interface` 不行
3. `interface` 用 `extends` 继承，`type` 用 `&` 交叉
4. `interface` 只能描述对象形状，`type` 可以给任何类型起别名

选择策略：定义对象结构优先用 `interface`（可扩展性好），其他场景用 `type`。

### Q2: TypeScript 中函数重载是怎么工作的？

**答**：TS 的函数重载分两部分：
1. 重载签名：声明多种调用方式（只有类型，没有实现）
2. 实现签名：包含实际逻辑，参数类型必须兼容所有重载签名

调用时 TS 会从上到下匹配重载签名，找到第一个匹配的就使用。注意：实现签名对外不可见，调用者只能看到重载签名。

### Q3: readonly 和 const 有什么区别？

**答**：
- `const` 用于变量声明，表示变量引用不可变（但对象内部属性可以改）
- `readonly` 用于属性声明，表示属性值不可修改

```ts
const obj = { name: 'Tom' }
obj.name = 'Bob'  // ✅ const 只保证 obj 引用不变

interface User { readonly name: string }
const user: User = { name: 'Tom' }
// user.name = 'Bob'  // ❌ readonly 保证属性不可改
```

### Q4: 可选参数和默认参数有什么区别？

**答**：
- 可选参数 `age?: number`：类型是 `number | undefined`，不传时值为 `undefined`
- 默认参数 `age: number = 18`：不传时使用默认值 18，类型就是 `number`

默认参数不需要 `?`，因为它总有值。可选参数在函数体内需要处理 `undefined` 的情况。

### Q5: 什么是索引签名？有什么限制？

**答**：索引签名允许对象拥有动态的 key，语法是 `[key: string]: ValueType`。

限制：
1. 索引签名的值类型必须兼容所有固定属性的类型
2. 一个接口最多一个字符串索引签名和一个数字索引签名
3. 数字索引的值类型必须是字符串索引值类型的子类型

```ts
interface Dict {
  name: string           // 固定属性
  [key: string]: string  // 索引签名 → name 的类型必须兼容 string
}
```

---

## 3.10 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第3章 知识点总结                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  函数类型：                                               │
│    - 参数类型 + 返回值类型                                 │
│    - 可选参数 (?)、默认参数 (=)、剩余参数 (...)            │
│    - 函数类型表达式：type Fn = (a: T) => R                │
│    - 函数重载：多个签名 + 一个实现                         │
│                                                          │
│  对象类型：                                               │
│    - interface：定义对象形状，支持继承和声明合并            │
│    - type：类型别名，支持联合/交叉/映射等                  │
│    - 可选属性 (?)、只读属性 (readonly)                     │
│    - 索引签名 [key: string]: T                            │
│                                                          │
│  interface vs type：                                      │
│    - 对象结构 → interface                                 │
│    - 联合/交叉/工具类型 → type                            │
│    - 需要声明合并 → interface                              │
│                                                          │
│  最佳实践：                                               │
│    ✅ 函数返回值能推断就不写                                │
│    ✅ 复杂对象用 interface 定义                             │
│    ✅ 回调函数用 type 定义函数类型                          │
│    ❌ 避免过度使用索引签名（丢失类型精确性）                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第2章：基础类型](./chapter02.md)
> 下一章：[第4章：联合类型与类型缩小](./chapter04.md)
