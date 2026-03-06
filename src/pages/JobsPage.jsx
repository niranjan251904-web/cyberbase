import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { jobs as fallbackJobs } from '../data/jobs'
import { getCollection } from '../services/firestoreService'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

const typeFilters = ['All', 'Full-time', 'Contract', 'Bounty']

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const difficultyColors = {
    Easy: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80', border: 'rgba(74,222,128,0.20)' },
    Medium: { bg: 'rgba(250,204,21,0.12)', text: '#facc15', border: 'rgba(250,204,21,0.20)' },
    Hard: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.20)' },
}

export default function JobsPage() {
    const [jobsData, setJobsData] = useState(fallbackJobs)
    const [filter, setFilter] = useState('All')
    const [search, setSearch] = useState('')
    const [savedJobs, setSavedJobs] = useState(new Set())
    const [appliedJobs, setAppliedJobs] = useState(new Set())
    const [viewJob, setViewJob] = useState(null)
    const { addToast } = useApp()
    const sectionRef = useScrollReveal()

    useEffect(() => {
        getCollection('jobs').then((data) => { if (data.length) setJobsData(data) }).catch(() => { })
    }, [])

    const filtered = jobsData
        .filter((j) => filter === 'All' || j.type === filter)
        .filter(
            (j) =>
                !search ||
                j.title.toLowerCase().includes(search.toLowerCase()) ||
                j.company.toLowerCase().includes(search.toLowerCase()) ||
                j.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
        )

    const toggleSave = (id) => {
        setSavedJobs((prev) => {
            const next = new Set(prev)
            if (next.has(id)) { next.delete(id); addToast('Removed from saved') }
            else { next.add(id); addToast('Saved!') }
            return next
        })
    }

    const applyToJob = (id) => {
        setAppliedJobs((prev) => new Set([...prev, id]))
        addToast('Application submitted!')
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto" ref={sectionRef}>
                <div data-reveal className="section-line mb-4" />
                <div data-reveal className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-white">Jobs & Bounties</h1>
                        <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.35)] mt-1">
                            {filtered.length} opportunities
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ── Sidebar ── */}
                    <div data-reveal className="lg:w-[240px] shrink-0">
                        <div className="glass p-4 lg:sticky lg:top-24">
                            <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Type</p>
                            <div className="flex flex-row lg:flex-col gap-1 mb-5">
                                {typeFilters.map((t) => {
                                    const count = t === 'All' ? jobsData.length : jobsData.filter((j) => j.type === t).length
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => setFilter(t)}
                                            className="relative text-left px-3 py-2 font-sans text-[0.72rem] rounded-lg transition-colors flex items-center justify-between"
                                            style={{
                                                color: filter === t ? '#F7F7FB' : 'rgba(247,247,251,0.40)',
                                                background: filter === t ? 'rgba(247,247,251,0.04)' : 'transparent',
                                            }}
                                        >
                                            <span>{t}</span>
                                            <span className="text-[0.55rem] opacity-40 ml-2">{count}</span>
                                            {filter === t && (
                                                <motion.div
                                                    layoutId="jobs-sidebar-active"
                                                    className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
                                                    style={{ background: '#F7F7FB' }}
                                                />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Search</p>
                            <input
                                className="input-glass w-full !text-[0.72rem]"
                                placeholder="Title, company, skill…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ── Job Cards ── */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={filter + search}
                                className="flex flex-col gap-5"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            >
                                {filtered.map((job) => (
                                    <motion.div key={job.id} variants={itemVariants} layout>
                                        <GlassCard className="relative">
                                            {/* Bounty difficulty badge */}
                                            {job.difficulty && (
                                                <span
                                                    className="absolute top-4 right-4 text-[0.55rem] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                                    style={{
                                                        background: difficultyColors[job.difficulty]?.bg,
                                                        color: difficultyColors[job.difficulty]?.text,
                                                        border: `1px solid ${difficultyColors[job.difficulty]?.border}`,
                                                    }}
                                                >
                                                    {job.difficulty}
                                                </span>
                                            )}

                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar initials={job.companyInitials} size={48} />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-display text-[1.1rem] text-white truncate">{job.title}</h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="font-sans text-[0.68rem] text-[rgba(247,247,251,0.50)]">{job.company}</span>
                                                        <span className="text-[rgba(247,247,251,0.15)]">·</span>
                                                        <span className="font-sans text-[0.62rem] text-[rgba(247,247,251,0.30)]">{job.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="font-sans text-[0.72rem] text-[rgba(247,247,251,0.42)] leading-relaxed mb-3 line-clamp-2">
                                                {job.description}
                                            </p>

                                            {/* Meta row */}
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <Badge variant="violet">{job.type}</Badge>
                                                <span
                                                    className="font-display text-[0.85rem] text-white px-2 py-0.5 rounded-lg"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                                                >
                                                    {job.salary}
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {job.skills.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-2 py-0.5 rounded-full font-sans text-[0.58rem] border"
                                                        style={{ borderColor: 'rgba(247,247,251,0.06)', color: 'rgba(247,247,251,0.40)' }}
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-sans text-[0.58rem] text-[rgba(247,247,251,0.25)]">
                                                        {job.posted} · {job.applicants} applicants
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Bookmark */}
                                                    <motion.button
                                                        onClick={() => toggleSave(job.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.04)',
                                                            border: '1px solid rgba(255,255,255,0.06)',
                                                            color: savedJobs.has(job.id) ? '#a855f7' : 'rgba(255,255,255,0.3)',
                                                        }}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill={savedJobs.has(job.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                    </motion.button>

                                                    <Button variant="glass" className="!text-[0.62rem] !py-1.5" onClick={() => setViewJob(job)}>
                                                        Details
                                                    </Button>

                                                    {appliedJobs.has(job.id) ? (
                                                        <span className="font-sans text-[0.62rem] text-violet flex items-center gap-1">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                            Applied
                                                        </span>
                                                    ) : (
                                                        <Button variant="primary" className="!text-[0.62rem] !py-1.5" onClick={() => applyToJob(job.id)}>
                                                            {job.type === 'Bounty' ? 'Start Hunting →' : 'Apply →'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {filtered.length === 0 && (
                            <div className="text-center py-20">
                                <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.30)]">No opportunities match your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Job Detail Modal ── */}
            <Modal isOpen={!!viewJob} onClose={() => setViewJob(null)} title={viewJob?.title} maxWidth="580px">
                {viewJob && (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar initials={viewJob.companyInitials} size={48} />
                            <div>
                                <p className="font-sans text-[0.8rem] text-white font-medium">{viewJob.company}</p>
                                <p className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.40)]">{viewJob.location} · {viewJob.type}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="violet">{viewJob.type}</Badge>
                            <span
                                className="font-display text-[1rem] text-white px-3 py-1 rounded-lg"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                {viewJob.salary}
                            </span>
                            {viewJob.difficulty && (
                                <span
                                    className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full"
                                    style={{
                                        background: difficultyColors[viewJob.difficulty]?.bg,
                                        color: difficultyColors[viewJob.difficulty]?.text,
                                        border: `1px solid ${difficultyColors[viewJob.difficulty]?.border}`,
                                    }}
                                >
                                    {viewJob.difficulty}
                                </span>
                            )}
                        </div>

                        <h4 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-2">Description</h4>
                        <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.50)] leading-relaxed mb-4">{viewJob.description}</p>

                        <h4 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {viewJob.skills.map((s) => <Badge key={s} variant="violet">{s}</Badge>)}
                        </div>

                        <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.25)] mb-4">
                            Posted {viewJob.posted} · {viewJob.applicants} applicants
                        </p>

                        <div className="flex gap-2">
                            {appliedJobs.has(viewJob.id) ? (
                                <span className="font-sans text-[0.72rem] text-violet flex items-center gap-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Applied
                                </span>
                            ) : (
                                <Button variant="primary" onClick={() => { applyToJob(viewJob.id); setViewJob(null) }}>
                                    {viewJob.type === 'Bounty' ? 'Start Hunting →' : 'Apply Now →'}
                                </Button>
                            )}
                            <Button variant="glass" onClick={() => { toggleSave(viewJob.id); setViewJob(null) }}>
                                {savedJobs.has(viewJob.id) ? 'Unsave' : 'Save for Later'}
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    )
}
