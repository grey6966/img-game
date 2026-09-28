<script setup>
import { ref } from 'vue'

const emit = defineEmits(['select'])

const inputRef = ref(null)
const fileName = ref('')
const error = ref('')

function openPicker() {
  inputRef.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }
  error.value = ''
  fileName.value = file.name
  emit('select', file)
  // 允许再次选择同一文件
  e.target.value = ''
}
</script>

<template>
  <div class="upload">
    <div class="upload__zone" role="button" tabindex="0" @click="openPicker" @keydown.enter="openPicker">
      <div class="upload__icon">🖼️</div>
      <p class="upload__hint">点击上传本地图片开始游戏</p>
      <p v-if="fileName" class="upload__name">{{ fileName }}</p>
      <p v-if="error" class="upload__error">{{ error }}</p>
    </div>
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      hidden
      @change="onFileChange"
    />
  </div>
</template>

<style scoped>
.upload__zone {
  border: 2px dashed #b9c4e2;
  border-radius: var(--radius);
  padding: 56px 24px;
  text-align: center;
  background: #fafbff;
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
}

.upload__zone:hover,
.upload__zone:focus-visible {
  border-color: var(--primary);
  background: #f3f5ff;
  outline: none;
}

.upload__icon {
  font-size: 44px;
  line-height: 1;
}

.upload__hint {
  margin-top: 14px;
  font-size: 15px;
  color: var(--text);
}

.upload__name {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-dim);
  word-break: break-all;
}

.upload__error {
  margin-top: 8px;
  font-size: 13px;
  color: var(--danger);
}
</style>
