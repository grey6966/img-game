<script setup>
import { ref } from 'vue'
import { usePuzzle } from './composables/usePuzzle.js'
import ImageUploader from './components/ImageUploader.vue'
import DifficultySelector from './components/DifficultySelector.vue'
import GameStats from './components/GameStats.vue'
import PuzzleBoard from './components/PuzzleBoard.vue'
import WinModal from './components/WinModal.vue'

const {
  gridSize,
  imageUrl,
  tiles,
  moves,
  timeText,
  started,
  solved,
  selectedIndex,
  loadImage,
  setupGame,
  changeGrid,
  clickTile,
  swapTiles
} = usePuzzle()

const fileInput = ref(null)
const objectUrl = ref('')

function revokeOld() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = ''
  }
}

function onImageSelected(file) {
  revokeOld()
  objectUrl.value = URL.createObjectURL(file)
  loadImage(objectUrl.value)
  setupGame()
}

function onDifficultyChange(v) {
  changeGrid(v)
}

function restart() {
  setupGame()
}

function reupload() {
  revokeOld()
  loadImage('')
}
</script>

<template>
  <div class="page">
    <header class="header">
      <h1 class="header__title">🧩 图片拼图</h1>
      <p class="header__sub">上传图片，还原它！</p>
    </header>

    <main class="main">
      <!-- 未上传图片 -->
      <ImageUploader v-if="!imageUrl" class="main__uploader" @select="onImageSelected" />

      <!-- 游戏区 -->
      <template v-else>
        <div class="toolbar">
          <DifficultySelector
            :model-value="gridSize"
            @update:model-value="onDifficultyChange"
          />
          <GameStats :time-text="timeText" :moves="moves" />
        </div>

        <div class="board-wrap">
          <PuzzleBoard
            :tiles="tiles"
            :grid-size="gridSize"
            :image-url="imageUrl"
            :selected-index="selectedIndex"
            :solved="solved"
            @swap="swapTiles"
            @click-tile="clickTile"
          />
        </div>

        <div class="actions">
          <button class="btn-primary" @click="restart">重新开始</button>
          <button class="btn-ghost" @click="reupload">重新上传图片</button>
        </div>

        <p class="tip">💡 点击两块可交换位置，也可以按住拖动到目标格</p>

        <WinModal
          :show="solved"
          :moves="moves"
          :time-text="timeText"
          @restart="restart"
          @new-image="reupload"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
.page {
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.header {
  text-align: center;
  margin-bottom: 22px;
}

.header__title {
  font-size: 26px;
}

.header__sub {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-dim);
}

.main__uploader {
  margin-top: 10px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.board-wrap {
  display: flex;
  justify-content: center;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 22px;
}

.tip {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-dim);
}

@media (max-width: 420px) {
  .page {
    padding: 16px 12px 36px;
  }

  .toolbar {
    justify-content: center;
  }

  .actions button {
    flex: 1;
    max-width: 180px;
  }
}
</style>
