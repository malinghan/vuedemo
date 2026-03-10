<script setup>
import { ref, computed, onMounted } from 'vue'
import MarkdownViewer from '../../components/MarkdownViewer.vue'

const chapters = [
  { id: 1, file: '01_html5.md', title: 'HTML5 — 网页的骨架' },
  { id: 2, file: '02_css3.md', title: 'CSS3 — 网页的皮肤' },
  { id: 3, file: '03_javascript.md', title: 'JavaScript — 网页的大脑' },
  { id: 4, file: '04_toolchain.md', title: '工具链 — 现代前端基础设施' },
  { id: 5, file: '05_vue_basics.md', title: 'Vue 基础 — 模板语法与指令' },
  { id: 6, file: '06_vue_reactivity.md', title: '响应式系统 — ref / reactive / computed' },
  { id: 7, file: '07_vue_components.md', title: '组件化 — Props / Emit / Slots' },
  { id: 8, file: '08_vue_router.md', title: 'Vue Router — 单页应用路由' },
  { id: 9, file: '09_vue_pinia.md', title: 'Pinia 状态管理' },
  { id: 10, file: '10_project.md', title: '实战项目：Todo App' },
]

const current = ref(1)
const content = ref('')
const loading = ref(false)

async function loadChapter(id) {
  const ch = chapters.find(c => c.id === id)
  if (!ch) return
  loading.value = true
  try {
    const res = await fetch(`/vue/chapters/${ch.file}`)
    content.value = await res.text()
  } catch (e) {
    content.value = '加载失败，请确认文件存在。'
  }
  loading.value = false
}

function selectChapter(id) {
  current.value = id
  loadChapter(id)
}

onMounted(() => loadChapter(1))
</script>

<template>
  <div class="vue-tutorial">
    <div class="page-header">
      <h1>Vue 3 教程</h1>
      <p>10 个章节，从 HTML/CSS/JS 基础到 Vue3 实战项目</p>
    </div>

    <div class="layout">
      <aside class="chapter-nav">
        <button
          v-for="c in chapters"
          :key="c.id"
          :class="['ch-btn', { active: current === c.id }]"
          @click="selectChapter(c.id)"
        >
          <span class="ch-num">{{ String(c.id).padStart(2, '0') }}</span>
          <span class="ch-title">{{ c.title }}</span>
        </button>
      </aside>

      <div class="chapter-body">
        <div v-if="loading" class="loading">加载中...</div>
        <MarkdownViewer v-else :content="content" accent-color="#42b883" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vue-tutorial {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.page-header p {
  color: #888;
  font-size: 14px;
}

.layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.chapter-nav {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.ch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: none;
  cursor: pointer;
  font-size: 12.5px;
  color: #666;
  text-align: left;
  transition: all 0.15s;
}

.ch-btn:hover {
  background: #f0fff7;
  color: #42b883;
}

.ch-btn.active {
  background: #42b883;
  color: #fff;
}

.ch-num {
  font-family: monospace;
  font-size: 11px;
  opacity: 0.6;
  flex-shrink: 0;
}

.ch-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-body {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  padding: 36px 40px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.loading {
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 15px;
}
</style>
