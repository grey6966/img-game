<script setup>
defineProps({
  seconds: { type: Number, default: 0 },
  moves: { type: Number, default: 0 }
})

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <div class="stats">
    <div class="stat-item">
      <span class="stat-icon">⏱️</span>
      <div>
        <div class="stat-value">{{ formatTime(seconds) }}</div>
        <div class="stat-name">用时</div>
      </div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-icon">👣</span>
      <div>
        <div class="stat-value">{{ moves }}</div>
        <div class="stat-name">步数</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 4px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.stat-name {
  font-size: 12px;
  color: var(--muted);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: var(--border);
}
</style>
