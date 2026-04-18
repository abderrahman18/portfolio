import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const nowItems = [
  {
    category: 'Building',
    content: 'AgroConnect v2 — adding real-time chat between buyers and farmers, and a mobile-first redesign of the farmer dashboard.',
    accent: 'var(--accent)',
  },
  {
    category: 'Learning',
    content: 'Going deep on WebGPU and compute shaders for the next generation of browser-based visualizations. Also studying distributed systems fundamentals.',
    accent: 'var(--accent-3)',
  },
  {
    category: 'Reading',
    content: 'Shape Up by Basecamp (for the second time). Every time I re-read it something new clicks. Also going through SICP slowly.',
    accent: 'var(--accent-2)',
  },
  {
    category: 'Thinking about',
    content: 'How to build AI-powered tools that are actually useful for Arabic-speaking communities online. NLP models are still severely underrepresented in Arabic.',
    accent: '#c47aff',
  },
]

export default function NowPage() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="now" className="section" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <div ref={ref} style={{ maxWidth: 800, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="label"
          >
            Now
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 16 }}
          >
            <h2 className="display-lg">
              What I'm doing{' '}
              <span style={{ color: 'var(--accent)' }}>right now</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--text-3)', letterSpacing: '0.1em',
              marginBottom: 56,
            }}
          >
            Updated April 2026 · Algiers, Algeria · Inspired by{' '}
            <a
              href="https://nownownow.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-2)', textDecoration: 'underline', textUnderlineOffset: 3 }}
            >
              nownownow.com
            </a>
          </motion.p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {nowItems.map((item, i) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: 32,
                  padding: '28px 0',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'start',
                }}
                className="now-item"
              >
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: item.accent, letterSpacing: '0.15em',
                  textTransform: 'uppercase', paddingTop: 3,
                }}>
                  {item.category}
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.75 }}>
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .now-item {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </section>
  )
}
