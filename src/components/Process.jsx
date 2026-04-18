import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    num: '01',
    title: 'Discover',
    desc: 'Deep dive into your goals, users, and competitive landscape. Every great project starts with the right questions.',
    duration: '3–5 days',
  },
  {
    num: '02',
    title: 'Design',
    desc: 'Wireframes, moodboards, and high-fidelity prototypes. We iterate fast until every interaction feels inevitable.',
    duration: '1–2 weeks',
  },
  {
    num: '03',
    title: 'Build',
    desc: 'Production-grade code with daily updates. Clean architecture, performance-first, fully tested.',
    duration: '2–6 weeks',
  },
  {
    num: '04',
    title: 'Launch',
    desc: 'Deploy with CI/CD, monitor metrics, and crush any last-mile issues before going live.',
    duration: '2–3 days',
  },
  {
    num: '05',
    title: 'Grow',
    desc: 'Post-launch support, A/B testing, and iterative improvements based on real user data.',
    duration: 'Ongoing',
  },
]

export default function Process() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <div ref={ref} style={{ marginBottom: 64 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="label"
          >
            How I Work
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="display-lg"
            style={{ maxWidth: 480 }}
          >
            A process built for clarity
          </motion.h2>
        </div>

        <div style={{ position: 'relative' }}>
          {/* FIX: vertical line animates scaleY from 0→1 when section enters view */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', left: 55, top: 0, bottom: 0,
              width: 1, background: 'var(--border)',
              transformOrigin: 'top',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'flex', gap: 40,
                  padding: '32px 0',
                }}
              >
                {/* Number bubble */}
                <div style={{
                  width: 40, height: 40,
                  borderRadius: '50%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--accent)', letterSpacing: '0.1em',
                  flexShrink: 0,
                  position: 'relative', zIndex: 1,
                  marginLeft: 36,
                }}>
                  {step.num}
                </div>

                <div style={{ flex: 1, paddingTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 24, fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}>
                      {step.title}
                    </h3>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'var(--text-3)', letterSpacing: '0.1em',
                    }}>
                      {step.duration}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, maxWidth: 560 }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
