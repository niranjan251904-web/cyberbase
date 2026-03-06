import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
    const dotRef = useRef(null)
    const trailRef = useRef(null)
    const pos = useRef({ x: 0, y: 0 })
    const isHovering = useRef(false)

    useEffect(() => {
        const dot = dotRef.current
        const trail = trailRef.current
        if (!dot || !trail) return

        const onMove = (e) => {
            pos.current = { x: e.clientX, y: e.clientY }

            // Dot follows instantly
            gsap.set(dot, { x: e.clientX, y: e.clientY })

            // Trail follows slower for a trailing glow effect
            gsap.to(trail, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.8,
                ease: 'power2.out',
            })
        }

        const onOver = (e) => {
            const target = e.target.closest('a, button, [role="button"], input, textarea, select')
            if (target && !isHovering.current) {
                isHovering.current = true
                gsap.to(dot, { scale: 1.8, duration: 0.3, ease: 'back.out(2)' })
                gsap.to(trail, { scale: 2.5, opacity: 0.2, duration: 0.5, ease: 'power2.out' })
            } else if (!target && isHovering.current) {
                isHovering.current = false
                gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power2.out' })
                gsap.to(trail, { scale: 1, opacity: 0.08, duration: 0.4, ease: 'power2.out' })
            }
        }

        const onDown = () => {
            gsap.to(dot, { scale: 0.5, duration: 0.1 })
            gsap.to(trail, { scale: 0.6, duration: 0.15 })
        }

        const onUp = () => {
            gsap.to(dot, { scale: isHovering.current ? 1.8 : 1, duration: 0.3, ease: 'back.out(2)' })
            gsap.to(trail, { scale: isHovering.current ? 2.5 : 1, duration: 0.3, ease: 'power2.out' })
        }

        window.addEventListener('mousemove', onMove)
        document.addEventListener('mouseover', onOver)
        window.addEventListener('mousedown', onDown)
        window.addEventListener('mouseup', onUp)

        return () => {
            window.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseover', onOver)
            window.removeEventListener('mousedown', onDown)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    // Hide on touch devices
    const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window
    if (isTouch) return null

    return (
        <>
            <div ref={trailRef} className="cursor-trail" />
            <div ref={dotRef} className="cursor-dot" />
        </>
    )
}
