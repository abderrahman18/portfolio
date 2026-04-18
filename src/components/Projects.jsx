import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

const projects = [
  {
    id: 1,
    title: 'AgroConnect',
    category: 'Full-Stack Platform · Web + Mobile',
    description: 'An end-to-end agricultural marketplace connecting Algerian farmers directly with buyers. Built a full platform — React web dashboard, React Native mobile app, and Node.js/Express REST API with real-time order tracking.',
    longDescription: `AgroConnect solves a real problem: Algerian farmers had no direct channel to reach buyers, losing margin to middlemen. I designed and built the entire system from scratch — a React web dashboard for buyers and admin, a React Native mobile app for farmers to list produce and track orders, and a Node.js + Express API backed by PostgreSQL. Real-time order status updates via WebSockets. The mobile app covers both iOS and Android from a single codebase.`,
    tags: ['React', 'React Native', 'Node.js', 'PostgreSQL', 'WebSockets', 'Express'],
    year: '2024',
    type: 'Full-Stack · Web & Mobile',
    accent: '#e8ff47',
    gradient: 'linear-gradient(135deg, #1a1f0a 0%, #0d1a0d 100%)',
    highlight: 'Web + Mobile + API',
    github: 'https://github.com',
    live: null,
  },
  {
    id: 2,
    title: 'Etheris AI',
    category: 'AI · NLP · Text Analysis',
    description: 'An AI-powered text analysis platform that classifies, categorizes, and extracts insights from unstructured text. Built with a React frontend and a Python ML backend using NLP models for multi-label classification.',
    longDescription: `Etheris AI takes raw, unstructured text and surfaces what matters — categories, sentiment, key entities, and summaries. The frontend is React + Framer Motion for a clean analysis UI. The backend is Python + FastAPI, using transformer models (HuggingFace) for text classification. Users upload text or paste directly, and get back structured JSON with categories, confidence scores, and extracted entities. Built for teams that deal with large volumes of support tickets, reviews, or documents.`,
    tags: ['React', 'Python', 'FastAPI', 'NLP', 'HuggingFace', 'Machine Learning'],
    year: '2024',
    type: 'AI / NLP Platform',
    accent: '#47ffe8',
    gradient: 'linear-gradient(135deg, #0a1a1a 0%, #0d1520 100%)',
    highlight: 'AI-Powered',
    github: 'https://github.com',
    live: 'https://etheris.ai',
  },
  {
    id: 3,
    title: 'Quran App',
    category: 'Mobile App · React Native',
    description: 'A full-featured Quran mobile application with audio recitation, bookmarking, search, and translation support across 10+ languages. Clean, distraction-free reading experience with offline support.',
    longDescription: `Built a complete Quran app in React Native for iOS and Android. Features include: audio recitation with multiple reciters, verse-by-verse highlighting synchronized to audio, bookmarking and notes, full-text search across all 6236 ayat, 10+ translations, offline mode (full Quran cached locally), and a clean reading mode with customizable font size and night mode. Special care was taken for Arabic text rendering and right-to-left layout throughout the app.`,
    tags: ['React Native', 'Expo', 'SQLite', 'Audio API', 'RTL', 'AsyncStorage'],
    year: '2023',
    type: 'Mobile Application',
    accent: '#ff6b35',
    gradient: 'linear-gradient(135deg, #1a0f0a 0%, #1a0d0d 100%)',
    highlight: '10+ Languages',
    github: 'https://github.com',
    live: null,
  },
  {
    id: 4,
    title: 'Meteo App',
    category: 'Web App · Weather',
    description: 'A real-time weather application with beautiful data visualizations, 7-day forecasts, hourly breakdowns, and location-based auto-detection. Animated weather conditions and responsive design.',
    longDescription: `A weather app that actually looks good. Built with React and the OpenWeatherMap API. Features: geolocation-based auto-detection, city search with autocomplete, animated weather conditions (rain, snow, clear sky, thunderstorm), 7-day forecast with min/max temperatures, hourly breakdown charts built with Recharts, UV index, humidity, wind speed/direction, and a beautiful glassmorphism UI that adapts its gradient background to current conditions. Fully responsive.`,
    tags: ['React', 'OpenWeatherMap API', 'Recharts', 'Framer Motion', 'Geolocation'],
    year: '2023',
    type: 'Web Application',
    accent: '#c47aff',
    gradient: 'linear-gradient(135deg, #120a1a 0%, #0d0d1a 100%)',
    highlight: 'Real-Time Data',
    github: 'https://github.com',
    live: 'https://meteo.abdou.dev',
  },
  {
    id: 5,
    title: '2048 Game (SDL2)',
    category: 'Systems · C · SDL2',
    description: 'A fully functional 2048 game built in C using the SDL2 graphics library. Smooth tile animations, score tracking, high score persistence, and keyboard + swipe controls. Pure systems-level programming.',
    longDescription: `2048 implemented entirely in C with SDL2 for rendering. This project demonstrates systems-level programming skills — manual memory management, rendering pipeline, game loop with delta time, and animation interpolation written by hand. Features: smooth tile slide and merge animations, score and high score tracking with file persistence, keyboard controls, and a clean dark UI. Compiled and tested on Linux.`,
    tags: ['C', 'SDL2', 'Game Development', 'Systems Programming', 'Linux'],
    year: '2023',
    type: 'Systems / Game Dev',
    accent: '#e8ff47',
    gradient: 'linear-gradient(135deg, #1a1a0a 0%, #141400 100%)',
    highlight: 'Pure C + SDL2',
    github: 'https://github.com',
    live: null,
  },
  {
    id: 6,
    title: 'Portfolio Sites',
    category: 'Web Design · Freelance',
    description: 'A collection of landing pages and portfolio websites built for clients — restaurants, freelancers, small businesses, and creatives. Each one crafted with unique visual identity, SEO, and conversion in mind.',
    longDescription: `Multiple client websites delivered: restaurant landing pages with online reservation systems, personal portfolio sites for designers and photographers, a law firm website with accessibility-first design, a local gym site with class schedule and contact integration, and more. Each project started with understanding the client's business goal, not just their aesthetic preference. Result: pages that look unique and actually generate leads.`,
    tags: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'Vercel', 'SEO'],
    year: '2023–2024',
    type: 'Freelance Web Design',
    accent: '#47ffe8',
    gradient: 'linear-gradient(135deg, #0a1515 0%, #0a150f 100%)',
    highlight: 'Multiple Clients',
    github: null,
    live: null,
  },
]

// FIX: 3D tilt uses Framer Motion values — no more conflict with inView animation
function ProjectCard({ project, onClick, index }) {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8])
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 800, height: '100%' }}
    >
      <motion.div
        onClick={() => onClick(project)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          background: project.gradient,
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 32,
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          rotateY,
          rotateX,
          transformStyle: 'preserve-3d',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        }}
        whileHover={{
          borderColor: `${project.accent}40`,
          boxShadow: `0 20px 60px ${project.accent}15`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: project.accent, letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            {project.category}
          </div>
          <div style={{
            padding: '3px 10px',
            background: `${project.accent}15`,
            border: `1px solid ${project.accent}30`,
            borderRadius: 100,
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: project.accent, letterSpacing: '0.1em',
          }}>
            {project.highlight}
          </div>
        </div>

        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: 12, lineHeight: 1.1,
        }}>
          {project.title}
        </h3>

        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, marginBottom: 24, flexGrow: 1 }}>
          {project.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {project.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              padding: '3px 10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: 100,
              fontFamily: 'var(--font-mono)',
              fontSize: 10, letterSpacing: '0.06em',
              color: 'var(--text-3)',
            }}>
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span style={{
              padding: '3px 10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: 100,
              fontFamily: 'var(--font-mono)',
              fontSize: 10, color: 'var(--text-3)',
            }}>
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        <div style={{
          paddingTop: 20,
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-3)', letterSpacing: '0.1em',
          }}>
            {project.year} · {project.type}
          </span>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            border: `1px solid ${project.accent}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" fill="none" stroke={project.accent} strokeWidth="2" viewBox="0 0 24 24">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// FIX: ESC key handler + focus trap + github/live links
function Modal({ project, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    // Focus the close button immediately for keyboard accessibility
    closeRef.current?.focus()

    // ESC to close
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-modal)',
        background: 'rgba(5,5,5,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 40 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: 48,
          maxWidth: 680,
          width: '100%',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer',
          }}
        >
          ×
        </button>

        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: project.accent, letterSpacing: '0.2em', textTransform: 'uppercase',
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ width: 24, height: 1, background: project.accent, display: 'inline-block' }} />
          Case Study
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
          letterSpacing: '-0.03em', marginBottom: 8,
        }}>
          {project.title}
        </h2>

        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)',
          letterSpacing: '0.1em', marginBottom: 28,
        }}>
          {project.type} · {project.year}
        </div>

        <p style={{ color: 'var(--text-2)', lineHeight: 1.85, marginBottom: 32, fontSize: 15 }}>
          {project.longDescription}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              padding: '5px 14px', background: 'var(--bg-3)',
              border: '1px solid var(--border)', borderRadius: 100,
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)',
              letterSpacing: '0.06em',
            }}>{tag}</span>
          ))}
        </div>

        {/* FIX: github + live links */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              GitHub
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Live Site ↗
            </a>
          )}
          {!project.github && !project.live && (
            <button onClick={onClose} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              Close
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const [selected, setSelected] = useState(null)
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section id="work" className="section">
      <div className="container">
        <div ref={ref} style={{ marginBottom: 64 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="label"
          >
            Selected Work
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}
          >
            <h2 className="display-lg">Real projects.<br />Real outcomes.</h2>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--text-3)', letterSpacing: '0.1em',
            }}>
              {projects.length} projects ↓
            </span>
          </motion.div>
        </div>

        <div className="projects-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
        }}>
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} onClick={setSelected} index={i} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <Modal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .projects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
