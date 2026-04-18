import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const techs = [
  { name: 'React', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'Three.js', color: '#ffffff' },
  { name: 'Framer', color: '#0055ff' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'Figma', color: '#f24e1e' },
  { name: 'Tailwind', color: '#38bdf8' },
  { name: 'GraphQL', color: '#e535ab' },
  { name: 'Supabase', color: '#3ecf8e' },
  { name: 'Vite', color: '#bd34fe' },
  { name: 'GSAP', color: '#88ce02' },
]

export default function TechStack() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section" style={{ overflow: 'hidden' }}>
      <div className="container">
        <div ref={ref} style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="label"
            style={{ justifyContent: 'center' }}
          >
            Tech Stack
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="display-lg"
          >
            Tools of the trade
          </motion.h2>
        </div>

        {/* Marquee */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Fade masks */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 120,
            background: 'linear-gradient(to right, var(--bg), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
            background: 'linear-gradient(to left, var(--bg), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />

          <div style={{
            display: 'flex',
            animation: 'marquee 20s linear infinite',
            width: 'max-content',
          }}>
            {[...techs, ...techs].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 32px',
                margin: '0 4px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 100,
                whiteSpace: 'nowrap',
                transition: 'border-color 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${t.color}40`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: t.color,
                  boxShadow: `0 0 8px ${t.color}80`,
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  color: 'var(--text-2)', letterSpacing: '0.05em',
                }}>
                  {t.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
