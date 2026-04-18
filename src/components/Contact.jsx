import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── IMPORTANT: Replace with your real Formspree form ID ─────────────────────
// 1. Go to https://formspree.io → create a free account → New Form
// 2. Copy your form ID (looks like: xpwzgkrd)
// 3. Replace the value below:
const FORMSPREE_ID = 'YOUR_FORM_ID' // <-- replace this before deploying

// If you prefer EmailJS instead:
// npm install @emailjs/browser
// import emailjs from '@emailjs/browser'
// emailjs.send('SERVICE_ID', 'TEMPLATE_ID', form, 'PUBLIC_KEY')
// ─────────────────────────────────────────────────────────────────────────────

export default function Contact() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error | not_configured
  const [form, setForm]     = useState({ name: '', email: '', message: '', budget: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // FIX: guard against the placeholder being live in production
    if (FORMSPREE_ID === 'YOUR_FORM_ID') {
      setStatus('not_configured')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.3s',
    resize: 'none',
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80, alignItems: 'start',
        }} className="contact-grid">

          {/* Left */}
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="label"
            >
              Get In Touch
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="display-lg"
              style={{ marginBottom: 24 }}
            >
              Have a project?<br />
              Let's{' '}
              <span style={{ color: 'var(--accent)' }}>make it real</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.8, marginBottom: 48 }}
            >
              Tell me what you're building. I'll give you an honest assessment,
              a rough timeline, and a flat rate. No hourly surprises.
            </motion.p>

            {[
              { label: 'Email',        value: 'abderrahman.rahim18@email.com',     href: 'mailto:abderrahman.rahim18@email.com', note: 'Replies within 24h' },
              { label: 'Location',     value: 'Algiers, Algeria',    href: null,                     note: 'Remote worldwide' },
              { label: 'Availability', value: 'Open to projects',    href: null,                     note: 'Starting from May 2026' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{
                  display: 'flex', flexDirection: 'column',
                  padding: '18px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--text-3)', letterSpacing: '0.15em', textTransform: 'uppercase',
                  }}>{item.label}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--accent)', letterSpacing: '0.08em',
                  }}>{item.note}</span>
                </div>
                {item.href ? (
                  <a href={item.href} style={{ color: 'var(--text)', fontSize: 15, marginTop: 4 }}>
                    {item.value}
                  </a>
                ) : (
                  <div style={{ color: 'var(--text)', fontSize: 15, marginTop: 4 }}>{item.value}</div>
                )}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap' }}
            >
              {[
                { label: 'GitHub',   href: 'https://github.com' },
                { label: 'LinkedIn', href: 'https://linkedin.com' },
                { label: 'Twitter',  href: 'https://twitter.com' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '7px 16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 100,
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--text-2)', letterSpacing: '0.05em',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--text-2)' }}
                >
                  {s.label}
                </a>
              ))}
            </motion.div>
          </div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 24, padding: 40,
            }}
          >
            {status === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(232,255,71,0.1)',
                  border: '1px solid rgba(232,255,71,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: 24,
                }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
                  Message sent!
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7 }}>
                  I'll review your project and get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  Start a conversation
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)',
                      letterSpacing: '0.1em', display: 'block', marginBottom: 8, textTransform: 'uppercase',
                    }}>Name</label>
                    <input
                      style={inputStyle}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      required
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                  <div>
                    <label style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)',
                      letterSpacing: '0.1em', display: 'block', marginBottom: 8, textTransform: 'uppercase',
                    }}>Email</label>
                    <input
                      type="email"
                      style={inputStyle}
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)',
                    letterSpacing: '0.1em', display: 'block', marginBottom: 8, textTransform: 'uppercase',
                  }}>Budget</label>
                  <select
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="">Select budget range...</option>
                    <option>Under $500</option>
                    <option>$500 – $2,000</option>
                    <option>$2,000 – $5,000</option>
                    <option>$5,000 – $10,000</option>
                    <option>$10,000+</option>
                    <option>Let's discuss</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)',
                    letterSpacing: '0.1em', display: 'block', marginBottom: 8, textTransform: 'uppercase',
                  }}>Tell me about your project</label>
                  <textarea
                    style={{ ...inputStyle, height: 130 }}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="What are you building? Who is it for? What's the timeline?"
                    required
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                {/* FIX: distinct error states — not_configured vs network error */}
                {status === 'not_configured' && (
                  <p style={{ color: '#e8ff47', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}>
                    Form not configured yet. Email me directly at{' '}
                    <a href="mailto:abdou@email.com" style={{ textDecoration: 'underline' }}>abdou@email.com</a>
                  </p>
                )}
                {status === 'error' && (
                  <p style={{ color: '#ff4444', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    Something went wrong. Please email me directly at abdou@email.com
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={status === 'sending'}
                  style={{ marginTop: 4, width: '100%', justifyContent: 'center', opacity: status === 'sending' ? 0.7 : 1 }}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                  {status !== 'sending' && (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  )
}
