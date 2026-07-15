/**
 * 《铁头 · Arcana》视觉方案 Web Demo
 * 逻辑分辨率 320×180；对齐 docs/pixel-game-visual-design.md
 */

export type ScreenId =
  | 'splash'
  | 'title'
  | 'settings'
  | 'setup'
  | 'loading'
  | 'play'
  | 'pause'
  | 'death'
  | 'clear'
  | 'dialog'
  | 'credits'
  | 'confirm'

export interface ArcanaSettings {
  master: number
  sfx: number
  shake: boolean
  flash: boolean
  showTimer: boolean
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

interface Enemy {
  x: number
  y: number
  w: number
  h: number
  dir: 1 | -1
  speed: number
  alive: boolean
}

interface Coin {
  x: number
  y: number
  taken: boolean
}

interface Level {
  platforms: Rect[]
  spikes: Rect[]
  enemies: Enemy[]
  coins: Coin[]
  goal: Rect
  spawn: { x: number; y: number }
}

const W = 320
const H = 180
const GRAVITY = 0.28
const MOVE_ACC = 0.55
const MOVE_MAX = 1.7
const JUMP_V = -4.6
const FRICTION = 0.78
const COYOTE = 100
const JUMP_BUFFER = 150

const COLORS = {
  bgDeep: '#0E1218',
  bgPlay: '#1A2330',
  surface: '#243044',
  border: '#4A5D78',
  text: '#E8EEF6',
  muted: '#8A9BB0',
  amber: '#E8A838',
  steel: '#7EB6D9',
  danger: '#D64545',
  safe: '#4CAF7A',
  arcana: '#5BC4C4',
  knight: '#C9B08A',
  ground: '#2A3A4A',
  groundHi: '#4A6A7A',
  castle: '#152030',
}

function aabb(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  )
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

function buildLevel(seed: number): Level {
  const platforms: Rect[] = [
    { x: 0, y: 156, w: 120, h: 24 },
    { x: 140, y: 140, w: 48, h: 10 },
    { x: 200, y: 120, w: 40, h: 10 },
    { x: 250, y: 100, w: 70, h: 10 },
    { x: 80, y: 110, w: 36, h: 10 },
    { x: 0, y: 90, w: 40, h: 10 },
  ]
  const spikes: Rect[] = [
    { x: 120, y: 150, w: 18, h: 6 },
    { x: 188, y: 150, w: 12, h: 6 },
  ]
  const enemies: Enemy[] = [
    {
      x: 150,
      y: 128,
      w: 12,
      h: 12,
      dir: 1,
      speed: 0.55 + (seed % 3) * 0.08,
      alive: true,
    },
    {
      x: 260,
      y: 88,
      w: 12,
      h: 12,
      dir: -1,
      speed: 0.45,
      alive: true,
    },
  ]
  const coins: Coin[] = [
    { x: 92, y: 96, taken: false },
    { x: 156, y: 124, taken: false },
    { x: 214, y: 104, taken: false },
    { x: 270, y: 84, taken: false },
    { x: 16, y: 74, taken: false },
  ]
  return {
    platforms,
    spikes,
    enemies,
    coins,
    goal: { x: 300, y: 76, w: 10, h: 24 },
    spawn: { x: 20, y: 130 },
  }
}

export function mountArcana(root: HTMLElement) {
  const canvasEl = root.querySelector<HTMLCanvasElement>('[data-arcana-canvas]')
  const uiEl = root.querySelector<HTMLElement>('[data-arcana-ui]')
  const stageEl = root.querySelector<HTMLElement>('.arcana__stage')
  if (!canvasEl || !uiEl || !stageEl) return () => undefined

  const canvas = canvasEl
  const ui = uiEl
  const stage = stageEl
  const context = canvas.getContext('2d')
  if (!context) return () => undefined
  const ctx: CanvasRenderingContext2D = context
  ctx.imageSmoothingEnabled = false

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const settings: ArcanaSettings = {
    master: 80,
    sfx: 100,
    shake: !reduced,
    flash: !reduced,
    showTimer: true,
  }

  let screen: ScreenId = 'splash'
  let prevScreen: ScreenId = 'title'
  let confirmAction: null | (() => void) = null
  let menuIndex = 0
  let settingsTab = 0
  let difficulty = 1
  let seed = Math.floor(Math.random() * 9000) + 1000
  let loadingUntil = 0
  let dialogIndex = 0
  let dialogChars = 0

  const dialogLines = [
    { name: '梅林', text: '王国正在被「完美秩序」重写。' },
    { name: '梅林', text: '铁头，盔甲会记得每一次跳跃。' },
    { name: '铁头', text: '那就让 Arcana 看看——秩序之外，还能怎么走。' },
  ]

  let level = buildLevel(seed)
  let lives = 3
  let coins = 0
  let deaths = 0
  let cause = '坠落'
  let runStarted = 0
  let levelStarted = 0
  let clearTime = 0
  let stars = 0

  const player = {
    x: 20,
    y: 130,
    w: 12,
    h: 16,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1 as 1 | -1,
    invuln: 0,
    stretch: 0,
  }

  let coyoteUntil = 0
  let jumpBufferUntil = 0
  const particles: Particle[] = []
  const keys = new Set<string>()

  const titleItems = ['start', 'continue', 'settings', 'credits']
  const pauseItems = ['resume', 'settings', 'retry', 'title']
  const deathItems = ['retry', 'title']
  const clearItems = ['next', 'retry', 'title']
  const confirmItems = ['cancel', 'ok']

  function $(sel: string) {
    return ui.querySelector(sel)
  }

  function setScreen(next: ScreenId) {
    screen = next
    menuIndex = 0
    ui.querySelectorAll('[data-screen]').forEach((el) => {
      el.classList.toggle('is-active', el.getAttribute('data-screen') === next)
      if (el.getAttribute('data-screen') === next) {
        el.classList.remove('is-enter')
        // reflow for enter anim
        void (el as HTMLElement).offsetWidth
        const panel = el.querySelector('.arcana-panel')
        panel?.classList.add('is-enter')
      }
    })
    refreshMenus()
    syncHud()
    syncSettingsUi()
    syncSetupUi()
    syncDialog()
    syncDeath()
    syncClear()
  }

  function currentMenu(): string[] {
    if (screen === 'title') return titleItems
    if (screen === 'pause') return pauseItems
    if (screen === 'death') return deathItems
    if (screen === 'clear') return clearItems
    if (screen === 'confirm') return confirmItems
    return []
  }

  function refreshMenus() {
    const items = currentMenu()
    ui.querySelectorAll(`[data-screen="${screen}"] [data-menu-item]`).forEach(
      (el, i) => {
        el.classList.toggle('is-focus', i === menuIndex)
        if (el instanceof HTMLButtonElement) {
          const id = el.getAttribute('data-menu-item')
          if (id === 'continue') {
            el.disabled = !localStorage.getItem('arcana-save')
          }
        }
      }
    )
    if (screen === 'confirm') {
      ui.querySelectorAll('[data-confirm-btn]').forEach((el, i) => {
        el.classList.toggle('is-focus', i === menuIndex)
      })
    }
    void items
  }

  function syncHud() {
    const livesEl = $('[data-hud-lives]')
    const timeEl = $('[data-hud-time]')
    const coinEl = $('[data-hud-coin]')
    if (livesEl) {
      livesEl.textContent = '●'.repeat(Math.max(0, lives)) + '○'.repeat(Math.max(0, 3 - lives))
    }
    if (coinEl) coinEl.textContent = String(coins).padStart(3, '0')
    if (timeEl) {
      const elapsed = screen === 'play' ? performance.now() - levelStarted : clearTime
      timeEl.textContent = formatTime(elapsed)
      timeEl.classList.toggle('is-urgent', elapsed > 50_000)
      ;(timeEl as HTMLElement).style.visibility = settings.showTimer
        ? 'visible'
        : 'hidden'
    }
  }

  function syncSettingsUi() {
    const master = $('[data-setting="master"]') as HTMLInputElement | null
    const sfx = $('[data-setting="sfx"]') as HTMLInputElement | null
    const shake = $('[data-setting="shake"]') as HTMLInputElement | null
    const flash = $('[data-setting="flash"]') as HTMLInputElement | null
    const timer = $('[data-setting="timer"]') as HTMLInputElement | null
    if (master) master.value = String(settings.master)
    if (sfx) sfx.value = String(settings.sfx)
    if (shake) shake.checked = settings.shake
    if (flash) flash.checked = settings.flash
    if (timer) timer.checked = settings.showTimer
    const masterOut = $('[data-setting-out="master"]')
    const sfxOut = $('[data-setting-out="sfx"]')
    if (masterOut) masterOut.textContent = `${settings.master}%`
    if (sfxOut) sfxOut.textContent = `${settings.sfx}%`
    ui.querySelectorAll('[data-settings-tab]').forEach((el) => {
      el.classList.toggle(
        'is-active',
        Number(el.getAttribute('data-settings-tab')) === settingsTab
      )
    })
    ui.querySelectorAll('[data-settings-panel]').forEach((el) => {
      ;(el as HTMLElement).hidden =
        Number(el.getAttribute('data-settings-panel')) !== settingsTab
    })
  }

  function syncSetupUi() {
    ui.querySelectorAll('[data-diff]').forEach((el) => {
      el.classList.toggle(
        'is-active',
        Number(el.getAttribute('data-diff')) === difficulty
      )
    })
    const seedEl = $('[data-seed]')
    if (seedEl) seedEl.textContent = String(seed)
  }

  function syncDialog() {
    const line = dialogLines[dialogIndex]
    if (!line) return
    const name = $('[data-dialog-name]')
    const text = $('[data-dialog-text]')
    if (name) name.textContent = line.name
    if (text) text.textContent = line.text.slice(0, Math.floor(dialogChars))
  }

  function syncDeath() {
    const causeEl = $('[data-death-cause]')
    if (causeEl) causeEl.textContent = `死因：${cause}`
  }

  function syncClear() {
    const t = $('[data-clear-time]')
    const d = $('[data-clear-deaths]')
    const c = $('[data-clear-coins]')
    const s = $('[data-clear-stars]')
    if (t) t.textContent = formatTime(clearTime)
    if (d) d.textContent = String(deaths)
    if (c) c.textContent = `+${coins}`
    if (s) s.textContent = '★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars))
  }

  function toast(msg: string) {
    const el = $('[data-toast]')
    if (!el) return
    el.textContent = msg
    el.classList.add('is-show')
    window.setTimeout(() => el.classList.remove('is-show'), 1600)
  }

  function flash() {
    if (!settings.flash) return
    stage.classList.add('is-flash')
    window.setTimeout(() => stage.classList.remove('is-flash'), 90)
  }

  function shake() {
    if (!settings.shake || reduced) return
    stage.classList.remove('is-shake')
    void stage.offsetWidth
    stage.classList.add('is-shake')
    window.setTimeout(() => stage.classList.remove('is-shake'), 120)
  }

  function spawnDust(x: number, y: number, color = COLORS.muted) {
    for (let i = 0; i < 5; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.random() * 1.2,
        life: 18 + Math.random() * 10,
        color,
      })
    }
  }

  function resetPlayer() {
    player.x = level.spawn.x
    player.y = level.spawn.y
    player.vx = 0
    player.vy = 0
    player.onGround = false
    player.invuln = 0
    player.stretch = 0
  }

  function startRun(newSeed?: number) {
    if (newSeed != null) seed = newSeed
    level = buildLevel(seed)
    lives = difficulty === 0 ? 5 : difficulty === 2 ? 2 : 3
    coins = 0
    deaths = 0
    runStarted = performance.now()
    levelStarted = runStarted
    particles.length = 0
    resetPlayer()
    localStorage.setItem(
      'arcana-save',
      JSON.stringify({ seed, difficulty, ts: Date.now() })
    )
    setScreen('loading')
    loadingUntil = performance.now() + (reduced ? 200 : 700)
  }

  function openConfirm(from: ScreenId, action: () => void) {
    prevScreen = from
    confirmAction = action
    setScreen('confirm')
  }

  function activateMenu() {
    const items = currentMenu()
    const id = items[menuIndex]
    if (!id) return

    if (screen === 'title') {
      if (id === 'start') setScreen('setup')
      if (id === 'continue') {
        try {
          const raw = localStorage.getItem('arcana-save')
          if (!raw) return
          const data = JSON.parse(raw) as { seed: number; difficulty: number }
          difficulty = data.difficulty ?? 1
          startRun(data.seed)
        } catch {
          toast('存档损坏')
        }
      }
      if (id === 'settings') {
        prevScreen = 'title'
        setScreen('settings')
      }
      if (id === 'credits') setScreen('credits')
    } else if (screen === 'pause') {
      if (id === 'resume') setScreen('play')
      if (id === 'settings') {
        prevScreen = 'pause'
        setScreen('settings')
      }
      if (id === 'retry') startRun(seed)
      if (id === 'title')
        openConfirm('pause', () => setScreen('title'))
    } else if (screen === 'death') {
      if (id === 'retry') startRun(seed)
      if (id === 'title') setScreen('title')
    } else if (screen === 'clear') {
      if (id === 'next') {
        seed = (seed * 7 + 13) % 9000 + 1000
        deaths = 0
        startRun(seed)
      }
      if (id === 'retry') startRun(seed)
      if (id === 'title') setScreen('title')
    } else if (screen === 'confirm') {
      if (id === 'cancel') setScreen(prevScreen)
      if (id === 'ok') {
        const fn = confirmAction
        confirmAction = null
        fn?.()
      }
    }
  }

  function hurt(reason: string) {
    if (player.invuln > 0) return
    cause = reason
    lives -= 1
    deaths += 1
    flash()
    shake()
    spawnDust(player.x + 6, player.y + 8, COLORS.danger)
    if (lives <= 0) {
      setScreen('death')
      return
    }
    player.invuln = 900
    resetPlayer()
    toast('盔甲裂了一点…')
  }

  function winLevel() {
    clearTime = performance.now() - levelStarted
    stars = 1
    if (clearTime < 45_000) stars++
    if (deaths === 0) stars++
    setScreen('clear')
  }

  function fill(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
  }

  function drawBackground(t: number) {
    fill(0, 0, W, H, COLORS.bgPlay)
    // far castle parallax
    const px = -((t / 40) % 40)
    for (let i = -1; i < 10; i++) {
      const x = px + i * 40
      fill(x, 70, 22, 50, COLORS.castle)
      fill(x + 6, 55, 10, 15, COLORS.castle)
    }
    // mid band
    fill(0, 120, W, 8, '#203040')
    // void pit under spikes area
    fill(118, 156, 90, 24, '#0A1018')
  }

  function drawPlatforms() {
    for (const p of level.platforms) {
      fill(p.x, p.y, p.w, p.h, COLORS.ground)
      fill(p.x, p.y, p.w, 1, COLORS.groundHi)
    }
    for (const s of level.spikes) {
      for (let i = 0; i < s.w; i += 3) {
        fill(s.x + i, s.y, 2, s.h, COLORS.danger)
        fill(s.x + i, s.y - 2, 1, 2, COLORS.danger)
      }
    }
    // goal portal
    const g = level.goal
    const pulse = Math.floor(performance.now() / 200) % 2
    fill(g.x, g.y, g.w, g.h, pulse ? COLORS.arcana : '#3A8A8A')
    fill(g.x - 1, g.y, 1, g.h, COLORS.amber)
  }

  function drawActor() {
    const blink = player.invuln > 0 && Math.floor(performance.now() / 80) % 2 === 0
    if (blink) return
    const squash = player.stretch
    const h = player.h + squash
    const y = player.y - squash
    // body / helm silhouette
    fill(player.x + 2, y, 8, 5, COLORS.knight)
    fill(player.x, y + 5, 12, 7, COLORS.steel)
    fill(player.x + 1, y + 12, 4, h - 12, COLORS.border)
    fill(player.x + 7, y + 12, 4, h - 12, COLORS.border)
    // visor
    const open = player.onGround ? 2 : 1
    fill(player.x + (player.facing > 0 ? 7 : 3), y + 2, 3, open, COLORS.bgDeep)
  }

  function drawEnemies() {
    for (const e of level.enemies) {
      if (!e.alive) continue
      fill(e.x, e.y, e.w, e.h, COLORS.danger)
      fill(e.x + 2, e.y + 3, 2, 2, COLORS.text)
      fill(e.x + e.w - 4, e.y + 3, 2, 2, COLORS.text)
    }
  }

  function drawCoins() {
    for (const c of level.coins) {
      if (c.taken) continue
      const bob = Math.floor(performance.now() / 200 + c.x) % 2
      fill(c.x, c.y + bob, 6, 6, COLORS.amber)
      fill(c.x + 2, c.y + 2 + bob, 2, 2, COLORS.text)
    }
  }

  function drawParticles() {
    for (const p of particles) {
      fill(p.x, p.y, 2, 2, p.color)
    }
  }

  function drawTitleScene(t: number) {
    fill(0, 0, W, H, COLORS.bgDeep)
    const px = -((t / 60) % 50)
    for (let i = -1; i < 9; i++) {
      fill(px + i * 50, 90, 28, 70, COLORS.castle)
      fill(px + i * 50 + 8, 70, 12, 20, COLORS.castle)
    }
    // knight idle
    const bob = Math.floor(t / 300) % 2
    fill(230, 120 + bob, 14, 8, COLORS.knight)
    fill(228, 128 + bob, 18, 12, COLORS.steel)
    fill(232, 140 + bob, 5, 10, COLORS.border)
    fill(239, 140 + bob, 5, 10, COLORS.border)
    // arcana scanline
    if (Math.floor(t / 400) % 5 === 0) {
      fill(0, 100, W, 1, 'rgba(91,196,196,0.25)')
    }
  }

  function updatePlay(dt: number) {
    const now = performance.now()
    const left = keys.has('ArrowLeft') || keys.has('a') || keys.has('A')
    const right = keys.has('ArrowRight') || keys.has('d') || keys.has('D')
    if (left) {
      player.vx -= MOVE_ACC
      player.facing = -1
    }
    if (right) {
      player.vx += MOVE_ACC
      player.facing = 1
    }
    if (!left && !right) player.vx *= FRICTION
    player.vx = Math.max(-MOVE_MAX, Math.min(MOVE_MAX, player.vx))

    if (keys.has(' ') || keys.has('z') || keys.has('Z') || keys.has('j') || keys.has('J')) {
      jumpBufferUntil = now + JUMP_BUFFER
    }
    const canJump = player.onGround || now < coyoteUntil
    if (now < jumpBufferUntil && canJump) {
      player.vy = JUMP_V
      player.onGround = false
      coyoteUntil = 0
      jumpBufferUntil = 0
      player.stretch = 2
      spawnDust(player.x + 6, player.y + player.h, COLORS.muted)
    }

    player.vy += GRAVITY
    if (player.vy > 6) player.vy = 6

    // horizontal
    player.x += player.vx * (dt / 16)
    const body: Rect = { x: player.x, y: player.y, w: player.w, h: player.h }
    for (const p of level.platforms) {
      if (aabb(body, p)) {
        if (player.vx > 0) player.x = p.x - player.w
        else if (player.vx < 0) player.x = p.x + p.w
        player.vx = 0
        body.x = player.x
      }
    }

    // vertical
    player.y += player.vy * (dt / 16)
    body.y = player.y
    let grounded = false
    for (const p of level.platforms) {
      if (aabb(body, p)) {
        if (player.vy > 0) {
          player.y = p.y - player.h
          player.vy = 0
          if (!player.onGround) {
            player.stretch = -2
            spawnDust(player.x + 6, player.y + player.h, COLORS.muted)
          }
          grounded = true
        } else if (player.vy < 0) {
          player.y = p.y + p.h
          player.vy = 0
        }
        body.y = player.y
      }
    }
    if (grounded) {
      player.onGround = true
      coyoteUntil = now + COYOTE
    } else if (player.onGround) {
      player.onGround = false
      coyoteUntil = now + COYOTE
    }

    if (player.stretch > 0) player.stretch -= 0.4
    if (player.stretch < 0) player.stretch += 0.4
    if (Math.abs(player.stretch) < 0.4) player.stretch = 0

    if (player.invuln > 0) player.invuln -= dt

    // bounds / fall
    if (player.x < 0) player.x = 0
    if (player.x + player.w > W) player.x = W - player.w
    if (player.y > H + 20) hurt('坠落')

    // spikes
    const pbox = { x: player.x + 2, y: player.y + 2, w: player.w - 4, h: player.h - 2 }
    for (const s of level.spikes) {
      if (aabb(pbox, s)) hurt('尖刺')
    }

    // enemies
    for (const e of level.enemies) {
      if (!e.alive) continue
      e.x += e.dir * e.speed * (dt / 16)
      // patrol on nearest platform
      const floor = level.platforms.find(
        (p) => e.x + e.w / 2 >= p.x && e.x + e.w / 2 <= p.x + p.w && Math.abs(p.y - (e.y + e.h)) < 4
      )
      if (floor) {
        if (e.x <= floor.x || e.x + e.w >= floor.x + floor.w) e.dir = (e.dir * -1) as 1 | -1
      }
      const ebox = { x: e.x, y: e.y, w: e.w, h: e.h }
      if (!aabb(pbox, ebox)) continue
      // stomp
      if (player.vy > 0 && player.y + player.h - e.y < 10) {
        e.alive = false
        player.vy = JUMP_V * 0.72
        spawnDust(e.x + 6, e.y + 6, COLORS.amber)
        coins += 1
      } else {
        hurt('敌人')
      }
    }

    // coins
    for (const c of level.coins) {
      if (c.taken) continue
      if (aabb(pbox, { x: c.x, y: c.y, w: 6, h: 6 })) {
        c.taken = true
        coins += 1
        spawnDust(c.x, c.y, COLORS.amber)
      }
    }

    if (aabb(pbox, level.goal)) winLevel()

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.life -= dt / 16
      if (p.life <= 0) particles.splice(i, 1)
    }

    syncHud()
  }

  function draw(t: number) {
    if (
      screen === 'play' ||
      screen === 'pause' ||
      screen === 'death' ||
      screen === 'clear' ||
      screen === 'dialog' ||
      screen === 'confirm'
    ) {
      drawBackground(t)
      drawPlatforms()
      drawCoins()
      drawEnemies()
      drawActor()
      drawParticles()
      if (screen !== 'play' && screen !== 'dialog') {
        ctx.fillStyle = 'rgba(14,18,24,0.45)'
        ctx.fillRect(0, 0, W, H)
      }
    } else if (screen === 'title' || screen === 'credits') {
      drawTitleScene(t)
    } else if (screen === 'splash' || screen === 'loading') {
      fill(0, 0, W, H, COLORS.bgDeep)
    } else {
      // settings / setup keep last play or title underneath
      drawTitleScene(t)
      ctx.fillStyle = 'rgba(14,18,24,0.55)'
      ctx.fillRect(0, 0, W, H)
    }
  }

  let raf = 0
  let last = performance.now()

  const loop = (now: number) => {
    const dt = Math.min(32, now - last)
    last = now

    if (screen === 'loading' && now >= loadingUntil) {
      dialogIndex = 0
      dialogChars = 0
      setScreen('dialog')
    }

    if (screen === 'dialog') {
      const line = dialogLines[dialogIndex]
      if (line && dialogChars < line.text.length) {
        dialogChars += reduced ? line.text.length : dt > 24 ? 1 : 0.5
        if (dialogChars > line.text.length) dialogChars = line.text.length
        syncDialog()
      }
    }

    if (screen === 'play') updatePlay(dt)
    draw(now)
    raf = requestAnimationFrame(loop)
  }

  function onKeyDown(e: KeyboardEvent) {
    keys.add(e.key)
    const up = e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W'
    const down = e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'
    const enter = e.key === 'Enter' || e.key === ' '
    const esc = e.key === 'Escape'

    if (screen === 'splash') {
      e.preventDefault()
      setScreen('title')
      return
    }

    if (screen === 'play') {
      if (esc) {
        e.preventDefault()
        setScreen('pause')
      }
      if (e.key === ' ' || e.key === 'ArrowUp') e.preventDefault()
      return
    }

    if (screen === 'dialog') {
      e.preventDefault()
      const line = dialogLines[dialogIndex]
      if (line && dialogChars < line.text.length) {
        dialogChars = line.text.length
        syncDialog()
        return
      }
      dialogIndex += 1
      dialogChars = 0
      if (dialogIndex >= dialogLines.length) {
        levelStarted = performance.now()
        setScreen('play')
        toast('抵达青色传送门')
      } else syncDialog()
      return
    }

    if (screen === 'loading' || screen === 'credits') {
      if (enter || esc) {
        e.preventDefault()
        if (screen === 'credits') setScreen('title')
      }
      return
    }

    if (screen === 'settings') {
      if (esc) {
        e.preventDefault()
        setScreen(prevScreen === 'pause' ? 'pause' : 'title')
      }
      return
    }

    if (screen === 'setup') {
      if (esc) {
        e.preventDefault()
        setScreen('title')
      }
      if (enter) {
        e.preventDefault()
        startRun(seed)
      }
      return
    }

    const items = currentMenu()
    if (items.length) {
      if (up) {
        e.preventDefault()
        menuIndex = (menuIndex - 1 + items.length) % items.length
        refreshMenus()
      }
      if (down) {
        e.preventDefault()
        menuIndex = (menuIndex + 1) % items.length
        refreshMenus()
      }
      if (enter && e.key === 'Enter') {
        e.preventDefault()
        activateMenu()
      }
      if (e.key === ' ') {
        e.preventDefault()
        activateMenu()
      }
      if (esc && screen === 'pause') {
        e.preventDefault()
        setScreen('play')
      }
      if (esc && screen === 'confirm') {
        e.preventDefault()
        setScreen(prevScreen)
      }
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    keys.delete(e.key)
  }

  // UI clicks
  ui.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement
    const menuItem = t.closest<HTMLElement>('[data-menu-item]')
    if (menuItem) {
      const items = currentMenu()
      const id = menuItem.getAttribute('data-menu-item') || ''
      const idx = items.indexOf(id)
      if (idx >= 0) {
        menuIndex = idx
        refreshMenus()
        activateMenu()
      }
      return
    }
    const diff = t.closest<HTMLElement>('[data-diff]')
    if (diff) {
      difficulty = Number(diff.getAttribute('data-diff'))
      syncSetupUi()
      return
    }
    if (t.matches('[data-start-run]')) {
      startRun(seed)
      return
    }
    if (t.matches('[data-reroll-seed]')) {
      seed = Math.floor(Math.random() * 9000) + 1000
      syncSetupUi()
      return
    }
    const tab = t.closest<HTMLElement>('[data-settings-tab]')
    if (tab) {
      settingsTab = Number(tab.getAttribute('data-settings-tab'))
      syncSettingsUi()
      return
    }
    if (t.matches('[data-settings-back]')) {
      setScreen(prevScreen === 'pause' ? 'pause' : 'title')
      return
    }
    const confirmBtn = t.closest<HTMLElement>('[data-confirm-btn]')
    if (confirmBtn) {
      menuIndex = confirmBtn.getAttribute('data-confirm-btn') === 'ok' ? 1 : 0
      refreshMenus()
      activateMenu()
      return
    }
    if (screen === 'splash') setScreen('title')
    if (screen === 'credits') setScreen('title')
  })

  ui.addEventListener('input', (ev) => {
    const t = ev.target as HTMLInputElement
    const key = t.getAttribute('data-setting')
    if (!key) return
    if (key === 'master') settings.master = Number(t.value)
    if (key === 'sfx') settings.sfx = Number(t.value)
    if (key === 'shake') settings.shake = t.checked
    if (key === 'flash') settings.flash = t.checked
    if (key === 'timer') settings.showTimer = t.checked
    syncSettingsUi()
    syncHud()
  })

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  // boot
  window.setTimeout(() => {
    if (screen === 'splash') setScreen('title')
  }, reduced ? 400 : 1800)
  setScreen('splash')
  raf = requestAnimationFrame(loop)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  }
}
