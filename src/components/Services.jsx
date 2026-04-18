import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const services = [
  {
    icon: '◈',
    title: 'UI/UX Design',
    desc: 'Research-driven design that converts. From wireframes to polished Figma prototypes and complete design systems.',
    features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    price: 'From $',
    accent: '#e8ff47',
  },
  {
    icon: '⬡',
    title: 'Frontend Development',
    desc: 'Pixel-perfect, performant web apps. React, Next.js, and modern tooling built for scale and speed.',
    features: ['React / Next.js', 'Performance Opt.', 'Animations', 'Testing'],
    price: 'From $',
    accent: '#47ffe8',
  },
  {
    icon: '◉',
    title: '3D & WebGL',
    desc: 'Immersive 3D experiences and interactive visualizations that set your brand apart from the rest.',
    features: ['Three.js', 'React Three Fiber', 'GLSL Shaders', '3D Modeling'],
    price: 'From $',
    accent: '#ff6b35',
  },
  {
    icon: '⬟',
    title: 'Full Product',
    desc: 'End-to-end product delivery — from strategy and design to deployment and ongoing support.',
    features: ['Strategy', 'Design + Dev', 'Launch', 'Support'],
    price: 'From $',
    accent: '#c47aff',
  },
]

export default function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="services" className="section" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <div ref={ref} style={{ marginBottom: 64 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="label"
          >
            What I Offer
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="display-lg"
          >
            Services built<br />for growth
          </motion.h2>
        </div>

        {/* FIX: use className on the grid — no more fragile :last-child CSS selector */}
        <div className="services-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}>
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: 28,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${s.accent}40`
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 20px 40px ${s.accent}10`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: 28, color: s.accent,
                marginBottom: 20,
                fontFamily: 'var(--font-mono)',
              }}>
                {s.icon}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20, fontWeight: 700,
                marginBottom: 12, letterSpacing: '-0.02em',
              }}>
                {s.title}
              </h3>

              <p style={{
                color: 'var(--text-2)', fontSize: 13,
                lineHeight: 1.7, marginBottom: 24, flex: 1,
              }}>
                {s.desc}
              </p>

              <div style={{ marginBottom: 24 }}>
                {s.features.map(f => (
                  <div key={f} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0',
                    borderBottom: '1px solid var(--border)',
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--text-2)', letterSpacing: '0.05em',
                  }}>
                    <span style={{ color: s.accent, fontSize: 8 }}>●</span>
                    {f}
                  </div>
                ))}
              </div>

              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800, fontSize: 18,
                color: s.accent,
              }}>
                {s.price}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
