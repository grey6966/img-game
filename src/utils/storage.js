// 所有数据均保存在浏览器 localStorage，不依赖任何后端
const STATE_KEY = 'puzzle:state:v2' // 对局状态（含难度、顺序、步数、用时等）
const IMAGE_KEY = 'puzzle:image:v2' // 正方形底图 dataURL（体积较大，单独存储）
const BEST_KEY = 'puzzle:best:v2' // 各难度最佳成绩

export function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch (e) {
    // 容量超限时静默失败，不影响本局游戏
    console.warn('保存对局失败', e)
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearState() {
  localStorage.removeItem(STATE_KEY)
}

export function saveImage(dataUrl) {
  try {
    localStorage.setItem(IMAGE_KEY, dataUrl)
  } catch (e) {
    console.warn('保存图片失败', e)
  }
}

export function loadImage() {
  return localStorage.getItem(IMAGE_KEY) || ''
}

export function clearImage() {
  localStorage.removeItem(IMAGE_KEY)
}

export function loadBests() {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY)) || {}
  } catch {
    return {}
  }
}

// 返回本局打破的记录类型：'both' | 'time' | 'moves' | null
export function updateBest(size, seconds, moves) {
  const bests = loadBests()
  const key = String(size)
  const old = bests[key]
  let broke = null
  if (!old) {
    broke = 'both'
  } else {
    const faster = seconds < old.seconds
    const fewer = moves < old.moves
    if (faster && fewer) broke = 'both'
    else if (faster) broke = 'time'
    else if (fewer) broke = 'moves'
  }
  bests[key] = {
    seconds: old ? Math.min(old.seconds, seconds) : seconds,
    moves: old ? Math.min(old.moves, moves) : moves
  }
  localStorage.setItem(BEST_KEY, JSON.stringify(bests))
  return broke
}
