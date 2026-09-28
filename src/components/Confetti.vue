<script setup>
// 撒花：纯 DOM 实现，无第三方依赖
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const COLORS = ['#ff6b6b', '#5b6cff', '#2ecc8f', '#ffd166', '#ff9f43', '#a55eea']
let timers = []

function burst() {
  const layer = document.getElementById('confetti-layer')
  if (!layer) return
  layer.innerHTML = ''
  const count = 90
  for (let i = 0; i < count; i++) {
    const el = document.createElement('i')
    const left = Math.random() * 100
    const delay = Math.random() * 0.9
    const duration = 2.4 + Math.random() * 1.8
    const size = 6 + Math.random() * 8
    const color = COLORS[i % COLORS.length]
    const rotate = Math.random() * 360
    el.style.cssText = `
      position:absolute;left:${left}%;top:-20px;
      width:${size}px;height:${size * 0.55}px;
      background:${color};border-radius:2px;
      transform:rotate(${rotate}deg);
      animation:confetti-fall ${duration}s linear ${delay}s forwards;
    `
    layer.appendChild(el)
  }
  timers.forEach(clearTimeout)
  timers = [setTimeout(() => (layer.innerHTML = ''), 5200)]
}

watch(
  () => props.show,
  (v) => {
    if (v) setTimeout(burst, 60)
  }
)

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  document.getElementById('confetti-layer')?.remove()
})
</script>

<template>
  <Teleport to="body">
    <div id="confetti-layer" class="confetti-layer" aria-hidden="true"></div>
  </Teleport>
</template>

<style>
.confetti-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 90;
  overflow: hidden;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(105vh) rotate(720deg);
    opacity: 0.85;
  }
}
</style>
