<script setup>
// 关键修复 1：必须从 vue 中导入 computed
import { computed } from 'vue' 

const props = defineProps(['chapterId', 'maxUnlockedId'])
const emit = defineEmits(['select', 'back'])

const chapterConfigs = {
  1: { title: "第一章：基础规则", bg: "/images/main_background0.png", panel: "rgba(0,0,0,0.35)", accent: "#5ff38e" },
  2: { title: "第二章：进阶公式", bg: "/images/main_background1.png", panel: "rgba(20,40,60,0.45)", accent: "#f46ad9" },
  3: { title: "第三章：高难残局", bg: "/images/main_background2.png", panel: "rgba(60,20,20,0.45)", accent: "#47d3e5" }
}

// 核心逻辑：计算当前章节 8 个格子的解锁状态
const levelStatus = computed(() => {
  return [1, 2, 3, 4, 5, 6, 7, 8].map(i => {
    // 全局 ID 计算逻辑：(章节-1)*8 + 当前索引
    const globalId = (props.chapterId - 1) * 8 + i;
    return {
      index: i - 1,
      isLocked: globalId > props.maxUnlockedId // 大于已解锁 ID 则锁定
    };
  });
});

const config = chapterConfigs[props.chapterId]
</script>

<template>
  <div class="chapter-map" :style="{ backgroundImage: `url(${config.bg})` }">
    <button class="back-btn-fixed" @click="emit('back')">返回</button>
    
    <h1 class="chapter-title">{{ config.title }}</h1>
    
    <div class="level-panel" :style="{ backgroundColor: config.panel }">
      <div class="level-grid">
        <div 
          v-for="item in levelStatus" 
          :key="item.index" 
          class="level-card"
          :class="{ 'locked': item.isLocked }" 
          :style="{ '--accent': config.accent }"
          @click="!item.isLocked && emit('select', props.chapterId, item.index)"
        >
          <span v-if="item.isLocked">🔒</span>
          <span v-else>{{ item.index + 1 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chapter-map {
  width: 100vw; height: 100vh;
  background-size: cover; background-position: center;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}

.chapter-title {
  font-size: 48px; color: white; margin-bottom: 30px;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.level-panel { padding: 40px; border-radius: 20px; backdrop-filter: blur(5px); }

.level-grid {
  display: grid;
  grid-template-columns: repeat(4, 120px);
  grid-template-rows: repeat(2, 120px);
  gap: 25px;
}

.level-card {
  background: rgba(255, 255, 255, 0.85);
  color: var(--accent); 
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: bold;
  cursor: pointer; transition: 0.2s;
  border: 1px solid rgba(0,0,0,0.1);
}

/* 关键修复 4：添加锁定状态的置灰样式 */
.level-card.locked {
  background: rgba(0, 0, 0, 0.4);
  color: #777;
  cursor: not-allowed;
  filter: grayscale(1);
}

.level-card:not(.locked):hover {
  transform: translateY(-5px);
  background: var(--accent); 
  color: white; 
  box-shadow: 0 8px 15px rgba(0,0,0,0.2);
}

.back-btn-fixed {
  position: fixed; top: 20px; left: 20px;
  padding: 10px 20px; background: rgba(0,0,0,0.5);
  color: white; border: 1px solid white; border-radius: 8px; cursor: pointer;
}
</style>