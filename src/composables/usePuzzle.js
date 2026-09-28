import { ref, computed, onUnmounted } from 'vue'

/**
 * 拼图游戏核心逻辑
 * tiles: 当前棋盘顺序，每项为该位置上的拼图块原始索引（0 = 左上角）
 * solved 条件：每个位置 i 上的值都等于 i
 */
export function usePuzzle() {
  const gridSize = ref(3)
  const imageUrl = ref('')
  const tiles = ref([])
  const moves = ref(0)
  const seconds = ref(0)
  const started = ref(false)
  const solved = ref(false)
  const selectedIndex = ref(null)

  let timerId = null

  const totalTiles = computed(() => gridSize.value * gridSize.value)

  const timeText = computed(() => {
    const m = String(Math.floor(seconds.value / 60)).padStart(2, '0')
    const s = String(seconds.value % 60).padStart(2, '0')
    return `${m}:${s}`
  })

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function startTimer() {
    stopTimer()
    timerId = setInterval(() => {
      seconds.value++
    }, 1000)
  }

  /** Fisher–Yates 洗牌，并保证不是已完成状态 */
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

  function checkSolved() {
    return tiles.value.every((v, i) => v === i)
  }

  function finishIfSolved() {
    if (checkSolved()) {
      solved.value = true
      stopTimer()
      selectedIndex.value = null
      return true
    }
    return false
  }

  /** 初始化/重新打乱一局 */
  function setupGame() {
    if (!imageUrl.value) return
    tiles.value = shuffledOrder(totalTiles.value)
    moves.value = 0
    seconds.value = 0
    solved.value = false
    started.value = true
    selectedIndex.value = null
    startTimer()
  }

  function loadImage(url) {
    imageUrl.value = url
    started.value = false
    stopTimer()
    seconds.value = 0
    moves.value = 0
    solved.value = false
    tiles.value = []
    selectedIndex.value = null
  }

  function changeGrid(size) {
    gridSize.value = size
    if (imageUrl.value) setupGame()
  }

  /** 交换两个位置上的拼图块（点击交换 / 拖拽交换共用） */
  function swapTiles(from, to) {
    if (solved.value || from === to || from == null || to == null) return
    const t = tiles.value
    ;[t[from], t[to]] = [t[to], t[from]]
    tiles.value = [...t]
    moves.value++
    finishIfSolved()
  }

  /** 点击某块：第一次选中，第二次与选中块交换 */
  function clickTile(index) {
    if (solved.value) return
    if (selectedIndex.value === null) {
      selectedIndex.value = index
      return
    }
    if (selectedIndex.value === index) {
      selectedIndex.value = null
      return
    }
    swapTiles(selectedIndex.value, index)
    selectedIndex.value = null
  }

  onUnmounted(stopTimer)

  return {
    gridSize,
    imageUrl,
    tiles,
    moves,
    seconds,
    timeText,
    started,
    solved,
    selectedIndex,
    totalTiles,
    loadImage,
    setupGame,
    changeGrid,
    clickTile,
    swapTiles
  }
}
