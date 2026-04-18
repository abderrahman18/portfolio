import { useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Projects from './components/Projects'
import About from './components/About'
import Services from './components/Services'
import Process from './components/Process'
import NowPage from './components/NowPage'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  useEffect(() => {
    if (!isTouchDevice) {
      document.documentElement.style.cursor = 'none'
    }
  }, [isTouchDevice])

  return (
    <>
      {/* FIX: use --z-progress from centralised scale */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 2,
          background: 'var(--accent)',
          transformOrigin: '0%',
          scaleX,
          zIndex: 'var(--z-progress)',
        }}
      />

      {!isTouchDevice && <Cursor />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Nav />
        <main>
          <Hero />
          <Projects />
          <About />
          <Services />
          <Process />
          <NowPage />
          <Contact />
        </main>
        <Footer />
      </motion.div>
    </>
  )
}
