import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

const FRAME_COUNT = 98
const FRAME_PATH = '/hero-frames/ezgif-frame-'

// position: where text appears, align: text alignment, enter/exit: animation direction
const SECTIONS = [
    {
        title: 'CYBER',
        subtitle: 'BASE',
        description: 'The digital headquarters for AI × Cybersecurity professionals.',
        position: 'right',   // bottom-right
        enter: { x: 80, y: 0 },
        exit: { x: 40, y: -20 },
    },
    {
        title: 'BUILD',
        subtitle: 'TOGETHER',
        description: 'Form elite teams. Tackle real-world challenges. Ship solutions.',
        position: 'left',    // bottom-left
        enter: { x: -80, y: 0 },
        exit: { x: -40, y: -20 },
    },
    {
        title: 'COMPETE',
        subtitle: '& LEARN',
        description: 'CTFs, hackathons, workshops — sharpen your edge every week.',
        position: 'center',  // center
        enter: { x: 0, y: 60 },
        exit: { x: 0, y: -30 },
    },
    {
        title: 'CLIMB',
        subtitle: 'THE RANKS',
        description: 'Dynamic leaderboard. Earn points. Prove your expertise.',
        position: 'right',   // top-right area
        enter: { x: 60, y: -40 },
        exit: { x: 30, y: 20 },
    },
    {
        title: 'JOIN',
        subtitle: 'THE MISSION',
        description: 'Connect with 500+ members building the future of security.',
        position: 'left',    // bottom-left
        enter: { x: -60, y: 40 },
        exit: { x: -30, y: -20 },
    },
]

// Position styles for each layout
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
    return Math.min(Math.floor(frame / 22), SECTIONS.length - 1)
}

// Self-contained overlay — bakes in its own position & animation so exit works correctly
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
                        className="block text-[clamp(3rem,8vw,7rem)] text-white leading-[0.9] font-light"
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    >
                        {section.title}
                    </span>
                    <span
                        className="block text-[clamp(3rem,8vw,7rem)] text-white leading-[0.9] italic font-light"
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    >
                        {section.subtitle}
                    </span>
                </h1>
                <p
                    className="text-[0.8rem] sm:text-[0.9rem] text-[rgba(247,247,251,0.55)] max-w-[420px] mt-4 leading-relaxed"
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
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const imagesRef = useRef([])
    const currentFrameRef = useRef(0)
    const [loaded, setLoaded] = useState(false)
    const [activeSection, setActiveSection] = useState(0)

    useEffect(() => {
        const images = []
        let loadedCount = 0

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image()
            img.src = getFrameSrc(i)
            img.onload = () => {
                loadedCount++
                if (loadedCount === FRAME_COUNT) {
                    setLoaded(true)
                }
            }
            images.push(img)
        }
        imagesRef.current = images
    }, [])

    useEffect(() => {
        if (!loaded) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        function resizeCanvas() {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            drawFrame(currentFrameRef.current)
        }

        function drawFrame(index) {
            const img = imagesRef.current[index]
            if (!img) return

            const cw = canvas.width
            const ch = canvas.height
            const iw = img.naturalWidth
            const ih = img.naturalHeight

            const scale = Math.max(cw / iw, ch / ih)
            const dw = iw * scale
            const dh = ih * scale
            const dx = (cw - dw) / 2
            const dy = (ch - dh) / 2

            ctx.clearRect(0, 0, cw, ch)
            ctx.drawImage(img, dx, dy, dw, dh)
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

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
                if (frameIndex !== currentFrameRef.current) {
                    currentFrameRef.current = frameIndex
                    drawFrame(frameIndex)
                    setActiveSection(getSectionIndex(frameIndex))
                }
            },
        })

        drawFrame(0)

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            if (tween.scrollTrigger) tween.scrollTrigger.kill()
            tween.kill()
        }
    }, [loaded])

    return (
        <div
            ref={containerRef}
            className="relative"
            style={{ height: `${FRAME_COUNT * 6}vh` }}
        >
            <div className="sticky top-0 w-full h-screen overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ display: loaded ? 'block' : 'none' }}
                />

                {/* Dark overlay */}
                {loaded && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,16,0.65)] via-[rgba(8,8,16,0.1)] to-[rgba(8,8,16,0.25)]" />
                )}

                {/* Text overlays — each section is self-contained */}
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
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="font-sans text-[0.7rem] text-[rgba(247,247,251,0.30)] tracking-wider uppercase animate-pulse">
                            Loading frames...
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
