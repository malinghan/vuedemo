# 07 · Vue 组件化 — Props / Emit / Slots

> 类比：组件是**乐高积木**。
> 每个积木（组件）独立设计，可以拼装成复杂的作品（应用）。

**学习目标**
- [ ] 理解组件化思想
- [ ] 掌握 Props 父传子
- [ ] 掌握 Emit 子传父
- [ ] 会用 Slots 插槽
- [ ] 理解组件生命周期

**预计学习时长**：3 天

---

## 1. 组件化思想

### 类比：造房子

不组件化：一块巨大的混凝土（所有代码写在一起）
组件化：砖块、窗户、门分别制造，再组装（每个组件独立开发）

```
应用
├── Header 组件
│   ├── Logo 组件
│   └── Nav 组件
├── Main 组件
│   ├── Sidebar 组件
│   └── Content 组件
│       ├── Card 组件
│       └── Card 组件
└── Footer 组件
```

**组件的好处：**

```
复用性  → 写一次，到处用（Button、Card、Modal）
可维护  → 每个组件职责单一，易于修改
可测试  → 独立测试每个组件
协作    → 团队成员各自开发不同组件
```

---

## 2. 组件注册

### 2.1 全局注册（不推荐）

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import MyButton from './components/MyButton.vue'

const app = createApp(App)
app.component('MyButton', MyButton)  // 全局注册
app.mount('#app')

// 任何组件都可以直接用 <MyButton />
```

### 2.2 局部注册（推荐）

```vue
<!-- App.vue -->
<script setup>
import MyButton from './components/MyButton.vue'
import UserCard from './components/UserCard.vue'
// 导入后自动注册，直接在 template 中使用
</script>

<template>
  <MyButton />
  <UserCard />
</template>
```

**组件命名规范：**

```
文件名：PascalCase（大驼峰）
MyButton.vue
UserCard.vue
TodoList.vue

使用时：
<MyButton />    ← PascalCase（推荐）
<my-button />   ← kebab-case（也可以）
```

---

## 3. Props — 父传子

### 类比：函数参数

Props 就像**函数的参数**：父组件调用子组件时传入数据。

```
父组件
  │  传递 props
  ▼
子组件（接收 props，只读）
```

```vue
<!-- 父组件 Parent.vue -->
<script setup>
import Child from './Child.vue'
import { ref } from 'vue'

const message = ref('Hello from Parent')
const count = ref(10)
</script>

<template>
  <Child :message="message" :count="count" />
</template>
```

```vue
<!-- 子组件 Child.vue -->
<script setup>
// 接收 props
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})

// 使用 props
console.log(props.message)
console.log(props.count)
</script>

<template>
  <div>
    <p>{{ message }}</p>
    <p>Count: {{ count }}</p>
  </div>
</template>
```

**Props 类型校验：**

```javascript
defineProps({
  // 基础类型
  title: String,
  count: Number,
  isActive: Boolean,
  tags: Array,
  user: Object,
  callback: Function,

  // 多种类型
  id: [String, Number],

  // 必填
  name: {
    type: String,
    required: true
  },

  // 默认值
  age: {
    type: Number,
    default: 18
  },

  // 对象/数组默认值（必须用工厂函数）
  user: {
    type: Object,
    default: () => ({ name: 'Guest' })
  },

  tags: {
    type: Array,
    default: () => []
  },

  // 自定义验证
  score: {
    type: Number,
    validator: (value) => value >= 0 && value <= 100
  }
})
```

**Props 单向数据流：**

```
父组件数据变化 → 子组件 props 自动更新 ✅
子组件修改 props → 父组件不受影响 ❌（会警告）

┌─────────────┐
│  父组件      │
│  count = 10 │
└──────┬──────┘
       │  :count="count"
       ▼
┌─────────────┐
│  子组件      │
│  props.count│  ← 只读，不能修改
└─────────────┘
```

```vue
<!-- ❌ 错误：直接修改 props -->
<script setup>
const props = defineProps(['count'])
props.count++  // 警告！不能修改 props
</script>

<!-- ✅ 正确：用本地变量 -->
<script setup>
import { ref } from 'vue'
const props = defineProps(['count'])
const localCount = ref(props.count)  // 复制一份
localCount.value++  // 修改本地变量
</script>

<!-- ✅ 正确：通知父组件修改 -->
<script setup>
const props = defineProps(['count'])
const emit = defineEmits(['update:count'])
emit('update:count', props.count + 1)
</script>
```

---

## 4. Emit — 子传父

### 类比：按门铃

子组件通过 `emit` **按门铃**，父组件听到铃声（事件）后执行操作。

```
子组件
  │  emit('event-name', data)
  ▼
父组件
  │  @event-name="handler"
  ▼
执行 handler(data)
```

```vue
<!-- 子组件 Child.vue -->
<script setup>
const emit = defineEmits(['increment', 'decrement'])

function handleClick() {
  emit('increment', 10)  // 触发事件，传递参数
}
</script>

<template>
  <button @click="emit('increment', 1)">+1</button>
  <button @click="emit('decrement', 1)">-1</button>
  <button @click="handleClick">+10</button>
</template>
```

```vue
<!-- 父组件 Parent.vue -->
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const count = ref(0)

function onIncrement(value) {
  count.value += value
}

function onDecrement(value) {
  count.value -= value
}
</script>

<template>
  <p>Count: {{ count }}</p>
  <Child @increment="onIncrement" @decrement="onDecrement" />
</template>
```

**事件命名规范：**

```javascript
// ✅ 推荐：kebab-case
emit('update-count')
emit('delete-item')

// ❌ 不推荐：camelCase（在 HTML 中不区分大小写）
emit('updateCount')
```

**v-model 的本质：**

```vue
<!-- 父组件 -->
<Child v-model="text" />

<!-- 等价于 -->
<Child :modelValue="text" @update:modelValue="text = $event" />
```

```vue
<!-- 子组件 -->
<script setup>
defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input 
    :value="modelValue" 
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

**多个 v-model：**

```vue
<!-- 父组件 -->
<UserForm v-model:name="name" v-model:email="email" />

<!-- 子组件 -->
<script setup>
defineProps(['name', 'email'])
const emit = defineEmits(['update:name', 'update:email'])
</script>

<template>
  <input :value="name" @input="emit('update:name', $event.target.value)" />
  <input :value="email" @input="emit('update:email', $event.target.value)" />
</template>
```

---

## 5. Slots — 插槽

### 类比：相框

插槽就像**相框**：子组件提供框架（相框），父组件填充内容（照片）。

```
┌─────────────────────────────┐
│  子组件（Card）              │
│  ┌─────────────────────────┐│
│  │  <slot />  ← 插槽位置   ││
│  └─────────────────────────┘│
└─────────────────────────────┘
         ▲
         │  父组件传入内容
         │
    <Card>这是内容</Card>
```

### 5.1 默认插槽

```vue
<!-- 子组件 Card.vue -->
<template>
  <div class="card">
    <slot>默认内容（父组件没传时显示）</slot>
  </div>
</template>
```

```vue
<!-- 父组件 -->
<template>
  <Card>
    <h2>标题</h2>
    <p>这是卡片内容</p>
  </Card>

  <Card />  <!-- 显示"默认内容" -->
</template>
```

### 5.2 具名插槽

```vue
<!-- 子组件 Layout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header">默认头部</slot>
    </header>
    <main>
      <slot>默认主内容</slot>
    </main>
    <footer>
      <slot name="footer">默认底部</slot>
    </footer>
  </div>
</template>
```

```vue
<!-- 父组件 -->
<template>
  <Layout>
    <template #header>
      <h1>我的网站</h1>
    </template>

    <p>主要内容</p>

    <template #footer>
      <p>© 2024</p>
    </template>
  </Layout>
</template>
```

### 5.3 作用域插槽

### 类比：快递代收点

子组件把数据**打包**给父组件，父组件决定怎么**展示**。

```vue
<!-- 子组件 List.vue -->
<script setup>
defineProps(['items'])
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <!-- 把 item 传给父组件 -->
      <slot :item="item" :index="index">
        {{ item.name }}  <!-- 默认展示 -->
      </slot>
    </li>
  </ul>
</template>
```

```vue
<!-- 父组件 -->
<template>
  <List :items="users">
    <!-- 接收子组件传来的数据 -->
    <template #default="{ item, index }">
      <strong>{{ index + 1 }}. {{ item.name }}</strong> ({{ item.age }}岁)
    </template>
  </List>
</template>
```

---

## 6. 组件生命周期

### 类比：人的一生

组件从出生（创建）到死亡（销毁）的各个阶段。

```
创建阶段
    │
    ▼
onBeforeMount  ← 挂载前（DOM 还不存在）
    │
    ▼
onMounted      ← 已挂载（可以访问 DOM）★ 最常用
    │
    ▼
更新阶段（数据变化时）
    │
    ▼
onBeforeUpdate ← 更新前
    │
    ▼
onUpdated      ← 更新后
    │
    ▼
销毁阶段
    │
    ▼
onBeforeUnmount ← 卸载前
    │
    ▼
onUnmounted     ← 已卸载（清理定时器、取消订阅）★ 常用
```

```vue
<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

const count = ref(0)

onMounted(() => {
  console.log('组件已挂载')
  // 发起数据请求
  // 初始化第三方库
  // 添加事件监听
})

onUpdated(() => {
  console.log('组件已更新，count =', count.value)
})

onUnmounted(() => {
  console.log('组件即将卸载')
  // 清理定时器
  // 取消事件监听
  // 取消网络请求
})
</script>
```

**常用场景：**

```javascript
// 1. 发起数据请求
onMounted(async () => {
  const data = await fetchData()
  list.value = data
})

// 2. 操作 DOM
onMounted(() => {
  inputRef.value.focus()
})

// 3. 定时器
onMounted(() => {
  const timer = setInterval(() => {
    count.value++
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)  // 清理定时器
  })
})

// 4. 事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
```

---

## 7. 组件通信总结

```
父子通信
├── 父 → 子：Props
└── 子 → 父：Emit

跨层级通信
├── provide / inject（祖先 → 后代）
└── Pinia（全局状态管理）

兄弟通信
└── 通过共同父组件中转 或 Pinia
```

### provide / inject 示例

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)  // 提供数据
</script>
```

```vue
<!-- 后代组件（任意层级） -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')  // 注入数据
</script>

<template>
  <div :class="theme">当前主题：{{ theme }}</div>
</template>
```

---

## 8. 综合练习

### 练习 1：可复用 Button 组件（必做）

```vue
<!-- MyButton.vue -->
<!-- 要求：
  - Props: type (primary/danger), size (small/large), disabled
  - Emit: click 事件
  - Slot: 按钮文字
-->
```

### 练习 2：Modal 对话框组件（必做）

```vue
<!-- Modal.vue -->
<!-- 要求：
  - Props: visible (控制显示/隐藏)
  - Emit: close 事件
  - Slots: header, default, footer
-->
```

### 练习 3：Todo List 组件化（进阶）

```
App.vue
├── TodoInput.vue   (输入框 + 添加按钮)
├── TodoList.vue    (列表容器)
│   └── TodoItem.vue (单个任务)
└── TodoFilter.vue  (全部/未完成/已完成)
```

---

## 自测题

- [ ] Props 为什么是单向数据流？
- [ ] 如何实现子组件修改父组件的数据？
- [ ] 具名插槽和作用域插槽的区别？
- [ ] `onMounted` 和 `onUnmounted` 分别用来做什么？
- [ ] `provide/inject` 和 Props 的区别？

---

## 学习资源

| 资源 | 链接 | 说明 |
|------|------|------|
| Vue 组件基础 | https://cn.vuejs.org/guide/essentials/component-basics.html | 官方文档 |
| Vue 组件深入 | https://cn.vuejs.org/guide/components/registration.html | 深入指南 |

---

> 下一步 → [08 · Vue Router — 单页应用路由](./08_vue_router.md)
