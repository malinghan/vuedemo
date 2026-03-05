# 06 · Vue 响应式系统 — ref / reactive / computed / watch

> 类比：Vue 的响应式系统是**自动化的 Excel**。
> 你改了 A1，所有依赖 A1 的单元格（B1、C1...）自动重新计算并更新。

**学习目标**
- [ ] 理解 ref 和 reactive 的区别
- [ ] 掌握 computed 计算属性
- [ ] 会用 watch 监听数据变化
- [ ] 理解响应式原理（Proxy）

**预计学习时长**：2 天

---

## 1. 响应式是什么

### 类比：智能家居

普通变量像**手动开关**：你改了值，页面不会自动更新。
响应式变量像**智能开关**：你改了值，所有依赖它的地方自动更新。

```javascript
// 普通变量（非响应式）
let count = 0
count = 10  // 页面不会更新

// 响应式变量
const count = ref(0)
count.value = 10  // 页面自动更新
```

**响应式原理（简化版）：**

```
创建响应式变量
    │
    ▼
Vue 用 Proxy 包装数据
    │
    ▼
读取时（get）：收集依赖（谁用了我？）
    │
    ▼
修改时（set）：通知所有依赖更新
    │
    ▼
页面自动重新渲染
```

---

## 2. ref — 基本类型响应式

### 类比：带标签的盒子

`ref` 把值装进一个**盒子**里，盒子本身是响应式的。

```
普通值：  42  ← 直接是数字
ref 值：  { value: 42 }  ← 装在盒子里
```

```vue
<script setup>
import { ref } from 'vue'

// 创建 ref
const count = ref(0)
const name = ref('Tom')
const user = ref({ name: 'Tom', age: 18 })

// 在 script 中访问/修改：必须 .value
console.log(count.value)  // 0
count.value++             // 修改
name.value = 'Jerry'

// 在 template 中：自动解包，不需要 .value
</script>

<template>
  <p>{{ count }}</p>      <!-- 不是 count.value -->
  <p>{{ name }}</p>
  <button @click="count++">+1</button>  <!-- 自动解包 -->
</template>
```

**ref 适用场景：**

```
✅ 基本类型（推荐）
const count = ref(0)
const name = ref('Tom')
const flag = ref(true)

✅ 需要整体替换的对象
const user = ref({ name: 'Tom' })
user.value = { name: 'Jerry' }  // 整体替换

❌ 复杂对象（用 reactive 更方便）
const user = ref({ name: 'Tom', age: 18, address: { city: 'Beijing' } })
user.value.name = 'Jerry'  // 每次都要 .value，麻烦
```

---

## 3. reactive — 对象响应式

### 类比：智能档案柜

`reactive` 把整个对象变成**智能档案柜**，每个抽屉（属性）都是响应式的。

```vue
<script setup>
import { reactive } from 'vue'

// 创建 reactive
const user = reactive({
  name: 'Tom',
  age: 18,
  address: {
    city: 'Beijing',
    street: 'xxx路'
  }
})

// 直接修改属性，不需要 .value
user.name = 'Jerry'
user.age++
user.address.city = 'Shanghai'

// ❌ 不能整体替换（会失去响应式）
user = { name: 'Alice' }  // 错误！响应式丢失
</script>

<template>
  <p>{{ user.name }} - {{ user.age }}岁</p>
  <p>{{ user.address.city }}</p>
</template>
```

**reactive 的限制：**

```javascript
// ❌ 不能用于基本类型
const count = reactive(0)  // 错误！

// ❌ 不能整体替换
let state = reactive({ count: 0 })
state = reactive({ count: 1 })  // 失去响应式

// ✅ 正确做法：修改属性
state.count = 1

// ❌ 解构会失去响应式
const { count } = reactive({ count: 0 })
count++  // 不是响应式的！

// ✅ 用 toRefs 解构
import { toRefs } from 'vue'
const state = reactive({ count: 0, name: 'Tom' })
const { count, name } = toRefs(state)  // 现在是响应式的
count.value++
```

---

## 4. ref vs reactive 对比

```
┌─────────────────┬──────────────┬──────────────┐
│                 │     ref      │   reactive   │
├─────────────────┼──────────────┼──────────────┤
│ 适用类型        │ 任意类型     │ 对象/数组    │
│ 访问方式(script)│ .value       │ 直接访问     │
│ 访问方式(template)│ 自动解包   │ 直接访问     │
│ 整体替换        │ ✅           │ ❌           │
│ 解构            │ ✅           │ ❌(需toRefs) │
│ 推荐场景        │ 基本类型     │ 复杂对象     │
└─────────────────┴──────────────┴──────────────┘
```

**选择建议：**

```javascript
// 基本类型 → ref
const count = ref(0)
const name = ref('Tom')

// 需要整体替换 → ref
const user = ref(null)
user.value = await fetchUser()

// 复杂对象，只修改属性 → reactive
const form = reactive({
  username: '',
  email: '',
  password: ''
})

// 或者全用 ref（推荐，统一风格）
const form = ref({
  username: '',
  email: '',
  password: ''
})
```

---

## 5. computed — 计算属性

### 类比：Excel 公式

`computed` 就像 Excel 的**公式单元格**：依赖的数据变了，自动重新计算。

```
A1 = 10
B1 = 20
C1 = A1 + B1  ← 公式，自动计算为 30

A1 改为 15
C1 自动变为 35  ← 不需要手动更新
```

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// 计算属性（只读）
const fullName = computed(() => {
  return firstName.value + lastName.value
})

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return firstName.value + lastName.value
  },
  set(value) {
    firstName.value = value[0]
    lastName.value = value.slice(1)
  }
})

const count = ref(0)
const double = computed(() => count.value * 2)
const isEven = computed(() => count.value % 2 === 0)
</script>

<template>
  <p>{{ fullName }}</p>
  <p>{{ double }}</p>
  <p>{{ isEven ? '偶数' : '奇数' }}</p>
</template>
```

**computed vs 方法：**

```vue
<script setup>
const count = ref(0)

// 计算属性（有缓存）
const double = computed(() => {
  console.log('计算 double')
  return count.value * 2
})

// 方法（无缓存）
function getDouble() {
  console.log('计算 double')
  return count.value * 2
}
</script>

<template>
  <!-- 多次访问 computed，只计算一次 -->
  <p>{{ double }}</p>
  <p>{{ double }}</p>
  <p>{{ double }}</p>

  <!-- 多次调用方法，每次都计算 -->
  <p>{{ getDouble() }}</p>
  <p>{{ getDouble() }}</p>
  <p>{{ getDouble() }}</p>
</template>
```

**computed 使用场景：**

```javascript
// 1. 过滤列表
const todos = ref([...])
const unfinished = computed(() => todos.value.filter(t => !t.done))

// 2. 格式化数据
const price = ref(1234.56)
const formattedPrice = computed(() => `¥${price.value.toFixed(2)}`)

// 3. 复杂计算
const cart = ref([{ price: 10, qty: 2 }, { price: 20, qty: 1 }])
const total = computed(() => 
  cart.value.reduce((sum, item) => sum + item.price * item.qty, 0)
)

// 4. 表单验证
const email = ref('')
const isValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
```

---

## 6. watch — 侦听器

### 类比：监控摄像头

`watch` 是**监控摄像头**：盯着某个数据，一旦变化就执行回调。

```
数据变化
    │
    ▼
watch 检测到
    │
    ▼
执行回调函数
    │
    ▼
发请求 / 打日志 / 更新其他数据
```

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)
const user = ref({ name: 'Tom', age: 18 })

// 监听 ref
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`)
})

// 监听对象的某个属性（用 getter 函数）
watch(
  () => user.value.age,
  (newAge) => {
    console.log('年龄变了：', newAge)
  }
)

// 监听多个数据源
watch([count, () => user.value.name], ([newCount, newName]) => {
  console.log('count 或 name 变了')
})

// 立即执行 + 深度监听
watch(
  user,
  (newUser) => {
    console.log('user 变了', newUser)
  },
  { immediate: true, deep: true }
)
</script>
```

**watch 选项：**

```javascript
watch(source, callback, {
  immediate: true,  // 立即执行一次
  deep: true,       // 深度监听（对象内部变化也触发）
  flush: 'post'     // 回调时机：'pre'(默认) | 'post'(DOM更新后) | 'sync'(同步)
})
```

**watch vs watchEffect：**

```javascript
// watch：明确指定监听谁
watch(count, () => {
  console.log('count 变了')
})

// watchEffect：自动收集依赖
watchEffect(() => {
  console.log('count 或 name 变了：', count.value, name.value)
  // 用到谁就监听谁，不需要手动指定
})
```

**watch 使用场景：**

```javascript
// 1. 搜索防抖
const keyword = ref('')
watch(keyword, async (newKeyword) => {
  if (!newKeyword) return
  const results = await searchAPI(newKeyword)
  // ...
})

// 2. 路由变化时重新加载数据
watch(
  () => route.params.id,
  async (newId) => {
    const data = await fetchData(newId)
    // ...
  }
)

// 3. 表单自动保存
watch(form, (newForm) => {
  localStorage.setItem('draft', JSON.stringify(newForm))
}, { deep: true })

// 4. 依赖其他数据的计算
const x = ref(0)
const y = ref(0)
watch([x, y], ([newX, newY]) => {
  // 复杂的副作用逻辑
  updateChart(newX, newY)
})
```

---

## 7. computed vs watch 对比

```
┌──────────────┬────────────────┬────────────────┐
│              │    computed    │     watch      │
├──────────────┼────────────────┼────────────────┤
│ 用途         │ 计算派生值     │ 执行副作用     │
│ 返回值       │ 必须有         │ 无             │
│ 缓存         │ 有             │ 无             │
│ 使用场景     │ 模板中展示     │ 异步操作/日志  │
│ 依赖收集     │ 自动           │ 手动指定       │
└──────────────┴────────────────┴────────────────┘
```

**选择建议：**

```javascript
// ✅ 用 computed：需要在模板中展示的派生数据
const fullName = computed(() => firstName.value + lastName.value)

// ✅ 用 watch：数据变化时执行异步操作
watch(keyword, async (val) => {
  const results = await searchAPI(val)
})

// ❌ 不要用 watch 做 computed 的事
watch(firstName, () => {
  fullName.value = firstName.value + lastName.value  // 错误！用 computed
})
```

---

## 8. 响应式工具函数

```javascript
import { 
  toRef, toRefs, toRaw, unref, isRef, isReactive 
} from 'vue'

// toRef：把对象的某个属性转为 ref
const state = reactive({ count: 0 })
const countRef = toRef(state, 'count')
countRef.value++  // state.count 也会变

// toRefs：把对象的所有属性转为 ref（用于解构）
const { count, name } = toRefs(state)

// toRaw：获取原始对象（非响应式）
const raw = toRaw(state)
raw.count++  // 不会触发更新

// unref：如果是 ref 返回 .value，否则返回本身
const val = unref(maybeRef)  // 等价于 isRef(maybeRef) ? maybeRef.value : maybeRef

// 类型判断
isRef(count)      // true
isReactive(state) // true
```

---

## 9. 综合练习

### 练习 1：购物车（必做）

```javascript
// 实现功能：
// - 商品列表（价格、数量）
// - 计算总价（computed）
// - 数量变化时打印日志（watch）
```

### 练习 2：搜索框（必做）

```javascript
// 实现功能：
// - 输入关键词
// - 实时过滤列表（computed）
// - 输入变化时发请求（watch + 防抖）
```

### 练习 3：表单自动保存（进阶）

```javascript
// 实现功能：
// - 表单数据用 reactive
// - 数据变化时自动保存到 localStorage（watch deep）
// - 页面加载时恢复数据
```

---

## 自测题

- [ ] ref 和 reactive 的区别？什么时候用哪个?
- [ ] 为什么 script 中访问 ref 需要 .value，template 中不需要？
- [ ] computed 和方法的区别？
- [ ] computed 和 watch 分别适合什么场景？
- [ ] 如何监听对象的某个属性？

---

## 学习资源

| 资源 | 链接 | 说明 |
|------|------|------|
| Vue 响应式原理 | https://cn.vuejs.org/guide/extras/reactivity-in-depth.html | 官方深入解析 |
| Vue 3 响应式 API | https://cn.vuejs.org/api/reactivity-core.html | API 参考 |

---

> 完成后把 `INDEX.md` 里 `06_vue_reactivity.md` 的 `☐` 改为 `✅`
>
> 下一步 → `07_vue_components.md`
