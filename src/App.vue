<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ImageUploader from './components/ImageUploader.vue'
import DifficultySelector from './components/DifficultySelector.vue'
import StatsBar from './components/StatsBar.vue'
import PuzzleBoard from './components/PuzzleBoard.vue'
import WinModal from './components/WinModal.vue'

const BOARD_PX = 720 // 裁切成正方形底图，高分屏也清晰

const imageUrl = ref('')
const rawFileName = ref('')
const size = ref(3)
const pieces = ref([])
const moves = ref(0)
const seconds = ref(0)
const solved = ref(false)
const showWin = ref(false)
let timer = null

const hasImage = computed(() => !!imageUrl.value)

// ---------- 图片处理：居中裁切为正方形，避免拼图变形 ----------
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleUpload(file) {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = BOARD_PX
  canvas.height = BOARD_PX
  const ctx = canvas.getContext('2d')

  const side = Math.min(img.width, img.height)
  const sx = (img.width - side) / 2
  const sy = (img.height - side) / 2
  ctx.drawImage(img, sx, sy, side, side, 0, 0, BOARD_PX, BOARD_PX)

  if (imageUrl.value?.startsWith('data:')) {
    // 旧 dataURL 由 GC 回收，无需显式释放
  }
  imageUrl.value = canvas.toDataURL('image/jpeg', 0.9)
  rawFileName.value = file.name
  startGame()
}

// ---------- 游戏逻辑 ----------
function shuffledOrder(n) {
  const arr = Array.from({ length: n }, (_, i) => i)
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  } while (arr.every((v, i) => v === i)) // 保证不是已完成状态
  return arr
}

function checkSolved() {
  return pieces.value.every((v, i) => v === i)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    seconds.value += 1
  }, 1000)
}

function startGame() {
  if (!hasImage.value) return
  pieces.value = shuffledOrder(size.value * size.value)
  moves.value = 0
  seconds.value = 0
  solved.value = false
  showWin.value = false
  startTimer()
}

function handleSwap(a, b) {
  if (solved.value || a === b) return
  const next = [...pieces.value]
  ;[next[a], next[b]] = [next[b], next[a]]
  pieces.value = next
  moves.value += 1
  if (checkSolved()) {
    solved.value = true
    stopTimer()
    setTimeout(() => (showWin.value = true), 650)
  }
}

function changeImage() {
  stopTimer()
  imageUrl.value = ''
  rawFileName.value = ''
  pieces.value = []
  solved.value = false
  showWin.value = false
  moves.value = 0
  seconds.value = 0
}

// 切换难度：有图片时立即用新难度重新开局
watch(size, () => {
  if (hasImage.value) startGame()
})

onBeforeUnmount(stopTimer)
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>🧩 图片拼图游戏</h1>
      <p>上传一张图片，把碎片拼回原样吧</p>
    </header>

    <!-- 未上传：上传区 -->
    <section v-if="!hasImage" class="card">
      <ImageUploader @upload="handleUpload" />
    </section>

    <!-- 游戏区 -->
    <template v-else>
      <section class="card">
        <div class="toolbar">
          <DifficultySelector v-model="size" :disabled="solved" />
          <div class="toolbar-btns">
            <button class="btn btn-primary" @click="startGame">重新开始</button>
            <button class="btn btn-ghost" @click="changeImage">重新上传</button>
          </div>
        </div>
        <p v-if="rawFileName" class="file-name" :title="rawFileName">
          📷 {{ rawFileName }}
        </p>
      </section>

      <section class="card">
        <StatsBar :seconds="seconds" :moves="moves" />
      </section>

      <section class="card">
        <PuzzleBoard
          :image-url="imageUrl"
          :size="size"
          :pieces="pieces"
          :solved="solved"
          @swap="handleSwap"
        />
      </section>
    </template>

    <WinModal
      :show="showWin"
      :seconds="seconds"
      :moves="moves"
      :size="size"
      @restart="startGame"
      @change-image="changeImage"
    />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-btns {
  display: flex;
  gap: 8px;
}

.file-name {
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 480px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-btns {
    justify-content: center;
  }

  .toolbar-btns .btn {
    flex: 1;
  }
}
</style>
