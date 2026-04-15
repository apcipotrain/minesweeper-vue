<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['select', 'back'])

// 响应式状态
const offset = ref(0)
const speed = ref(0)
const bgIndex = ref(0)
let animationId = null

const CARD_WIDTH = 600
const GAP = 80
const STEP = CARD_WIDTH + GAP

// 鼠标位置控制移动速度 (搬运自原版 JS)
const handleMouseMove = (e) => {
  const x = e.clientX
  const width = window.innerWidth
  const leftZone = width * 0.25
  const rightZone = width * 0.75

  if (x < leftZone) {
    speed.value = -((leftZone - x) / leftZone) * 16
  } else if (x > rightZone) {
    speed.value = ((x - rightZone) / leftZone) * 16
  } else {
    speed.value = 0
  }
}

// 动画循环
const animate = () => {
  offset.value += speed.value
  const maxOffset = (3 - 1) * STEP // 3个章节
  offset.value = Math.max(0, Math.min(offset.value, maxOffset))
  
  // 计算当前居中的背景索引
  bgIndex.value = Math.round(offset.value / STEP)
  
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <div class="challenge-home">
    <div 
      class="bg-blur" 
      :style="{ backgroundImage: `url(images/main_background${bgIndex}.png)` }" 
    ></div>

    <button class="back-btn-fixed" @click="emit('back')">返回</button>

    <div class="carousel-wrapper">
      <div class="carousel" :style="{ transform: `translateX(${-offset}px)` }">
        <div class="card" @click="emit('select', 1)">
          <img src="/images/main_background0.png" class="card-img">
          <div class="card-title">基础规则</div>
        </div>

        <div class="card" @click="emit('select', 2)">
          <img src="/images/main_background1.png" class="card-img">
          <div class="card-title">进阶公式</div>
        </div>

        <div class="card" @click="emit('select', 3)">
          <img src="/images/main_background2.png" class="card-img">
          <div class="card-title">高难残局</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 直接搬运你的 challenge_home.css 核心内容 */
.challenge-home {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.bg-blur {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(10px) brightness(0.6);
  transition: background-image 0.4s ease;
  z-index: 0;
}

.carousel-wrapper {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
}

.carousel {
  display: flex;
  gap: 80px;
  /* 这里的 padding 确保第一张和最后一张能居中 */
  padding-left: calc((100vw - 600px) / 2);
  padding-right: calc((100vw - 600px) / 2);
}

.card {
  width: 600px;
  height: 350px;
  flex-shrink: 0;
  border-radius: 25px;
  border: 6px solid rgba(255,255,255,0.8);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.25s ease;
  box-shadow: 0 15px 30px rgba(0,0,0,0.45);
}

.card:hover { transform: scale(1.05); }

.card-img { width: 100%; height: 100%; object-fit: cover; }

.card-title {
  position: absolute;
  bottom: 30px;
  left: 30px;
  color: white;
  font-size: 36px;
  font-weight: bold;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.back-btn-fixed {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10;
  padding: 10px 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: 1px solid white;
  border-radius: 8px;
  cursor: pointer;
}
</style>