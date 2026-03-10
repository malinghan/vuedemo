# 第2章：基础类型（最核心入门）

## 学习目标

- [ ] 掌握 `number / string / boolean` 三大基本类型
- [ ] 理解 `array / tuple / enum` 的用法
- [ ] 区分 `any / unknown / never / void` 四个特殊类型
- [ ] 理解类型推断（Type Inference）
- [ ] 掌握类型断言（Type Assertion）

---

## 2.1 基本类型

### 三大基础类型

```ts
// number —— 所有数字（整数、浮点、十六进制等）
let age: number = 18
let price: number = 9.99
let hex: number = 0xff

// string —— 字符串（支持模板字符串）
let userName: string = 'Tom'
let greeting: string = `Hello, ${userName}`

// boolean —— 布尔值
let isAdmin: boolean = false
let isReady: boolean = true
```

### 类比理解

```text
类型就像"容器的标签"：

  ┌──────────┐   ┌──────────┐   ┌──────────┐
  │  number  │   │  string  │   │ boolean  │
  │          │   │          │   │          │
  │  18      │   │  "Tom"   │   │  true    │
  │  3.14    │   │  "hello" │   │  false   │
  │  0xff    │   │  `hi`    │   │          │
  └──────────┘   └──────────┘   └──────────┘

  贴了 number 标签的容器，只能放数字
  贴了 string 标签的容器，只能放字符串
  放错了东西 → 编译器立刻报错
```

### null 和 undefined

```ts
// 在 strict 模式下，null 和 undefined 是独立类型
let n: null = null
let u: undefined = undefined

// 不能把 null 赋给 string（strict 模式下）
// let name: string = null  // ❌ 报错

// 如果允许为空，用联合类型
let name: string | null = null
name = 'Tom'  // ✅
```

---

## 2.2 数组类型

两种写法，效果完全一样：

```ts
// 写法一：类型[]（推荐，更简洁）
let fruits: string[] = ['苹果', '香蕉', '橘子']
let scores: number[] = [95, 88, 72]

// 写法二：Array<类型>（泛型写法）
let tags: Array<string> = ['vue', 'ts', 'vite']
let ids: Array<number> = [1, 2, 3]

// 数组操作也受类型约束
fruits.push('西瓜')    // ✅
// fruits.push(123)    // ❌ number 不能放进 string[]
```

---

## 2.3 元组（Tuple）

元组 = 固定长度 + 固定类型顺序的数组。

```ts
// 元组：第一个是 number，第二个是 string
let httpResult: [number, string] = [200, 'ok']

// 访问元素有类型提示
httpResult[0].toFixed()     // ✅ number 方法
httpResult[1].toUpperCase() // ✅ string 方法

// 不能越界或类型错误
// httpResult[0] = 'abc'    // ❌ 类型错误
// httpResult[2]            // ❌ 越界访问
```

### 元组 vs 数组 类比

```text
数组 string[]  像"一箱同款饮料"  → 每瓶都是同一种
元组 [A, B]    像"套餐组合"      → 第一个是汉堡，第二个是可乐，顺序固定

  数组: [ 🍎, 🍎, 🍎, 🍎 ]     全是苹果
  元组: [ 🍔, 🥤 ]              汉堡 + 可乐，不能反
```

### 实际应用场景

```ts
// React 的 useState 返回的就是元组
// const [count, setCount] = useState(0)
// 类型是 [number, (n: number) => void]

// 坐标
type Point = [number, number]
const origin: Point = [0, 0]

// 键值对
type Entry = [string, number]
const score: Entry = ['数学', 95]
```

---

## 2.4 枚举（Enum）

枚举用于定义一组命名常量。

### 字符串枚举（推荐）

```ts
enum Role {
  Visitor = 'visitor',
  Editor = 'editor',
  Admin = 'admin'
}

const myRole: Role = Role.Editor
console.log(myRole)  // 'editor'

// 用在条件判断中
function checkPermission(role: Role): string {
  switch (role) {
    case Role.Admin:
      return '完全权限'
    case Role.Editor:
      return '编辑权限'
    case Role.Visitor:
      return '只读权限'
  }
}
```

### 数字枚举

```ts
enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3
}

// 数字枚举可以自动递增
enum Status {
  Pending,   // 0
  Active,    // 1
  Disabled   // 2
}
```

### 枚举 vs 联合字面量

```ts
// 方式一：枚举
enum Color { Red = 'red', Green = 'green', Blue = 'blue' }

// 方式二：联合字面量类型（更轻量，推荐用于简单场景）
type Color2 = 'red' | 'green' | 'blue'

// 实际开发中，简单场景用联合字面量，复杂场景用枚举
```

---

## 2.5 特殊类型：any / unknown / never / void

这四个类型是面试高频考点，也是理解 TS 类型系统的关键。

### 类比总览

```text
┌──────────────────────────────────────────────────────────┐
│                    TS 特殊类型类比                         │
├──────────┬───────────────────────────────────────────────┤
│  any     │ 保安直接放行，谁都能进（完全不检查）              │
│  unknown │ 先验明身份再放行（安全的"不确定"）                │
│  void    │ 空房间，什么都没有（函数无返回值）                │
│  never   │ 黑洞，永远不会有东西出来（永远不会到达的类型）     │
└──────────┴───────────────────────────────────────────────┘
```

### any —— 逃生舱（尽量避免）

```ts
let v1: any = 'hello'
v1 = 123        // ✅ 不报错
v1 = true       // ✅ 不报错
v1.foo.bar      // ✅ 不报错（但运行时可能炸）

// any 相当于关闭了类型检查
// 用了 any 就等于回到了 JavaScript
```

### unknown —— 安全的 any

```ts
let v2: unknown = 'hello'

// 不能直接使用 unknown 类型的值
// v2.toUpperCase()  // ❌ 报错：对象类型为 unknown

// 必须先"验明身份"（类型缩小）才能使用
if (typeof v2 === 'string') {
  console.log(v2.toUpperCase())  // ✅ 此时 TS 知道 v2 是 string
}
```

### any vs unknown 对比图

```text
         any                          unknown
          │                              │
          ▼                              ▼
   ┌─────────────┐              ┌──────────────┐
   │  直接放行    │              │  先检查身份    │
   │  不做任何    │              │              │
   │  类型检查    │              │  typeof?     │
   │             │              │  instanceof? │
   │  ⚠️ 危险    │              │  类型守卫?    │
   └──────┬──────┘              └──────┬───────┘
          │                            │
          ▼                            ▼
   随便调用方法                   确认类型后才能操作
   运行时可能崩溃                 编译期就安全
```

### void —— 无返回值

```ts
// 函数没有返回值时，返回类型是 void
function log(msg: string): void {
  console.log(msg)
  // 没有 return，或 return undefined
}

// void 变量只能赋值 undefined
let v: void = undefined
```

### never —— 永远不会发生

```ts
// 1. 抛出异常的函数（永远不会正常返回）
function throwError(msg: string): never {
  throw new Error(msg)
}

// 2. 无限循环（永远不会结束）
function infiniteLoop(): never {
  while (true) {}
}

// 3. 穷尽检查（最实用的场景）
type Shape = 'circle' | 'square' | 'triangle'

function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return Math.PI * 10 * 10
    case 'square':
      return 10 * 10
    case 'triangle':
      return (10 * 10) / 2
    default:
      // 如果所有 case 都覆盖了，shape 的类型就是 never
      const _exhaustive: never = shape
      return _exhaustive
  }
}
```

### 四种特殊类型关系图

```text
                    所有类型
                       │
          ┌────────────┼────────────┐
          │            │            │
         any        unknown       其他具体类型
      (顶部类型)    (顶部类型)    (string, number...)
      可赋给任何    需要缩小后         │
      类型         才能使用           │
                                    │
                                  void
                              (undefined 子集)
                                    │
                                    │
                                  never
                              (底部类型)
                           (是所有类型的子类型)
```

---

## 2.6 类型推断（Type Inference）

TS 很聪明，很多时候不需要手动写类型。

```ts
// TS 自动推断类型
let name = 'Tom'       // 推断为 string
let age = 18           // 推断为 number
let isOk = true        // 推断为 boolean
let list = [1, 2, 3]   // 推断为 number[]

// 函数返回值也能推断
function add(a: number, b: number) {
  return a + b  // 返回值自动推断为 number
}

// 什么时候需要手动写类型？
// 1. 变量声明时没有初始值
let score: number       // 必须写，否则是 any
score = 95

// 2. 函数参数（必须写）
function greet(name: string) { /* ... */ }

// 3. 复杂对象（推荐写，提高可读性）
interface User { name: string; age: number }
const user: User = { name: 'Tom', age: 18 }
```

### 推断原则

```text
能推断的 → 不写（简洁）
不能推断的 → 必须写（参数、无初始值的变量）
复杂结构 → 建议写（提高可读性和安全性）
```

---

## 2.7 类型断言（Type Assertion）

类型断言 = 告诉编译器"我比你更了解这个值的类型"。

```ts
// 场景：从 DOM 获取元素
const input = document.getElementById('myInput')
// TS 推断为 HTMLElement | null

// 你知道它一定是 input 元素，用断言告诉 TS
const inputEl = document.getElementById('myInput') as HTMLInputElement
console.log(inputEl.value)  // ✅ 可以访问 value 属性

// 另一种写法（不推荐，在 JSX 中有歧义）
const inputEl2 = <HTMLInputElement>document.getElementById('myInput')
```

### 断言的注意事项

```ts
// ⚠️ 断言不是类型转换！它不会改变运行时的值
let str: any = 'hello'
let num: number = str as number  // 编译通过，但 num 实际还是 'hello'

// ⚠️ 不能做"不合理"的断言
// let n: number = 'hello' as number  // ❌ 报错

// 如果非要强制断言，可以用 as unknown as（双重断言，极不推荐）
let n: number = 'hello' as unknown as number  // 编译通过，但很危险
```

### 类比

```text
类型断言像"签免责声明"：

  你对编译器说："这个值的类型我来负责，你别管了"
  编译器说："好吧，出了问题你自己兜着"

  所以：断言用得越少越好，能用类型缩小就不用断言
```

---

## 2.8 教学 Demo

```ts
// ============================================
// 第2章 Demo：基础类型综合练习
// ============================================

// ---------- 1. 基本类型 ----------
let productName: string = 'MacBook Pro'
let productPrice: number = 9999
let inStock: boolean = true

// ---------- 2. 数组 ----------
let colors: string[] = ['红', '绿', '蓝']
let primes: number[] = [2, 3, 5, 7, 11]

// ---------- 3. 元组 ----------
type ApiResult = [number, string, boolean]
let result: ApiResult = [200, '成功', true]

// ---------- 4. 枚举 ----------
enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled'
}

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.Pending]: '待付款',
    [OrderStatus.Paid]: '已付款',
    [OrderStatus.Shipped]: '已发货',
    [OrderStatus.Delivered]: '已送达',
    [OrderStatus.Cancelled]: '已取消'
  }
  return labels[status]
}

console.log(getStatusLabel(OrderStatus.Shipped))  // '已发货'

// ---------- 5. any vs unknown ----------
function parseJSON(jsonStr: string): unknown {
  return JSON.parse(jsonStr)
}

const data = parseJSON('{"name": "Tom", "age": 18}')

// 使用前必须类型缩小
if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log((data as { name: string }).name)
}

// ---------- 6. never 穷尽检查 ----------
type Theme = 'light' | 'dark' | 'auto'

function getBackground(theme: Theme): string {
  switch (theme) {
    case 'light':
      return '#ffffff'
    case 'dark':
      return '#1a1a1a'
    case 'auto':
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? '#1a1a1a'
        : '#ffffff'
    default:
      const _check: never = theme  // 确保所有情况都处理了
      return _check
  }
}

// ---------- 7. 类型推断 ----------
let inferred = '自动推断为 string'  // 不需要写 : string
let nums = [1, 2, 3]               // 自动推断为 number[]
let mixed = [1, 'two', true]       // 自动推断为 (string | number | boolean)[]
```

---

## 2.9 面试问题与答案

### Q1: any 和 unknown 有什么区别？什么时候用 unknown？

**答**：
- `any`：完全跳过类型检查，可以赋给任何类型，也可以调用任何方法。相当于回到 JS。
- `unknown`：类型安全的"不确定类型"。赋值给 unknown 变量没问题，但使用前必须通过类型缩小（typeof / instanceof / 类型守卫）确认具体类型。

使用场景：当你不确定一个值的类型时（如 JSON.parse 的返回值、第三方库的回调参数），用 `unknown` 而不是 `any`，强制自己在使用前做类型检查。

### Q2: never 类型有什么实际用途？

**答**：三个主要用途：
1. 表示永远不会返回的函数（抛异常、无限循环）
2. 穷尽检查（exhaustive check）：在 switch 的 default 分支中，如果所有 case 都覆盖了，变量类型会被收窄为 never。如果后续新增了联合类型成员但忘记加 case，编译器会报错。
3. 条件类型中过滤不需要的类型（如 `Exclude<T, U>` 的实现原理）。

### Q3: 元组和数组有什么区别？

**答**：
- 数组 `T[]`：长度不固定，每个元素类型相同
- 元组 `[A, B, C]`：长度固定，每个位置的类型可以不同

元组适合表示"固定结构的数据组合"，如坐标 `[number, number]`、键值对 `[string, any]`、React 的 `useState` 返回值 `[T, SetStateAction<T>]`。

### Q4: const 声明的变量，TS 推断的类型和 let 有什么不同？

**答**：
```ts
let a = 'hello'    // 类型推断为 string（宽类型）
const b = 'hello'  // 类型推断为 'hello'（字面量类型，窄类型）

let n = 42          // number
const m = 42        // 42（字面量类型）
```
`const` 声明的变量不可重新赋值，所以 TS 会推断为更精确的字面量类型。这在需要精确类型匹配时很有用（如函数参数要求字面量类型）。

### Q5: 枚举（enum）和联合字面量类型（union literal）怎么选？

**答**：
- 联合字面量 `type Status = 'a' | 'b' | 'c'`：更轻量，编译后不产生额外代码，适合简单场景
- 枚举 `enum Status { A, B, C }`：编译后会生成一个对象，支持反向映射（数字枚举），适合需要遍历所有值或需要运行时访问的场景

实际开发建议：优先用联合字面量类型，只在需要运行时枚举值集合时才用 enum。

### Q6: 类型断言（as）和类型声明（: Type）有什么区别？

**答**：
- 类型声明 `let x: string = value`：在赋值时检查 value 是否兼容 string，不兼容则报错
- 类型断言 `value as string`：告诉编译器"我确定这是 string"，编译器信任你，不做严格检查

类型声明更安全（编译器主动检查），类型断言是"开发者承诺"（编译器被动信任）。应优先使用类型声明和类型缩小，断言作为最后手段。

---

## 2.10 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第2章 知识点总结                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  基本类型：number / string / boolean / null / undefined   │
│                                                          │
│  复合类型：                                               │
│    - 数组：string[] 或 Array<string>                      │
│    - 元组：[number, string]（固定长度+固定类型）            │
│    - 枚举：enum Role { Admin = 'admin' }                  │
│                                                          │
│  特殊类型：                                               │
│    - any     → 关闭类型检查（尽量避免）                     │
│    - unknown → 安全的不确定类型（使用前必须缩小）            │
│    - void    → 函数无返回值                                │
│    - never   → 永远不会发生的类型（穷尽检查）               │
│                                                          │
│  类型推断：TS 自动推断，能省则省                            │
│  类型断言：as 语法，慎用，优先用类型缩小                     │
│                                                          │
│  最佳实践：                                               │
│    ✅ 用 unknown 代替 any                                 │
│    ✅ 用联合字面量代替简单枚举                              │
│    ✅ 利用类型推断减少冗余注解                              │
│    ✅ 用 never 做穷尽检查                                  │
│    ❌ 避免滥用 any 和 as 断言                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第1章：认识TypeScript与环境准备](./chapter01.md)
> 下一章：[第3章：函数与对象类型](./chapter03.md)
