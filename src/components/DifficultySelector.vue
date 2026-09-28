<script setup>
const levels = [
  { label: '3 × 3', value: 3 },
  { label: '4 × 4', value: 4 },
  { label: '5 × 5', value: 5 }
]

defineProps({
  modelValue: { type: Number, required: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="difficulty">
    <span class="difficulty-label">难度</span>
    <div class="difficulty-options">
      <button
        v-for="lv in levels"
        :key="lv.value"
        class="difficulty-btn"
        :class="{ active: modelValue === lv.value }"
        :disabled="disabled"
        @click="emit('update:modelValue', lv.value)"
      >
        {{ lv.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.difficulty {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.difficulty-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
}

.difficulty-options {
  display: flex;
  gap: 8px;
}

.difficulty-btn {
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: #eef0fb;
  color: var(--muted);
  transition: all 0.15s ease;
}

.difficulty-btn.active {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 4px 10px rgba(91, 108, 255, 0.35);
}

.difficulty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
