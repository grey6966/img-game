<script setup>
import { ref } from 'vue'

const props = defineProps({
  imageUrl: { type: String, required: true },
  size: { type: Number, required: true },
  pieces: { type: Array, required: true },
  solved: { type: Boolean, default: false },
  paused: { type: Boolean, default: false },
  // 提示高亮的格子索引（位置），闪烁提示其应放的块
  hintCells: { type: Array, default: () => [] }
})

const emit = defineEmits(['swap'])

const selected = ref(-1)
const dragIndex = ref(-1)
const dragOverIndex = ref(-1)
const pointerStart = ref(null)
const dragging = ref(false)

function bgPosition(id) {
  const row = Math.floor(id / props.size)
  const col = id % props.size
  return {
    backgroundImage: `url(${props.imageUrl})`,
    backgroundSize: `${props.size * 100}% ${props.size * 100}%`,
    backgroundPosition: `${(col / (props.size - 1)) * 100}% ${
      (row / (props.size - 1)) * 100
    }%`
  }
}

function isCorrect(index) {
  return props.pieces[index] === index
}

function interactive() {
  return !props.solved && !props.paused
}

function handleClick(index) {
  if (!interactive() || dragging.value) return
  if (selected.value === -1) {
    selected.value = index
    return
  }
  if (selected.value === index) {
    selected.value = -1
    return
  }
  emit('swap', selected.value, index)
  selected.value = -1
}

function onPointerDown(e, index) {
  if (!interactive()) return
  pointerStart.value = { x: e.clientX, y: e.clientY, index }
  dragIndex.value = -1
  dragging.value = false
}

function onPointerMove(e) {
  if (!pointerStart.value || props.paused) return
  const dx = e.clientX - pointerStart.value.x
  const dy = e.clientY - pointerStart.value.y
  if (!dragging.value && Math.hypot(dx, dy) > 8) {
    dragging.value = true
    dragIndex.value = pointerStart.value.index
    selected.value = -1
  }
  if (dragging.value) {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const tile = el?.closest?.('[data-index]')
    dragOverIndex.value = tile ? Number(tile.dataset.index) : -1
  }
}

function onPointerUp() {
  if (dragging.value && dragIndex.value !== -1 && dragOverIndex.value !== -1 &&
      dragOverIndex.value !== dragIndex.value && !props.paused) {
    emit('swap', dragIndex.value, dragOverIndex.value)
  }
  pointerStart.value = null
  dragIndex.value = -1
  dragOverIndex.value = -1
  setTimeout(() => (dragging.value = false), 0)
}
</script>

<template>
  <div
    class="board-wrap"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div
      class="board"
      :class="{ merged: solved }"
      :style="{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: solved ? '0px' : '3px'
      }"
    >
      <div
        v-for="(pieceId, index) in pieces"
        :key="index"
        :data-index="index"
        class="tile"
        :class="{
          selected: selected === index,
          dragging: dragIndex === index,
          'drag-over': dragOverIndex === index && dragIndex !== index,
          correct: solved || isCorrect(index),
          hint: hintCells.includes(index)
        }"
        :style="bgPosition(pieceId)"
        @click="handleClick(index)"
        @pointerdown="(e) => onPointerDown(e, index)"
      >
        <span v-if="!solved && size <= 4" class="tile-num">{{ pieceId + 1 }}</span>
      </div>

      <!-- 暂停遮罩：遮住拼图并阻止交互 -->
      <div v-if="paused && !solved" class="pause-mask">
        <div class="pause-emoji">⏸️</div>
        <p>已暂停</p>
      </div>

      <div v-if="solved" class="win-mask">
        <div class="win-emoji">🎉</div>
        <p>拼图完成！</p>
      </div>
    </div>
    <p class="board-tip">点击两块进行交换，或拖动一块到目标位置</p>
  </div>
</template>

<style scoped>
.board-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.board {
  position: relative;
  display: grid;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #eceef8;
  border-radius: 10px;
  padding: 4px;
  touch-action: none;
  transition: gap 0.5s ease, padding 0.5s ease;
}

.board.merged {
  padding: 0;
  border-radius: 10px;
}

.tile {
  position: relative;
  border-radius: 6px;
  background-color: #dfe2f2;
  background-repeat: no-repeat;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease,
    border-radius 0.5s ease;
}

.board.merged .tile {
  border-radius: 0;
}

.tile:hover {
  transform: scale(0.98);
}

.tile.selected {
  box-shadow: 0 0 0 3px var(--primary), 0 0 14px rgba(91, 108, 255, 0.5);
  transform: scale(0.95);
  z-index: 2;
}

.tile.dragging {
  opacity: 0.4;
  transform: scale(0.92);
}

.tile.drag-over {
  box-shadow: 0 0 0 3px var(--success);
  transform: scale(0.95);
}

.tile.correct {
  box-shadow: inset 0 0 0 1px rgba(46, 204, 143, 0.45);
}

.tile.hint {
  animation: hint-pulse 0.7s ease-in-out 3;
  z-index: 3;
}

@keyframes hint-pulse {
  0%,
  100% {
    box-shadow: inset 0 0 0 2px rgba(255, 209, 102, 0.9);
  }
  50% {
    box-shadow:
      0 0 0 3px #ffd166,
      0 0 18px rgba(255, 209, 102, 0.8);
  }
}

.tile-num {
  position: absolute;
  left: 4px;
  top: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  pointer-events: none;
}

.pause-mask,
.win-mask {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  animation: pop 0.3s ease;
  z-index: 5;
}

.pause-mask {
  background: rgba(20, 24, 50, 0.78);
  backdrop-filter: blur(3px);
}

.win-mask {
  background: rgba(20, 24, 50, 0.55);
}

.pause-emoji,
.win-emoji {
  font-size: 48px;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.board-tip {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}
</style>
