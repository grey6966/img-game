<script setup>
// 右上角固定参考图：单击放大，长按（或触屏按住）查看
import { onBeforeUnmount, ref } from 'vue'

defineProps({
  imageUrl: { type: String, required: true }
})

const showLarge = ref(false)
const showPeek = ref(false)
let pressTimer = null
let longPressed = false

function startPress() {
  longPressed = false
  pressTimer = setTimeout(() => {
    longPressed = true
    showPeek.value = true
  }, 350)
}
function endPress() {
  clearTimeout(pressTimer)
  // 长按触发后松手不再触发点击放大
  setTimeout(() => (longPressed = false), 0)
}
function onClick() {
  if (longPressed) return
  showLarge.value = true
}

function clearTimer() {
  clearTimeout(pressTimer)
}
onBeforeUnmount(clearTimer)
</script>

<template>
  <div class="ref-thumb" title="单击放大 · 长按查看">
    <img
      :src="imageUrl"
      alt="参考图"
      draggable="false"
      @click="onClick"
      @mousedown="startPress"
      @mouseup="endPress"
      @mouseleave="clearTimer"
      @touchstart.prevent="startPress"
      @touchend="endPress"
      @touchcancel="clearTimer"
    />
    <span class="ref-badge">参考图</span>

    <!-- 长按浮层（松手即关） -->
    <Teleport to="body">
      <div
        v-if="showPeek"
        class="peek-overlay"
        @mouseup="showPeek = false"
        @mouseleave="showPeek = false"
        @touchend="showPeek = false"
      >
        <img :src="imageUrl" alt="参考图大图" />
      </div>
    </Teleport>

    <!-- 单击放大（点击关闭） -->
    <Teleport to="body">
      <div
        v-if="showLarge"
        class="ref-modal"
        @click="showLarge = false"
      >
        <img :src="imageUrl" alt="参考图大图" @mouseup="showPeek = false" />
        <p>点击任意处关闭</p>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.ref-thumb {
  position: fixed;
  top: 14px;
  right: 14px;
  width: 64px;
  height: 64px;
  z-index: 40;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(40, 50, 110, 0.25);
  border: 2px solid #fff;
  background: #eef0fb;
}

.ref-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  -webkit-user-drag: none;
}

.ref-badge {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  font-size: 10px;
  text-align: center;
  color: #fff;
  background: rgba(20, 24, 50, 0.5);
  padding: 1px 0;
}
</style>

<style>
/* 全局浮层（Teleport 到 body，不能用 scoped） */
.peek-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 18, 40, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.peek-overlay img {
  max-width: min(92vw, 560px);
  max-height: 80vh;
  border-radius: 12px;
}

.ref-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 18, 40, 0.82);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  cursor: zoom-out;
}

.ref-modal img {
  max-width: min(92vw, 560px);
  max-height: 80vh;
  border-radius: 12px;
}

.ref-modal p {
  color: rgba(255, 255, 255, 255, 0.8);
  font-size: 13px;
}
</style>
