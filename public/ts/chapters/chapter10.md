# 第10章：Vue3 组件类型设计（高频实战）

## 学习目标

- [ ] 掌握 `defineProps<T>` 的类型写法
- [ ] 掌握 `withDefaults` 设置默认值
- [ ] 掌握 `defineEmits<T>` 的类型写法
- [ ] 会用 `defineExpose` 暴露组件方法
- [ ] 理解模板 ref 的类型（InstanceType）
- [ ] 了解 `defineSlots`（Vue 3.3+）
- [ ] 理解 v-model 的类型设计
- [ ] 了解泛型组件（generic="T"）

---

## 10.1 defineProps 类型写法

### 基于类型的声明（推荐）

```vue
<script setup lang="ts">
// 直接用 interface 定义 Props 类型
interface Props {
  title: string
  count: number
  tags?: string[]        // 可选属性
  readonly id: number    // 只读属性
}

// 泛型方式声明 props
const props = defineProps<Props>()

// 使用
console.log(props.title)  // string
console.log(props.tags)   // string[] | undefined
</script>
```

### withDefaults 设置默认值

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  tags?: string[]
  theme?: 'light' | 'dark'
}

// withDefaults 为可选属性提供默认值
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  tags: () => [],        // 引用类型必须用工厂函数
  theme: 'light'
})

// 此时 props.count 的类型是 number（不再是 number | undefined）
</script>
```

### Props 类型流图

```text
父组件
  │
  │  <Child title="hello" :count="5" />
  │
  ▼
defineProps<Props>()
  │
  ├── title: string      ← 必传，不传则编译报错
  ├── count?: number     ← 可选
  │     │
  │     └── withDefaults → count: number（有默认值，不再是 undefined）
  ├── tags?: string[]    ← 可选
  │     │
  │     └── withDefaults → tags: string[]（工厂函数返回默认值）
  └── theme?: 'light' | 'dark'
```

---

## 10.2 defineEmits 类型写法

### 调用签名写法

```vue
<script setup lang="ts">
// 方式一：调用签名（推荐，更灵活）
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit', data: { name: string; age: number }): void
  (e: 'cancel'): void
}>()

// 调用
emit('update:modelValue', 'new value')  // ✅
emit('submit', { name: 'Tom', age: 18 }) // ✅
emit('cancel')                           // ✅
// emit('submit', 'wrong')               // ❌ 参数类型错误
// emit('unknown')                        // ❌ 事件名不存在
</script>
```

### 具名写法（Vue 3.3+）

```vue
<script setup lang="ts">
// 方式二：具名写法（更简洁，Vue 3.3+）
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': [data: { name: string; age: number }]
  'cancel': []
}>()
</script>
```

---

## 10.3 v-model 的类型设计

### 单个 v-model

```vue
<!-- 子组件 MyInput.vue -->
<script setup lang="ts">
interface Props {
  modelValue: string
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 100
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  if (value.length <= props.maxLength) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <input :value="modelValue" @input="onInput" />
</template>
```

```vue
<!-- 父组件使用 -->
<template>
  <MyInput v-model="name" :max-length="20" />
</template>
```

### 多个 v-model

```vue
<!-- 子组件 UserForm.vue -->
<script setup lang="ts">
interface Props {
  firstName: string
  lastName: string
  age: number
}

defineProps<Props>()

const emit = defineEmits<{
  'update:firstName': [value: string]
  'update:lastName': [value: string]
  'update:age': [value: number]
}>()
</script>
```

```vue
<!-- 父组件 -->
<template>
  <UserForm
    v-model:first-name="first"
    v-model:last-name="last"
    v-model:age="age"
  />
</template>
```

---

## 10.4 defineExpose 暴露组件方法

```vue
<!-- 子组件 MyForm.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({ name: '', email: '' })

// 暴露给父组件的方法
function validate(): boolean {
  return formData.value.name.length > 0 && formData.value.email.includes('@')
}

function reset(): void {
  formData.value = { name: '', email: '' }
}

function getData(): { name: string; email: string } {
  return { ...formData.value }
}

// 只暴露指定的方法，其他内部状态对外不可见
defineExpose({
  validate,
  reset,
  getData
})
</script>
```

```vue
<!-- 父组件 -->
<script setup lang="ts">
import { ref } from 'vue'
import MyForm from './MyForm.vue'

// 组件 ref 的类型
const formRef = ref<InstanceType<typeof MyForm> | null>(null)

function handleSubmit() {
  if (formRef.value?.validate()) {
    const data = formRef.value.getData()
    console.log('提交数据:', data)
  }
}

function handleReset() {
  formRef.value?.reset()
}
</script>

<template>
  <MyForm ref="formRef" />
  <button @click="handleSubmit">提交</button>
  <button @click="handleReset">重置</button>
</template>
```

### 组件 ref 类型图

```text
子组件 defineExpose({ validate, reset, getData })
         │
         ▼
父组件 ref<InstanceType<typeof MyForm> | null>(null)
         │
         ▼
formRef.value?.validate()   ← 有类型提示
formRef.value?.reset()      ← 有类型提示
formRef.value?.getData()    ← 返回值有类型
```

---

## 10.5 defineSlots（Vue 3.3+）

```vue
<!-- 子组件 DataList.vue -->
<script setup lang="ts">
interface Item {
  id: number
  name: string
}

defineProps<{
  items: Item[]
}>()

// 定义插槽的类型
defineSlots<{
  default(props: { item: Item; index: number }): any
  header(props: {}): any
  empty(props: {}): any
}>()
</script>

<template>
  <div>
    <slot name="header" />
    <template v-if="items.length">
      <div v-for="(item, index) in items" :key="item.id">
        <slot :item="item" :index="index" />
      </div>
    </template>
    <template v-else>
      <slot name="empty" />
    </template>
  </div>
</template>
```

```vue
<!-- 父组件使用 —— 插槽参数有类型提示 -->
<template>
  <DataList :items="users">
    <template #header>
      <h2>用户列表</h2>
    </template>

    <template #default="{ item, index }">
      <!-- item: Item, index: number —— 有类型提示 -->
      <p>{{ index + 1 }}. {{ item.name }}</p>
    </template>

    <template #empty>
      <p>暂无数据</p>
    </template>
  </DataList>
</template>
```

---

## 10.6 泛型组件（Vue 3.3+）

```vue
<!-- GenericList.vue -->
<script setup lang="ts" generic="T extends { id: number }">
// generic 属性声明泛型参数
// T extends { id: number } 约束 T 必须有 id 属性

defineProps<{
  items: T[]
  selected?: T
}>()

const emit = defineEmits<{
  select: [item: T]
}>()
</script>

<template>
  <ul>
    <li
      v-for="item in items"
      :key="item.id"
      :class="{ active: selected?.id === item.id }"
      @click="emit('select', item)"
    >
      <slot :item="item" />
    </li>
  </ul>
</template>
```

```vue
<!-- 使用泛型组件 -->
<script setup lang="ts">
interface User {
  id: number
  name: string
  age: number
}

const users: User[] = [
  { id: 1, name: 'Tom', age: 18 },
  { id: 2, name: 'Bob', age: 20 }
]

const selected = ref<User>()

function onSelect(user: User) {
  // user 的类型自动推断为 User
  selected.value = user
}
</script>

<template>
  <!-- T 被推断为 User -->
  <GenericList :items="users" :selected="selected" @select="onSelect">
    <template #default="{ item }">
      {{ item.name }} ({{ item.age }})
    </template>
  </GenericList>
</template>
```

---

## 10.7 组件类型流全景图

```text
┌─────────────────────────────────────────────────────────┐
│                    父组件                                │
│                                                         │
│  <Child                                                 │
│    :title="title"          ← Props 入参约束              │
│    v-model="value"         ← 双向绑定类型约束             │
│    @submit="onSubmit"      ← Emits 出参约束              │
│    ref="childRef"          ← Expose 方法约束              │
│  >                                                      │
│    <template #default="{ item }">                       │
│      {{ item.name }}       ← Slots 参数约束              │
│    </template>                                          │
│  </Child>                                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    子组件                                │
│                                                         │
│  defineProps<Props>()      ← 入参类型                    │
│  defineEmits<Emits>()      ← 出参类型                    │
│  defineSlots<Slots>()      ← 插槽类型                    │
│  defineExpose({ ... })     ← 暴露方法类型                │
│                                                         │
│  所有类型在编译期检查，运行时零开销                        │
└─────────────────────────────────────────────────────────┘
```

---

## 10.8 教学 Demo：完整的类型安全组件

```vue
<!-- SearchSelect.vue —— 一个带搜索的下拉选择组件 -->
<script setup lang="ts" generic="T extends { id: number; label: string }">
import { ref, computed } from 'vue'

// Props
interface Props {
  options: T[]
  modelValue?: T | null
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: '请选择...'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: T | null]
  'search': [keyword: string]
}>()

// Slots
defineSlots<{
  option(props: { item: T; selected: boolean }): any
}>()

// 内部状态
const keyword = ref('')
const isOpen = ref(false)

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!keyword.value) return props.options
  const kw = keyword.value.toLowerCase()
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(kw)
  )
})

// 方法
function select(item: T) {
  emit('update:modelValue', item)
  isOpen.value = false
  keyword.value = ''
}

function onSearch(e: Event) {
  const value = (e.target as HTMLInputElement).value
  keyword.value = value
  emit('search', value)
}

function clear() {
  emit('update:modelValue', null)
}

// 暴露方法
defineExpose({
  open: () => { isOpen.value = true },
  close: () => { isOpen.value = false },
  clear
})
</script>

<template>
  <div class="search-select">
    <div @click="isOpen = !isOpen">
      {{ modelValue?.label ?? placeholder }}
      <button v-if="modelValue" @click.stop="clear">x</button>
    </div>

    <div v-if="isOpen">
      <input :value="keyword" placeholder="搜索..." @input="onSearch" />
      <ul>
        <li
          v-for="opt in filteredOptions"
          :key="opt.id"
          @click="select(opt)"
        >
          <slot name="option" :item="opt" :selected="modelValue?.id === opt.id">
            {{ opt.label }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>
```

---

## 10.9 面试问题与答案

### Q1: defineProps 的两种声明方式有什么区别？

**答**：
1. 运行时声明：`defineProps({ title: { type: String, required: true } })`，和 Options API 类似，支持运行时校验
2. 类型声明：`defineProps<{ title: string }>()`，纯 TS 类型，编译期检查，更简洁

两者不能混用。类型声明方式更推荐，因为和 TS 生态更契合，但不支持运行时的 validator 函数。

### Q2: withDefaults 为什么引用类型要用工厂函数？

**答**：和 Vue2 的 data 一样的原因——避免多个组件实例共享同一个引用。如果直接写 `tags: []`，所有实例会共享同一个数组。用工厂函数 `tags: () => []` 确保每个实例都有独立的数组。

### Q3: 如何获取子组件 expose 的方法的类型？

**答**：使用 `InstanceType<typeof Component>`：
```ts
import MyForm from './MyForm.vue'
const formRef = ref<InstanceType<typeof MyForm> | null>(null)
formRef.value?.validate()  // 有类型提示
```
`InstanceType` 提取组件实例的类型，包含 `defineExpose` 暴露的所有成员。

### Q4: Vue 3.3 的 defineSlots 解决了什么问题？

**答**：在 3.3 之前，插槽的参数类型无法在子组件中声明，父组件使用作用域插槽时没有类型提示。`defineSlots` 让子组件可以声明每个插槽的参数类型，父组件使用时自动获得类型推断和补全。

### Q5: 什么是泛型组件？什么场景需要用？

**答**：泛型组件通过 `<script setup generic="T">` 声明类型参数，让组件的 Props/Emits/Slots 类型随使用者传入的数据类型变化。

适用场景：通用列表、表格、选择器等"容器型"组件，需要支持不同数据模型但保持类型安全。

---

## 10.10 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第10章 知识点总结                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Props：                                                 │
│    defineProps<T>() + withDefaults()                     │
│    引用类型默认值用工厂函数                                │
│                                                          │
│  Emits：                                                 │
│    defineEmits<{ (e: 'name', ...): void }>()             │
│    Vue 3.3+: defineEmits<{ name: [arg1, arg2] }>()      │
│                                                          │
│  v-model：                                               │
│    modelValue + update:modelValue                        │
│    多个 v-model: v-model:firstName / v-model:lastName    │
│                                                          │
│  Expose：                                                │
│    defineExpose({ method1, method2 })                    │
│    父组件: ref<InstanceType<typeof Comp>>                │
│                                                          │
│  Slots（3.3+）：                                         │
│    defineSlots<{ default(props: T): any }>()             │
│                                                          │
│  泛型组件（3.3+）：                                       │
│    <script setup generic="T extends Constraint">         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第9章：Vue3+TS核心写法](./chapter09.md)
> 下一章：[第11章：工程化与迁移策略](./chapter11.md)
