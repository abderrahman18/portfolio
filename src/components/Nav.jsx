import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const links = ['Work', 'About', 'Services', 'Now', 'Contact']

export default function Nav() {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  // FIX: track which section is currently in view
  const [activeSection, setActive]    = useState('')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // FIX: IntersectionObserver to highlight active nav link
  useEffect(() => {
    const sectionIds = links.map(l => l.toLowerCase())
    const observers = []

    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 'var(--z-nav)',
          padding: '18px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(5,5,5,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22, fontWeight: 800,
            letterSpacing: '-0.05em', color: 'var(--text)',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          A<span style={{ color: 'var(--accent)' }}>.</span>
        </button>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }} className="desktop-nav">
          {links.map(link => {
            const isActive = activeSection === link.toLowerCase()
            return (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  // FIX: accent color when section is active
                  color: isActive ? 'var(--accent)' : 'var(--text-2)',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s',
                  background: 'none', border: 'none', cursor: 'pointer',
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = isActive ? 'var(--accent)' : 'var(--text-2)'}
              >
                {link}
                {/* Active dot indicator */}
                {isActive && (
                  <motion.span
                    layoutId="nav-dot"
                    style={{
                      position: 'absolute', bottom: -6, left: '50%',
                      transform: 'translateX(-50%)',
                      width: 3, height: 3, borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'block',
                    }}
                  />
                )}
              </button>
            )
          })}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: '9px 20px', fontSize: 11 }}
          >
            Resume ↗
          </a>
        </div>

        {/* FIX: Animated hamburger — morphs to X when open */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-menu-btn"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: 5, padding: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            width: 30, height: 24, justifyContent: 'center',
          }}
        >
          <span style={{
            display: 'block', width: 22, height: 1.5,
            background: 'var(--text)',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            transform: mobileOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
          }} />
          <span style={{
            display: 'block', width: 22, height: 1.5,
            background: 'var(--text)',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            opacity: mobileOpen ? 0 : 1,
            transform: mobileOpen ? 'scaleX(0)' : 'none',
          }} />
          <span style={{
            display: 'block', width: 22, height: 1.5,
            background: 'var(--text)',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            transform: mobileOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
          }} />
        </button>
      </motion.nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', inset: 0, top: 0,
              background: 'var(--bg)',
              zIndex: 'calc(var(--z-nav) - 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 28,
            }}
          >
            {links.map((link, i) => (
              <motion.button
                key={link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => scrollTo(link)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 44, fontWeight: 800,
                  color: activeSection === link.toLowerCase() ? 'var(--accent)' : 'var(--text)',
                  letterSpacing: '-0.03em',
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                {link}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          nav { padding: 18px 20px !important; }
        }
        @media (min-width: 768px) {
          nav { padding: 18px 40px !important; }
        }
      `}</style>
    </>
  )
}
