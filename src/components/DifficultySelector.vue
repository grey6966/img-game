<script setup>
defineProps({
  modelValue: { type: Number, default: 3 }
})
const emit = defineEmits(['update:modelValue'])

const levels = [
  { value: 3, label: '3 × 3' },
  { value: 4, label: '4 × 4' },
  { value: 5, label: '5 × 5' }
]

function select(v) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="difficulty">
    <span class="difficulty__label">难度</span>
    <div class="difficulty__group">
      <button
        v-for="lv in levels"
        :key="lv.value"
        class="difficulty__btn"
        :class="{ 'is-active': modelValue === lv.value }"
        @click="select(lv.value)"
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

.difficulty__label {
  font-size: 14px;
  color: var(--text-dim);
}

.difficulty__group {
  display: flex;
  background: #eef1fa;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.difficulty__btn {
  background: transparent;
  color: var(--text-dim);
  padding: 7px 14px;
  font-size: 14px;
  border-radius: 8px;
}

.difficulty__btn.is-active {
  background: #fff;
  color: var(--primary);
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(31, 39, 51, 0.1);
}
</style>
