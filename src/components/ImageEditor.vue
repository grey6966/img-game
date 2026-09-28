<script setup>
// 上传后的图片编辑器：裁剪、旋转、缩放成正方形，并压缩大图
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  file: { type: File, required: true },
  size: { type: Number, default: 720 } // 输出正方形边长（px）
})

const emit = defineEmits(['confirm', 'cancel'])

const PREVIEW = 300 // 预览框边长（CSS px）

const img = ref(null)
const ready = ref(false)
const zoom = ref(1) // 相对“铺满”状态的放大倍数
const rotation = ref(0) // 0 / 90 / 180 / 270
const tx = ref(0)
const ty = ref(0)

let dragStart = null

function loadImage() {
  const reader = new FileReader()
  reader.onload = () => {
    const el = new Image()
    el.onload = () => {
      img.value = el
      ready.value = true
    }
    el.src = reader.result
  }
  reader.readAsDataURL(props.file)
}

onMounted(loadImage)

// 旋转 90°/270° 后画面宽高对调
const rotatedDims = computed(() => {
  if (!img.value) return { w: 0, h: 0 }
  const swap = rotation.value % 180 === 90
  return {
    w: swap ? img.value.height : img.value.width,
    h: swap ? img.value.width : img.value.height
  }
})

// 输出坐标系下的基础铺满缩放（输出 px / 原图 px）
function outputCoverScale() {
  const { w, h } = rotatedDims.value
  return Math.max(props.size / w, props.size / h) * zoom.value
}

const cssPerImage = computed(() => {
  // 预览 CSS px / 原图 px（含 zoom）
  return outputCoverScale() * (PREVIEW / props.size)
})

// 外层盒子：旋转后的画面尺寸，保证任何旋转角度下都铺满正方形
const layerStyle = computed(() => {
  if (!img.value) return {}
  const { w, h } = rotatedDims.value
  const s = cssPerImage.value
  return {
    width: w * s + 'px',
    height: h * s + 'px',
    transform: `translate(calc(-50% + ${tx.value}px), calc(-50% + ${ty.value}px))`
  }
})

// 内层：原始图片宽高，旋转后外轮廓恰好等于外层盒子
const imgWrapStyle = computed(() => {
  if (!img.value) return {}
  const s = cssPerImage.value
  return {
    width: img.value.width * s + 'px',
    height: img.value.height * s + 'px',
    transform: `rotate(${rotation.value}deg)`
  }
})

function onPointerDown(e) {
  dragStart = { x: e.clientX - tx.value, y: e.clientY - ty.value }
  e.currentTarget.setPointerCapture?.(e.pointerId)
}

function onPointerMove(e) {
  if (!dragStart) return
  tx.value = e.clientX - dragStart.x
  ty.value = e.clientY - dragStart.y
}

function onPointerUp() {
  dragStart = null
}

function rotateImage() {
  rotation.value = (rotation.value + 90) % 360
}

function reset() {
  zoom.value = 1
  rotation.value = 0
  tx.value = 0
  ty.value = 0
}

// 离屏高清渲染，与预览同一套变换；1 预览 px = size/PREVIEW 输出 px
function exportImage() {
  const k = props.size / PREVIEW
  const canvas = document.createElement('canvas')
  canvas.width = props.size
  canvas.height = props.size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, props.size, props.size)

  ctx.save()
  ctx.translate(props.size / 2 + tx.value * k, props.size / 2 + ty.value * k)
  ctx.rotate((rotation.value * Math.PI) / 180)
  ctx.scale(outputCoverScale(), outputCoverScale())
  ctx.drawImage(img.value, -img.value.width / 2, -img.value.height / 2)
  ctx.restore()

  // JPEG 0.85 压缩，控制体积以便写入 localStorage
  return canvas.toDataURL('image/jpeg', 0.85)
}

function confirm() {
  emit('confirm', exportImage())
}
</script>

<template>
  <div v-if="ready" class="editor">
    <p class="editor-title">调整图片（拖动平移 · 滑块缩放 · 可旋转90°）</p>
    <div
      class="editor-frame"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div class="editor-stage" :style="{ width: PREVIEW + 'px', height: PREVIEW + 'px' }">
        <div class="editor-layer" :style="layerStyle">
          <div class="editor-imgwrap" :style="imgWrapStyle">
            <img :src="img.src" alt="待裁剪图片" draggable="false" />
          </div>
        </div>
      </div>
      <div class="editor-grid"></div>
    </div>

    <div class="editor-controls">
      <label class="zoom-row">
        <span>🔍</span>
        <input v-model.number="zoom" type="range" min="1" max="3" step="0.01" />
      </label>
      <button class="btn btn-ghost" @click="rotateImage">↻ 旋转90°</button>
      <button class="btn btn-ghost" @click="reset">复位</button>
    </div>

    <div class="editor-actions">
      <button class="btn btn-ghost" @click="emit('cancel')">取消</button>
      <button class="btn btn-primary" @click="confirm">使用此图</button>
    </div>
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.editor-title {
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}

.editor-frame {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #1d2038;
  touch-action: none;
  cursor: grab;
}

.editor-frame:active {
  cursor: grabbing;
}

.editor-stage {
  position: relative;
  overflow: hidden;
}

.editor-layer {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-imgwrap {
  flex: none;
}

.editor-imgwrap img {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  -webkit-user-drag: none;
}

.editor-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to right, rgba(255, 255, 255, 0.18) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.18) 1px, transparent 1px);
  background-size: 33.33% 33.33%;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.6);
}

.editor-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.zoom-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 180px;
}

.zoom-row input[type='range'] {
  flex: 1;
  accent-color: var(--primary);
}

.editor-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.editor-actions .btn {
  flex: 1;
}
</style>
