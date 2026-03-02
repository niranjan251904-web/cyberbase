import { useEffect, useRef } from 'react'

export default function CustomCursor() {
    const dotRef = useRef(null)
    const ringRef = useRef(null)

    useEffect(() => {
        const dot = dotRef.current
        const ring = ringRef.current
        if (!dot || !ring) return

        const onMove = (e) => {
            dot.style.left = e.clientX + 'px'
            dot.style.top = e.clientY + 'px'
            ring.style.left = e.clientX + 'px'
            ring.style.top = e.clientY + 'px'
        }

        const onOver = (e) => {
            const target = e.target.closest('a, button, [role="button"], input, textarea, select')
            if (target) ring.classList.add('expanded')
            else ring.classList.remove('expanded')
        }

        window.addEventListener('mousemove', onMove)
        document.addEventListener('mouseover', onOver)
        return () => {
            window.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseover', onOver)
        }
    }, [])

    // Hide on touch devices
    const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window
    if (isTouch) return null

    return (
        <>
            <div ref={dotRef} className="cursor-dot" />
            <div ref={ringRef} className="cursor-ring" />
        </>
    )
}
