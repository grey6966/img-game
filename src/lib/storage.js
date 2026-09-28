// 所有存档均保存在浏览器本地，不依赖后端
const SAVE_KEY = 'puzzle-save-v1'
const RECORD_KEY = 'puzzle-records-v1'

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeSave(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch (e) {
    // 配额超限时静默失败，不影响游戏
    console.warn('存档失败：', e)
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    /* ignore */
  }
}

export function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORD_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// 返回 { time: bool(破纪录), moves: bool(破纪录) }，并写入新纪录
export function commitRecord(size, seconds, moves) {
  const all = loadRecords()
  const cur = all[size] || {}
  const result = {
    time: cur.bestTime == null || seconds < cur.bestTime,
    moves: cur.bestMoves == null || moves < cur.bestMoves
  }
  all[size] = {
    bestTime: result.time ? seconds : cur.bestTime,
    bestMoves: result.moves ? moves : cur.bestMoves
  }
  try {
    localStorage.setItem(RECORD_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
  return result
}
