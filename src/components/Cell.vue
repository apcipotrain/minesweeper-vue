<script setup>
import { ref } from 'vue'

const props = defineProps(['status', 'cellSize'])
const emit = defineEmits(['leftClick', 'rightClick', 'chordClick'])

// 模拟你原先的全局变量，但现在是每个格子私有的
// Cell.vue 的 script setup 部分
let leftDown = false;
let rightDown = false;
let isChordAction = false; // 新增：是否正在进行双键操作的标记

const handleMouseDown = (e) => {
  if (e.button === 0) leftDown = true;
  if (e.button === 2) rightDown = true;
  
  if (e.buttons === 3 || (leftDown && rightDown)) {
    isChordAction = true; // 标记现在是双键状态
    emit('chordClick');
  }
};

const handleMouseUp = (e) => {
  // 如果刚才触发过双键，那么抬起时什么都不做，直接重置
  if (isChordAction) {
    if (e.buttons === 0) { // 等到所有键都抬起了
      isChordAction = false;
      leftDown = false;
      rightDown = false;
    }
    return; 
  }

  if (e.button === 0 && leftDown) {
    emit('leftClick');
  } else if (e.button === 2 && rightDown) {
    emit('rightClick');
  }

  // 重置状态
  if (e.button === 0) leftDown = false;
  if (e.button === 2) rightDown = false;
};


// 增加一个鼠标移出重置，防止拖拽导致状态卡死
const handleMouseLeave = () => {
  leftDown = false
  rightDown = false
}
</script>

<template>
  <div 
    class="cell" 
    :class="{ 'open': status.isOpen, 'flag': status.isFlag }"
    :data-num="status.isOpen && !status.isMine && status.count > 0 ? status.count : null"
    :style="{ width: cellSize + 'px', height: cellSize + 'px' }"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @contextmenu.prevent
  >
    <template v-if="status.isOpen">
      <span v-if="status.isMine">💣</span>
      <span v-else-if="status.count > 0">{{ status.count }}</span>
    </template>
    <span v-else-if="status.isFlag">🚩</span>
  </div>
</template>