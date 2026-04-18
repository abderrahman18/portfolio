import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)
  const pos     = useRef({ x: 0, y: 0 })
  const ring    = useRef({ x: 0, y: 0 })
  // FIX: track scale as a ref so we always set the full transform string cleanly
  const scale   = useRef(1)

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }

    let raf
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        // FIX: always build complete transform string from ref — no string concatenation
        ringRef.current.style.transform =
          `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px) scale(${scale.current})`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    // FIX: event delegation on document — catches ALL interactive elements,
    // including dynamically rendered ones (modal buttons, project cards, etc.)
    const onMouseOver = (e) => {
      const target = e.target.closest('a, button, [data-cursor]')
      if (!target) return
      scale.current = 2
      if (dotRef.current) dotRef.current.style.opacity = '0'
    }

    const onMouseOut = (e) => {
      const target = e.target.closest('a, button, [data-cursor]')
      if (!target) return
      scale.current = 1
      if (dotRef.current) dotRef.current.style.opacity = '1'
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 8, height: 8,
        borderRadius: '50%',
        background: 'var(--accent)',
        pointerEvents: 'none',
        zIndex: 'var(--z-cursor-dot)',
        transition: 'opacity 0.2s',
        mixBlendMode: 'difference',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 40, height: 40,
        borderRadius: '50%',
        border: '1px solid rgba(232,255,71,0.5)',
        pointerEvents: 'none',
        zIndex: 'var(--z-cursor-ring)',
        transition: 'scale 0.15s var(--ease-out)',
      }} />
    </>
  )
}
