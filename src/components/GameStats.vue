<script setup>
defineProps({
  timeText: { type: String, required: true },
  moves: { type: Number, required: true }
})
</script>

<template>
  <div class="stats">
    <div class="stats__item">
      <span class="stats__value">{{ timeText }}</span>
      <span class="stats__label">用时</span>
    </div>
    <div class="stats__divider"></div>
    <div class="stats__item">
      <span class="stats__value">{{ moves }}</span>
      <span class="stats__label">步数</span>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  align-items: center;
  gap: 22px;
}

.stats__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 58px;
}

.stats__value {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.stats__label {
  font-size: 12px;
  color: var(--text-dim);
  margin-top: 2px;
}

.stats__divider {
  width: 1px;
  height: 30px;
  background: var(--border);
}
</style>
