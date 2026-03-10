# 第1章：认识 TypeScript 与环境准备

## 学习目标

- [ ] 理解 TypeScript 和 JavaScript 的关系
- [ ] 理解"编译期类型检查"的价值
- [ ] 能在 Vue3 项目中启用 TypeScript
- [ ] 了解 tsconfig.json 的基础配置
- [ ] 掌握 TS 的开发工作流

---

## 1.1 TypeScript 是什么

### 一句话定义

TypeScript = JavaScript + 静态类型系统。它是 JS 的**超集**，所有合法的 JS 代码都是合法的 TS 代码。

### 类比理解

```text
┌─────────────────────────────────────────────────┐
│                                                 │
│   JavaScript 像"直接上路开车"                     │
│   - 灵活、自由，但容易出事故                       │
│   - 错误只有在运行时才会暴露                       │
│                                                 │
│   TypeScript 像"先考驾照再上路"                    │
│   - 多了一道检查关卡（编译期类型检查）               │
│   - 在你"上路"之前就告诉你哪里有问题                │
│   - 但最终开的还是同一辆车（运行的还是 JS）          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### TS 与 JS 的关系图

```text
┌──────────────────────────────┐
│        TypeScript            │
│  ┌────────────────────────┐  │
│  │      JavaScript        │  │
│  │  (所有JS语法都有效)      │  │
│  └────────────────────────┘  │
│  + 类型注解                   │
│  + 接口 / 泛型 / 枚举         │
│  + 编译期检查                 │
└──────────────────────────────┘
```

关键认知：**TS 不改变 JS 的运行时行为**。类型信息在编译后会被完全擦除，浏览器和 Node.js 运行的始终是纯 JS。

---

## 1.2 为什么需要 TypeScript（编译期类型检查的价值）

### 没有 TS 时的痛点

```js
// JavaScript —— 没有类型约束
function greet(user) {
  return 'Hello, ' + user.name
}

// 调用时传错了参数，JS 不会报错，运行时才炸
greet('Tom')  // ❌ 运行时: Cannot read property 'name' of undefined
```

### 有 TS 时的体验

```ts
// TypeScript —— 编译期就能发现错误
interface User {
  name: string
  age: number
}

function greet(user: User): string {
  return 'Hello, ' + user.name
}

greet('Tom')  // ❌ 编译期报错: 类型"string"不能赋给类型"User"
greet({ name: 'Tom', age: 18 })  // ✅ 正确
```

### 类比：TS 就像"拼写检查器"

```text
┌─────────────────────────────────────────┐
│  Word 文档的拼写检查                      │
│                                         │
│  你打字 → 红色波浪线提示拼写错误            │
│  你修正 → 波浪线消失                      │
│  最终打印 → 打印的是纯文字（没有波浪线）     │
│                                         │
│  TypeScript 的类型检查                    │
│                                         │
│  你写代码 → IDE红色波浪线提示类型错误        │
│  你修正 → 波浪线消失                      │
│  最终编译 → 输出的是纯JS（没有类型信息）     │
└─────────────────────────────────────────┘
```

### TS 的核心价值总结

| 价值 | 说明 |
|------|------|
| 提前发现错误 | 编译期捕获，而非运行时崩溃 |
| 智能提示 | IDE 自动补全、参数提示、跳转定义 |
| 代码即文档 | 类型注解就是最好的接口文档 |
| 重构安全 | 改一个类型，所有引用处自动报错 |
| 团队协作 | 类型约束让多人协作更可靠 |

---

## 1.3 TypeScript 工作流

### 完整工作流图

```text
你写 .ts / .vue (lang="ts") 代码
        │
        ▼
┌─────────────────────┐
│  TypeScript 编译器    │
│  (tsc / Vite 内置)   │
│                     │
│  1. 读取 tsconfig    │
│  2. 解析类型         │
│  3. 检查类型错误      │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
 有错误       无错误
    │           │
    ▼           ▼
 IDE红线      输出 .js
 终端报错        │
                ▼
          浏览器/Node 运行
```

### 在 Vue3 + Vite 项目中的工作流

```text
.vue 文件 (lang="ts")
        │
        ▼
┌─────────────────────────┐
│  Vite 开发服务器          │
│                         │
│  1. esbuild 快速转译 TS   │  ← 开发时：只转译，不做完整类型检查（快）
│  2. 热更新 (HMR)         │
└─────────────────────────┘
        │
        ▼
  浏览器实时预览

同时，IDE (VS Code + Volar) 在后台做类型检查 → 红色波浪线提示
构建时：vue-tsc 做完整类型检查 → 有错误则构建失败
```

---

## 1.4 在 Vue3 项目中启用 TypeScript

### 方式一：新建 TS 项目（推荐）

```bash
# 使用 Vite 创建 Vue3 + TS 项目
npm create vite@latest my-vue-ts -- --template vue-ts

# 进入项目
cd my-vue-ts
npm install
npm run dev
```

### 方式二：在现有 JS 项目中引入 TS

```bash
# 1. 安装 TypeScript 和 Vue 类型检查工具
npm install -D typescript vue-tsc

# 2. 创建 tsconfig.json
npx tsc --init
```

### 将组件改为 TS

```vue
<!-- 改之前：JavaScript -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- 改之后：TypeScript（只需加 lang="ts"） -->
<script setup lang="ts">
import { ref } from 'vue'
const count = ref<number>(0)  // 显式指定泛型类型
</script>
```

### 文件后缀对照

```text
JavaScript          TypeScript
─────────           ──────────
main.js       →     main.ts
utils.js      →     utils.ts
types.js      →     types.ts       （类型定义文件）
xxx.d.ts      →     xxx.d.ts       （声明文件，TS 专有）
*.vue         →     *.vue          （加 lang="ts" 即可）
```

---

## 1.5 tsconfig.json 基础配置

```json
{
  "compilerOptions": {
    // 编译目标：输出的 JS 版本
    "target": "ES2020",

    // 模块系统
    "module": "ESNext",

    // 开启严格模式（强烈推荐）
    "strict": true,

    // 模块解析策略（Vite 项目用 Bundler）
    "moduleResolution": "Bundler",

    // 跳过第三方库的类型检查（加速编译）
    "skipLibCheck": true,

    // 保留 JSX（Vue 需要）
    "jsx": "preserve",

    // 引入的类型声明
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

### 关键配置项类比

```text
tsconfig.json 就像"驾校的考试规则"：

strict: true     → 严格考试，不放水（推荐！）
target: "ES2020" → 考的是 2020 版驾照（输出的 JS 版本）
module: "ESNext" → 用最新的交通规则（模块系统）
skipLibCheck     → 不检查别人的驾照（第三方库），只查自己的
```

---

## 1.6 教学 Demo：第一个 TypeScript 文件

创建 `ts/chapters/demo/ch01-hello.ts`：

```ts
// ============================================
// 第1章 Demo：TypeScript 初体验
// ============================================

// 1. 基本类型注解
let message: string = 'Hello TypeScript!'
let count: number = 42
let isReady: boolean = true

console.log(message, count, isReady)

// 2. 函数类型注解
function add(a: number, b: number): number {
  return a + b
}

console.log(add(1, 2))    // ✅ 输出 3
// console.log(add('1', 2))  // ❌ 编译报错：类型"string"不能赋给类型"number"

// 3. 对象类型（用 interface）
interface User {
  name: string
  age: number
}

function greet(user: User): string {
  return `你好，${user.name}，你今年 ${user.age} 岁`
}

console.log(greet({ name: '小明', age: 18 }))  // ✅
// console.log(greet({ name: '小明' }))          // ❌ 缺少 age 属性

// 4. 数组类型
let fruits: string[] = ['苹果', '香蕉', '橘子']
let scores: number[] = [95, 88, 72]

// 5. 类型推断 —— TS 会自动推断类型，不一定要手动写
let autoString = 'hello'   // TS 自动推断为 string
let autoNumber = 123       // TS 自动推断为 number
// autoString = 123         // ❌ 不能将 number 赋给 string
```

### 在 Vue 组件中的 Demo

```vue
<!-- HelloTS.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

// 带类型的响应式数据
const name = ref<string>('TypeScript')
const count = ref<number>(0)

// 计算属性自动推断返回类型
const greeting = computed(() => `Hello, ${name.value}!`)

// 带类型的函数
function increment(): void {
  count.value++
}
</script>

<template>
  <div>
    <h1>{{ greeting }}</h1>
    <p>计数: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

---

## 1.7 面试问题与答案

### Q1: TypeScript 和 JavaScript 有什么区别？

**答**：TypeScript 是 JavaScript 的超集，主要区别：
1. TS 增加了静态类型系统，在编译期进行类型检查
2. TS 支持接口（interface）、泛型（generics）、枚举（enum）等特性
3. TS 代码需要编译为 JS 才能运行，类型信息在编译后被擦除
4. TS 提供更好的 IDE 支持（自动补全、重构、跳转定义）

核心：TS 不改变 JS 的运行时行为，它只在开发阶段提供类型安全保障。

### Q2: TypeScript 的类型检查发生在什么阶段？运行时还是编译时？

**答**：编译时（compile time）。TS 的类型系统是**静态的**，所有类型检查都在编译阶段完成。编译后输出的 JS 代码中不包含任何类型信息。这意味着：
- 类型错误在写代码时就能发现（IDE 提示 + 编译报错）
- 运行时没有类型检查的性能开销
- 运行时的类型错误（如 API 返回了错误的数据结构）TS 无法捕获

### Q3: 什么是 tsconfig.json？它的作用是什么？

**答**：`tsconfig.json` 是 TypeScript 项目的配置文件，定义了编译选项和项目范围。核心作用：
1. `compilerOptions`：控制编译行为（目标版本、模块系统、严格程度等）
2. `include/exclude`：指定哪些文件参与编译
3. `strict: true`：开启严格模式，包含 `noImplicitAny`、`strictNullChecks` 等子选项

一个项目可以有多个 tsconfig（如 `tsconfig.app.json`、`tsconfig.node.json`），通过 `extends` 继承公共配置。

### Q4: 在 Vue3 项目中如何启用 TypeScript？

**答**：
1. 安装依赖：`npm install -D typescript vue-tsc`
2. 创建 `tsconfig.json` 配置文件
3. 在 `.vue` 文件的 `<script>` 标签上添加 `lang="ts"`
4. 将 `main.js` 改为 `main.ts`
5. 安装 VS Code 的 Volar 扩展获得最佳类型支持

Vite 内置了 TS 支持，开发时用 esbuild 快速转译，构建时用 `vue-tsc` 做完整类型检查。

### Q5: TypeScript 的 strict 模式包含哪些检查？为什么推荐开启？

**答**：`strict: true` 是一个总开关，包含以下子选项：
- `noImplicitAny`：不允许隐式 any 类型
- `strictNullChecks`：null 和 undefined 不能赋给其他类型
- `strictFunctionTypes`：函数参数类型严格检查
- `strictBindCallApply`：bind/call/apply 参数类型检查
- `strictPropertyInitialization`：类属性必须初始化
- `noImplicitThis`：不允许隐式 any 类型的 this
- `alwaysStrict`：每个文件都加 "use strict"

推荐开启的原因：能最大程度发挥 TS 的类型安全优势，避免"写了 TS 但到处是 any"的尴尬局面。

### Q6: TS 编译后的代码和手写的 JS 有什么区别？

**答**：几乎没有区别。TS 编译器做的主要工作是：
1. 擦除所有类型注解（`let x: number = 1` → `let x = 1`）
2. 将高版本语法降级（如果 target 设置较低）
3. 转换模块语法（如果需要）

编译后的 JS 代码是干净的、可读的，不会引入额外的运行时开销。

---

## 1.8 知识点总结

```text
┌─────────────────────────────────────────────────────┐
│              第1章 知识点总结                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. TS = JS + 静态类型系统（超集关系）                  │
│                                                     │
│  2. 类型检查发生在编译期，不影响运行时                   │
│                                                     │
│  3. 编译后类型信息被擦除，输出纯 JS                     │
│                                                     │
│  4. Vue3 启用 TS：                                   │
│     - <script setup lang="ts">                      │
│     - 安装 typescript + vue-tsc                      │
│     - 配置 tsconfig.json                             │
│                                                     │
│  5. tsconfig 关键配置：                               │
│     - strict: true（必开）                            │
│     - target / module / moduleResolution             │
│                                                     │
│  6. 开发工具链：                                      │
│     - Vite（esbuild 转译）                            │
│     - VS Code + Volar（类型提示）                     │
│     - vue-tsc（构建时完整检查）                        │
│                                                     │
│  核心理念：TS 是"开发阶段的安全网"，                    │
│           不是运行时的额外负担                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

> 下一章：[第2章：基础类型](./chapter02.md)
