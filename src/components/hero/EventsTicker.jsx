import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { events } from '../../data/events'

export default function EventsTicker() {
    const containerRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const tracks = container.querySelectorAll('.ticker-track')
        const tween = gsap.to(tracks, {
            x: '-50%',
            duration: 35,
            ease: 'none',
            repeat: -1,
        })
        const handleEnter = () => gsap.to(tween, { timeScale: 0, duration: 0.5 })
        const handleLeave = () => gsap.to(tween, { timeScale: 1, duration: 0.5 })
        container.addEventListener('mouseenter', handleEnter)
        container.addEventListener('mouseleave', handleLeave)
        return () => {
            tween.kill()
            container.removeEventListener('mouseenter', handleEnter)
            container.removeEventListener('mouseleave', handleLeave)
        }
    }, [])

    const tickerItems = events.map(e => ({
        name: e.name,
        status: e.status,
    }))

    const StatusDot = ({ status }) => {
        const color = status === 'live' ? '#22c55e' : status === 'upcoming' ? '#fbbf24' : 'rgba(247,247,251,0.30)'
        return <span className="inline-block w-1.5 h-1.5 rounded-full mr-2" style={{ background: color }} />
    }

    return (
        <div
            ref={containerRef}
            className="w-full border-y border-[rgba(247,247,251,0.06)] overflow-hidden"
            style={{ height: 44 }}
        >
            <div className="ticker-track" style={{ display: 'inline-flex', alignItems: 'center', height: '100%' }}>
                {[...tickerItems, ...tickerItems].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 whitespace-nowrap">
                        <div className="flex items-center">
                            <StatusDot status={item.status} />
                            <span className="font-sans text-[0.68rem] text-[rgba(247,247,251,0.40)]">{item.name}</span>
                        </div>
                        <span className="text-[rgba(247,247,251,0.10)]">·</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
