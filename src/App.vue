<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import ImageUploader from './components/ImageUploader.vue'
import ImageEditor from './components/ImageEditor.vue'
import DifficultySelector from './components/DifficultySelector.vue'
import StatsBar from './components/StatsBar.vue'
import PuzzleBoard from './components/PuzzleBoard.vue'
import WinModal from './components/WinModal.vue'
import RefThumb from './components/RefThumb.vue'
import Confetti from './components/Confetti.vue'
import {
  clearImage,
  clearState,
  loadBests,
  loadImage,
  loadState,
  saveImage,
  saveState,
  updateBest
} from './utils/storage'
import { playHint, playSwap, playUndo, playWin } from './utils/sound'

const BOARD_PX = 720
const MAX_HINTS = 3
const HINT_PENALTY = 5 // 每次提示加时 5 秒
const HINT_SHOW_MS = 2500

const imageUrl = ref('')
const rawFileName = ref('')
const editingFile = ref(null)
const size = ref(3)
const pieces = ref([])
const moves = ref(0)
const seconds = ref(0)
const solved = ref(false)
const showWin = ref(false)
const paused = ref(false)
const hintsLeft = ref(MAX_HINTS)
const recordType = ref(null)

// 撤销 / 重做：每次交换记录两个下标
const undoStack = ref([])
const redoStack = ref([])

// 提示高亮
const hintCells = ref([])
const hintTargets = reactive({})
let hintTimer = null

let timer = null
const startedAt = ref(0) // 当前计时段的起点时间戳
const baseSeconds = ref(0) // 暂停前累计秒数

const hasImage = computed(() => !!imageUrl.value)
const canUndo = computed(() => undoStack.value.length > 0 && !solved.value)
const canRedo = computed(() => redoStack.value.length > 0 && !solved.value)
const bests = ref(loadBests())
const currentBest = computed(() => bests.value[String(size.value)] || null)

// ---------- 计时：用时间戳差值，刷新/暂停后仍准确 ----------
function tick() {
  seconds.value = baseSeconds.value + Math.floor((Date.now() - startedAt.value) / 1000)
}

function startTimer() {
  stopTimer()
  startedAt.value = Date.now()
  timer = setInterval(tick, 500)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function pauseGame() {
  if (paused.value || solved.value || !hasImage.value) return
  baseSeconds.value = seconds.value
  paused.value = true
  stopTimer()
  persist()
}

function resumeGame() {
  if (!paused.value) return
  paused.value = false
  startedAt.value = Date.now()
  startTimer()
}

// 切到后台自动暂停
function handleVisibility() {
  if (document.hidden) pauseGame()
}

// ---------- 持久化 ----------
function persist() {
  if (!hasImage.value) return
  saveState({
    size: size.value,
    pieces: pieces.value,
    moves: moves.value,
    seconds: seconds.value,
    solved: solved.value,
    hintsLeft: hintsLeft.value,
    undoStack: undoStack.value,
    redoStack: redoStack.value,
    fileName: rawFileName.value,
    paused: paused.value
  })
}

// ---------- 上传与编辑 ----------
function handleUpload(file) {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  editingFile.value = file
}

function handleEditorConfirm(dataUrl) {
  imageUrl.value = dataUrl
  rawFileName.value = editingFile.value.name
  editingFile.value = null
  saveImage(dataUrl)
  startGame()
}

function handleEditorCancel() {
  // 已有图片时点取消保持现状，没有则停留在上传页
  editingFile.value = null
}

// ---------- 游戏逻辑 ----------
function shuffledOrder(n) {
  const arr = Array.from({ length: n }, (_, i) => i)
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  } while (arr.every((v, i) => v === i))
  return arr
}

function startGame() {
  if (!hasImage.value) return
  pieces.value = shuffledOrder(size.value * size.value)
  moves.value = 0
  seconds.value = 0
  baseSeconds.value = 0
  solved.value = false
  showWin.value = false
  paused.value = false
  hintsLeft.value = MAX_HINTS
  undoStack.value = []
  redoStack.value = []
  clearHint()
  startTimer()
  persist()
}

function applySwap(a, b, recordHistory) {
  const next = [...pieces.value]
  ;[next[a], next[b]] = [next[b], next[a]]
  pieces.value = next
  moves.value += 1
  if (recordHistory) {
    undoStack.value.push([a, b])
    redoStack.value = []
  }
}

function finishIfSolved() {
  if (!pieces.value.every((v, i) => v === i)) return
  solved.value = true
  stopTimer()
  clearHint()
  persist()
  playWin()
  // 等合拢动画完成后撒花、弹窗
  setTimeout(() => {
    const broke = updateBest(size.value, seconds.value, moves.value)
    bests.value = loadBests()
    recordType.value = broke
    showWin.value = true
  }, 750)
}

function handleSwap(a, b) {
  if (solved.value || paused.value || a === b) return
  applySwap(a, b, true)
  playSwap()
  clearHint()
  persist()
  finishIfSolved()
}

function undo() {
  if (!canUndo.value) return
  const [a, b] = undoStack.value.pop()
  applySwap(a, b, false) // applySwap 会 +1 步
  moves.value -= 2 // 撤销净效果为 -1 步
  redoStack.value.push([a, b])
  playUndo()
  clearHint()
  persist()
}

function redo() {
  if (!canRedo.value) return
  const [a, b] = redoStack.value.pop()
  applySwap(a, b, false)
  undoStack.value.push([a, b])
  playUndo()
  clearHint()
  persist()
}

// ---------- 提示 ----------
function clearHint() {
  hintCells.value = []
  Object.keys(hintTargets).forEach(k => delete hintTargets[k])
  clearTimeout(hintTimer)
}

function useHint() {
  if (solved.value || paused.value || hintsLeft.value <= 0) return
  // 找到第一个错位块，标出它和它的正确位置
  const wrongPos = pieces.value.findIndex((v, i) => v !== i)
  if (wrongPos === -1) return
  const pieceId = pieces.value[wrongPos]
  const targetPos = pieceId // 编号 pieceId 的块正确位置即下标 pieceId

  hintsLeft.value -= 1
  seconds.value += HINT_PENALTY
  baseSeconds.value += HINT_PENALTY
  clearHint()
  hintCells.value = [wrongPos]
  hintTargets[targetPos] = true
  playHint()
  hintTimer = setTimeout(clearHint, HINT_SHOW_MS)
  persist()
}

// ---------- 换图 ----------
function changeImage() {
  stopTimer()
  clearState()
  clearImage()
  imageUrl.value = ''
  rawFileName.value = ''
  pieces.value = []
  solved.value = false
  showWin.value = false
  paused.value = false
  undoStack.value = []
  redoStack.value = []
  clearHint()
}

// ---------- 快捷键 ----------
function onKeydown(e) {
  if (!hasImage.value || editingFile.value) return
  const tag = e.target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault()
    paused.value ? resumeGame() : pauseGame()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
    e.preventDefault()
    redo()
  } else if (e.key === 'h' || e.key === 'H') {
    useHint()
  }
}

// 切换难度立即以新难度重开（恢复存档过程中不触发）
let restored = false
watch(size, () => {
  if (restored && hasImage.value && !editingFile.value) startGame()
})

// 刷新恢复：图片从独立存储读取，对局状态还原，计时从暂停态继续
function restore() {
  const state = loadState()
  const savedImg = loadImage()
  if (!state || !savedImg) {
    clearState()
    clearImage()
    return
  }
  imageUrl.value = savedImg
  rawFileName.value = state.fileName || ''
  size.value = state.size
  pieces.value = state.pieces
  moves.value = state.moves
  seconds.value = state.seconds
  baseSeconds.value = state.seconds
  solved.value = !!state.solved
  hintsLeft.value = state.hintsLeft ?? MAX_HINTS
  undoStack.value = state.undoStack || []
  redoStack.value = state.redoStack || []
  bests.value = loadBests()
  if (solved.value) {
    showWin.value = false
  } else {
    // 恢复后默认暂停，玩家点击继续后再计时，避免离线时间被计入
    paused.value = true
  }
}

onMounted(() => {
  restore()
  restored = true
  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  stopTimer()
  clearTimeout(hintTimer)
  document.removeEventListener('visibilitychange', handleVisibility)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>🧩 图片拼图游戏</h1>
      <p>上传图片原地开局，进度自动保存在浏览器</p>
    </header>

    <!-- 上传 / 编辑 覆盖在游戏区位置，不跳转页面 -->
    <section v-if="!hasImage && !editingFile" class="card">
      <ImageUploader @upload="handleUpload" />
    </section>

    <section v-else-if="editingFile" class="card">
      <ImageEditor
        :file="editingFile"
        :size="BOARD_PX"
        @confirm="handleEditorConfirm"
        @cancel="handleEditorCancel"
      />
    </section>

    <template v-else>
      <section class="card">
        <div class="toolbar">
          <DifficultySelector v-model="size" :disabled="solved" />
          <RefThumb :image-url="imageUrl" />
        </div>
        <div class="toolbar toolbar-actions">
          <button class="btn" :disabled="!canUndo" @click="undo">↩ 撤销</button>
          <button class="btn" :disabled="!canRedo" @click="redo">↪ 重做</button>
          <button class="btn btn-hint" :disabled="hintsLeft <= 0 || solved || paused" @click="useHint">
            💡 提示<span class="hint-penalty">+5s</span>
          </button>
          <button v-if="!solved" class="btn" @click="paused ? resumeGame() : pauseGame()">
            {{ paused ? '▶ 继续' : '⏸ 暂停' }}
          </button>
          <button class="btn btn-primary" @click="startGame">重新开始</button>
          <button class="btn btn-ghost" @click="changeImage">换图</button>
        </div>
        <p v-if="rawFileName" class="file-name" :title="rawFileName">📷 {{ rawFileName }}</p>
      </section>

      <section class="card">
        <StatsBar
          :seconds="seconds"
          :moves="moves"
          :hints-left="hintsLeft"
          :best-seconds="currentBest?.seconds ?? null"
          :best-moves="currentBest?.moves ?? null"
        />
      </section>

      <section class="card">
        <PuzzleBoard
          :image-url="imageUrl"
          :size="size"
          :pieces="pieces"
          :solved="solved"
          :paused="paused"
          :hint-cells="hintCells"
          :hint-targets="hintTargets"
          @swap="handleSwap"
          @resume="resumeGame"
        />
      </section>

      <p class="shortcuts">快捷键：空格 暂停/继续 · Ctrl/⌘+Z 撤销 · Ctrl/⌘+Shift+Z 重做 · H 提示</p>
    </template>

    <Confetti :show="showWin" />

    <WinModal
      :show="showWin"
      :seconds="seconds"
      :moves="moves"
      :size="size"
      :record="recordType"
      :best-seconds="bests[String(size)]?.seconds ?? null"
      :best-moves="bests[String(size)]?.moves ?? null"
      @restart="startGame"
      @change-image="changeImage"
      @close="showWin = false"
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

.toolbar-actions {
  margin-top: 12px;
  justify-content: center;
}

.toolbar-actions .btn {
  padding: 8px 12px;
  font-size: 13px;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-hint {
  background: #fff6d9;
  color: #a97900;
}

.hint-penalty {
  margin-left: 4px;
  font-size: 11px;
  opacity: 0.8;
}

.file-name {
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shortcuts {
  text-align: center;
  font-size: 11px;
  color: var(--muted);
}

@media (max-width: 480px) {
  .toolbar-actions {
    gap: 6px;
  }

  .toolbar-actions .btn {
    flex: 1 1 30%;
    padding: 8px 6px;
  }
}
</style>
