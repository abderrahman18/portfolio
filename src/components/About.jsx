import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const techStack = [
  'React', 'Next.js', 'React Native',
  'TypeScript', 'Node.js', 'Express',
  'Three.js', 'Framer Motion', 'Tailwind',
  'PostgreSQL', 'Python', 'FastAPI',
  'Figma', 'Vite', 'Vercel',
]

const facts = [
  { label: 'Based in', value: 'Algiers, Algeria' },
  { label: 'Remote', value: 'Available worldwide' },
  { label: 'Focus', value: 'React, Three.js, Full-Stack' },
  { label: 'Turnaround', value: '2–4 week projects' },
]

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  // FIX: track if avatar image loaded successfully
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  return (
    <section id="about" className="section">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'start',
        }} className="about-grid">

          {/* Left */}
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="label"
            >
              About Me
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="display-lg"
              style={{ marginBottom: 32 }}
            >
              I build things that{' '}
              <span style={{ color: 'var(--accent)' }}>actually</span>{' '}
              ship
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
              style={{ color: 'var(--text-2)', lineHeight: 1.85, marginBottom: 20, fontSize: 15 }}
            >
              I'm Abdou — a frontend developer based in Algeria who specializes in React, Three.js, and
              full-stack platforms. I've shipped everything from AI text analysis tools to mobile Quran apps
              to agricultural marketplaces. I care about code that's clean, UIs that are fast, and
              products that solve real problems.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ color: 'var(--text-2)', lineHeight: 1.85, marginBottom: 40, fontSize: 15 }}
            >
              I'm obsessive about motion (if an animation doesn't earn its milliseconds, it doesn't ship),
              obsessive about performance, and I have a rule: no placeholder content, no fake metrics,
              no borrowed aesthetics. Everything I put out is something I'd be proud to show to a
              senior engineer and a first-time user in the same breath.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {facts.map((fact, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>{fact.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)' }}>
                    {fact.value}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Tech + identity card */}
          <div style={{ paddingTop: 60 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                padding: 32,
                marginBottom: 32,
                position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, var(--accent), var(--accent-3), var(--accent-2))',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                {/* FIX: img with onLoad/onError — shows initials until/unless photo loads */}
                <div style={{
                  width: 60, height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-3))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
                  color: 'var(--bg)',
                  flexShrink: 0,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {/* Actual photo — swap /avatar.jpg for your real image path */}
                  <img
                    src="/avatar.jpg"
                    alt="Abdou"
                    onLoad={() => setAvatarLoaded(true)}
                    onError={e => { e.target.style.display = 'none' }}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      display: avatarLoaded ? 'block' : 'none',
                    }}
                  />
                  {/* Initials fallback — always rendered, hidden behind image when loaded */}
                  <span style={{ position: 'relative', zIndex: 1 }}>A</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Abdou</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--text-3)', letterSpacing: '0.1em', marginTop: 2,
                  }}>
                    Frontend Developer · Algeria
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px',
                    background: 'rgba(232,255,71,0.08)',
                    border: '1px solid rgba(232,255,71,0.2)',
                    borderRadius: 100,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'inline-block',
                      animation: 'avpulse 2.2s ease-in-out infinite',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9,
                      color: 'var(--accent)', letterSpacing: '0.1em',
                    }}>OPEN</span>
                  </div>
                </div>
              </div>

              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'var(--text-2)', lineHeight: 1.7,
                fontStyle: 'italic',
              }}>
                "I don't just deliver code. I deliver something you can ship to real users,
                get feedback on, and be proud of."
              </p>
            </motion.div>

            {/* Tech stack */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--text-3)', letterSpacing: '0.15em',
                textTransform: 'uppercase', marginBottom: 16,
              }}>
                Stack
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {techStack.map((tech, i) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.04, duration: 0.4 }}
                    style={{
                      padding: '6px 14px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 100,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11, letterSpacing: '0.05em',
                      color: 'var(--text-2)',
                      transition: 'all 0.2s',
                      cursor: 'default',
                    }}
                    whileHover={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes avpulse {
          0%,100% { opacity:1; box-shadow:0 0 8px var(--accent) }
          50%      { opacity:.35; box-shadow:none }
        }
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .about-grid > div:last-child { padding-top: 0 !important; }
        }
      `}</style>
    </section>
  )
}
