# 第8章：模块系统与声明文件

## 学习目标

- [ ] 理解 ES Module 的 import/export
- [ ] 掌握类型导入 `import type`
- [ ] 理解声明文件 `.d.ts` 的作用和写法
- [ ] 会处理第三方库无类型的问题
- [ ] 了解 `@types` 包和模块解析策略

---

## 8.1 ES Module 与类型导入

### 值导入 vs 类型导入

```ts
// 值导入：导入运行时需要的代码
import { ref, computed } from 'vue'
import { fetchUser } from './api'

// 类型导入：只导入类型信息，编译后会被擦除
import type { Ref } from 'vue'
import type { User, ApiResponse } from './types'

// 混合导入（Vue 3.3+ / TS 4.5+）
import { ref, type Ref } from 'vue'
```

### 为什么要区分？

```text
┌─────────────────────────────────────────────────┐
│  import { User } from './types'                 │
│  → 编译器不确定 User 是值还是类型                  │
│  → 可能产生不必要的运行时导入                      │
│                                                 │
│  import type { User } from './types'            │
│  → 明确告诉编译器：这是类型                        │
│  → 编译后完全擦除，不产生运行时代码                 │
│  → 打包体积更小，意图更清晰                        │
└─────────────────────────────────────────────────┘
```

### 导出类型

```ts
// types.ts

// 导出类型
export interface User {
  id: number
  name: string
  email: string
}

export type UserRole = 'admin' | 'editor' | 'visitor'

// 也可以用 export type 明确标记
export type { User, UserRole }
```

---

## 8.2 组织类型文件的最佳实践

### 推荐目录结构

```text
src/
├── types/
│   ├── index.ts        ← 统一导出
│   ├── user.ts         ← 用户相关类型
│   ├── todo.ts         ← Todo 相关类型
│   └── api.ts          ← API 通用类型
├── api/
│   ├── user.ts         ← 用户 API（导入 types/user.ts）
│   └── todo.ts
└── components/
    └── UserCard.vue    ← 组件（导入 types/user.ts）
```

### 统一导出

```ts
// types/index.ts
export type { User, UserRole } from './user'
export type { Todo, CreateTodoDTO } from './todo'
export type { ApiResponse, PaginatedResult } from './api'

// 使用时
import type { User, Todo, ApiResponse } from '@/types'
```

---

## 8.3 声明文件（.d.ts）

声明文件只包含类型信息，不包含实现代码。

### 类比

```text
声明文件像"产品说明书"：

  .ts 文件  = 产品本身（有代码实现）
  .d.ts 文件 = 说明书（只描述接口，不含实现）

  当你拿到一个没有说明书的产品（JS 库），
  你可以自己写一份说明书（.d.ts），
  这样 TS 就知道怎么使用它了。
```

### 场景1：为 JS 库写声明

```ts
// legacy-lib.d.ts
// 当某个 JS 库没有类型定义时，手动补充

declare module 'legacy-lib' {
  export function parse(input: string): { ok: boolean; data: any }
  export function stringify(data: any): string
  export const version: string
}

// 使用时就有类型提示了
import { parse, stringify } from 'legacy-lib'
const result = parse('{"a":1}')  // { ok: boolean; data: any }
```

### 场景2：扩展全局类型

```ts
// env.d.ts
// 为 Vite 的环境变量添加类型

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 场景3：声明全局变量

```ts
// global.d.ts
// 声明挂载在 window 上的全局变量

declare global {
  interface Window {
    __APP_VERSION__: string
    __API_BASE__: string
  }
}

export {}  // 必须有 export，让文件成为模块

// 使用
console.log(window.__APP_VERSION__)  // ✅ 有类型提示
```

### 场景4：声明非 JS 模块

```ts
// shims.d.ts
// 让 TS 认识 .vue 文件、图片等非 JS 模块

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}
```

---

## 8.4 @types 包

很多流行的 JS 库由社区维护类型定义，发布在 `@types` 命名空间下。

```bash
# 安装第三方库的类型定义
npm install -D @types/lodash
npm install -D @types/node

# 安装后，import lodash 就有类型提示了
```

### 类型查找优先级

```text
import { debounce } from 'lodash'

TS 查找类型的顺序：
1. lodash 包自带的类型（package.json 的 types 字段）
2. node_modules/@types/lodash
3. 项目中的 declare module 'lodash'
4. 都没有 → 报错：找不到模块的声明文件
```

### 处理"找不到类型"的方案

```text
方案1：安装 @types 包
  npm install -D @types/xxx

方案2：自己写声明文件
  创建 xxx.d.ts，写 declare module 'xxx'

方案3：快速跳过（不推荐）
  创建 shims.d.ts：
  declare module 'xxx'  // 类型为 any
```

---

## 8.5 命名空间（namespace）—— 了解即可

```ts
// 命名空间是 TS 早期的模块化方案，现在基本被 ES Module 取代
namespace Validation {
  export interface Rule {
    validate(value: string): boolean
  }

  export class RequiredRule implements Rule {
    validate(value: string): boolean {
      return value.length > 0
    }
  }
}

// 使用
const rule = new Validation.RequiredRule()
```

> 现代项目中几乎不用 namespace，了解即可。用 ES Module 的 import/export 就够了。

---

## 8.6 模块解析策略

```text
tsconfig.json 中的 moduleResolution：

┌──────────────┬──────────────────────────────────────┐
│ "Node"       │ 模拟 Node.js 的解析规则               │
│              │ 适合纯 Node.js 项目                   │
├──────────────┼──────────────────────────────────────┤
│ "Bundler"    │ 适合 Vite/Webpack 等打包工具项目       │
│              │ 支持 package.json 的 exports 字段     │
│              │ Vue3 + Vite 项目推荐用这个             │
├──────────────┼──────────────────────────────────────┤
│ "NodeNext"   │ 支持 ESM + CJS 混合                  │
│              │ 适合发布 npm 包                       │
└──────────────┴──────────────────────────────────────┘
```

---

## 8.7 教学 Demo

```ts
// ============================================
// 第8章 Demo：模块与声明文件
// ============================================

// ---------- types/user.ts ----------
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export type UserRole = 'admin' | 'editor' | 'visitor'

export type CreateUserDTO = Omit<User, 'id'>
export type UpdateUserDTO = Partial<CreateUserDTO>

// ---------- types/api.ts ----------
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ---------- types/index.ts ----------
export type { User, UserRole, CreateUserDTO, UpdateUserDTO } from './user'
export type { ApiResponse, PaginatedResult } from './api'

// ---------- api/user.ts ----------
import type { User, CreateUserDTO, ApiResponse, PaginatedResult } from '../types'

const BASE_URL = '/api'

export async function getUsers(
  page: number,
  pageSize: number
): Promise<ApiResponse<PaginatedResult<User>>> {
  const res = await fetch(`${BASE_URL}/users?page=${page}&pageSize=${pageSize}`)
  return res.json()
}

export async function createUser(
  dto: CreateUserDTO
): Promise<ApiResponse<User>> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  })
  return res.json()
}

// ---------- 声明文件示例：env.d.ts ----------
// /// <reference types="vite/client" />
// interface ImportMetaEnv {
//   readonly VITE_API_URL: string
//   readonly VITE_APP_TITLE: string
// }
```

---

## 8.8 面试问题与答案

### Q1: import type 和普通 import 有什么区别？

**答**：
- `import type { X }`：只导入类型信息，编译后完全擦除，不产生运行时代码
- `import { X }`：导入值或类型，编译后可能保留运行时导入

使用 `import type` 的好处：明确意图、避免循环依赖问题、减小打包体积。TS 5.0+ 的 `verbatimModuleSyntax` 选项会强制区分。

### Q2: .d.ts 文件是什么？什么时候需要写？

**答**：`.d.ts` 是声明文件，只包含类型声明不包含实现。需要写的场景：
1. 为没有类型的 JS 库补充类型（`declare module 'xxx'`）
2. 声明全局变量或扩展全局类型（`declare global`）
3. 声明非 JS 模块（`.vue`、`.png` 等）
4. 发布 npm 包时提供类型定义

### Q3: @types 包是什么？怎么知道一个库有没有类型？

**答**：`@types` 是 DefinitelyTyped 社区维护的类型定义包。判断方法：
1. 库自带类型：package.json 有 `types` 或 `typings` 字段 → 不需要 @types
2. 有 @types 包：`npm info @types/xxx` 能找到 → 安装 @types
3. 都没有：自己写 `.d.ts` 声明文件

### Q4: declare module 和 declare global 有什么区别？

**答**：
- `declare module 'xxx'`：为某个模块声明类型，import 时生效
- `declare global { ... }`：扩展全局作用域的类型（如 Window、globalThis）

`declare global` 必须在模块文件中使用（文件中有 import/export），否则文件本身就是全局作用域。

### Q5: moduleResolution 设置为 Bundler 和 Node 有什么区别？

**答**：
- `Node`：按 Node.js 的 CommonJS 规则解析（查找 index.js、package.json 的 main 字段）
- `Bundler`：按现代打包工具的规则解析（支持 package.json 的 exports/imports 字段、不要求文件扩展名）

Vue3 + Vite 项目推荐 `Bundler`，因为 Vite 本身就是打包工具，解析规则和 Bundler 一致。

---

## 8.9 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第8章 知识点总结                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  模块导入：                                               │
│    - import { x } → 值导入（运行时保留）                   │
│    - import type { X } → 类型导入（编译后擦除）            │
│    - 推荐明确区分值和类型导入                              │
│                                                          │
│  声明文件 .d.ts：                                         │
│    - declare module 'xxx' → 为模块声明类型                 │
│    - declare global → 扩展全局类型                         │
│    - *.vue / *.png 等非 JS 模块需要声明                   │
│                                                          │
│  第三方库类型：                                            │
│    - 自带类型 > @types 包 > 手写 .d.ts                    │
│                                                          │
│  模块解析：                                               │
│    - Vue3 + Vite → moduleResolution: "Bundler"           │
│                                                          │
│  最佳实践：                                               │
│    ✅ 用 import type 导入纯类型                            │
│    ✅ 集中管理类型文件（src/types/）                       │
│    ✅ 统一导出（types/index.ts）                           │
│    ❌ 避免用 declare module 'xxx' 无类型跳过               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第7章：类与面向对象](./chapter07.md)
> 下一章：[第9章：Vue3+TS核心写法](./chapter09.md)
