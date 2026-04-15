<script setup>
import { ref, computed, onMounted, watch } from 'vue' // 必须包含 watch 和 ref
import Cell from '../components/Cell.vue'
import { useMinesweeper } from '../composables/useMinesweeper'

const props = defineProps(['levelData', 'chapterId'])
const emit = defineEmits(['back', 'success', 'next-level'])
const showResult = ref(false);

// --- 1. 统一声明扫雷逻辑 (只声明一次) ---
const { 
  board, minesLeft, timer, 
  initGame, openCell, toggleFlag, chordOpen,
  gameOver, isWin, revealAllMines
} = useMinesweeper()

// --- 2. 在组件挂载时初始化数据 ---
onMounted(() => {
  if (props.levelData) {
    initGame(props.levelData)
  }
})

// --- 3. 核心修复：棋盘格子自适应计算 ---
const cellSize = computed(() => {
  if (!props.levelData) return 40
  const { rows, cols } = props.levelData
  const maxWidth = window.innerWidth * 0.8
  const maxHeight = window.innerHeight * 0.6 
  return Math.floor(Math.min(maxWidth / cols, maxHeight / rows))
})

// 监听关卡数据变化（核心修复）
watch(() => props.levelData, (newLevel) => {
  if (newLevel) {
    // 1. 重新初始化棋盘和雷数
    initGame(newLevel);
    // 2. 这里的 initGame 内部应该包含停止旧计时器并开启新计时的逻辑
  }
}, { deep: true });

// 成功结算
watch(isWin, (win) => {
  if (win) {
    // 关键：通知父组件解锁下一关
    emit('success', props.levelData.globalId);

    setTimeout(() => {
      const choice = confirm(
        `🎉 挑战成功！\n\n` +
        `“${props.levelData?.quote || '再接再厉！'}”\n\n` +
        `点击“确定”：进入下一关\n点击“取消”：返回地图`
      );

      if (choice) {
        emit('next-level'); // 需要在 App.vue 监听此事件以切换到下一关
      } else {
        emit('back');
      }
    }, 100); // 100毫秒足够 DOM 完成更新
  }
})

// 失败结算
watch(gameOver, (lose) => {
  if (lose) {
    const choice = confirm(
      `胜败乃兵家常事\n\n` +
      `少侠，再试一次吧！\n\n` +
      `点击“确定”：重新挑战\n点击“取消”：返回地图`
    )

    if (choice) {
      initGame(props.levelData) // 重新初始化当前关卡
    } else {
      emit('back')
    }
  }
})
</script>

<template>
  <div class="game-stage" :style="{ backgroundImage: `url(/images/main_background${chapterId-1}.png)` }">
    
    <button class="back-btn-fixed" @click="emit('back')">返回</button>

    <div class="stage-header">
      <h1 class="level-title">{{ levelData?.name }}</h1>
      <div class="status-bar">
        <span>🚩 剩余: {{ minesLeft }}</span>
        <span>⏱️ 时间: {{ timer }}s</span>
      </div>
    </div>

    <div class="board-outer">
      <div class="board-container">
        <div v-for="(row, rIdx) in board" :key="rIdx" class="row">
          <Cell 
            v-for="(cell, cIdx) in row" 
            :key="cIdx" 
            :status="cell"
            :cell-size="cellSize" 
            @leftClick="openCell(rIdx, cIdx)"
            @rightClick="toggleFlag(rIdx, cIdx)"
            @chordClick="chordOpen(rIdx, cIdx)" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-stage {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stage-header {
  margin-top: 60px;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  text-align: center;
}

.status-bar {
  display: flex;
  gap: 30px;
  background: rgba(0,0,0,0.6);
  padding: 10px 25px;
  border-radius: 30px;
  font-family: monospace;
  font-size: 20px;
  margin-top: 10px;
}

.board-outer {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.2); 
  border-radius: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* 关键：确保每一行是横向排列的 */
.row {
  display: flex;
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
  backdrop-filter: blur(5px);
  transition: 0.3s;
}

.back-btn-fixed:hover {
  background: rgba(255,255,255,0.2);
}
</style>