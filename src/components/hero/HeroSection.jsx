import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import HeroCanvas from './HeroCanvas'
import EventsTicker from './EventsTicker'
import { useCounter } from '../../hooks/useCounter'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import GlassCard from '../ui/GlassCard'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { events } from '../../data/events'
import { leaderboard } from '../../data/leaderboard'
import { feed } from '../../data/feed'

function StatItem({ value, label }) {
    const ref = useCounter(value)
    return (
        <div className="text-center flex-1">
            <div ref={ref} className="font-display text-[clamp(2rem,4vw,3.5rem)] text-white font-semibold">0</div>
            <div className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mt-1">{label}</div>
        </div>
    )
}

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function HeroSection() {
    const sectionRef = useScrollReveal()
    const navigate = useNavigate()

    // Section line draw
    useEffect(() => {
        gsap.fromTo('.section-line-hero',
            { scaleX: 0, transformOrigin: 'left center' },
            {
                scaleX: 1, duration: 0.8, ease: 'power3.inOut',
                scrollTrigger: { trigger: '.section-line-hero', start: 'top 88%' },
            }
        )
    }, [])

    return (
        <div>
            {/* Hero — Scroll-driven frame animation */}
            <HeroCanvas />

            {/* Ticker */}
            <EventsTicker />

            {/* Stats */}
            <section ref={sectionRef} className="max-w-7xl mx-auto px-6 py-20">
                <div data-reveal className="flex items-center divide-x divide-[rgba(247,247,251,0.06)]">
                    <StatItem value={500} label="Members" />
                    <StatItem value={48} label="Events" />
                    <StatItem value={120} label="Challenges" />
                    <StatItem value={32} label="Teams" />
                </div>
            </section>

            {/* Preview Cards */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                <div className="section-line-hero section-line mb-4" />
                <motion.div
                    className="grid md:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    {/* Latest Events */}
                    <motion.div variants={itemVariants}>
                        <GlassCard>
                            <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-4">Latest Events</h3>
                            {events.filter(e => e.status === 'live').slice(0, 2).map(e => (
                                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-[rgba(247,247,251,0.04)] last:border-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                                    <span className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.60)]">{e.name}</span>
                                </div>
                            ))}
                            <button onClick={() => navigate('/events')} className="font-sans text-[0.68rem] text-violet mt-3 hover:underline">View all →</button>
                        </GlassCard>
                    </motion.div>

                    {/* Leaderboard Top 3 */}
                    <motion.div variants={itemVariants}>
                        <GlassCard>
                            <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-4">Leaderboard Top 3</h3>
                            {leaderboard.slice(0, 3).map(m => (
                                <div key={m.rank} className="flex items-center gap-3 py-2 border-b border-[rgba(247,247,251,0.04)] last:border-0">
                                    <span className="font-display text-lg text-[rgba(247,247,251,0.15)] w-6">{m.rank}</span>
                                    <span className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.60)]">{m.name}</span>
                                    <span className="font-display text-sm text-violet ml-auto">{m.pts.toLocaleString()}</span>
                                </div>
                            ))}
                            <button onClick={() => navigate('/leaderboard')} className="font-sans text-[0.68rem] text-violet mt-3 hover:underline">View all →</button>
                        </GlassCard>
                    </motion.div>

                    {/* Recent Posts */}
                    <motion.div variants={itemVariants}>
                        <GlassCard>
                            <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-4">Recent Posts</h3>
                            {feed.slice(0, 2).map(p => (
                                <div key={p.id} className="py-2 border-b border-[rgba(247,247,251,0.04)] last:border-0">
                                    <span className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.60)] line-clamp-1">{p.title}</span>
                                    <span className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.25)] mt-0.5 block">{p.author.name} · {p.time}</span>
                                </div>
                            ))}
                            <button onClick={() => navigate('/feed')} className="font-sans text-[0.68rem] text-violet mt-3 hover:underline">View all →</button>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    )
}
