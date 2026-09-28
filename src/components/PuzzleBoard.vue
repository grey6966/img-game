<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  tiles: { type: Array, required: true },
  gridSize: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  selectedIndex: { type: Number, default: null },
  solved: { type: Boolean, default: false }
})

const emit = defineEmits(['swap', 'click-tile'])

const boardSize = 480 // CSS px，实际用 min() 自适应
const percent = computed(() => 100 / props.gridSize)

const dragFrom = ref(null)
const dragOver = ref(null)
const dragTilePos = ref(null)
const dragPointer = ref(null)
const dragging = ref(false)

/** 根据触摸/鼠标坐标找到对应格子索引 */
function indexFromPoint(clientX, clientY, el) {
  const rect = el.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null
  const col = Math.min(props.gridSize - 1, Math.floor((x / rect.width) * props.gridSize))
  const row = Math.min(props.gridSize - 1, Math.floor((y / rect.height) * props.gridSize))
  return row * props.gridSize + col
}

function onPointerDown(e, index) {
  if (props.solved) return
  dragFrom.value = index
  dragTilePos.value = { x: e.clientX, y: e.clientY }
  dragging.value = false
}

function onPointerMove(e) {
  if (dragFrom.value === null) return
  if (!dragging.value) {
    const dx = e.clientX - dragTilePos.value.x
    const dy = e.clientY - dragTilePos.value.y
    if (Math.hypot(dx, dy) < 8) return // 视为点击
    dragging.value = true
  }
  dragPointer.value = { x: e.clientX, y: e.clientY }
  dragOver.value = indexFromPoint(e.clientX, e.clientY, e.currentTarget)
}

function onPointerUp(e) {
  if (dragFrom.value === null) return
  if (dragging.value) {
    const target = indexFromPoint(e.clientX, e.clientY, e.currentTarget)
    if (target !== null && target !== dragFrom.value) {
      emit('swap', dragFrom.value, target)
    }
  } else {
    // 未产生位移 => 点击
    emit('click-tile', dragFrom.value)
  }
  dragFrom.value = null
  dragOver.value = null
  dragging.value = false
  dragPointer.value = null
}

/** 原图块定位样式：background-position 按原始行列计算 */
function tileStyle(tileId) {
  const row = Math.floor(tileId / props.gridSize)
  const col = tileId % props.gridSize
  return {
    backgroundImage: `url(${props.imageUrl})`,
    backgroundSize: `${props.gridSize * 100}% ${props.gridSize * 100}%`,
    backgroundPosition: `${(col / (props.gridSize - 1 || 1)) * 100}% ${
      (row / (props.gridSize - 1 || 1)) * 100
    }%`
  }
}
</script>

<template>
  <div
    class="board"
    :class="{ 'is-solved': solved }"
    :style="{
      '--n': gridSize,
      '--pct': percent + '%'
    }"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div
      v-for="(tileId, index) in tiles"
      :key="index"
      class="cell"
      :class="{
        'is-selected': !solved && selectedIndex === index,
        'is-dragover': dragging && dragOver === index && dragFrom !== index,
        'is-dragging': dragging && dragFrom === index,
        'is-correct': solved
      }"
      @pointerdown.prevent="onPointerDown($event, index)"
    >
      <div class="piece" :style="tileStyle(tileId)">
        <span class="piece__num">{{ tileId + 1 }}</span>
      </div>
    </div>

    <!-- 拖拽中的浮动块 -->
    <div
      v-if="dragging && dragPointer && dragFrom !== null"
      class="ghost"
      :style="{
        ...tileStyle(tiles[dragFrom]),
        width: `calc(min(${boardSize}px, 92vw) / ${gridSize})`,
        height: `calc(min(${boardSize}px, 92vw) / ${gridSize})`,
        left: dragPointer.x + 'px',
        top: dragPointer.y + 'px'
      }"
    ></div>
  </div>
</template>

<style scoped>
.board {
  position: relative;
  width: min(480px, 92vw);
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: repeat(var(--n), 1fr);
  grid-template-rows: repeat(var(--n), 1fr);
  gap: 3px;
  padding: 3px;
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  touch-action: none;
  user-select: none;
}

.cell {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  background: #e9edf7;
  cursor: pointer;
}

.piece {
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  transition: transform 0.15s ease;
}

.piece__num {
  position: absolute;
  left: 4px;
  top: 3px;
  font-size: 10px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(0, 0, 0, 0.35);
  border-radius: 4px;
  padding: 2px 4px;
  pointer-events: none;
}

.cell.is-selected .piece {
  outline: 3px solid var(--primary);
  outline-offset: -3px;
  z-index: 2;
}

.cell.is-dragover {
  outline: 3px dashed var(--primary);
  outline-offset: -3px;
}

.cell.is-dragging .piece {
  opacity: 0.3;
}

.board.is-solved {
  gap: 0;
  padding: 0;
}

.board.is-solved .cell {
  border-radius: 0;
}

.board.is-solved .piece__num {
  display: none;
}

.ghost {
  position: fixed;
  background-repeat: no-repeat;
  border-radius: 6px;
  transform: translate(-50%, -50%) scale(1.06);
  box-shadow: 0 12px 30px rgba(31, 39, 51, 0.35);
  pointer-events: none;
  z-index: 50;
}
</style>
