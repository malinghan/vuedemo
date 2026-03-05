<script setup>
import { ref, reactive, computed, watch } from 'vue'

// ref：基本类型响应式
const count = ref(0)
const name = ref('Vue')

// reactive：对象响应式
const user = reactive({
  firstName: '小',
  lastName: '明',
  age: 18,
})

// computed：计算属性
const fullName = computed(() => user.firstName + user.lastName)
const doubleCount = computed(() => count.value * 2)

// watch：侦听器
const watchLog = ref([])
watch(count, (newVal, oldVal) => {
  watchLog.value.unshift(`count: ${oldVal} → ${newVal}`)
  if (watchLog.value.length > 5) watchLog.value.pop()
})

// watchEffect 示例
const searchText = ref('')
const searchLog = ref('等待输入...')
watch(searchText, (val) => {
  searchLog.value = val ? `正在搜索：${val}` : '等待输入...'
})
</script>

<template>
  <div class="demo-page">

    <section class="demo-block">
      <h3>1. ref — 基本类型响应式</h3>
      <p>count = <strong>{{ count }}</strong>，doubleCount = <strong>{{ doubleCount }}</strong></p>
      <button @click="count++">+1</button>
      <button @click="count--">-1</button>
      <button @click="count = 0">重置</button>
      <p class="tip">在 script 中访问 ref 需要 <code>.value</code>，模板中直接用</p>
    </section>

    <section class="demo-block">
      <h3>2. reactive — 对象响应式</h3>
      <p>姓名：{{ fullName }}，年龄：{{ user.age }}</p>
      <div class="row">
        <input v-model="user.firstName" placeholder="姓" style="width:60px" />
        <input v-model="user.lastName" placeholder="名" style="width:80px" />
        <input v-model.number="user.age" type="number" placeholder="年龄" style="width:70px" />
      </div>
      <p class="tip">reactive 直接修改属性，不需要 .value</p>
    </section>

    <section class="demo-block">
      <h3>3. computed — 计算属性</h3>
      <p>fullName 是由 firstName + lastName 自动计算得出的</p>
      <p>当依赖数据变化时，computed 自动重新计算并缓存结果</p>
      <div class="result">{{ fullName }} 今年 {{ user.age }} 岁</div>
    </section>

    <section class="demo-block">
      <h3>4. watch — 侦听器</h3>
      <p>点击 +1/-1 按钮，观察 watch 的触发记录：</p>
      <button @click="count++">count +1（当前：{{ count }}）</button>
      <ul class="log">
        <li v-for="(log, i) in watchLog" :key="i">{{ log }}</li>
        <li v-if="!watchLog.length" style="color:#aaa">还没有变化记录</li>
      </ul>
    </section>

    <section class="demo-block">
      <h3>5. watch 实时搜索示例</h3>
      <input v-model="searchText" placeholder="输入搜索内容..." />
      <p class="tip">{{ searchLog }}</p>
    </section>

  </div>
</template>

<style scoped>
.demo-page { display: flex; flex-direction: column; gap: 24px; }
.demo-block { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.demo-block h3 { font-size: 15px; color: #42b883; margin-bottom: 12px; }
.tip { margin-top: 8px; padding: 8px 12px; background: #f0faf5; border-left: 3px solid #42b883; border-radius: 4px; font-size: 13px; }
.row { display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap; }
.result { margin-top: 8px; padding: 10px 14px; background: #fff8e1; border-radius: 6px; font-size: 16px; font-weight: bold; }
.log { margin-top: 8px; padding-left: 20px; font-family: monospace; font-size: 13px; }
.log li { margin: 3px 0; color: #555; }
input { padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
button { padding: 6px 14px; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-top: 8px; margin-right: 6px; }
button:hover { background: #33a06f; }
code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
</style>
