<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Cell from '../components/Cell.vue'
import { useMinesweeper } from '../composables/useMinesweeper'

const emit = defineEmits(['back'])

// 1. 获取扫雷逻辑
const { 
  board, minesLeft, timer, 
  initClassicGame, openCell, toggleFlag, chordOpen,
  gameOver, isWin, revealAllMines, saveStats 
} = useMinesweeper()

// 2. 初始化经典模式 (以高级模式 16x30, 99雷 为例)
const rows = 16
const cols = 30
const mines = 99

onMounted(() => {
  initClassicGame(rows, cols, mines)
})

// 3. 计算格子大小 (经典模式格子通常多，比例要调小一点)
const cellSize = computed(() => {
  const maxWidth = window.innerWidth * 0.9
  const maxHeight = window.innerHeight * 0.7
  return Math.floor(Math.min(maxWidth / cols, maxHeight / rows))
})

// 结算弹窗逻辑
const handleGameOver = async (lose) => {
  if (lose) {
    const date = new Date().toLocaleDateString(); // 加上这一行
    await revealAllMines(30); // 1. 先播放地雷翻开动画
    
    const stats = saveStats(false, timer.value); // 2. 保存战绩
    const winRate = ((stats.wins / stats.total) * 100).toFixed(1);

    // 3. 使用 confirm 进行选择
    const isRetry = confirm(
      `很遗憾，你输了！\n\n` +
      `🏆 胜场：${stats.wins}  总场：${stats.total}  胜率：${winRate}%\n` +
      `⏱️ 本次用时：${timer.value}s  最佳用时：${stats.bestTime}s\n` +
      `📅 日期：${date}\n\n` +
      `点击“确定”：再来一局\n点击“取消”：返回菜单`
    );

    if (isRetry) {
      initClassicGame(rows, cols, mines); // 用户选了确定，重置游戏
    } else {
      emit('back'); // 用户选了取消，退出到主菜单
    }
  }
}

const handleWin = (win) => {
  if (win) {
    setTimeout(() => {
      // 1. 更新并获取统计数据（第一个参数传 true 表示胜利）
      const stats = saveStats(true, timer.value);
      
      // 2. 准备结算数据
      const winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : "100.0";
      const date = new Date().toLocaleDateString();

      // 3. 使用 confirm 弹出详细结算并获取用户选择
      const isRetry = confirm(
        `恭喜你，通关了！\n\n` +
        `🏆 胜场：${stats.wins}  总场：${stats.total}  胜率：${winRate}%\n` +
        `⏱️ 本次用时：${timer.value}s  🚀 最佳用时：${stats.bestTime}s\n` +
        `📅 日期：${date}\n\n` +
        `点击“确定”：再来一局\n点击“取消”：返回菜单`
      );

      // 4. 根据用户选择执行逻辑
      if (isRetry) {
        initClassicGame(rows, cols, mines); // 重新初始化游戏
      } else {
        emit('back'); // 触发返回事件
      }
    }, 100); // 100毫秒足够 DOM 完成更新
  }
}

// 监听状态
watch(gameOver, (val) => val && handleGameOver(true));
watch(isWin, (val) => val && handleWin(true));

</script>

<template>
  <div class="classic-game">
    <button class="back-btn-fixed" @click="emit('back')">返回主菜单</button>

    <div class="stage-header">
      <h1 class="level-title">经典实战 ({{ rows }}×{{ cols }})</h1>
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
.classic-game {
  width: 100vw;
  height: 100vh;
  /* 统一背景图 */
  /* 注意：因为 ClassicGame 在 views 文件夹，路径可能需要多跳一级回到 images */
  background: 
    linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), 
    url('/images/zym.png') no-repeat center center;
  background-size: cover;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}
.stage-header {
  margin-top: 40px;
  color: #e2e2e2;
  text-align: center;
}

.status-bar {
  display: flex;
  gap: 40px;
  background: rgba(0, 0, 0, 0.4);
  padding: 12px 30px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  margin-top: 15px;
  color: #47d3e5;
}

.board-outer {
  margin-top: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  max-width: 95vw;
  max-height: 80vh;
  overflow: auto; /* 经典模式格子多时允许滚动 */
}

.row {
  display: flex;
}

.back-btn-fixed {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: 0.3s;
}

.back-btn-fixed:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #47d3e5;
}
</style>