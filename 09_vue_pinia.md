# 09 · Pinia 状态管理

> 当多个组件需要共享数据时，用 Pinia 集中管理状态。

---

## 为什么需要状态管理？

### 问题场景

```
App
 ├─ Header（显示用户名、购物车数量）
 ├─ ProductList（商品列表）
 └─ Cart（购物车）
```

**痛点**：
- 用户信息需要在 Header 和多个页面共享
- 购物车数据需要在 ProductList 和 Cart 之间同步
- 用 props/emit 层层传递太麻烦

**解决方案**：用 Pinia 创建全局 store，所有组件直接访问。

---

## Pinia 基础

### 安装

```bash
npm install pinia
```

### 注册

```js
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

---

## 创建 Store

### 基本结构

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // 状态（相当于组件的 data）
  state: () => ({
    count: 0,
    name: 'Counter'
  }),

  // 计算属性（相当于组件的 computed）
  getters: {
    doubleCount: (state) => state.count * 2,

    // 可以访问其他 getter
    displayText() {
      return `${this.name}: ${this.doubleCount}`
    }
  },

  // 方法（相当于组件的 methods）
  actions: {
    increment() {
      this.count++
    },

    incrementBy(amount) {
      this.count += amount
    },

    async fetchData() {
      const res = await fetch('/api/data')
      this.count = await res.json()
    }
  }
})
```

### 在组件中使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// 直接访问 state
console.log(counter.count)

// 访问 getter
console.log(counter.doubleCount)

// 调用 action
counter.increment()
counter.incrementBy(5)
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.doubleCount }}</p>
    <button @click="counter.increment">+1</button>
  </div>
</template>
```

---

## Setup 语法（推荐）

更灵活的写法，类似组件的 `<script setup>`：

```js
// stores/user.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // state
  const name = ref('Guest')
  const age = ref(0)

  // getters
  const isAdult = computed(() => age.value >= 18)

  // actions
  function updateName(newName) {
    name.value = newName
  }

  async function login(username, password) {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    name.value = data.name
    age.value = data.age
  }

  // 必须 return 出去
  return {
    name,
    age,
    isAdult,
    updateName,
    login
  }
})
```

---

## 实战案例：购物车

### 创建 Store

```js
// stores/cart.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  // 购物车商品列表
  const items = ref([])

  // 总价
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
  })

  // 商品总数
  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // 添加商品
  function addItem(product) {
    const existItem = items.value.find(item => item.id === product.id)

    if (existItem) {
      existItem.quantity++
    } else {
      items.value.push({
        ...product,
        quantity: 1
      })
    }
  }

  // 移除商品
  function removeItem(productId) {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  // 更新数量
  function updateQuantity(productId, quantity) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.quantity = quantity
      if (item.quantity <= 0) {
        removeItem(productId)
      }
    }
  }

  // 清空购物车
  function clear() {
    items.value = []
  }

  return {
    items,
    totalPrice,
    totalCount,
    addItem,
    removeItem,
    updateQuantity,
    clear
  }
})
```

### 商品列表组件

```vue
<!-- ProductList.vue -->
<script setup>
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

const products = [
  { id: 1, name: 'iPhone 15', price: 5999 },
  { id: 2, name: 'MacBook Pro', price: 12999 },
  { id: 3, name: 'AirPods', price: 1299 }
]
</script>

<template>
  <div class="product-list">
    <div v-for="product in products" :key="product.id" class="product">
      <h3>{{ product.name }}</h3>
      <p>¥{{ product.price }}</p>
      <button @click="cart.addItem(product)">加入购物车</button>
    </div>
  </div>
</template>
```

### 购物车组件

```vue
<!-- Cart.vue -->
<script setup>
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
</script>

<template>
  <div class="cart">
    <h2>购物车 ({{ cart.totalCount }})</h2>

    <div v-if="cart.items.length === 0">
      购物车是空的
    </div>

    <div v-else>
      <div v-for="item in cart.items" :key="item.id" class="cart-item">
        <span>{{ item.name }}</span>
        <span>¥{{ item.price }}</span>
        <input
          type="number"
          :value="item.quantity"
          @input="cart.updateQuantity(item.id, +$event.target.value)"
          min="0"
        >
        <button @click="cart.removeItem(item.id)">删除</button>
      </div>

      <div class="total">
        总价：¥{{ cart.totalPrice }}
      </div>

      <button @click="cart.clear">清空购物车</button>
    </div>
  </div>
</template>
```

### 头部组件

```vue
<!-- Header.vue -->
<script setup>
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
</script>

<template>
  <header>
    <h1>我的商城</h1>
    <div class="cart-badge">
      🛒 {{ cart.totalCount }}
    </div>
  </header>
</template>
```

---

## 解构响应式

### ❌ 错误：直接解构会失去响应式

```vue
<script setup>
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const { totalCount } = cart  // ❌ 失去响应式

console.log(totalCount)  // 只是个普通数字
</script>
```

### ✅ 正确：使用 storeToRefs

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const { totalCount, totalPrice } = storeToRefs(cart)  // ✅ 保持响应式

// actions 不需要 storeToRefs
const { addItem, removeItem } = cart
</script>

<template>
  <div>
    <p>总数：{{ totalCount }}</p>
    <p>总价：{{ totalPrice }}</p>
  </div>
</template>
```

---

## 多个 Store 协作

```js
// stores/user.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const isLoggedIn = computed(() => !!token.value)

  function login(newToken) {
    token.value = newToken
  }

  function logout() {
    token.value = ''
  }

  return { token, isLoggedIn, login, logout }
})
```

```js
// stores/cart.js
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  async function checkout() {
    const userStore = useUserStore()

    if (!userStore.isLoggedIn) {
      alert('请先登录')
      return
    }

    await fetch('/api/checkout', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(items.value)
    })

    items.value = []
  }

  return { items, checkout }
})
```

---

## 持久化存储

### 手动实现

```js
// stores/user.js
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 读取初始值
  const name = ref(localStorage.getItem('userName') || 'Guest')

  // 监听变化，自动保存
  watch(name, (newName) => {
    localStorage.setItem('userName', newName)
  })

  return { name }
})
```

### 使用插件（推荐）

```bash
npm install pinia-plugin-persistedstate
```

```js
// main.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

```js
// stores/user.js
export const useUserStore = defineStore('user', () => {
  const name = ref('Guest')
  const token = ref('')

  return { name, token }
}, {
  persist: true  // 自动持久化到 localStorage
})
```

---

## 调试技巧

### Vue DevTools

1. 安装 Vue DevTools 浏览器插件
2. 打开开发者工具 → Vue 面板 → Pinia 标签
3. 可以查看所有 store 的状态、修改历史

### 手动查看

```vue
<script setup>
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

// 查看完整状态
console.log(cart.$state)

// 重置到初始状态
cart.$reset()

// 批量修改
cart.$patch({
  items: [],
  totalPrice: 0
})

// 订阅状态变化
cart.$subscribe((mutation, state) => {
  console.log('状态变化了', state)
})
</script>
```

---

## 最佳实践

### 1. 按功能模块拆分 Store

```
stores/
  ├─ user.js      # 用户相关
  ├─ cart.js      # 购物车
  ├─ product.js   # 商品
  └─ order.js     # 订单
```

### 2. 优先使用 Setup 语法

```js
// ✅ 推荐
export const useUserStore = defineStore('user', () => {
  const name = ref('Guest')
  return { name }
})

// ❌ 不推荐（除非需要 Options API）
export const useUserStore = defineStore('user', {
  state: () => ({ name: 'Guest' })
})
```

### 3. Actions 处理异步逻辑

```js
export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      const res = await fetch('/api/products')
      products.value = await res.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, fetchProducts }
})
```

### 4. 使用 TypeScript（可选）

```ts
// stores/user.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => user.value !== null)

  function login(userData: User) {
    user.value = userData
  }

  return { user, isLoggedIn, login }
})
```

---

## 对比 Vuex

| 特性 | Pinia | Vuex |
|------|-------|------|
| API 风格 | 简洁，类似 Composition API | 繁琐，需要 mutations |
| TypeScript | 原生支持 | 需要额外配置 |
| DevTools | 完整支持 | 完整支持 |
| 模块化 | 天然支持 | 需要手动配置 |
| 学习曲线 | 平缓 | 陡峭 |

**结论**：Vue 3 项目优先选择 Pinia。

---

## 练习任务

### 任务 1：用户登录

创建 `useAuthStore`，实现：
- `login(username, password)` 登录
- `logout()` 登出
- `isLoggedIn` 计算属性判断登录状态

### 任务 2：主题切换

创建 `useThemeStore`，实现：
- `theme` 状态（'light' / 'dark'）
- `toggleTheme()` 切换主题
- 持久化到 localStorage

### 任务 3：待办事项

创建 `useTodoStore`，实现：
- `todos` 列表
- `addTodo(text)` 添加
- `toggleTodo(id)` 切换完成状态
- `deleteTodo(id)` 删除
- `completedCount` 计算已完成数量

---

## 常见问题

### Q1：什么时候用 Pinia？

**需要用**：
- 多个组件共享数据（用户信息、购物车）
- 跨路由保持状态
- 复杂的数据交互逻辑

**不需要用**：
- 单个组件内部状态（用 `ref`/`reactive`）
- 父子组件通信（用 `props`/`emit`）
- 简单的临时数据

### Q2：Pinia vs 全局变量？

```js
// ❌ 全局变量
window.user = { name: 'Alice' }

// ✅ Pinia
const user = useUserStore()
```

**Pinia 优势**：
- 响应式更新
- DevTools 调试
- 类型提示
- 持久化支持

### Q3：Store 太大怎么办？

拆分成多个小 Store：

```js
// 不好：一个巨大的 Store
const useAppStore = defineStore('app', () => {
  // 100+ 行代码
})

// 好：按功能拆分
const useUserStore = defineStore('user', () => { ... })
const useCartStore = defineStore('cart', () => { ... })
const useProductStore = defineStore('product', () => { ... })
```

---

## 小结

- **Pinia** 是 Vue 3 官方推荐的状态管理库
- **Setup 语法** 更灵活，推荐使用
- **storeToRefs** 解构时保持响应式
- **按功能拆分** Store，避免单个 Store 过大
- **持久化插件** 自动保存到 localStorage

---

> **下一步**：[10_project.md](./10_project.md) · 综合实战项目
