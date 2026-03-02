import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(options = {}) {
    const ref = useRef(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const targets = el.querySelectorAll('[data-reveal]')
        const animations = []
        targets.forEach((target, i) => {
            const anim = gsap.fromTo(target,
                { opacity: 0, y: 28 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: i * 0.08,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: target,
                        start: 'top 88%',
                        toggleActions: 'play none none none',
                    },
                }
            )
            animations.push(anim)
        })
        return () => {
            animations.forEach(a => a.scrollTrigger && a.scrollTrigger.kill())
        }
    }, [])
    return ref
}
