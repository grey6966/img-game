<script setup>
import { ref } from 'vue'

const emit = defineEmits(['upload'])

const inputEl = ref(null)
const dragging = ref(false)

function pickFile() {
  inputEl.value?.click()
}

function handleChange(e) {
  const file = e.target.files?.[0]
  if (file) emit('upload', file)
  e.target.value = ''
}

function handleDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) emit('upload', file)
}

function handleDragOver() {
  dragging.value = true
}

function handleDragLeave() {
  dragging.value = false
}
</script>

<template>
  <div
    class="uploader"
    :class="{ dragging }"
    @click="pickFile"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <input
      ref="inputEl"
      type="file"
      accept="image/*"
      hidden
      @change="handleChange"
    />
    <div class="uploader-icon">🖼️</div>
    <p class="uploader-title">点击上传图片</p>
    <p class="uploader-hint">或将图片拖拽到此处 · 支持 JPG / PNG / WebP</p>
  </div>
</template>

<style scoped>
.uploader {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.uploader:hover,
.uploader.dragging {
  border-color: var(--primary);
  background: #f6f7ff;
}

.uploader-icon {
  font-size: 42px;
  line-height: 1;
}

.uploader-title {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 700;
}

.uploader-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--muted);
}
</style>
