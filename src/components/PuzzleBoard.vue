<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  imageUrl: { type: String, required: true },
  size: { type: Number, required: true },
  pieces: { type: Array, required: true },
  solved: { type: Boolean, default: false },
  paused: { type: Boolean, default: false },
  // 提示：需要高亮的格子下标列表（错位块）及其正确目标
  hintCells: { type: Array, default: () => [] },
  hintTargets: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['swap', 'resume'])

const selected = ref(-1)
const dragIndex = ref(-1)
const dragOverIndex = ref(-1)
const pointerStart = ref(null)
const dragging = ref(false)

const gap = 3 // px between tiles

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

watch(
  () => props.solved,
  v => {
    if (v) selected.value = -1
  }
)

function handleClick(index) {
  if (props.solved || props.paused || dragging.value) return
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
  if (props.solved || props.paused) return
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
        gap: solved ? '0px' : gap + 'px'
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
          'hint-wrong': !solved && hintCells.includes(index),
          'hint-target': !solved && hintTargets[index] !== undefined
        }"
        :style="bgPosition(pieceId)"
        @click="handleClick(index)"
        @pointerdown="(e) => onPointerDown(e, index)"
      >
        <span v-if="!solved && size <= 4" class="tile-num">{{ pieceId + 1 }}</span>
        <span
          v-if="!solved && hintTargets[index] !== undefined"
          class="hint-arrow"
        >➜</span>
      </div>

      <!-- 暂停遮罩：盖住拼图，防止偷看参考排布 -->
      <Transition name="fade">
        <div v-if="paused && !solved" class="pause-mask" @click="emit('resume')">
          <div class="pause-icon">⏸</div>
          <p class="pause-title">已暂停</p>
          <p class="pause-hint">计时已停止 · 点击继续</p>
        </div>
      </Transition>
    </div>
    <p class="board-tip">点击两块交换，或拖动一块到目标位置</p>
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
}

/* 完成时合拢：去掉间隙与内边距 */
.board.merged {
  gap: 0;
  padding: 0;
  background: transparent;
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
  box-shadow: none;
  transition: border-radius 0.5s ease;
}

.board.merged .tile:first-child {
  border-radius: 10px 0 0 0;
}
.board.merged .tile:last-child {
  border-radius: 0 0 10px 0;
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

/* 提示高亮：错位块用金色脉冲，目标块用绿色描边 + 箭头 */
.tile.hint-wrong {
  animation: hint-pulse 0.9s ease-in-out infinite;
  z-index: 2;
}

.tile.hint-target {
  box-shadow: 0 0 0 3px var(--success), 0 0 16px rgba(46, 204, 143, 0.6);
  z-index: 2;
}

.hint-arrow {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
  pointer-events: none;
  animation: pop 0.3s ease;
}

@keyframes hint-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 3px #ffb703, 0 0 10px rgba(255, 183, 3, 0.5);
  }
  50% {
    box-shadow: 0 0 0 4px #ffd166, 0 0 22px rgba(255, 183, 3, 0.9);
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

.pause-mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  border-radius: 10px;
  background: rgba(20, 24, 50, 0.82);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
  cursor: pointer;
}

.pause-icon {
  font-size: 44px;
}

.pause-title {
  font-size: 22px;
  font-weight: 800;
}

.pause-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.6);
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
