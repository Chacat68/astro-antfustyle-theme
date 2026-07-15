/**
 * Three.js 故障艺术引擎。
 * - lite：全站轻量背景（噪声 / 扫描线 / 微弱 RGB）
 * - hero：首页展示台（几何线框 + 更强故障）
 */
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'

export type GlitchMode = 'lite' | 'hero'

export interface CreateGlitchOptions {
  mode?: GlitchMode
  reducedMotion?: boolean
  isDark?: boolean
}

export interface GlitchHandle {
  dispose: () => void
  setDark: (dark: boolean) => void
  setIntensity: (value: number) => void
  resize: () => void
}

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uIntensity;
uniform float uHero;
uniform vec2 uResolution;
uniform vec3 uBg;
uniform vec3 uFg;
uniform vec3 uAccent;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// 动态弧线：径向扰动 + 角向扫掠
float arcRing(vec2 p, float radius, float t, float speed, float warp) {
  float ang = atan(p.y, p.x);
  float dist = length(p);
  float wobble = sin(ang * 3.0 + t * speed) * 0.018
    + sin(ang * 7.0 - t * speed * 1.4) * 0.01
    + noise(vec2(ang * 2.0, t * 0.35)) * warp;
  float band = abs(dist - (radius + wobble));
  float core = smoothstep(0.016, 0.0, band);
  float sweep = 0.45 + 0.55 * sin(ang * 2.0 - t * speed * 1.8);
  return core * sweep;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float t = uTime;
  float inten = clamp(uIntensity, 0.0, 1.5);
  float hero = uHero;

  // 偶发水平切片：低频，避免屏幕持续撕裂闪烁
  float sliceTick = floor(t * (hero > 0.5 ? 1.6 : 4.0));
  float slice = step(
    hero > 0.5 ? 0.992 : (0.978 - inten * 0.1),
    hash(vec2(floor(uv.y * 24.0), sliceTick))
  );
  uv.x += slice * (hash(vec2(floor(uv.y * 32.0), sliceTick)) - 0.5)
    * (hero > 0.5 ? 0.012 : (0.02 + inten * 0.05));
  p = (uv - 0.5) * vec2(aspect, 1.0);

  float n = noise(uv * (6.0 + hero * 5.0) + t * 0.22);
  float rgbShift = (0.002 + inten * 0.012 + hero * 0.006) * (0.5 + n);

  float r = noise(uv + vec2(rgbShift, 0.0) + t * 0.08);
  float g = noise(uv + t * 0.1);
  float b = noise(uv - vec2(rgbShift, 0.0) - t * 0.06);

  float scan = sin((uv.y + t * 0.12) * uResolution.y * 1.2) * 0.5 + 0.5;
  // 颗粒用慢采样，减少「雪花闪屏」感
  float grain = hash(uv * uResolution + floor(t * (hero > 0.5 ? 6.0 : 24.0)));
  float vignette = smoothstep(1.25, 0.2, length(p));
  // 全屏闪白：hero 极低频（约数秒一次量级）
  float flash = step(
    hero > 0.5 ? 0.9985 : (0.994 - inten * 0.012),
    hash(vec2(floor(t * (hero > 0.5 ? 2.0 : 14.0)), 3.1))
  );

  if (hero > 0.5) {
    // 多层扩张/收缩弧线 + 旋转菱形
    float pulse = 0.04 * sin(t * 0.9);
    float arcs =
        arcRing(p, 0.18 + pulse, t, 1.1, 0.03)
      + arcRing(p, 0.32 - pulse * 0.6, t, -0.85, 0.035)
      + arcRing(p, 0.48 + pulse * 0.4, t, 0.7, 0.04)
      + arcRing(p, 0.68 - pulse * 0.3, t, -0.55, 0.045)
      + arcRing(p, 0.92 + pulse * 0.2, t, 0.42, 0.05);

    // 扩张波纹
    float ripple = fract(length(p) * 1.35 - t * 0.18);
    ripple = smoothstep(0.08, 0.0, abs(ripple - 0.5) * 2.0) * 0.55;

    // 旋转菱形线框
    float ca = cos(t * 0.22);
    float sa = sin(t * 0.22);
    vec2 pd = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
    float diamond = abs(abs(pd.x) + abs(pd.y) - (0.5 + 0.03 * sin(t * 0.7)));
    diamond = smoothstep(0.012, 0.0, diamond);

    // 能量波形（accent 色带）
    float wave = sin(p.x * 7.0 + t * 1.6 + noise(p * 3.0 + t * 0.4) * 4.0);
    float energy = smoothstep(0.35, 0.0, abs(p.y + wave * 0.12 - sin(t * 0.5) * 0.05));
    energy *= 0.35 + 0.65 * (0.5 + 0.5 * sin(t * 2.2 + p.x * 4.0));

    float scanMix = mix(1.0, scan, 0.08 + inten * 0.06);
    vec3 fog = mix(uFg, uAccent, 0.42);
    vec3 col = uBg;
    col += fog * ((r * 0.12 + g * 0.08 + b * 0.14) * (0.75 + inten * 0.45));
    col += uAccent * arcs * (0.55 + inten * 0.35);
    col += uAccent * ripple * (0.22 + inten * 0.15);
    col += uFg * diamond * (0.28 + inten * 0.25);
    col += uAccent * energy * (0.2 + inten * 0.18);
    col *= scanMix;
    col += (grain - 0.5) * (0.05 + inten * 0.04);
    col *= mix(0.72, 1.0, vignette);
    col = mix(col, mix(uFg, uAccent, 0.35), flash * 0.06);

    // RGB 通道轻微分开
    col.r += arcs * 0.08;
    col.b += arcs * 0.06 + energy * 0.05;

    gl_FragColor = vec4(col, 1.0);
    return;
  }

  // 轻量模式：常驻动态弧线 + 低闪烁，保留正文可读性
  float pulse = 0.03 * sin(t * 0.7);
  float arcs =
      arcRing(p, 0.28 + pulse, t, 0.65, 0.02)
    + arcRing(p, 0.5 - pulse * 0.5, t, -0.48, 0.025)
    + arcRing(p, 0.78 + pulse * 0.3, t, 0.32, 0.03);
  float ripple = fract(length(p) * 1.1 - t * 0.12);
  ripple = smoothstep(0.1, 0.0, abs(ripple - 0.5) * 2.0) * 0.35;

  float ca = cos(t * 0.12);
  float sa = sin(t * 0.12);
  vec2 pd = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
  float diamond = smoothstep(0.014, 0.0, abs(abs(pd.x) + abs(pd.y) - 0.55));

  vec3 fog = mix(uFg, uAccent, 0.5);
  float field = (r * 0.4 + g * 0.28 + b * 0.38) * (0.1 + inten * 0.12);
  float scanA = (1.0 - scan) * (0.04 + inten * 0.03);
  float arcsA = arcs * (0.1 + inten * 0.08);
  float rippleA = ripple * (0.05 + inten * 0.04);
  float diamondA = diamond * 0.06;
  float grainA = abs(grain - 0.5) * (0.035 + inten * 0.03);
  float flashA = flash * 0.04;
  float alpha = clamp(
    field + scanA + arcsA + rippleA + diamondA + grainA + flashA,
    0.0,
    0.38
  );
  alpha *= mix(0.5, 1.0, vignette);

  vec3 col = fog * (0.5 + field * 2.2)
    + uAccent * (arcs * 0.85 + ripple * 0.55)
    + uFg * diamond * 0.45;
  col = mix(col, uFg, flash * 0.2);
  gl_FragColor = vec4(col, alpha);
}
`

function themeColors(isDark: boolean, mode: GlitchMode) {
  if (mode === 'hero') {
    return {
      bg: new Color('#050505'),
      fg: new Color('#f4f4f2'),
      accent: isDark ? new Color('#38bdf8') : new Color('#7dd3fc'),
    }
  }
  // lite：叠层色贴近 accent / 前景，透明画布下不抢正文
  if (isDark) {
    return {
      bg: new Color('#08090b'),
      fg: new Color('#f5f5f4'),
      accent: new Color('#38bdf8'),
    }
  }
  return {
    bg: new Color('#fafaf8'),
    fg: new Color('#0a0a0a'),
    accent: new Color('#0284c7'),
  }
}

function makeRing(radius: number, segments = 128) {
  const positions = new Float32Array((segments + 1) * 3)
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    positions[i * 3] = Math.cos(a) * radius
    positions[i * 3 + 1] = Math.sin(a) * radius
    positions[i * 3 + 2] = 0
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geo
}

/** 开放弧段（非闭合），用于扫掠动效 */
function makeArc(radius: number, start: number, end: number, segments = 64) {
  const count = segments + 1
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const a = start + ((end - start) * i) / segments
    positions[i * 3] = Math.cos(a) * radius
    positions[i * 3 + 1] = Math.sin(a) * radius
    positions[i * 3 + 2] = 0
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geo
}

function makeDiamond(size: number) {
  const s = size
  const positions = new Float32Array([
    0,
    s,
    0,
    s,
    0,
    0,
    0,
    -s,
    0,
    -s,
    0,
    0,
    0,
    s,
    0,
  ])
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geo
}

interface RingAnim {
  object: Line | LineLoop
  baseScale: number
  spin: number
  breathe: number
  phase: number
  accent: boolean
}

export function createGlitchEngine(
  container: HTMLElement,
  options: CreateGlitchOptions = {}
): GlitchHandle {
  const mode: GlitchMode = options.mode ?? 'lite'
  const reducedMotion = options.reducedMotion ?? false
  let isDark = options.isDark ?? true
  let intensity = mode === 'hero' ? 0.55 : 0.28
  let disposed = false
  let raf = 0
  let burstTimer = 0

  const colors = themeColors(isDark, mode)
  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const renderer = new WebGLRenderer({
    antialias: false,
    alpha: mode !== 'hero',
    powerPreference: mode === 'hero' ? 'high-performance' : 'low-power',
    premultipliedAlpha: false,
    // 避免部分设备长时间运行后上下文被回收且无法恢复
    failIfMajorPerformanceCaveat: false,
  })
  renderer.setClearColor(
    mode === 'hero' ? 0x050505 : 0x000000,
    mode === 'hero' ? 1 : 0
  )
  // 控制像素比，降低长时间高负载导致的 GPU 上下文丢失概率
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, mode === 'hero' ? 1.5 : 1.25)
  )
  renderer.domElement.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;display:block;'
  container.appendChild(renderer.domElement)

  const uniforms = {
    uTime: { value: 0 },
    uIntensity: { value: intensity },
    uHero: { value: mode === 'hero' ? 1 : 0 },
    uResolution: { value: new Vector2(1, 1) },
    uBg: { value: colors.bg.clone() },
    uFg: { value: colors.fg.clone() },
    uAccent: { value: colors.accent.clone() },
  }

  const material = new ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    depthTest: false,
    depthWrite: false,
    transparent: mode !== 'hero',
  })

  const quad = new Mesh(new PlaneGeometry(2, 2), material)
  scene.add(quad)

  const geoGroup = new Group()
  scene.add(geoGroup)
  const ringAnims: RingAnim[] = []

  if (mode === 'hero') {
    const ringSpecs = [
      { r: 0.26, spin: 0.18, breathe: 0.04, accent: false },
      { r: 0.42, spin: -0.14, breathe: 0.055, accent: true },
      { r: 0.62, spin: 0.1, breathe: 0.07, accent: false },
      { r: 0.88, spin: -0.07, breathe: 0.05, accent: true },
      { r: 1.18, spin: 0.045, breathe: 0.035, accent: false },
    ]

    ringSpecs.forEach((spec, i) => {
      const mat = new LineBasicMaterial({
        color: spec.accent ? colors.accent : colors.fg,
        transparent: true,
        opacity: spec.accent ? 0.42 : 0.28,
      })
      const loop = new LineLoop(makeRing(1), mat)
      loop.scale.setScalar(spec.r)
      geoGroup.add(loop)
      ringAnims.push({
        object: loop,
        baseScale: spec.r,
        spin: spec.spin,
        breathe: spec.breathe,
        phase: i * 0.9,
        accent: spec.accent,
      })
    })

    // 扫掠弧段
    const arcSpecs = [
      { r: 0.35, span: 1.2, spin: 0.55, accent: true },
      { r: 0.55, span: 0.9, spin: -0.4, accent: false },
      { r: 0.78, span: 1.5, spin: 0.28, accent: true },
    ]
    arcSpecs.forEach((spec, i) => {
      const mat = new LineBasicMaterial({
        color: spec.accent ? colors.accent : colors.fg,
        transparent: true,
        opacity: 0.55,
      })
      const arc = new Line(makeArc(1, -spec.span * 0.5, spec.span * 0.5), mat)
      arc.scale.setScalar(spec.r)
      geoGroup.add(arc)
      ringAnims.push({
        object: arc,
        baseScale: spec.r,
        spin: spec.spin,
        breathe: 0.02,
        phase: i * 1.4 + 2,
        accent: spec.accent,
      })
    })

    const diamondMat = new LineBasicMaterial({
      color: colors.fg,
      transparent: true,
      opacity: 0.32,
    })
    const diamond = new Line(makeDiamond(1), diamondMat)
    diamond.scale.setScalar(0.72)
    geoGroup.add(diamond)
    ringAnims.push({
      object: diamond,
      baseScale: 0.72,
      spin: -0.08,
      breathe: 0.03,
      phase: 0.3,
      accent: false,
    })
  }

  const resize = () => {
    if (disposed) return
    const rect = container.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width || container.clientWidth || window.innerWidth))
    const h = Math.max(1, Math.round(rect.height || container.clientHeight || window.innerHeight))
    renderer.setSize(w, h, false)
    uniforms.uResolution.value.set(w, h)
    // 相机保持 -1..1 以铺满 shader 四边形；线框按宽高比压成正圆
    const aspect = w / Math.max(h, 1)
    geoGroup.scale.set(1 / aspect, 1, 1)
  }

  const applyTheme = (dark: boolean) => {
    isDark = dark
    const next = themeColors(dark, mode)
    uniforms.uBg.value.copy(next.bg)
    uniforms.uFg.value.copy(next.fg)
    uniforms.uAccent.value.copy(next.accent)
    for (const item of ringAnims) {
      const mat = item.object.material as LineBasicMaterial
      mat.color.copy(item.accent ? next.accent : next.fg)
    }
  }

  const renderFrame = (timeMs: number) => {
    if (disposed) return
    // 周期化时间，避免长时间运行后 hash/noise 浮点精度塌缩成黑屏
    const t = (timeMs * 0.001) % 3600
    uniforms.uTime.value = t
    uniforms.uIntensity.value = intensity

    if (mode === 'hero') {
      for (const item of ringAnims) {
        const breathe =
          1 + Math.sin(t * (1.1 + item.breathe * 8) + item.phase) * item.breathe
        const scale = item.baseScale * breathe * (1 + intensity * 0.04)
        item.object.scale.setScalar(scale)
        item.object.rotation.z = t * item.spin + item.phase
        // 轻微椭圆拉伸，让弧线更有运动感
        item.object.scale.x = scale * (1 + Math.sin(t * 0.6 + item.phase) * 0.04)
        item.object.scale.y = scale * (1 - Math.sin(t * 0.6 + item.phase) * 0.03)
        const mat = item.object.material as LineBasicMaterial
        mat.opacity = Math.min(
          1,
          Math.max(
            0.08,
            (item.accent ? 0.38 : 0.22) +
              intensity * 0.28 +
              Math.sin(t * 2.2 + item.phase) * 0.08
          )
        )
      }
      geoGroup.rotation.z = Math.sin(t * 0.08) * 0.04
    }

    const gl = renderer.getContext()
    if (gl.isContextLost()) return
    renderer.render(scene, camera)
  }

  const tick = (timeMs: number) => {
    if (disposed) return
    renderFrame(timeMs)
    if (!reducedMotion) raf = requestAnimationFrame(tick)
  }

  const startLoop = () => {
    if (disposed || reducedMotion) return
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(tick)
  }

  let recoverTimer = 0
  const scheduleBurst = () => {
    // 偶发强度脉冲：间隔拉长，避免频繁整屏闪烁
    if (reducedMotion || disposed || mode !== 'hero') return
    burstTimer = window.setTimeout(
      () => {
        if (disposed) return
        const prev = intensity
        intensity = Math.min(1.05, intensity + 0.22)
        window.setTimeout(() => {
          if (!disposed) intensity = prev
        }, 90)
        scheduleBurst()
      },
      7000 + Math.random() * 8000
    )
  }

  const onContextLost = (event: Event) => {
    event.preventDefault()
    cancelAnimationFrame(raf)
    raf = 0
  }

  const onContextRestored = () => {
    if (disposed) return
    material.needsUpdate = true
    for (const item of ringAnims) {
      ;(item.object.material as LineBasicMaterial).needsUpdate = true
    }
    resize()
    applyTheme(isDark)
    if (reducedMotion) {
      renderFrame(performance.now())
    } else {
      startLoop()
    }
  }

  const onVisibility = () => {
    if (disposed) return
    if (document.hidden) {
      cancelAnimationFrame(raf)
      raf = 0
      return
    }
    // 回到前台时强制校正尺寸并重启循环，规避休眠后黑屏
    window.clearTimeout(recoverTimer)
    recoverTimer = window.setTimeout(() => {
      if (disposed) return
      resize()
      if (reducedMotion) {
        renderFrame(performance.now())
      } else {
        startLoop()
      }
    }, 50)
  }

  resize()
  applyTheme(isDark)

  if (reducedMotion) {
    renderFrame(0)
  } else {
    startLoop()
    scheduleBurst()
  }

  const onResize = () => resize()
  window.addEventListener('resize', onResize)
  const ro =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => resize())
      : null
  ro?.observe(container)

  const canvas = renderer.domElement
  canvas.addEventListener('webglcontextlost', onContextLost, false)
  canvas.addEventListener('webglcontextrestored', onContextRestored, false)
  document.addEventListener('visibilitychange', onVisibility)

  return {
    dispose: () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.clearTimeout(burstTimer)
      window.clearTimeout(recoverTimer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onContextLost, false)
      canvas.removeEventListener('webglcontextrestored', onContextRestored, false)
      ro?.disconnect()
      material.dispose()
      quad.geometry.dispose()
      for (const item of ringAnims) {
        item.object.geometry.dispose()
        ;(item.object.material as LineBasicMaterial).dispose()
        geoGroup.remove(item.object)
      }
      scene.remove(geoGroup)
      renderer.dispose()
      renderer.domElement.remove()
    },
    setDark: (dark: boolean) => {
      applyTheme(dark)
      if (reducedMotion) renderFrame(uniforms.uTime.value * 1000)
    },
    setIntensity: (value: number) => {
      intensity = Math.min(1.5, Math.max(0, value))
      if (reducedMotion) renderFrame(uniforms.uTime.value * 1000)
    },
    resize,
  }
}
