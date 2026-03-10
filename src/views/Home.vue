<script setup>
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">前端学习平台</h1>
      <p class="hero-desc">Vue 3 + TypeScript 系统化学习，从入门到实战</p>
    </div>

    <div class="cards">
      <router-link to="/vue/tutorial" class="card vue-card">
        <div class="card-icon">🟢</div>
        <h2>Vue 3 学习</h2>
        <p>HTML/CSS/JS 基础、Vue 模板语法、响应式、组件通信、路由、状态管理</p>
        <div class="card-links">
          <router-link to="/vue/tutorial" class="link">教程</router-link>
          <router-link to="/vue/demo" class="link">演示案例</router-link>
        </div>
      </router-link>

      <router-link to="/ts/tutorial" class="card ts-card">
        <div class="card-icon">🔷</div>
        <h2>TypeScript 学习</h2>
        <p>基础类型、泛型、高级工具类型、Vue3+TS 实战、工程化迁移</p>
        <div class="card-links">
          <router-link to="/ts/tutorial" class="link">教程</router-link>
          <router-link to="/ts/demo" class="link">演示案例</router-link>
        </div>
      </router-link>
    </div>

    <div class="stats">
      <div class="stat-item">
        <span class="stat-num">10</span>
        <span class="stat-label">Vue 章节</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">12</span>
        <span class="stat-label">TS 章节</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">60+</span>
        <span class="stat-label">面试题</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">30+</span>
        <span class="stat-label">代码示例</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 960px;
  margin: 0 auto;
  padding: 60px 32px;
}

.hero {
  text-align: center;
  margin-bottom: 48px;
}

.hero-title {
  font-size: 40px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 12px;
}

.hero-desc {
  font-size: 18px;
  color: #666;
}

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

.card {
  display: block;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.vue-card:hover { border-color: #42b883; }
.ts-card:hover { border-color: #3178c6; }

.card-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.card h2 {
  font-size: 22px;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.card p {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin-bottom: 20px;
}

.card-links {
  display: flex;
  gap: 12px;
}

.card-links .link {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.vue-card .link {
  background: rgba(66,184,131,0.1);
  color: #42b883;
}
.vue-card .link:hover {
  background: #42b883;
  color: #fff;
}

.ts-card .link {
  background: rgba(49,120,198,0.1);
  color: #3178c6;
}
.ts-card .link:hover {
  background: #3178c6;
  color: #fff;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.stat-item {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}
</style>
