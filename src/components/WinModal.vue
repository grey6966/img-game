<script setup>
defineProps({
  show: Boolean,
  moves: Number,
  timeText: String
})
const emit = defineEmits(['restart', 'new-image'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="overlay" role="dialog" aria-modal="true" aria-label="拼图完成">
      <div class="modal">
        <div class="modal__emoji">🎉</div>
        <h2 class="modal__title">拼图完成！</h2>
        <p class="modal__desc">
          用时 <strong>{{ timeText }}</strong>，共 <strong>{{ moves }}</strong> 步
        </p>
        <div class="modal__actions">
          <button class="btn-primary" @click="emit('restart')">再来一局</button>
          <button class="btn-ghost" @click="emit('new-image')">重新上传图片</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 26, 40, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}

.modal {
  background: var(--card);
  border-radius: 18px;
  padding: 32px 28px;
  text-align: center;
  max-width: 340px;
  width: 100%;
  box-shadow: var(--shadow);
}

.modal__emoji {
  font-size: 52px;
}

.modal__title {
  margin-top: 10px;
  font-size: 22px;
}

.modal__desc {
  margin-top: 10px;
  color: var(--text-dim);
  font-size: 15px;
}

.modal__desc strong {
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.modal__actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .modal {
  animation: pop 0.28s cubic-bezier(0.2, 0.9, 0.35, 1.3);
}

@keyframes pop {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
