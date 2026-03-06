import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { leaderboard as fallbackLeaderboard } from '../data/leaderboard'
import { getCollection } from '../services/firestoreService'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import FilterTabs from '../components/ui/FilterTabs'
import { useScrollReveal } from '../hooks/useScrollReveal'

gsap.registerPlugin(ScrollTrigger)

const timeTabs = [
    { id: 'all', label: 'All Time' },
    { id: 'month', label: 'This Month' },
    { id: 'week', label: 'This Week' },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function ScoreBar({ score, maxScore }) {
    const barRef = useRef(null)
    const pct = Math.round((score / maxScore) * 100)

    useEffect(() => {
        const el = barRef.current
        if (!el) return
        const anim = gsap.fromTo(el,
            { width: '0%' },
            {
                width: pct + '%',
                duration: 1.2,
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            }
        )
        return () => { if (anim.scrollTrigger) anim.scrollTrigger.kill() }
    }, [pct])

    return (
        <div className="score-bar-track">
            <div ref={barRef} className="score-bar-fill" style={{ width: 0 }} />
        </div>
    )
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState(fallbackLeaderboard)
    const [timeFilter, setTimeFilter] = useState('all')
    const [search, setSearch] = useState('')
    const sectionRef = useScrollReveal()

    useEffect(() => {
        getCollection('leaderboard').then((data) => { if (data.length) setLeaderboard(data) }).catch(() => { })
    }, [])

    const getScore = (m) => {
        if (timeFilter === 'month') return m.pts_month
        if (timeFilter === 'week') return m.pts_week
        return m.pts
    }

    const sorted = [...leaderboard]
        .sort((a, b) => getScore(b) - getScore(a))
        .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()))

    const maxScore = sorted.length > 0 ? getScore(sorted[0]) : 1
    const top3 = sorted.slice(0, 3)
    const rest = sorted.slice(3)

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto" ref={sectionRef}>
                <div data-reveal className="section-line mb-4" />
                <h1 data-reveal className="font-display text-[clamp(2.5rem,5vw,4rem)] text-white mb-8">Top performers</h1>

                <div data-reveal className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
                    <FilterTabs tabs={timeTabs} active={timeFilter} onChange={setTimeFilter} />
                    <input
                        className="input-glass sm:ml-auto !w-auto"
                        style={{ maxWidth: 240 }}
                        placeholder="Search members..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Top 3 */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={timeFilter}
                        className="grid md:grid-cols-3 gap-6 mb-10"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                        {top3.map((member, i) => (
                            <motion.div key={member.name} variants={itemVariants}>
                                <GlassCard
                                    className="relative overflow-hidden"
                                    style={i === 0 ? { borderColor: 'rgba(247,247,251,0.20)' } : {}}
                                >
                                    <span className="absolute top-2 right-4 font-display text-[4rem] text-[rgba(247,247,251,0.06)] leading-none select-none">
                                        {i + 1}
                                    </span>
                                    <Link to={`/member/${member.id}`} className="flex items-center gap-3 mb-3 group block">
                                        <Avatar initials={member.initials} size={48} />
                                        <div>
                                            <h3 className="font-display text-[1.1rem] text-white group-hover:text-violet transition-colors">{member.name}</h3>
                                            <p className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.40)]">{member.title}</p>
                                        </div>
                                    </Link>
                                    <div className="font-display text-[1.6rem] text-white mb-2">
                                        {getScore(member).toLocaleString()}
                                        <span className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] ml-1">pts</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {member.badges.map(b => <Badge key={b} variant="violet">{b}</Badge>)}
                                    </div>
                                    <ScoreBar score={getScore(member)} maxScore={maxScore} />
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Ranked Table */}
                {rest.length > 0 && (
                    <GlassCard className="!p-0 overflow-hidden">
                        {rest.map((member, i) => (
                            <motion.div
                                key={member.name}
                                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-3.5 border-b border-[rgba(247,247,251,0.04)] last:border-0 transition-colors"
                                whileHover={{ backgroundColor: 'rgba(247,247,251,0.04)', borderLeft: '2px solid #F7F7FB' }}
                            >
                                <span className="font-display text-lg text-[rgba(247,247,251,0.20)] w-6 sm:w-8 text-center shrink-0">{i + 4}</span>
                                <div className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4">
                                    <Link to={`/member/${member.id}`} className="flex items-center gap-3 sm:gap-4 group min-w-0 w-full">
                                        <Avatar initials={member.initials} size={32} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-sans text-[0.72rem] sm:text-[0.75rem] text-white group-hover:text-violet transition-colors truncate">{member.name}</p>
                                            <p className="font-sans text-[0.55rem] sm:text-[0.6rem] text-[rgba(247,247,251,0.30)]">{member.title}</p>
                                        </div>
                                    </Link>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 shrink-0">
                                    {member.badges.slice(0, 1).map(b => <Badge key={b}>{b}</Badge>)}
                                </div>
                                <div className="hidden sm:block w-24 shrink-0">
                                    <ScoreBar score={getScore(member)} maxScore={maxScore} />
                                </div>
                                <span className="font-display text-sm text-white w-14 sm:w-16 text-right shrink-0">{getScore(member).toLocaleString()}</span>
                            </motion.div>
                        ))}
                    </GlassCard>
                )}

                {sorted.length === 0 && (
                    <div className="text-center py-20">
                        <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.30)]">No members found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
