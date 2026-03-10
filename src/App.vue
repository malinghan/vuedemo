<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(true)

const navItems = [
  {
    group: 'Vue 3 学习',
    icon: '🟢',
    children: [
      { name: '教程', path: '/vue/tutorial' },
      { name: '演示案例', path: '/vue/demo' },
    ]
  },
  {
    group: 'TypeScript 学习',
    icon: '🔷',
    children: [
      { name: '教程', path: '/ts/tutorial' },
      { name: '演示案例', path: '/ts/demo' },
    ]
  }
]

const isActive = (path) => route.path === path
const isGroupActive = (group) => group.children.some(c => route.path.startsWith(c.path.split('/').slice(0, 3).join('/')))
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <router-link to="/" class="logo-link">
        <h2 class="logo">📚 前端学习平台</h2>
      </router-link>

      <nav class="nav">
        <div v-for="group in navItems" :key="group.group" class="nav-group">
          <div class="nav-group-title">
            <span>{{ group.icon }}</span>
            <span>{{ group.group }}</span>
          </div>
          <router-link
            v-for="item in group.children"
            :key="item.path"
            :to="item.path"
            :class="['nav-item', { active: isActive(item.path) }]"
          >
            {{ item.name }}
          </router-link>
        </div>
      </nav>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f0f2f5;
  color: #333;
}
a { text-decoration: none; color: inherit; }
</style>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: #ccc;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 100;
}

.logo-link {
  display: block;
  text-decoration: none;
}

.logo {
  font-size: 17px;
  padding: 20px;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.logo-link:hover .logo {
  color: #42b883;
}

.nav {
  padding: 12px 0;
  flex: 1;
}

.nav-group {
  margin-bottom: 8px;
}

.nav-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
}

.nav-item {
  display: block;
  padding: 9px 20px 9px 44px;
  font-size: 14px;
  color: #aaa;
  transition: all 0.15s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}

.nav-item.active {
  background: rgba(66, 184, 131, 0.12);
  color: #42b883;
  border-left-color: #42b883;
  font-weight: 500;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
}
</style>
