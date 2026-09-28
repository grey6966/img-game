<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ImageUploader from './components/ImageUploader.vue'
import ImageEditor from './components/ImageEditor.vue'
import DifficultySelector from './components/DifficultySelector.vue'
import StatsBar from './components/StatsBar.vue'
import PuzzleBoard from './components/PuzzleBoard.vue'
import WinModal from './components/WinModal.vue'
import ReferenceThumb from './components/ReferenceThumb.vue'
import Confetti from './components/Confetti.vue'
import { clearSave, commitRecord, loadRecords, loadSave, writeSave } from './lib/storage'
import { playHint, playSwap, playUndo, playWin } from './lib/sound'

const MAX_HINTS = 3
const HINT_PENALTY = 10 // 秒
const HISTORY_CAP = 300

const imageUrl = ref('')
const rawFileName = ref('')
const size = ref(3)
const pieces = ref([])
const moves = ref(0)
const seconds = ref(0)
const solved = ref(false)
const showWin = ref(false)
const paused = ref(false)

const pendingFile = ref(null) // 等待进入编辑器的文件

// 撤销 / 重做：保存每步之后的局面快照
const history = ref([]) // [{ pieces, moves }]
const historyIndex = ref(-1) // 指向当前局面对应的快照
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// 提示
const hintsUsed = ref(0)
const hintsLeft = computed(() => MAX_HINTS - hintsUsed.value)
const hintCells = ref([])
let hintTimer = null

// 纪录
const records = ref(loadRecords())
const currentRecord = computed(() => records.value[size.value] || {})
const winRecord = ref({ time: false, moves: false })
const confettiOn = ref(false)

let timer = null

const hasImage = computed(() => !!imageUrl.value)

// ---------- 计时 ----------
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
    persist()
  }, 1000)
}

// ---------- 历史 ----------
function pushHistory() {
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push({ pieces: [...pieces.value], moves: moves.value })
  if (history.value.length > HISTORY_CAP) history.value.shift()
  historyIndex.value = history.value.length - 1
}

function applySnapshot(snap) {
  pieces.value = [...snap.pieces]
  moves.value = snap.moves
}

function undo() {
  if (!canUndo.value || solved.value) return
  historyIndex.value -= 1
  applySnapshot(history.value[historyIndex.value])
  playUndo()
  persist()
}

function redo() {
  if (!canRedo.value || solved.value) return
  historyIndex.value += 1
  applySnapshot(history.value[historyIndex.value])
  playSwap()
  persist()
}

// ---------- 提示 ----------
function useHint() {
  if (solved.value || paused.value || hintsLeft.value <= 0) return
  const n = size.value * size.value
  // 找到第一个错位格 c；正确块 id=c 当前位于 d
  let c = -1
  for (let i = 0; i < n; i++) {
    if (pieces.value[i] !== i) {
      c = i
      break
    }
  }
  if (c === -1) return
  const d = pieces.value.indexOf(c)
  hintsUsed.value += 1
  seconds.value += HINT_PENALTY
  hintCells.value = [c, d]
  playHint()
  clearTimeout(hintTimer)
  hintTimer = setTimeout(() => (hintCells.value = []), 2100)
  persist()
}

// ---------- 暂停 ----------
function togglePause() {
  if (solved.value) return
  paused.value = !paused.value
  if (paused.value) {
    stopTimer()
    hintCells.value = []
  } else {
    startTimer()
  }
  persist()
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
  solved.value = false
  showWin.value = false
  paused.value = false
  hintsUsed.value = 0
  hintCells.value = []
  history.value = [{ pieces: [...pieces.value], moves: 0 }]
  historyIndex.value = 0
  startTimer()
  persist()
}

function handleSwap(a, b) {
  if (solved.value || paused.value || a === b) return
  const next = [...pieces.value]
  ;[next[a], next[b]] = [next[b], next[a]]
  pieces.value = next
  moves.value += 1
  pushHistory()
  playSwap()
  if (next.every((v, i) => v === i)) {
    solved.value = true
    stopTimer()
    winRecord.value = commitRecord(size.value, seconds.value, moves.value)
    records.value = loadRecords()
    playWin()
    confettiOn.value = true
    setTimeout(() => {
      showWin.value = true
      confettiOn.value = false
    }, 900)
    clearSave()
  } else {
    persist()
  }
}

// ---------- 存档 ----------
function persist() {
  if (!hasImage.value) return
  writeSave({
    v: 1,
    imageUrl: imageUrl.value,
    rawFileName: rawFileName.value,
    size: size.value,
    pieces: pieces.value,
    moves: moves.value,
    seconds: seconds.value,
    solved: solved.value,
    paused: paused.value,
    hintsUsed: hintsUsed.value,
    history: history.value,
    historyIndex: historyIndex.value
  })
}

function restore() {
  const data = loadSave()
  if (!data?.imageUrl || !Array.isArray(data.pieces) || !data.pieces.length) {
    if (data?.imageUrl) clearSave()
    return
  }
  imageUrl.value = data.imageUrl
  rawFileName.value = data.rawFileName || ''
  size.value = data.size || 3
  pieces.value = data.pieces
  moves.value = data.moves || 0
  seconds.value = data.seconds || 0
  hintsUsed.value = data.hintsUsed || 0
  history.value =
    Array.isArray(data.history) && data.history.length
      ? data.history
      : [{ pieces: [...data.pieces], moves: data.moves || 0 }]
  historyIndex.value = Math.min(
    data.historyIndex ?? history.value.length - 1,
    history.value.length - 1
  )
  solved.value = data.solved || pieces.value.every((v, i) => v === i)
  if (solved.value) {
    // 已完成的局面不再计时，展示合拢的拼图，并清掉活动存档
    paused.value = false
    clearSave()
  } else {
    paused.value = data.paused ?? true // 刷新后默认暂停，避免偷偷计时
    if (!paused.value) startTimer()
  }
}

// ---------- 图片上传 + 编辑 ----------
function handleUpload(file) {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  pendingFile.value = file
}

function handleEditorConfirm(dataUrl) {
  imageUrl.value = dataUrl
  rawFileName.value = pendingFile.value?.name || 'puzzle.jpg'
  pendingFile.value = null
  startGame()
}

function handleEditorCancel() {
  pendingFile.value = null
}

function changeImage() {
  stopTimer()
  clearSave()
  imageUrl.value = ''
  rawFileName.value = ''
  pieces.value = []
  solved.value = false
  showWin.value = false
  paused.value = false
  moves.value = 0
  seconds.value = 0
  history.value = []
  historyIndex.value = -1
  hintsUsed.value = 0
  hintCells.value = []
}

// 切换难度：立即用新难度重新开局（恢复存档时跳过）
const isRestoring = ref(true)
watch(size, () => {
  if (hasImage.value && !solved.value && !isRestoring.value) startGame()
})

onBeforeUnmount(() => {
  stopTimer()
  clearTimeout(hintTimer)
})

restore()
isRestoring.value = false
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>🧩 图片拼图游戏</h1>
      <p>上传一张图片，把碎片拼回原样吧</p>
    </header>

    <!-- 上传区始终原地展示；上传后直接在本页开始游戏 -->
    <section class="card" :class="{ 'uploader-mini': hasImage }">
      <ImageUploader @upload="handleUpload" />
      <p v-if="hasImage" class="upload-hint">
        想换张图？再次上传即可
      </p>
    </section>

    <template v-if="hasImage">
      <ReferenceThumb :image-url="imageUrl" />

      <section class="card">
        <div class="toolbar">
          <DifficultySelector v-model="size" :disabled="solved" />
          <div class="toolbar-btns">
            <button
              class="btn btn-ghost"
              :disabled="!canUndo || solved"
              @click="undo"
            >
              ↩ 撤销
            </button>
            <button
              class="btn btn-ghost"
              :disabled="!canRedo || solved"
              @click="redo"
            >
              ↪ 重做
            </button>
            <button
              class="btn btn-warn"
              :disabled="hintsLeft <= 0 || solved || paused"
              @click="useHint"
            >
              💡 提示 ({{ hintsLeft }})
            </button>
            <button
              class="btn btn-ghost"
              :disabled="solved"
              @click="togglePause"
            >
              {{ paused ? '▶ 继续' : '⏸ 暂停' }}
            </button>
            <button class="btn btn-primary" @click="startGame">重新开始</button>
          </div>
        </div>
        <p class="hint-rule">
          提示每局限 {{ MAX_HINTS }} 次，每次 +{{ HINT_PENALTY }} 秒
        </p>
        <p v-if="rawFileName" class="file-name" :title="rawFileName">
          📷 {{ rawFileName }}
        </p>
      </section>

      <section class="card">
        <StatsBar
          :seconds="seconds"
          :moves="moves"
          :best-time="currentRecord.bestTime ?? null"
          :best-moves="currentRecord.bestMoves ?? null"
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
          @swap="handleSwap"
        />
      </section>
    </template>

    <!-- 图片裁剪/旋转/缩放编辑器 -->
    <ImageEditor
      v-if="pendingFile"
      :file="pendingFile"
      @confirm="handleEditorConfirm"
      @cancel="handleEditorCancel"
    />

    <Confetti :show="confettiOn" />

    <WinModal
      :show="showWin"
      :seconds="seconds"
      :moves="moves"
      :size="size"
      :record="winRecord"
      @restart="startGame"
      @change-image="changeImage"
      @close="showWin = false"
    />
  </div>
</template>

<style scoped>
.uploader-mini {
  padding: 10px 14px;
}

.uploader-mini :deep(.uploader) {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.uploader-mini :deep(.uploader-icon) {
  font-size: 24px;
}

.uploader-mini :deep(.uploader-title) {
  margin-top: 0;
  font-size: 14px;
}

.uploader-mini :deep(.uploader-hint) {
  margin-top: 2px;
}

.upload-hint {
  margin-top: 6px;
  text-align: center;
  font-size: 11px;
  color: var(--muted);
}

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
  flex-wrap: wrap;
}

.btn-warn {
  background: #fff4d6;
  color: #b07b00;
}

.btn-warn:hover {
  background: #ffe9b3;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.hint-rule {
  margin-top: 8px;
  font-size: 11px;
  color: var(--muted);
}

.file-name {
  margin-top: 6px;
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
    padding-left: 8px;
    padding-right: 8px;
    font-size: 13px;
  }
}
</style>
