<script setup>
import { computed } from 'vue'

const props = defineProps({
  seconds: { type: Number, default: 0 },
  moves: { type: Number, default: 0 },
  hintsLeft: { type: Number, default: 0 },
  bestSeconds: { type: Number, default: null },
  bestMoves: { type: Number, default: null }
})

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

const bestTimeText = computed(() =>
  props.bestSeconds === null ? '--:--' : formatTime(props.bestSeconds)
)
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
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-icon">💡</span>
      <div>
        <div class="stat-value">{{ hintsLeft }}</div>
        <div class="stat-name">剩余提示</div>
      </div>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item best">
      <span class="stat-icon">🏅</span>
      <div>
        <div class="stat-value">{{ bestTimeText }} <em>/ {{ bestMoves ?? '—' }}步</em></div>
        <div class="stat-name">本难度最佳</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 4px 0;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 22px;
}

.stat-value {
  font-size: 17px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.stat-value em {
  font-style: normal;
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
}

.stat-name {
  font-size: 11px;
  color: var(--muted);
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--border);
}
</style>
