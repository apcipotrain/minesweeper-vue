<script setup>
import { ref, onMounted, watch } from 'vue'
import ChallengeHome from './views/ChallengeHome.vue' // 确保路径正确
import ChapterMap from './views/ChapterMap.vue'     // 确保路径正确
import { useMinesweeper } from './composables/useMinesweeper'
import levelData from './data/level.json'
// --- 关键：添加缺失的组件导入 ---
import GameStage from './views/GameStage.vue'   // 确保路径指向你存放 GameStage 的位置
import ClassicGame from './views/ClassicGame.vue' // 如果还没写这个文件，先注释掉相关的 HTML 标签

const { gameOver, isWin, initGame } = useMinesweeper()

// --- 状态控制 ---
// 'menu': 主菜单
// 'challenge-home': 选章节 (原 challenge_home)
// 'chapter-map': 选关卡 (原 chapter_levels)
// 'playing': 游戏进行中 (实战或闯关)
const gameMode = ref('menu') 
const currentLevel = ref(null)
const selectedChapter = ref(1)

// --- 模式切换函数 ---
// 选好了章节，进入 1-8 关卡地图
const pickChapter = (ch) => {
  selectedChapter.value = ch
  gameMode.value = 'chapter-map'
}

// 1. 初始化已解锁的最大关卡 ID (默认为 1)
const maxUnlockedId = ref(Number(localStorage.getItem('ms_unlocked_id')) || 1);

// 2. 选关函数增加解锁逻辑判断
const handleLevelSelect = (chIdx, lvlIdx) => {
  // 计算当前点击关卡的全局 ID
  const globalId = (chIdx - 1) * 8 + (lvlIdx + 1);
  
  if (globalId <= maxUnlockedId.value) {
    const chapterKey = `chapter${chIdx}`;
    currentLevel.value = { 
      ...levelData[chapterKey][lvlIdx],
      globalId // 注入全局 ID，方便 GameStage 结算
    };
    gameMode.value = 'playing';
  } else {
    alert("该关卡尚未解锁，请先通过前面的关卡！");
  }
};

// 3. 通关后解锁下一关的逻辑
const handleUnlockNext = (completedGlobalId) => {
  // 如果完成的是当前最新的一关，且不是最后一关(24)，则解锁下一关
  if (completedGlobalId === maxUnlockedId.value && completedGlobalId < 24) {
    maxUnlockedId.value = completedGlobalId + 1;
    localStorage.setItem('ms_unlocked_id', maxUnlockedId.value);
  }
};

// 4. 下一关处理函数（你代码里已有的，微调一下）
const handleNextLevel = () => {
  const chapterKey = `chapter${selectedChapter.value}`;
  const chapterLevels = levelData[chapterKey];
  const currentIndex = chapterLevels.findIndex(l => l.id === currentLevel.value.id);

  if (currentIndex < chapterLevels.length - 1) {
    // 章节内下一关
    handleLevelSelect(selectedChapter.value, currentIndex + 1);
  } else if (selectedChapter.value < 3) {
    // 跨章节进入下一章第一关
    alert("恭喜！你已通关本章节所有关卡！")
    selectedChapter.value += 1;
    handleLevelSelect(selectedChapter.value, 0);
  } else {
    alert("恭喜！你已通关本游戏！")
    gameMode.value = 'menu';
  }
};

</script>

<template>
  <div class="game-wrapper">
    <div v-if="gameMode === 'menu'" class="main-menu">
      <h2 class="game-title">扫雷教程·vue版</h2>
      <div class="menu-buttons">
        <button class="menu-btn challenge" @click="gameMode = 'challenge-home'">闯关模式</button>
        <button class="menu-btn classic" @click="gameMode = 'classic-game'">经典实战</button>
      </div>
    </div>

    <ChallengeHome 
      v-else-if="gameMode === 'challenge-home'" 
      @select="pickChapter" 
      @back="gameMode = 'menu'" 
    />

    <ChapterMap 
      v-else-if="gameMode === 'chapter-map'" 
      :chapterId="selectedChapter" 
      :maxUnlockedId="maxUnlockedId"  @select="handleLevelSelect" 
      @back="gameMode = 'challenge-home'" 
    />

    <GameStage 
      v-else-if="gameMode === 'playing'" 
      :levelData="currentLevel" 
      :chapterId="selectedChapter"
      @back="gameMode = 'chapter-map'"
      @next-level="handleNextLevel"
      @success="handleUnlockNext" 
    />

    <ClassicGame 
      v-else-if="gameMode === 'classic-game'" 
      @back="gameMode = 'menu'"
    />
  </div>
</template>

<style scoped>
/* 基础样式复用 */
@import "./assets/board.css";

/* App.vue */
.game-wrapper {
  width: 100vw;
  height: 100vh;
  /* 1. 统一在这里设置背景，去掉之前的 #a7deed 浅蓝色 */
  background: 
    linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), 
    url('/images/zym.png') no-repeat center center;
  background-size: cover;
}

.main-menu {
  width: 100%;
  height: 100%;
  /* 2. 主菜单设为透明，直接透出 wrapper 的背景 */
  background: transparent; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.game-title {
  font-size: 3rem;
  margin-bottom: 50px;
  letter-spacing: 4px;
  text-shadow: 0 5px 15px rgba(0,0,0,0.2);
  color: rgb(255, 0, 230);
}

.menu-buttons {
  display: flex;
  gap: 30px;
}

.menu-btn {
  padding: 20px 40px;
  font-size: 1.2rem;
  border-radius: 15px;
  border: 2px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.1);
  font-size: 24px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.menu-btn:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-5px);
  border-color: rgb(255, 0, 230);
}

.status-left {
  display: flex;
  gap: 20px;
  font-family: monospace;
  background: rgba(0,0,0,0.5);
  padding: 5px 15px;
  border-radius: 20px;
}
</style>