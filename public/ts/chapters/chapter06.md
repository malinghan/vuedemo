# 第6章：高级类型工具（工程效率提升）

## 学习目标

- [ ] 掌握 `Partial / Required / Pick / Omit / Record` 五大工具类型
- [ ] 掌握 `Exclude / Extract / ReturnType / Parameters`
- [ ] 理解 `keyof` 操作符和索引访问类型 `T[K]`
- [ ] 理解映射类型（Mapped Types）的原理
- [ ] 初步理解条件类型（Conditional Types）
- [ ] 了解模板字面量类型

---

## 6.1 为什么需要工具类型

### 没有工具类型的痛点

```ts
interface User {
  id: number
  name: string
  email: string
  age: number
  avatar: string
}

// 创建用户时，不需要 id（后端生成）
interface CreateUserDTO {
  name: string
  email: string
  age: number
  avatar: string
}

// 更新用户时，所有字段都是可选的
interface UpdateUserDTO {
  name?: string
  email?: string
  age?: number
  avatar?: string
}

// 用户预览，只需要 id 和 name
interface UserPreview {
  id: number
  name: string
}

// 问题：User 改了一个字段，上面三个都要跟着改！
```

### 用工具类型解决

```ts
interface User {
  id: number
  name: string
  email: string
  age: number
  avatar: string
}

type CreateUserDTO = Omit<User, 'id'>           // 去掉 id
type UpdateUserDTO = Partial<Omit<User, 'id'>>  // 去掉 id，其余可选
type UserPreview = Pick<User, 'id' | 'name'>    // 只取 id 和 name

// User 改了字段，这三个自动跟着变！
```

### 类比

```text
工具类型像"照片编辑工具"：

  原图（User）
    │
    ├── Partial  → 加上"半透明"滤镜（所有属性变可选）
    ├── Required → 去掉"半透明"（所有属性变必选）
    ├── Pick     → 裁剪（只保留指定属性）
    ├── Omit     → 遮挡（去掉指定属性）
    └── Record   → 批量生成（按模板批量创建）

  不修改原图，生成新的"编辑版"
```

---

## 6.2 五大核心工具类型

### Partial\<T\> —— 全部变可选

```ts
interface Todo {
  id: number
  title: string
  done: boolean
}

type TodoDraft = Partial<Todo>
// 等价于：
// {
//   id?: number
//   title?: string
//   done?: boolean
// }

// 场景：更新操作，只传需要改的字段
function updateTodo(id: number, updates: Partial<Todo>) {
  // updates 的每个字段都是可选的
}

updateTodo(1, { title: '新标题' })       // ✅
updateTodo(1, { done: true })            // ✅
updateTodo(1, {})                        // ✅
```

### Required\<T\> —— 全部变必选

```ts
interface Config {
  host?: string
  port?: number
  debug?: boolean
}

type StrictConfig = Required<Config>
// 等价于：
// {
//   host: string
//   port: number
//   debug: boolean
// }

// 场景：配置合并后，确保所有字段都有值
function startServer(config: Required<Config>) {
  console.log(`${config.host}:${config.port}`)  // 安全访问，不用判空
}
```

### Pick\<T, K\> —— 只取指定属性

```ts
interface User {
  id: number
  name: string
  email: string
  age: number
}

type UserPreview = Pick<User, 'id' | 'name'>
// 等价于：{ id: number; name: string }

type LoginInfo = Pick<User, 'email'>
// 等价于：{ email: string }
```

### Omit\<T, K\> —— 去掉指定属性

```ts
type CreateUserDTO = Omit<User, 'id'>
// 等价于：{ name: string; email: string; age: number }

type PublicUser = Omit<User, 'email' | 'age'>
// 等价于：{ id: number; name: string }
```

### Record\<K, V\> —— 批量生成键值对

```ts
// 以 string 为 key，User 为 value
type UserMap = Record<string, User>

const users: UserMap = {
  'u1': { id: 1, name: 'Tom', email: 't@t.com', age: 18 },
  'u2': { id: 2, name: 'Bob', email: 'b@b.com', age: 20 }
}

// 以联合类型为 key
type Theme = 'light' | 'dark'
type ThemeColors = Record<Theme, { bg: string; text: string }>

const colors: ThemeColors = {
  light: { bg: '#fff', text: '#333' },
  dark: { bg: '#1a1a1a', text: '#eee' }
}
```

### 五大工具类型图示

```text
原类型 User: { id: number; name: string; email: string; age: number }

Partial<User>           → { id?: number; name?: string; email?: string; age?: number }
Required<User>          → { id: number; name: string; email: string; age: number }
Pick<User, 'id'|'name'> → { id: number; name: string }
Omit<User, 'email'>     → { id: number; name: string; age: number }
Record<'a'|'b', User>   → { a: User; b: User }
```

---

## 6.3 其他常用工具类型

### Exclude\<T, U\> —— 从联合类型中排除

```ts
type Status = 'loading' | 'success' | 'error' | 'idle'

type ActiveStatus = Exclude<Status, 'idle'>
// 'loading' | 'success' | 'error'

type NonError = Exclude<Status, 'error' | 'loading'>
// 'success' | 'idle'
```

### Extract\<T, U\> —— 从联合类型中提取

```ts
type NumOrStr = Extract<string | number | boolean, string | number>
// string | number
```

### ReturnType\<T\> —— 获取函数返回值类型

```ts
function createUser() {
  return { id: 1, name: 'Tom', role: 'admin' as const }
}

type User = ReturnType<typeof createUser>
// { id: number; name: string; role: 'admin' }

// 场景：第三方库的函数，不知道返回什么类型
```

### Parameters\<T\> —— 获取函数参数类型

```ts
function login(username: string, password: string, remember: boolean) {
  // ...
}

type LoginParams = Parameters<typeof login>
// [string, string, boolean]

type FirstParam = LoginParams[0]  // string
```

### NonNullable\<T\> —— 排除 null 和 undefined

```ts
type MaybeString = string | null | undefined
type DefiniteString = NonNullable<MaybeString>
// string
```

---

## 6.4 keyof 与索引访问类型

### keyof —— 获取所有属性名

```ts
interface User {
  id: number
  name: string
  age: number
}

type UserKey = keyof User  // 'id' | 'name' | 'age'

// 配合泛型使用
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user: User = { id: 1, name: 'Tom', age: 18 }
const name = getValue(user, 'name')  // 类型: string
const age = getValue(user, 'age')    // 类型: number
```

### 索引访问类型 T[K]

```ts
type UserName = User['name']       // string
type UserId = User['id']           // number
type UserNameOrAge = User['name' | 'age']  // string | number
```

### 图示

```text
interface User {
  id: number
  name: string
  age: number
}

keyof User → 'id' | 'name' | 'age'    （所有 key 的联合）

User['id']   → number                  （取某个 key 的值类型）
User['name'] → string
User['name' | 'age'] → string | number （取多个 key 的值类型联合）
```

---

## 6.5 映射类型（Mapped Types）

映射类型 = 遍历 key + 变换 value，生成新类型。

### 原理

```ts
// Partial 的实现原理
type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

// 解读：
// [K in keyof T]  → 遍历 T 的每个 key
// ?:              → 加上可选标记
// T[K]            → 保持原来的值类型
```

### 图示

```text
原类型: { name: string; age: number }
         │
         ▼
[K in keyof T]?: T[K]
         │
         ├── K = 'name' → name?: string
         ├── K = 'age'  → age?: number
         │
         ▼
结果: { name?: string; age?: number }
```

### 自定义映射类型

```ts
// 所有属性变为只读
type Readonly2<T> = {
  readonly [K in keyof T]: T[K]
}

// 所有属性值变为 string
type Stringify<T> = {
  [K in keyof T]: string
}

// 所有属性值包装为 Promise
type Promisify<T> = {
  [K in keyof T]: Promise<T[K]>
}

interface User { name: string; age: number }

type StringUser = Stringify<User>
// { name: string; age: string }

type AsyncUser = Promisify<User>
// { name: Promise<string>; age: Promise<number> }
```

---

## 6.6 条件类型（Conditional Types）入门

条件类型 = 类型层面的三元表达式。

```ts
// 语法：T extends U ? X : Y
// 含义：如果 T 满足 U 的约束，则类型为 X，否则为 Y

type IsString<T> = T extends string ? 'yes' : 'no'

type A = IsString<string>   // 'yes'
type B = IsString<number>   // 'no'
type C = IsString<'hello'>  // 'yes'（字面量 'hello' 满足 string）
```

### infer 关键字

```ts
// infer 用于在条件类型中"提取"某个类型
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type A = GetReturnType<() => string>           // string
type B = GetReturnType<(x: number) => boolean> // boolean

// 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never

type C = ElementOf<string[]>   // string
type D = ElementOf<number[]>   // number
```

---

## 6.7 模板字面量类型

```ts
// 模板字面量类型：在类型层面拼接字符串
type EventName = `on${Capitalize<'click' | 'focus' | 'blur'>}`
// 'onClick' | 'onFocus' | 'onBlur'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type ApiPath = '/users' | '/todos'
type ApiRoute = `${HttpMethod} ${ApiPath}`
// 'GET /users' | 'GET /todos' | 'POST /users' | 'POST /todos' | ...
```

---

## 6.8 教学 Demo

```ts
// ============================================
// 第6章 Demo：高级类型工具综合练习
// ============================================

// ---------- 1. 实际业务中的工具类型组合 ----------
interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
  createdAt: string
  updatedAt: string
}

// 创建商品：不需要 id 和时间戳
type CreateProductDTO = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

// 更新商品：所有字段可选，但不能改 id
type UpdateProductDTO = Partial<Omit<Product, 'id'>>

// 商品列表项：只需要关键信息
type ProductListItem = Pick<Product, 'id' | 'name' | 'price' | 'category'>

// 商品分类映射
type CategoryMap = Record<string, ProductListItem[]>

// ---------- 2. 自定义工具类型 ----------

// 将指定属性变为可选，其余保持不变
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type UserWithOptionalAge = PartialBy<
  { id: number; name: string; age: number },
  'age'
>
// { id: number; name: string; age?: number }

// 将指定属性变为必选，其余保持不变
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

// ---------- 3. 深层 Partial ----------
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

interface NestedConfig {
  server: {
    host: string
    port: number
  }
  database: {
    url: string
    pool: {
      min: number
      max: number
    }
  }
}

// 所有层级都变为可选
type PartialConfig = DeepPartial<NestedConfig>
const config: PartialConfig = {
  server: { port: 3000 }  // ✅ host 可以不传
}

// ---------- 4. 条件类型实战 ----------

// 提取对象中值为 string 类型的 key
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

interface Mixed {
  name: string
  age: number
  email: string
  isAdmin: boolean
}

type MixedStringKeys = StringKeys<Mixed>  // 'name' | 'email'
```

---

## 6.9 面试问题与答案

### Q1: Partial 和 Required 的实现原理是什么？

**答**：它们都是映射类型：
```ts
type Partial<T> = { [K in keyof T]?: T[K] }    // 遍历所有 key，加 ?
type Required<T> = { [K in keyof T]-?: T[K] }   // 遍历所有 key，去 ?（-? 表示移除可选）
```
核心是 `[K in keyof T]` 遍历所有属性名，`?` 或 `-?` 控制可选性，`T[K]` 保持原值类型。

### Q2: Pick 和 Omit 有什么区别？什么时候用哪个？

**答**：
- `Pick<T, K>`：从 T 中选取指定的属性（白名单）
- `Omit<T, K>`：从 T 中排除指定的属性（黑名单）

选择策略：需要的属性少 → 用 Pick；需要排除的属性少 → 用 Omit。

### Q3: keyof 和 typeof 在类型层面有什么作用？

**答**：
- `keyof T`：获取类型 T 的所有属性名，返回字符串字面量联合类型
- `typeof value`：获取值的类型（将运行时的值转为编译时的类型）

```ts
const user = { name: 'Tom', age: 18 }
type UserType = typeof user        // { name: string; age: number }
type UserKeys = keyof typeof user  // 'name' | 'age'
```

### Q4: 什么是条件类型？infer 关键字有什么用？

**答**：条件类型是类型层面的三元表达式：`T extends U ? X : Y`。

`infer` 用于在条件类型中声明一个待推断的类型变量：
```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
```
这里 `infer R` 表示"如果 T 是函数类型，把返回值类型提取出来赋给 R"。

### Q5: 如何实现一个 DeepReadonly 类型？

**答**：
```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]                    // 函数保持原样
      : DeepReadonly<T[K]>      // 对象递归处理
    : T[K]                      // 基本类型直接 readonly
}
```
核心思路：映射类型 + 条件类型 + 递归。对每个属性加 readonly，如果值是对象则递归处理。

---

## 6.10 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第6章 知识点总结                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  五大核心工具类型：                                        │
│    Partial<T>    → 全部可选                               │
│    Required<T>   → 全部必选                               │
│    Pick<T, K>    → 选取指定属性                            │
│    Omit<T, K>    → 排除指定属性                            │
│    Record<K, V>  → 批量生成键值对                          │
│                                                          │
│  其他工具类型：                                            │
│    Exclude / Extract → 联合类型的排除/提取                 │
│    ReturnType / Parameters → 函数类型的提取                │
│    NonNullable → 排除 null 和 undefined                   │
│                                                          │
│  底层机制：                                               │
│    keyof T       → 获取属性名联合类型                      │
│    T[K]          → 索引访问，获取属性值类型                 │
│    映射类型       → [K in keyof T]: ...                    │
│    条件类型       → T extends U ? X : Y                   │
│    infer         → 条件类型中提取子类型                     │
│                                                          │
│  最佳实践：                                               │
│    ✅ 用工具类型复用，避免重复定义                          │
│    ✅ 组合使用：Partial<Omit<T, 'id'>>                    │
│    ✅ 自定义工具类型封装常用模式                            │
│    ❌ 避免过度嵌套，保持可读性                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第5章：泛型](./chapter05.md)
> 下一章：[第7章：类与面向对象](./chapter07.md)
