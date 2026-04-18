import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone]         = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => { setDone(true); onComplete?.() }, 400)
          return 100
        }
        return p + Math.random() * 12
      })
    }, 80)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: [0.87, 0, 0.13, 1] }}
          style={{
            position: 'fixed', inset: 0,
            background: 'var(--bg)',
            // FIX: use centralised z-index variable
            zIndex: 'var(--z-loading)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 64,
              fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: '-0.05em',
            }}
          >
            A<span style={{ color: 'var(--accent)' }}>.</span>
          </motion.div>

          {/* Progress bar */}
          <div style={{ width: 200, height: 1, background: 'var(--border)' }}>
            <motion.div
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: 'linear' }}
              style={{ height: '100%', background: 'var(--accent)', transformOrigin: 'left' }}
            />
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'var(--text-3)',
          }}>
            {Math.min(Math.round(progress), 100)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
