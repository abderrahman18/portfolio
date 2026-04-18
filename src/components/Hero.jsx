import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

// ─── GLSL Shaders ─────────────────────────────────────────────────────────────
// These run on the GPU. The vertex shader positions geometry,
// the fragment shader colors each pixel.

const BG_VERT = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Layered value noise creates the organic dark plasma background.
// u_time drives all movement — everything is deterministic math, no textures.
const BG_FRAG = `
  uniform float u_time;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }

  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f); // smoothstep blend
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
      u.y
    );
  }

  void main(){
    vec2 uv = vUv * 3.0 - 1.5;
    float t = u_time * 0.12;
    // Fractional brownian motion: 3 octaves of noise at different scales/speeds
    float v = noise(uv + t) * 0.5
            + noise(uv * 2.0 - t * 0.5) * 0.25
            + noise(uv * 4.5 + t * 0.3) * 0.125;
    vec3 c = mix(vec3(0.016, 0.016, 0.016), vec3(0.040, 0.050, 0.004), v * v * 1.8);
    c = mix(c, vec3(0.006, 0.028, 0.024), noise(uv + vec2(t * 0.2, -t * 0.15)) * 0.3);
    gl_FragColor = vec4(c, 1.0);
  }
`

// Points shader: each point is a billboard quad sized by distance (gl_PointSize).
// a_sz and a_al are per-particle attributes set on the CPU.
const PT_VERT = `
  attribute float a_sz;
  attribute float a_al;
  varying float v_al;
  void main(){
    v_al = a_al;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = a_sz * (300.0 / -mv.z); // perspective divide
    gl_Position = projectionMatrix * mv;
  }
`

const PT_FRAG = `
  varying float v_al;
  uniform vec3 u_col;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if(d > 0.5) discard; // circular clip
    float s = 1.0 - smoothstep(0.12, 0.5, d); // soft edge
    gl_FragColor = vec4(u_col, v_al * s);
  }
`

// ─── Three.js Scene Builder ───────────────────────────────────────────────────
// Separated from React so it's easy to reason about.
// Returns { state, destroy } — React owns the lifecycle via useEffect.

function buildScene(canvas) {
  const W = () => canvas.clientWidth
  const H = () => canvas.clientHeight

  // Renderer: disable antialias (particles don't need it), cap pixel ratio for perf
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.setSize(W(), H())

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(52, W() / H(), 0.1, 100)
  camera.position.set(0, 0, 7)

  // ── 1. Plasma Background ──────────────────────────────────────────────────
  // A flat PlaneGeometry behind everything. The fragment shader
  // paints the entire plane each frame using animated noise — zero textures.
  const bgMat = new THREE.ShaderMaterial({
    uniforms: { u_time: { value: 0 } },
    vertexShader: BG_VERT,
    fragmentShader: BG_FRAG,
    depthWrite: false,
  })
  const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(32, 22), bgMat)
  bgMesh.position.z = -8
  scene.add(bgMesh)

  // ── 2. Particle Field ─────────────────────────────────────────────────────
  // Fewer particles on mobile/touch devices for consistent 60fps
  const isMobile = window.matchMedia('(pointer: coarse)').matches
  const COUNT = isMobile ? 1600 : 2800

  const pos = new Float32Array(COUNT * 3)
  const vel = new Float32Array(COUNT * 3)
  const sz  = new Float32Array(COUNT)
  const al  = new Float32Array(COUNT)

  for (let i = 0; i < COUNT; i++) {
    // Spherical distribution: uniform surface sampling via phi/theta
    const r     = 3.0 + Math.random() * 5.0
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
    pos[i*3+2] = r * Math.cos(phi)
    vel[i*3]   = (Math.random() - .5) * .0025
    vel[i*3+1] = (Math.random() - .5) * .0025
    vel[i*3+2] = (Math.random() - .5) * .0018
    sz[i] = 0.08 + Math.random() * 0.20
    al[i] = 0.25 + Math.random() * 0.65
  }

  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  pGeo.setAttribute('a_sz',     new THREE.BufferAttribute(sz, 1))
  pGeo.setAttribute('a_al',     new THREE.BufferAttribute(al, 1))

  const pMat = new THREE.ShaderMaterial({
    uniforms: { u_col: { value: new THREE.Color(0xd4f53c) } },
    vertexShader: PT_VERT,
    fragmentShader: PT_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending, // particles ADD light — bright clusters glow
  })
  const particles = new THREE.Points(pGeo, pMat)
  scene.add(particles)

  // ── 3. Morphing Icosahedron ───────────────────────────────────────────────
  // IcosahedronGeometry(r, detail): detail=3 → 320 triangular faces.
  // We keep a copy of original vertex positions (icoOrig) and
  // displace each vertex along its normal each frame using sin/cos noise.
  const icoGeo  = new THREE.IcosahedronGeometry(1.85, 3)
  const icoOrig = icoGeo.attributes.position.array.slice() // snapshot
  const icoPos  = icoGeo.attributes.position.array
  const icoMat  = new THREE.MeshBasicMaterial({
    color: 0xd4f53c,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  })
  const ico = new THREE.Mesh(icoGeo, icoMat)
  scene.add(ico)

  // Soft inner glow sphere (very low opacity)
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x8aaa10, transparent: true, opacity: 0.06 })
  ))

  // ── 4. Orbital Rings ──────────────────────────────────────────────────────
  // TorusGeometry(radius, tube, radialSeg, tubularSeg)
  // Thin tube (.006) = hairline rings. Each rotates at its own speed.
  function makeRing(r, col, op, rx, rz) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.006, 8, 120),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op })
    )
    m.rotation.x = rx
    m.rotation.z = rz
    scene.add(m)
    return m
  }
  const rings = [
    makeRing(2.4, 0xd4f53c, 0.22,  0.30,  0.10),
    makeRing(3.3, 0x47ffe8, 0.13, -0.50,  0.40),
    makeRing(4.2, 0xff6b35, 0.09,  1.00, -0.30),
    makeRing(5.0, 0xd4f53c, 0.05,  0.70,  0.80),
  ]

  // ── 5. Custom Cursor Glow ─────────────────────────────────────────────────
  // A small sprite that follows the mouse on the GPU side —
  // creates a "force field" feel when interacting with particles.
  const cursorGeo = new THREE.SphereGeometry(0.18, 12, 12)
  const cursorMat = new THREE.MeshBasicMaterial({
    color: 0xd4f53c,
    transparent: true,
    opacity: 0.0,
  })
  const cursorMesh = new THREE.Mesh(cursorGeo, cursorMat)
  scene.add(cursorMesh)

  // ── Shared animation state ────────────────────────────────────────────────
  const state = {
    mx: 0, my: 0,        // normalized mouse -1..1
    camX: 0, camY: 0,    // smoothed camera offset
    dRX: 0, dRY: 0,      // drag rotation (current, smoothed)
    tRX: 0, tRY: 0,      // drag rotation (target)
    // Smooth mouse-follow rotation for 3D objects
    mRX: 0, mRY: 0,      // current smooth mouse rotation
    drag: false, lx: 0, ly: 0,
    scroll: 0,
    cursorOpacity: 0,    // fades in on first mouse move
    t: 0,
    raf: null,
    paused: false,       // visibility API pause
  }

  // ── Render loop ───────────────────────────────────────────────────────────
  function tick() {
    state.raf = requestAnimationFrame(tick)
    if (state.paused) return  // tab hidden — skip all GPU work

    state.t += 0.016
    const { t, scroll: st } = state

    // Update plasma time uniform
    bgMat.uniforms.u_time.value = t

    // Camera parallax — mouse moves camera slightly, scroll pulls back
    const tx = state.mx * 0.45 * (1 - st * 0.7)
    const ty = state.my * 0.32 * (1 - st * 0.7)
    state.camX += (tx - state.camX) * 0.045
    state.camY += (ty - state.camY) * 0.045
    camera.position.x = state.camX
    camera.position.y = state.camY
    camera.position.z = 7 + st * 3.5
    camera.lookAt(0, 0, 0)

    // Drag inertia — exponential decay toward target rotation
    state.dRX += (state.tRX - state.dRX) * 0.08
    state.dRY += (state.tRY - state.dRY) * 0.08

    // Smooth mouse-follow rotation — lerp toward mx/my with easing
    // mx/my are -1..1, multiply by target angle range (±0.55 rad ≈ ±31°)
    state.mRX += ((-state.my * 0.55) - state.mRX) * 0.06
    state.mRY += ((state.mx  * 0.55) - state.mRY) * 0.06

    // Combine auto-rotation + mouse follow + drag for each object
    particles.rotation.x = t * 0.022 + state.mRX + state.dRX
    particles.rotation.y = t * 0.038 + state.mRY + state.dRY
    ico.rotation.x       = t * 0.028 + state.mRX * 1.2 + state.dRX
    ico.rotation.y       = t * 0.044 + state.mRY * 1.2 + state.dRY

    // Icosahedron morphing
    // morph oscillates 0→1 slowly; sp is per-vertex 3D noise displacement
    const morph = Math.sin(t * 0.55) * 0.5 + 0.5
    for (let i = 0; i < icoPos.length; i += 3) {
      const ox = icoOrig[i], oy = icoOrig[i+1], oz = icoOrig[i+2]
      const len = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1
      const sp = Math.sin(ox*3.1+t) * Math.cos(oy*2.8-t*0.7) * Math.sin(oz*3.5+t*0.5)
      const sc = 1 + sp * 0.38 * morph
      icoPos[i]   = (ox/len) * len * sc
      icoPos[i+1] = (oy/len) * len * sc
      icoPos[i+2] = (oz/len) * len * sc
    }
    icoGeo.attributes.position.needsUpdate = true
    icoMat.opacity = 0.13 + morph * 0.10

    // Particle simulation: gravity toward mouse + scroll vortex
    const pa = pGeo.attributes.position.array
    const gx = state.mx * 3.5
    const gy = state.my * 2.5

    for (let i = 0; i < COUNT; i++) {
      let x = pa[i*3], y = pa[i*3+1], z = pa[i*3+2]
      const dx = gx - x, dy = gy - y
      const d  = Math.sqrt(dx*dx + dy*dy + z*z) + 0.1
      x += vel[i*3]   + dx / d * 0.0013  // drift + attraction
      y += vel[i*3+1] + dy / d * 0.0013
      z += vel[i*3+2]
      // Scroll vortex: rotate particles in a spiral as user scrolls down
      if (st > 0.05) {
        const ang = Math.atan2(y, x) + st * 0.035
        const rad = Math.sqrt(x*x + y*y) * (1 - st * 0.013)
        x = Math.cos(ang) * rad
        y = Math.sin(ang) * rad
        z *= (1 - st * 0.007)
      }
      // Boundary: soft reset when particles drift too far
      if (x*x + y*y + z*z > 68) { x *= 0.975; y *= 0.975; z *= 0.975 }
      pa[i*3]=x; pa[i*3+1]=y; pa[i*3+2]=z
    }
    pGeo.attributes.position.needsUpdate = true

    // Color pulse — subtle hue shift on yellow channel
    const g = 0.96 + Math.sin(t * 0.7) * 0.04
    pMat.uniforms.u_col.value.setRGB(0.83, g * 0.99, 0.24 + Math.sin(t*0.5)*0.04)

    // Rings — also follow mouse for a unified feel
    rings[0].rotation.x = state.mRX + state.dRX + t*0.18; rings[0].rotation.y = state.mRY + state.dRY + t*0.11
    rings[1].rotation.x = state.mRX * 0.8 + state.dRX - t*0.12; rings[1].rotation.z = t*0.09
    rings[2].rotation.y = state.mRY * 0.8 + state.dRY + t*0.07; rings[2].rotation.z = -t*0.05
    rings[3].rotation.x = state.mRX * 0.5 + t*0.04;             rings[3].rotation.y = state.mRY * 0.5 + state.dRY + t*0.03

    // Cursor glow 3D position — unproject mouse into scene plane
    state.cursorOpacity = Math.min(state.cursorOpacity + 0.05, 0.55)
    cursorMesh.position.set(state.mx * 4.2, state.my * 3.0, 0)
    cursorMat.opacity = state.cursorOpacity

    renderer.domElement.style.opacity = String(1 - st * 0.55)
    renderer.render(scene, camera)
  }
  tick()

  // Visibility API — pause RAF when tab is hidden
  const onVisibility = () => { state.paused = document.hidden }
  document.addEventListener('visibilitychange', onVisibility)

  function resize() {
    renderer.setSize(W(), H())
    camera.aspect = W() / H()
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)

  return {
    state,
    destroy() {
      cancelAnimationFrame(state.raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      renderer.dispose()
    },
  }
}

// ─── Role list ────────────────────────────────────────────────────────────────
const ROLES = [
  'React Interfaces',
  'Three.js Experiences',
  'Full-Stack Platforms',
  'Mobile Apps',
  'AI-Powered Tools',
]

// ─── Hero Component ───────────────────────────────────────────────────────────
export default function Hero() {
  const canvasRef  = useRef(null)
  const sceneRef   = useRef(null)
  const [roleIdx, setRoleIdx]     = useState(0)
  const [prevRole, setPrevRole]   = useState(null)
  const [cycling, setCycling]     = useState(false)

  const { scrollYProgress } = useScroll()

  // Extended scroll exit — more cinematic (was 0→38%)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const heroY       = useTransform(scrollYProgress, [0, 0.55], ['0%', '-10%'])
  const heroScale   = useTransform(scrollYProgress, [0, 0.55], [1, 0.94])

  // Boot Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return
    const { state, destroy } = buildScene(canvasRef.current)
    sceneRef.current = state
    return destroy
  }, [])

  // Feed scroll progress into scene
  useEffect(() => scrollYProgress.on('change', v => {
    if (sceneRef.current) sceneRef.current.scroll = v
  }), [scrollYProgress])

  // Mouse: parallax + drag
  useEffect(() => {
    const mv = e => {
      const s = sceneRef.current; if (!s) return
      s.mx = (e.clientX / innerWidth) * 2 - 1
      s.my = -((e.clientY / innerHeight) * 2 - 1)
      if (s.drag) {
        s.tRY += (e.clientX - s.lx) * 0.006
        s.tRX += (e.clientY - s.ly) * 0.006
        s.lx = e.clientX; s.ly = e.clientY
      }
    }
    const md = e => { const s = sceneRef.current; if (s) { s.drag=true; s.lx=e.clientX; s.ly=e.clientY } }
    const mu = () => { if (sceneRef.current) sceneRef.current.drag = false }
    window.addEventListener('mousemove', mv, { passive: true })
    window.addEventListener('mousedown', md, { passive: true })
    window.addEventListener('mouseup',   mu, { passive: true })
    return () => {
      window.removeEventListener('mousemove', mv)
      window.removeEventListener('mousedown', md)
      window.removeEventListener('mouseup',   mu)
    }
  }, [])

  // Touch support
  useEffect(() => {
    const onTouch = e => {
      const s = sceneRef.current; if (!s) return
      const t0 = e.touches[0]
      s.mx = (t0.clientX / innerWidth) * 2 - 1
      s.my = -((t0.clientY / innerHeight) * 2 - 1)
    }
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => window.removeEventListener('touchmove', onTouch)
  }, [])

  // Role cycling — now using React state so transitions are frame-accurate
  useEffect(() => {
    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      setCycling(true)
      setTimeout(() => {
        setRoleIdx(i => {
          setPrevRole(ROLES[i])
          return (i + 1) % ROLES.length
        })
        setCycling(false)
      }, 300)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  // Width of longest role — prevents layout shift during cycling
  // "Three.js Experiences" is the widest; we lock it as min-width
  const MAX_ROLE_WIDTH = '14ch'

  const stats = [
    { v: 'Open to work', l: 'Remote · Worldwide' },
    { v: 'Web + Mobile',  l: 'Full-stack' },
    { v: 'Algeria',       l: 'Based in' },
  ]

  return (
    <section
      id="hero"
      style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
    >
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* Vignette — bottom-weighted so headline text stays readable */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 50% at 50% 110%, #050505 10%, transparent 70%),
          radial-gradient(ellipse 100% 40% at 50% 100%, #050505 0%, transparent 60%)
        `,
      }} />

      {/* All text + UI content */}
      <motion.div
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '100%', textAlign: 'center',
          padding: '0 24px',
          opacity: heroOpacity,
          y: heroY,
          scale: heroScale,
        }}
      >
        {/* Available badge */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px',
            background: 'rgba(212,245,60,0.07)',
            border: '1px solid rgba(212,245,60,0.2)',
            borderRadius: 100, marginBottom: 32,
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: '#d4f53c', boxShadow: '0 0 8px #d4f53c',
            animation: 'avpulse 2.2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: '#d4f53c', letterSpacing: '.13em', textTransform: 'uppercase',
          }}>Available for freelance · Remote worldwide</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.03em',
            lineHeight: 1.0,
            maxWidth: 900,
            marginBottom: 0,
            textAlign: 'center',
          }}
        >
          {/* Line 1: large, white — "I build [Role]" */}
          <span style={{
            display: 'block',
            fontSize: 'clamp(36px, 7.5vw, 88px)',
            fontWeight: 700,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            marginBottom: '0.08em',
          }}>
            I build{' '}
            <span style={{ position: 'relative', display: 'inline-block', minWidth: MAX_ROLE_WIDTH, textAlign: 'left' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={roleIdx}
                  initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{ color: 'var(--accent)', display: 'inline-block' }}
                >
                  {ROLES[roleIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>

          {/* Line 2: smaller, muted — "that perform & convert" */}
          <span style={{
            display: 'block',
            fontSize: 'clamp(24px, 4.5vw, 56px)',
            fontWeight: 400,
            color: 'var(--text-3)',
            letterSpacing: '-0.02em',
          }}>
            that perform &amp; convert
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.9 }}
          style={{
            marginTop: 20, fontSize: 15,
            color: 'var(--text-2)', maxWidth: 460,
            lineHeight: 1.75, fontWeight: 300,
          }}
        >
          Frontend developer based in Algeria — I ship fast, build clean,
          and obsess over the 1% details that make everything else feel effortless.
        </motion.p>

        {/* CTAs — FIX: backdrop blur keeps both buttons legible on any background */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button
            className="btn-primary"
            onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See My Work
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          {/* FIX: explicit dark bg + blur so outline button doesn't vanish on bright particles */}
          <button
            className="btn-outline"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(0,0,0,0.35)',
            }}
          >
            Start a Project
          </button>
        </motion.div>

        {/* Stats row — FIX: staggered entrance, better first stat */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 1.0 } },
          }}
          style={{ display: 'flex', gap: 10, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {stats.map(s => (
            <motion.div
              key={s.l}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16,1,0.3,1] } },
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 100,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text)' }}>{s.v}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'.1em', textTransform:'uppercase' }}>{s.l}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          style={{ position:'absolute', bottom:32, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}
        >
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'.22em', color:'var(--text-3)', textTransform:'uppercase' }}>Scroll</span>
          <div style={{ width:1, height:40, background:'linear-gradient(to bottom, rgba(212,245,60,.5), transparent)', animation:'scrollln 2.2s ease-in-out infinite' }} />
        </motion.div>
      </motion.div>

      {/* Drag hint — hidden on touch devices */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.5, 0] }}
        transition={{ delay: 2.5, duration: 4, times:[0,.2,.75,1] }}
        style={{
          position:'absolute', bottom:32, right:36,
          fontFamily:'var(--font-mono)', fontSize:9,
          color:'var(--text-3)', letterSpacing:'.14em',
          textTransform:'uppercase', pointerEvents:'none', zIndex:10,
        }}
        className="hide-on-touch"
      >
        Drag to rotate
      </motion.div>

      <style>{`
        @keyframes avpulse {
          0%,100% { opacity:1; box-shadow:0 0 8px #d4f53c }
          50%      { opacity:.35; box-shadow:none }
        }
        @keyframes scrollln {
          0%,100% { opacity:.3; transform:scaleY(1) }
          50%      { opacity:1; transform:scaleY(1.3) }
        }
        @media (pointer: coarse) {
          .hide-on-touch { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  )
}