// 用 WebAudio 合成的轻量音效，无需任何音频资源文件
let ctx = null

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  if (ctx && ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, duration = 0.12, type = 'sine', gain = 0.15, delay = 0) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  const t = ac.currentTime + delay
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + duration)
}

export function playSwap() {
  tone(520, 0.07, 'triangle', 0.08)
}

export function playSelect() {
  tone(700, 0.05, 'sine', 0.06)
}

export function playHint() {
  tone(880, 0.1, 'sine', 0.12)
  setTimeout(() => tone(1175, 0.12, 'sine', 0.12), 90)
}

export function playUndo() {
  tone(360, 0.08, 'triangle', 0.1)
}

export function playWin() {
  // 上行琶音庆祝
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, i * 0.12))
}
