<script setup>
defineProps({
  show: { type: Boolean, default: false },
  seconds: { type: Number, default: 0 },
  moves: { type: Number, default: 0 },
  size: { type: Number, default: 3 },
  record: { type: String, default: null }, // 'both' | 'time' | 'moves' | null
  bestSeconds: { type: Number, default: null },
  bestMoves: { type: Number, default: null }
})

const emit = defineEmits(['restart', 'change-image', 'close'])

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

const recordText = {
  both: '🎉 双项新纪录！',
  time: '⏱️ 最快用时新纪录！',
  moves: '👣 最少步数新纪录！'
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-emoji">🏆</div>
        <h2 class="modal-title">恭喜完成！</h2>
        <p class="modal-sub">{{ size }} × {{ size }} 拼图挑战成功</p>

        <div v-if="record" class="record-badge">{{ recordText[record] }}</div>

        <div class="modal-stats">
          <div class="modal-stat">
            <span class="num">{{ formatTime(seconds) }}</span>
            <span class="label">用时</span>
            <span class="best">最佳 {{ bestSeconds === null ? '--:--' : formatTime(bestSeconds) }}</span>
          </div>
          <div class="modal-stat">
            <span class="num">{{ moves }}</span>
            <span class="label">步数</span>
            <span class="best">最佳 {{ bestMoves ?? '—' }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="emit('restart')">再来一局</button>
          <button class="btn btn-ghost" @click="emit('change-image')">重新上传</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(28, 32, 60, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 340px;
  background: #fff;
  border-radius: 18px;
  padding: 28px 22px 22px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.modal-emoji {
  font-size: 52px;
}

.modal-title {
  margin-top: 8px;
  font-size: 22px;
}

.modal-sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--muted);
}

.record-badge {
  margin: 14px auto 0;
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: #b8860b;
  background: linear-gradient(135deg, #fff3c4, #ffe08a);
  animation: badge-pop 0.5s ease;
}

@keyframes badge-pop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  70% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-stats {
  display: flex;
  justify-content: center;
  gap: 34px;
  margin: 18px 0;
}

.modal-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-stat .num {
  font-size: 26px;
  font-weight: 800;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}

.modal-stat .label {
  font-size: 12px;
  color: var(--muted);
}

.modal-stat .best {
  font-size: 11px;
  color: #c9a227;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-actions .btn {
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-active .modal {
  transition: transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .modal {
  transform: scale(0.9) translateY(10px);
}
</style>
