<script setup>
// 图片编辑器：在正方形框内拖动平移、滚轮/按钮缩放、旋转 90°
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  file: { type: File, required: true }
})
const emit = defineEmits(['confirm', 'cancel'])

const OUT_PX = 720
const VIEW = 320 // 预览框 CSS px

const dataUrl = ref('')
const img = ref(null)
const loading = ref(true)
const scale = ref(1) // 相对“铺满”的倍率
const rotation = ref(0) // 0/90/180/270
const tx = ref(0)
const ty = ref(0)
let raf = 0

const drag = ref(null)

function fitBase() {
  // 初始铺满（cover）
  const im = img.value
  if (!im) return 1
  const r = ((rotation.value % 180) + 180) % 180 === 90
  const w = r ? im.height : im.width
  const h = r ? im.width : im.height
  return Math.max(VIEW / w, VIEW / h)
}

function clampPan() {
  const im = img.value
  if (!im) return
  const r = ((rotation.value % 180) + 180) % 180 === 90
  const w = (r ? im.height : im.width) * fitBase() * scale.value
  const h = (r ? im.width : im.height) * fitBase() * scale.value
  const maxX = Math.max(0, (w - VIEW) / 2)
  const maxY = Math.max(0, (h - VIEW) / 2)
  tx.value = Math.min(maxX, Math.max(-maxX, tx.value))
  ty.value = Math.min(maxY, Math.max(-maxY, ty.value))
}

const imgStyle = computed(() => ({
  backgroundImage: `url(${dataUrl.value})`,
  transform: `translate(calc(-50% + ${tx.value}px), calc(-50% + ${ty.value}px)) rotate(${rotation.value}deg) scale(${scale.value})`,
  width: img.value ? img.value.width * fitBase() + 'px' : '0px',
  height: img.value ? img.value.height * fitBase() + 'px' : '0px'
}))

watch([scale, rotation, tx, ty], () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(clampPan)
})

function readFile() {
  loading.value = true
  const reader = new FileReader()
  reader.onload = () => {
    const image = new Image()
    image.onload = () => {
      img.value = image
      dataUrl.value = reader.result
      loading.value = false
      scale.value = 1
      rotation.value = 0
      tx.value = ty.value = 0
    }
    image.src = reader.result
  }
  reader.readAsDataURL(props.file)
}

function onDown(e) {
  const p = e.touches ? e.touches[0] : e
  drag.value = { x: p.clientX, y: p.clientY, tx: tx.value, ty: ty.value }
}
function onMove(e) {
  if (!drag.value) return
  const p = e.touches ? e.touches[0] : e
  tx.value = drag.value.tx + (p.clientX - drag.value.x)
  ty.value = drag.value.ty + (p.clientY - drag.value.y)
}
function onUp() {
  drag.value = null
}
function onWheel(e) {
  e.preventDefault()
  const next = scale.value * (e.deltaY < 0 ? 1.08 : 0.92)
  scale.value = Math.min(3, Math.max(1, next))
}
function zoomBy(v) {
  scale.value = Math.min(3, Math.max(1, scale.value + v))
}
function rotate90() {
  rotation.value = (rotation.value + 90) % 360
  // 旋转后旧平移量可能非法，直接归零更直观
  tx.value = ty.value = 0
}

function confirm() {
  if (!img.value) return
  const canvas = document.createElement('canvas')
  canvas.width = OUT_PX
  canvas.height = OUT_PX
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, OUT_PX, OUT_PX)

  const base = fitBase()
  const k = OUT_PX / VIEW // 预览坐标 -> 输出坐标
  ctx.save()
  ctx.translate(OUT_PX / 2 + tx.value * k, OUT_PX / 2 + ty.value * k)
  ctx.rotate((rotation.value * Math.PI) / 180)
  ctx.scale(base * scale.value * k, base * scale.value * k)
  ctx.drawImage(img.value, -img.value.width / 2, -img.value.height / 2)
  ctx.restore()

  // 大图压缩：720x720 jpeg 已足够清晰且体积小
  emit('confirm', canvas.toDataURL('image/jpeg', 0.88))
}

readFile()
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="editor-overlay" @click.self="emit('cancel')">
    <div class="editor">
      <h3>调整图片</h3>
      <p class="editor-tip">拖动调整位置 · 滚轮或按钮缩放 · 可旋转</p>

      <div
        class="editor-viewport"
        @mousedown="onDown"
        @mousemove="onMove"
        @mouseup="onUp"
        @mouseleave="onUp"
        @touchstart.prevent="onDown"
        @touchmove.prevent="onMove"
        @touchend="onUp"
        @wheel.prevent="onWheel"
      >
        <div v-if="loading" class="editor-loading">加载中…</div>
        <div class="editor-img" :style="imgStyle"></div>
        <div class="editor-grid"></div>
      </div>

      <div class="editor-controls">
        <button class="btn btn-ghost" @click="zoomBy(-0.2)">－</button>
        <span class="zoom-val">{{ Math.round(scale * 100) }}%</span>
        <button class="btn btn-ghost" @click="zoomBy(0.2)">＋</button>
        <button class="btn btn-ghost" @click="rotate90">⟳ 旋转</button>
      </div>

      <div class="editor-actions">
        <button class="btn btn-ghost" @click="emit('cancel')">取消</button>
        <button class="btn btn-primary" :disabled="loading" @click="confirm">
          使用此图
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 50, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  padding: 16px;
}

.editor {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  text-align: center;
}

.editor h3 {
  font-size: 18px;
}

.editor-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
}

.editor-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin: 14px 0 12px;
  border-radius: 12px;
  overflow: hidden;
  background:
    repeating-conic-gradient(#eef0f6 0 25%, #f8f9fd 0 50%) 0 0 / 24px 24px;
  touch-action: none;
  cursor: grab;
}

.editor-viewport:active {
  cursor: grabbing;
}

.editor-img {
  position: absolute;
  left: 50%;
  top: 50%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  transform-origin: center;
  will-change: transform;
}

.editor-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 0 2px rgba(91, 108, 255, 0.6);
}

.editor-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 13px;
}

.editor-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 14px;
}

.zoom-val {
  min-width: 48px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.editor-actions {
  display: flex;
  gap: 10px;
}

.editor-actions .btn {
  flex: 1;
}
</style>
