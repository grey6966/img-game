<script setup>
// 右上角固定参考图：点击放大查看，长按（或鼠标悬停）也可放大
import { onBeforeUnmount, ref } from 'vue'

defineProps({
  imageUrl: { type: String, required: true }
})

const enlarged = ref(false)
let pressTimer = null

function open() {
  enlarged.value = true
}

function close() {
  enlarged.value = false
}

function startPress() {
  pressTimer = setTimeout(open, 350)
}

function cancelPress() {
  clearTimeout(pressTimer)
}

onBeforeUnmount(cancelPress)
</script>

<template>
  <div class="ref-thumb" @click="open" @pointerdown="startPress" @pointerup="cancelPress" @pointerleave="cancelPress" @pointercancel="cancelPress">
    <img :src="imageUrl" alt="参考图" draggable="false" />
    <span class="ref-label">参考图</span>

    <Teleport to="body">
      <Transition name="zoom">
        <div v-if="enlarged" class="ref-overlay" @click="close">
          <img :src="imageUrl" alt="参考图大图" />
          <p class="ref-tip">点击任意处关闭</p>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.ref-thumb {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 10px;
  overflow: hidden;
  cursor: zoom-in;
  box-shadow: 0 4px 12px rgba(60, 70, 140, 0.25);
  border: 2px solid #fff;
  flex: none;
  touch-action: manipulation;
}

.ref-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.15s ease;
}

.ref-thumb:active img {
  transform: scale(0.94);
}

.ref-label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  font-size: 9px;
  line-height: 14px;
  text-align: center;
  color: #fff;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.ref-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(20, 24, 50, 0.82);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
}

.ref-overlay img {
  max-width: min(86vw, 520px);
  max-height: 74vh;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.ref-tip {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: opacity 0.2s ease;
}

.zoom-enter-active img,
.zoom-leave-active img {
  transition: transform 0.2s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
}

.zoom-enter-from img {
  transform: scale(0.85);
}
</style>
