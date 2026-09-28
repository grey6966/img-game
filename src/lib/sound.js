// 用 WebAudio 合成简单音效，无需音频资源文件
let ctx = null

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone(freq, start, duration, type = 'sine', gainVal = 0.12) {
  const audio = ac()
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = audio.currentTime + start
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(gainVal, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

export function playSwap() {
  tone(520, 0, 0.08, 'triangle', 0.08)
}

export function playHint() {
  tone(880, 0, 0.12, 'sine', 0.1)
  tone(1180, 0.1, 0.14, 'sine', 0.08)
}

export function playUndo() {
  tone(360, 0, 0.09, 'triangle', 0.07)
}

export function playWin() {
  // 上行琶音 + 收尾和弦
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.12))
  ;[523.25, 659.25, 783.99].forEach((f) => tone(f, 0.55, 0.7, 'sine', 0.08))
}
