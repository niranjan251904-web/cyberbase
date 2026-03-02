import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { events } from '../data/events'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import FilterTabs from '../components/ui/FilterTabs'
import Modal from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

gsap.registerPlugin(ScrollTrigger)

const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'live', label: 'Live' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
]

const typeTabs = [
    { id: 'all', label: 'All' },
    { id: 'CTF', label: 'CTF' },
    { id: 'Hackathon', label: 'Hackathon' },
    { id: 'Workshop', label: 'Workshop' },
    { id: 'Conference', label: 'Conference' },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function CountdownDisplay({ event }) {
    const [time, setTime] = useState('')

    useEffect(() => {
        if (event.status === 'past') { setTime(`✓ Completed · ${event.participants} participants`); return }
        if (event.status === 'live' && event.countdown) {
            let { hours, minutes, seconds } = event.countdown
            const tick = () => {
                seconds--
                if (seconds < 0) { seconds = 59; minutes-- }
                if (minutes < 0) { minutes = 59; hours-- }
                if (hours < 0) { hours = 0; minutes = 0; seconds = 0 }
                setTime(`⏱ ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} remaining`)
            }
            tick()
            const interval = setInterval(tick, 1000)
            return () => clearInterval(interval)
        }
        if (event.status === 'upcoming') {
            const eventDate = new Date(event.date)
            const now = new Date()
            const diff = eventDate - now
            if (diff > 0) {
                const days = Math.floor(diff / 86400000)
                const hrs = Math.floor((diff % 86400000) / 3600000)
                const mins = Math.floor((diff % 3600000) / 60000)
                setTime(`⏳ ${days}d ${hrs}h ${mins}m`)
            }
        }
    }, [event])

    return <span className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.60)]">{time}</span>
}

export default function EventsPage() {
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [detailEvent, setDetailEvent] = useState(null)
    const [registerEvent, setRegisterEvent] = useState(null)
    const [formData, setFormData] = useState({ name: '', email: '', roll: '', team: '' })
    const [submitted, setSubmitted] = useState(false)
    const { addToast } = useApp()
    const sectionRef = useScrollReveal()

    const filtered = events.filter(e => {
        if (statusFilter !== 'all' && e.status !== statusFilter) return false
        if (typeFilter !== 'all' && e.type !== typeFilter) return false
        return true
    })

    const handleRegister = (e) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => {
            setRegisterEvent(null)
            setSubmitted(false)
            setFormData({ name: '', email: '', roll: '', team: '' })
            addToast('Registration successful! Check your email for confirmation.')
        }, 1500)
    }

    // Section line
    useEffect(() => {
        gsap.fromTo('.section-line-events',
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.8, ease: 'power3.inOut', scrollTrigger: { trigger: '.section-line-events', start: 'top 88%' } }
        )
    }, [])

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="section-line-events section-line mb-4" />
                <h1 data-reveal className="font-display text-[clamp(2.5rem,5vw,4rem)] text-white mb-8">What's happening</h1>

                {/* Filters */}
                <div ref={sectionRef} className="flex flex-col sm:flex-row gap-4 mb-10">
                    <div data-reveal>
                        <FilterTabs tabs={statusTabs} active={statusFilter} onChange={setStatusFilter} />
                    </div>
                    <div data-reveal className="sm:ml-6">
                        <FilterTabs tabs={typeTabs} active={typeFilter} onChange={setTypeFilter} />
                    </div>
                </div>

                {/* Events grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${statusFilter}-${typeFilter}`}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                        {filtered.map(event => (
                            <motion.div key={event.id} variants={itemVariants} layout>
                                <GlassCard className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge variant="violet">{event.type}</Badge>
                                        <Badge variant={event.status}>{event.status}</Badge>
                                    </div>
                                    <h3 className="font-display text-[1.2rem] text-white mb-2">{event.name}</h3>
                                    <p className="font-sans text-[0.68rem] text-[rgba(247,247,251,0.40)] mb-2">
                                        {event.date} · {event.format} · {event.prize}
                                    </p>
                                    <p className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.50)] leading-relaxed mb-4 line-clamp-2 flex-1">
                                        {event.description}
                                    </p>
                                    <div className="mb-4">
                                        <CountdownDisplay event={event} />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="glass" className="!text-[0.65rem] !py-1.5" onClick={() => setDetailEvent(event)}>View Details</Button>
                                        {event.status !== 'past' && (
                                            <Button variant="primary" className="!text-[0.65rem] !py-1.5" onClick={() => setRegisterEvent(event)}>Register →</Button>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="text-center py-20">
                        <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.30)]">No events match your filters.</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Modal isOpen={!!detailEvent} onClose={() => setDetailEvent(null)} title={detailEvent?.name} maxWidth="560px">
                {detailEvent && (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="violet">{detailEvent.type}</Badge>
                            <Badge variant={detailEvent.status}>{detailEvent.status}</Badge>
                        </div>
                        <p className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.40)] mb-2">
                            {detailEvent.date} · {detailEvent.format} · {detailEvent.prize}
                        </p>
                        <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.50)] leading-relaxed mb-6">
                            {detailEvent.description}
                        </p>
                        {detailEvent.timeline.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Timeline</h4>
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-[rgba(247,247,251,0.10)]" />
                                    {detailEvent.timeline.map((item, i) => (
                                        <div key={i} className="relative mb-3 last:mb-0">
                                            <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-[rgba(247,247,251,0.25)] border border-violet" />
                                            <span className="font-sans text-[0.65rem] text-violet">{item.time}</span>
                                            <span className="font-sans text-[0.72rem] text-[rgba(247,247,251,0.50)] ml-3">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {detailEvent.status !== 'past' && (
                            <Button variant="primary" onClick={() => { setDetailEvent(null); setRegisterEvent(detailEvent) }}>
                                Register for this event →
                            </Button>
                        )}
                    </>
                )}
            </Modal>

            {/* Registration Modal */}
            <Modal isOpen={!!registerEvent} onClose={() => { setRegisterEvent(null); setSubmitted(false) }} title="Register" maxWidth="480px">
                {registerEvent && !submitted && (
                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        <p className="font-sans text-[0.72rem] text-[rgba(247,247,251,0.40)] mb-2">{registerEvent.name}</p>
                        <input className="input-glass" placeholder="Full Name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                        <input className="input-glass" placeholder="Email" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required />
                        <input className="input-glass" placeholder="Roll Number" value={formData.roll} onChange={e => setFormData(p => ({ ...p, roll: e.target.value }))} />
                        <input className="input-glass" placeholder="Team Name (optional)" value={formData.team} onChange={e => setFormData(p => ({ ...p, team: e.target.value }))} />
                        <Button variant="primary" type="submit">Submit Registration →</Button>
                    </form>
                )}
                {submitted && (
                    <div className="text-center py-8">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: [0.9, 1.02, 1] }} transition={{ duration: 0.4 }}>
                            <p className="font-display text-2xl text-white mb-2">✓</p>
                            <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.60)]">Registration confirmed!</p>
                        </motion.div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
