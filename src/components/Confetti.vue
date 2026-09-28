<script setup>
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const pieces = ref([])
let raf = null

const COLORS = ['#5b6cff', '#2ecc8f', '#ff6b6b', '#ffd166', '#8a7cff', '#4cc9f0', '#ff8fab']

function spawn() {
  const w = window.innerWidth
  const count = Math.min(160, Math.floor(w / 6))
  pieces.value = Array.from({ length: count }, () => {
    const left = Math.random() * 100
    return {
      id: Math.random(),
      left,
      delay: Math.random() * 0.8,
      duration: 2.4 + Math.random() * 1.8,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      drift: (Math.random() - 0.5) * 120,
      rotate: Math.random() * 360,
      round: Math.random() > 0.5
    }
  })
  cancelAnimationFrame(raf)
  // 动画结束后自动清理 DOM
  raf = setTimeout(() => (pieces.value = []), 5200)
}

import { watch } from 'vue'
watch(
  () => props.show,
  v => {
    if (v) spawn()
  }
)

onBeforeUnmount(() => clearTimeout(raf))
</script>

<template>
  <div v-if="pieces.length" class="confetti" aria-hidden="true">
    <span
      v-for="p in pieces"
      :key="p.id"
      class="confetti-piece"
      :style="{
        left: p.left + 'vw',
        width: p.size + 'px',
        height: p.size * 1.4 + 'px',
        background: p.color,
        borderRadius: p.round ? '50%' : '2px',
        animationDelay: p.delay + 's',
        animationDuration: p.duration + 's',
        '--drift': p.drift + 'px',
        '--rot': p.rotate + 'deg'
      }"
    ></span>
  </div>
</template>

<style scoped>
.confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 90;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  top: -20px;
  animation-name: fall;
  animation-timing-function: cubic-bezier(0.25, 0.4, 0.55, 1);
  animation-fill-mode: forwards;
}

@keyframes fall {
  0% {
    transform: translate3d(0, -20px, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--drift), 105vh, 0) rotate(var(--rot));
    opacity: 0.9;
  }
}
</style>
