import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useCounter(targetValue, options = {}) {
    const ref = useRef(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.textContent = '0'
        const anim = gsap.to(el, {
            textContent: targetValue,
            duration: options.duration || 1.8,
            ease: 'power1.inOut',
            snap: { textContent: 1 },
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true,
            },
        })
        return () => {
            if (anim.scrollTrigger) anim.scrollTrigger.kill()
        }
    }, [targetValue])
    return ref
}
