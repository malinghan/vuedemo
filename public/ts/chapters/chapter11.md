# 第11章：工程化配置与 JS -> TS 迁移策略

## 学习目标

- [ ] 理解 `tsconfig.json` 关键配置项
- [ ] 掌握 `strict` 模式下的各个子选项
- [ ] 了解 Vue 项目的 tsconfig 推荐配置
- [ ] 掌握渐进式迁移策略（分阶段）
- [ ] 能处理常见迁移问题
- [ ] 了解 ESLint + TypeScript 配置

---

## 11.1 tsconfig.json 全面解读

### 类比

```text
tsconfig.json 像"驾校考试规则"：

  ┌─────────────────────────────────────────────┐
  │  target        → 考哪个版本的驾照（ES2020）   │
  │  module        → 用什么交通规则（ESNext）      │
  │  strict        → 考试严不严格（true = 严格）   │
  │  include       → 哪些学员参加考试（src/**）    │
  │  exclude       → 哪些学员免考（node_modules）  │
  │  skipLibCheck  → 不查别人的驾照（第三方库）     │
  └─────────────────────────────────────────────┘
```

### 关键配置项详解

```json
{
  "compilerOptions": {
    // ========== 编译目标 ==========
    "target": "ES2020",
    // 输出的 JS 版本。ES2020 覆盖现代浏览器，支持可选链、空值合并等

    "module": "ESNext",
    // 模块系统。ESNext = 使用最新的 ES Module 语法

    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    // 可用的类型声明库。DOM 提供 document/window 等类型

    // ========== 严格模式 ==========
    "strict": true,
    // 总开关，开启以下所有严格检查（强烈推荐）

    // strict 包含的子选项：
    // "noImplicitAny": true,           不允许隐式 any
    // "strictNullChecks": true,        null/undefined 不能赋给其他类型
    // "strictFunctionTypes": true,     函数参数类型严格检查
    // "strictBindCallApply": true,     bind/call/apply 参数检查
    // "strictPropertyInitialization": true,  类属性必须初始化
    // "noImplicitThis": true,          不允许隐式 any 的 this
    // "alwaysStrict": true,            每个文件加 "use strict"

    // ========== 模块解析 ==========
    "moduleResolution": "Bundler",
    // Vite/Webpack 项目用 Bundler，纯 Node 项目用 Node/NodeNext

    "resolveJsonModule": true,
    // 允许 import JSON 文件

    "isolatedModules": true,
    // 确保每个文件可以独立编译（Vite 需要）

    // ========== 路径别名 ==========
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    // 配合 Vite 的 resolve.alias 使用

    // ========== 输出控制 ==========
    "noEmit": true,
    // 不输出编译结果（Vite 负责编译，TS 只做类型检查）

    "skipLibCheck": true,
    // 跳过 .d.ts 文件的类型检查（加速编译）

    // ========== JSX ==========
    "jsx": "preserve",
    // 保留 JSX，交给 Vite 处理

    // ========== 类型声明 ==========
    "types": ["vite/client"]
    // 自动引入的类型声明
  },

  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

### strict 子选项图示

```text
strict: true（总开关）
    │
    ├── noImplicitAny
    │   → let x;  ❌ x 是隐式 any
    │   → let x: number;  ✅
    │
    ├── strictNullChecks
    │   → let s: string = null;  ❌
    │   → let s: string | null = null;  ✅
    │
    ├── strictFunctionTypes
    │   → 函数参数类型必须精确匹配（逆变检查）
    │
    ├── strictBindCallApply
    │   → fn.call(null, 'wrong type')  ❌ 参数类型检查
    │
    ├── strictPropertyInitialization
    │   → class A { name: string }  ❌ 未初始化
    │   → class A { name: string = '' }  ✅
    │
    ├── noImplicitThis
    │   → function() { this.x }  ❌ this 是隐式 any
    │
    └── alwaysStrict
        → 每个文件自动加 "use strict"
```

---

## 11.2 Vue3 项目推荐 tsconfig

### 多配置文件结构

```text
项目根目录/
├── tsconfig.json          ← 总配置（引用子配置）
├── tsconfig.app.json      ← 应用代码配置
└── tsconfig.node.json     ← Node 端配置（vite.config.ts 等）
```

### tsconfig.json（总配置）

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### tsconfig.app.json（应用代码）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "skipLibCheck": true,
    "jsx": "preserve",
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "env.d.ts"]
}
```

### tsconfig.node.json（Node 端）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 11.3 渐进式迁移策略

### 类比：旧城改造

```text
┌─────────────────────────────────────────────────────┐
│  JS → TS 迁移 = 旧城改造                             │
│                                                     │
│  ❌ 推倒重来（风险高、周期长、业务停摆）                │
│  ✅ 分街区施工（模块化迁移、业务不停）                  │
│                                                     │
│  施工顺序：                                          │
│  1. 先修主干道（核心类型定义）                         │
│  2. 再改商业区（公共组件）                             │
│  3. 最后改居民区（业务页面）                           │
│                                                     │
│  全程不断水断电（项目始终可运行）                       │
└─────────────────────────────────────────────────────┘
```

### 四阶段迁移路线

```text
阶段1：基础设施（1-2天）
  │
  │  ✅ 安装 typescript、vue-tsc
  │  ✅ 创建 tsconfig.json
  │  ✅ 添加 env.d.ts、shims-vue.d.ts
  │  ✅ main.js → main.ts
  │  ✅ 开启 allowJs: true（允许 JS/TS 共存）
  │
  ▼
阶段2：类型层（3-5天）
  │
  │  ✅ 创建 src/types/ 目录
  │  ✅ 定义核心业务类型（User、Todo、Order...）
  │  ✅ 定义 API 响应类型（ApiResponse<T>）
  │  ✅ API 请求函数加类型（api/*.ts）
  │
  ▼
阶段3：组件层（1-2周）
  │
  │  ✅ 公共组件加 lang="ts"
  │  ✅ defineProps<T> + defineEmits<T>
  │  ✅ 自定义 Hook 加泛型
  │  ✅ 工具函数迁移为 .ts
  │
  ▼
阶段4：页面层（持续进行）
  │
  │  ✅ 新页面直接用 TS
  │  ✅ 旧页面改动时顺便迁移
  │  ✅ 逐步关闭 allowJs
  │  ✅ 最终目标：strict: true，零 any
```

### allowJs 与 checkJs

```json
{
  "compilerOptions": {
    "allowJs": true,
    // 允许 TS 项目中混用 .js 文件（迁移过渡期必须开启）

    "checkJs": false
    // 是否对 .js 文件做类型检查
    // 迁移初期建议 false，后期可以开启
  }
}
```

---

## 11.4 常见迁移问题与解决方案

### 问题1：大量隐式 any

```ts
// 迁移前（JS）
function process(data) {  // data 是隐式 any
  return data.map(item => item.name)
}

// 迁移后（TS）
interface Item {
  name: string
}

function process(data: Item[]): string[] {
  return data.map(item => item.name)
}
```

### 问题2：第三方库没有类型

```ts
// 方案1：安装 @types 包
// npm install -D @types/lodash

// 方案2：手写声明文件
// src/types/legacy-lib.d.ts
declare module 'legacy-lib' {
  export function doSomething(input: string): void
}

// 方案3：临时跳过（不推荐，但迁移初期可用）
// src/types/shims.d.ts
declare module 'untyped-lib'  // 类型为 any
```

### 问题3：Vue 组件导入报错

```ts
// 确保有 shims-vue.d.ts
// src/env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

### 问题4：reactive 解构丢失响应式

```ts
// ❌ 错误：解构后丢失响应式
const state = reactive({ count: 0, name: 'Tom' })
const { count, name } = state  // count 和 name 不再是响应式

// ✅ 方案1：用 toRefs
import { toRefs } from 'vue'
const { count, name } = toRefs(state)  // 保持响应式

// ✅ 方案2：直接用 ref
const count = ref(0)
const name = ref('Tom')
```

### 问题5：as 断言滥用

```ts
// ❌ 不好：到处用 as 断言
const data = response.data as User[]

// ✅ 更好：在 API 层定义返回类型
async function fetchUsers(): Promise<ApiResponse<User[]>> {
  const res = await fetch('/api/users')
  return res.json()
}
// 调用处自动有类型，不需要断言
const { data } = await fetchUsers()  // data: User[]
```

---

## 11.5 ESLint + TypeScript 配置

```bash
# 安装依赖
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 推荐的 ESLint 规则

```js
// eslint.config.js (Flat Config)
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // 禁止使用 any
      '@typescript-eslint/no-explicit-any': 'warn',

      // 要求函数返回值类型
      '@typescript-eslint/explicit-function-return-type': 'off',

      // 优先使用 import type
      '@typescript-eslint/consistent-type-imports': 'error',

      // 禁止未使用的变量
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_'
      }],

      // 禁止非空断言 (!)
      '@typescript-eslint/no-non-null-assertion': 'warn'
    }
  }
]
```

---

## 11.6 教学 Demo：迁移一个 JS 组件

### 迁移前（JavaScript）

```vue
<!-- UserCard.vue（JS 版本） -->
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  showAge: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete'])

const isExpanded = ref(false)

const displayName = computed(() => {
  return props.user.name.toUpperCase()
})

function handleEdit() {
  emit('edit', props.user.id)
}

function handleDelete() {
  emit('delete', props.user.id)
}
</script>
```

### 迁移后（TypeScript）

```vue
<!-- UserCard.vue（TS 版本） -->
<script setup lang="ts">
import { ref, computed } from 'vue'

// 1. 定义类型
interface User {
  id: number
  name: string
  age: number
  email: string
}

// 2. Props 类型化
interface Props {
  user: User
  showAge?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAge: false
})

// 3. Emits 类型化
const emit = defineEmits<{
  edit: [id: number]
  delete: [id: number]
}>()

// 4. 响应式数据有类型
const isExpanded = ref(false)

// 5. 计算属性自动推断
const displayName = computed(() => {
  return props.user.name.toUpperCase()
})

// 6. 方法参数有类型约束
function handleEdit(): void {
  emit('edit', props.user.id)
}

function handleDelete(): void {
  emit('delete', props.user.id)
}
</script>
```

### 迁移检查清单

```text
□ 添加 lang="ts"
□ 定义 Props interface
□ defineProps 改为泛型写法
□ defineEmits 改为泛型写法
□ ref/reactive 加泛型（需要时）
□ 事件处理函数加参数类型
□ import type 导入纯类型
□ 消除所有 any
```

---

## 11.7 面试问题与答案

### Q1: tsconfig 中 strict: true 包含哪些检查？

**答**：strict 是总开关，包含 7 个子选项：noImplicitAny、strictNullChecks、strictFunctionTypes、strictBindCallApply、strictPropertyInitialization、noImplicitThis、alwaysStrict。开启后能最大程度发挥 TS 的类型安全优势。

### Q2: 如何将一个大型 JS 项目渐进式迁移到 TS？

**答**：四阶段策略：
1. 基础设施：安装 TS、创建 tsconfig（开启 allowJs）、改 main.ts
2. 类型层：定义核心业务类型和 API 类型
3. 组件层：公共组件加 lang="ts"、Props/Emits 类型化
4. 页面层：新页面用 TS，旧页面改动时顺便迁移

关键原则：始终保持项目可运行，不要一次性全改。

### Q3: moduleResolution 的 Bundler 和 Node 有什么区别？

**答**：
- Node：按 Node.js 的 CommonJS 规则解析（查找 index.js、main 字段）
- Bundler：按现代打包工具规则解析（支持 exports 字段、不要求扩展名）

Vue3 + Vite 项目用 Bundler，因为 Vite 本身就是打包工具。

### Q4: isolatedModules 是什么？为什么 Vite 项目需要开启？

**答**：`isolatedModules: true` 要求每个文件可以独立编译（不依赖其他文件的类型信息）。Vite 使用 esbuild 逐文件编译（不做全局类型分析），所以需要这个选项确保兼容。它会禁止一些依赖全局分析的写法，如 `const enum` 和纯类型的 `export { X } from 'y'`。

### Q5: 迁移过程中遇到大量 any 怎么办？

**答**：
1. 先用 `// @ts-ignore` 或 `as any` 临时跳过，保证项目能运行
2. 从核心类型开始，逐步替换 any 为具体类型
3. 开启 ESLint 的 `@typescript-eslint/no-explicit-any` 为 warn，逐步消除
4. 优先处理 API 层和公共组件的 any（影响面最大）
5. 最终目标：零 any（或极少量有充分理由的 any）

---

## 11.8 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第11章 知识点总结                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  tsconfig 关键配置：                                      │
│    strict: true（必开）                                   │
│    moduleResolution: "Bundler"（Vite 项目）               │
│    isolatedModules: true（Vite 需要）                     │
│    noEmit: true（TS 只做检查，Vite 负责编译）              │
│    paths: { "@/*": ["src/*"] }（路径别名）                │
│                                                          │
│  迁移策略：                                               │
│    阶段1：基础设施（tsconfig + allowJs）                   │
│    阶段2：类型层（types/ + api/）                         │
│    阶段3：组件层（Props/Emits 类型化）                     │
│    阶段4：页面层（新页面 TS，旧页面渐进迁移）              │
│                                                          │
│  核心原则：                                               │
│    ✅ 始终保持项目可运行                                   │
│    ✅ 从类型层开始，自底向上                               │
│    ✅ strict: true 从第一天就开启                          │
│    ✅ 新代码必须 TS，旧代码渐进迁移                        │
│    ❌ 不要一次性全改                                      │
│    ❌ 不要用 any 绕过所有报错                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第10章：Vue3组件类型设计](./chapter10.md)
> 下一章：[第12章：综合案例实战](./chapter12.md)
