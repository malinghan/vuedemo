<script setup>
import { ref } from 'vue'
import Chapter01 from './components/Chapter01_Basics.vue'
import Chapter02 from './components/Chapter02_Reactivity.vue'
import Chapter03 from './components/Chapter03_Components.vue'
import Chapter04 from './components/Chapter04_Lifecycle.vue'
import Chapter05 from './components/Chapter05_CompositionAPI.vue'

const chapters = [
  { id: 1, title: '模板语法与指令', component: Chapter01 },
  { id: 2, title: '响应式数据', component: Chapter02 },
  { id: 3, title: '组件通信', component: Chapter03 },
  { id: 4, title: '生命周期', component: Chapter04 },
  { id: 5, title: 'Composition API', component: Chapter05 },
]

const current = ref(1)
const currentChapter = () => chapters.find(c => c.id === current.value)
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <h2 class="sidebar-title">Vue 3 学习</h2>
      <nav>
        <button
          v-for="c in chapters"
          :key="c.id"
          :class="['nav-item', { active: current === c.id }]"
          @click="current = c.id"
        >
          <span class="chapter-num">{{ String(c.id).padStart(2, '0') }}</span>
          {{ c.title }}
        </button>
      </nav>
    </aside>
    <main class="content">
      <h1 class="chapter-title">第 {{ current }} 章：{{ currentChapter().title }}</h1>
      <component :is="currentChapter().component" />
    </main>
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
</style>

<style scoped>
.app { display: flex; min-height: 100vh; }
.sidebar { width: 220px; background: #1a1a2e; color: #fff; padding: 24px 0; flex-shrink: 0; }
.sidebar-title { font-size: 18px; padding: 0 20px 20px; border-bottom: 1px solid #333; color: #42b883; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 12px 20px;
  background: none; border: none; color: #aaa;
  cursor: pointer; text-align: left; font-size: 14px; transition: all 0.2s;
}
.nav-item:hover { background: #2a2a4e; color: #fff; }
.nav-item.active { background: #42b883; color: #fff; }
.chapter-num { font-size: 11px; opacity: 0.6; font-family: monospace; }
.content { flex: 1; padding: 32px; overflow-y: auto; }
.chapter-title { font-size: 24px; color: #333; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 2px solid #42b883; }
</style>
