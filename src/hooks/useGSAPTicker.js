import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useGSAPTicker(selector, options = {}) {
    const ref = useRef(null)
    useEffect(() => {
        const container = ref.current
        if (!container) return
        const track = container.querySelector(selector || '.ticker-track')
        if (!track) return
        const clone = track.cloneNode(true)
        container.appendChild(clone)
        const tween = gsap.to(container.querySelectorAll(selector || '.ticker-track'), {
            x: '-100%',
            duration: options.duration || 35,
            ease: 'none',
            repeat: -1,
        })
        return () => tween.kill()
    }, [])
    return ref
}
