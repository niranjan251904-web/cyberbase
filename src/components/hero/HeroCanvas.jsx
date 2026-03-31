import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const FRAME_COUNT = 270
const FRAME_PATH = '/hero-frames/ezgif-frame-'

const SECTIONS = [
    {
        title: 'AI × CYBER',
        subtitle: 'SECURITY',
        description: 'The digital headquarters for AI × Cybersecurity professionals.',
        position: 'right',
        enter: { x: 80, y: 0 },
        exit: { x: 40, y: -20 },
    },
    {
        title: 'BUILD',
        subtitle: 'TOGETHER',
        description: 'Form elite teams. Tackle real-world challenges. Ship solutions.',
        position: 'left',
        enter: { x: -80, y: 0 },
        exit: { x: -40, y: -20 },
    },
    {
        title: 'COMPETE',
        subtitle: '& LEARN',
        description: 'CTFs, hackathons, workshops — sharpen your edge every week.',
        position: 'center',
        enter: { x: 0, y: 60 },
        exit: { x: 0, y: -30 },
    },
    {
        title: 'CLIMB',
        subtitle: 'THE RANKS',
        description: 'Dynamic leaderboard. Earn points. Prove your expertise.',
        position: 'right',
        enter: { x: 60, y: -40 },
        exit: { x: 30, y: 20 },
    },
    {
        title: 'JOIN',
        subtitle: 'THE MISSION',
        description: 'Connect with 500+ members building the future of security.',
        position: 'left',
        enter: { x: -60, y: 40 },
        exit: { x: -30, y: -20 },
    },
]

const positionStyles = {
    right: 'items-end sm:items-end justify-end text-right pb-24 sm:pb-32 pr-6 md:pr-16',
    left: 'items-start justify-end text-left pb-24 sm:pb-32 pl-6 md:pl-16',
    center: 'items-center justify-center text-center',
}

function getFrameSrc(index) {
    const num = String(Math.min(Math.max(index, 1), FRAME_COUNT)).padStart(3, '0')
    return `${FRAME_PATH}${num}.jpg`
}

function getSectionIndex(frame) {
    // 270 frames total, 5 sections -> 54 frames per section
    return Math.min(Math.floor(frame / 54), SECTIONS.length - 1)
}

function SectionOverlay({ section, index, activeIndex }) {
    const posClass = positionStyles[section.position]
    const dotAlign = section.position === 'right' ? 'justify-end' : section.position === 'center' ? 'justify-center' : 'justify-start'

    return (
        <motion.div
            className={`absolute inset-0 flex flex-col ${posClass}`}
            initial={{ opacity: 0, x: section.enter.x, y: section.enter.y }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: section.exit.x, y: section.exit.y }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="max-w-[520px]">
                <h1 className="mb-2">
                    <span
                        className="block text-[clamp(2.5rem,8vw,7rem)] text-white leading-[0.9] font-light"
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    >
                        {section.title}
                    </span>
                    <span
                        className="block text-[clamp(2.5rem,8vw,7rem)] text-white leading-[0.9] italic font-light"
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    >
                        {section.subtitle}
                    </span>
                </h1>
                <p
                    className="text-[0.75rem] sm:text-[0.9rem] text-[rgba(247,247,251,0.55)] max-w-[420px] mt-4 leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                    {section.description}
                </p>
                <div className={`flex gap-2 mt-6 ${dotAlign}`}>
                    {SECTIONS.map((_, i) => (
                        <div
                            key={i}
                            className="h-[2px] rounded-full transition-all duration-500"
                            style={{
                                width: i === index ? 32 : 8,
                                background: i === index
                                    ? 'rgba(247,247,251,0.8)'
                                    : 'rgba(247,247,251,0.15)',
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

export default function HeroCanvas() {
    const containerRef = useRef(null)
    const videoRef = useRef(null)
    const [loaded, setLoaded] = useState(false)
    const [activeSection, setActiveSection] = useState(0)
    const [scrollMult, setScrollMult] = useState(2.5)

    useEffect(() => {
        setScrollMult(window.innerWidth < 768 ? 1.2 : 2.5)

        const video = videoRef.current
        if (!video) return

        let cleanupFn = null

        const initScrollTrigger = () => {
            setLoaded(true)
            
            const obj = { frame: 0 }
            const tween = gsap.to(obj, {
                frame: FRAME_COUNT - 1,
                snap: 'frame',
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.5,
                },
                onUpdate: () => {
                    const frameIndex = Math.round(obj.frame)
                    
                    // Scrub the video hardware directly based on our progress ratio
                    if (video.duration) {
                        video.currentTime = (frameIndex / (FRAME_COUNT - 1)) * video.duration
                    }
                    
                    setActiveSection(getSectionIndex(frameIndex))
                },
            })

            cleanupFn = () => {
                if (tween.scrollTrigger) tween.scrollTrigger.kill()
                tween.kill()
            }
        }

        // Wait until we have the video metadata (duration, width, height) to begin
        if (video.readyState >= 1) {
            initScrollTrigger()
        } else {
            video.addEventListener('loadedmetadata', initScrollTrigger)
        }

        return () => {
            if (cleanupFn) cleanupFn()
            if (video) video.removeEventListener('loadedmetadata', initScrollTrigger)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="relative"
            // Multiply height so the user physically scrolls 4-5 screen heights
            style={{ height: `${FRAME_COUNT * scrollMult}vh` }}
        >
            <div className="sticky top-0 w-full h-[100dvh] overflow-hidden">
                <video
                    ref={videoRef}
                    src="/original.mp4"
                    preload="auto"
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ display: loaded ? 'block' : 'none' }}
                />

                {loaded && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,16,0.65)] via-[rgba(8,8,16,0.1)] to-[rgba(8,8,16,0.25)]" />
                )}

                {loaded && (
                    <AnimatePresence mode="wait">
                        <SectionOverlay
                            key={activeSection}
                            section={SECTIONS[activeSection]}
                            index={activeSection}
                            activeIndex={activeSection}
                        />
                    </AnimatePresence>
                )}

                {!loaded && (
                    <div className="flex items-center justify-center w-full h-full bg-[#0a0a0f]">
                        <div className="font-sans text-[0.7rem] text-[rgba(247,247,251,0.30)] tracking-wider uppercase animate-pulse">
                            Loading video player...
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

