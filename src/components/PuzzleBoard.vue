<script setup>
import { ref } from 'vue'

const props = defineProps({
  imageUrl: { type: String, required: true },
  size: { type: Number, required: true },
  pieces: { type: Array, required: true },
  solved: { type: Boolean, default: false }
})

const emit = defineEmits(['swap'])

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

function handleClick(index) {
  if (props.solved || dragging.value) return
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
  if (props.solved) return
  pointerStart.value = { x: e.clientX, y: e.clientY, index }
  dragIndex.value = -1
  dragging.value = false
}

function onPointerMove(e) {
  if (!pointerStart.value) return
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
      dragOverIndex.value !== dragIndex.value) {
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
      :style="{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: gap + 'px'
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
          correct: solved || isCorrect(index)
        }"
        :style="bgPosition(pieceId)"
        @click="handleClick(index)"
        @pointerdown="(e) => onPointerDown(e, index)"
      >
        <span v-if="!solved && size <= 4" class="tile-num">{{ pieceId + 1 }}</span>
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
}

.tile {
  position: relative;
  border-radius: 6px;
  background-color: #dfe2f2;
  background-repeat: no-repeat;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
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
  /* 位置正确时加细微高光 */
  box-shadow: inset 0 0 0 1px rgba(46, 204, 143, 0.45);
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

.win-mask {
  position: absolute;
  inset: 4px;
  border-radius: 8px;
  background: rgba(20, 24, 50, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  animation: pop 0.35s ease;
}

.win-emoji {
  font-size: 48px;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.9);
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
