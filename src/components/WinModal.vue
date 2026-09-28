<script setup>
defineProps({
  show: { type: Boolean, default: false },
  seconds: { type: Number, default: 0 },
  moves: { type: Number, default: 0 },
  size: { type: Number, default: 3 },
  record: {
    type: Object,
    default: () => ({ time: false, moves: false })
  }
})

const emit = defineEmits(['restart', 'change-image', 'close'])

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-emoji">🏆</div>
        <h2 class="modal-title">恭喜完成！</h2>
        <p class="modal-sub">{{ size }} × {{ size }} 拼图挑战成功</p>

        <div v-if="record.time || record.moves" class="new-record">
          🎊 新纪录：{{ record.time ? '最快用时' : '' }}{{ record.time && record.moves ? ' · ' : '' }}{{ record.moves ? '最少步数' : '' }}！
        </div>

        <div class="modal-stats">
          <div class="modal-stat" :class="{ record: record.time }">
            <span class="num">{{ formatTime(seconds) }}</span>
            <span class="label">用时{{ record.time ? ' 👑' : '' }}</span>
          </div>
          <div class="modal-stat" :class="{ record: record.moves }">
            <span class="num">{{ moves }}</span>
            <span class="label">步数{{ record.moves ? ' 👑' : '' }}</span>
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

.new-record {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  background: linear-gradient(90deg, #fff4d6, #ffe3ec);
  color: #c27803;
  font-size: 13px;
  font-weight: 700;
  animation: pop 0.4s ease;
}

.modal-stats {
  display: flex;
  justify-content: center;
  gap: 34px;
  margin: 20px 0;
}

.modal-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-stat.record .num {
  color: #d99a00;
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

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-actions .btn {
  flex: 1;
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
