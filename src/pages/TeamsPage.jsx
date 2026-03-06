import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { teams as fallbackTeams } from '../data/teams'
import { getCollection, addDocument } from '../services/firestoreService'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function TeamsPage() {
    const [teams, setTeams] = useState(fallbackTeams)
    const [createOpen, setCreateOpen] = useState(false)
    const [viewTeam, setViewTeam] = useState(null)
    const [joinedTeams, setJoinedTeams] = useState(new Set())
    const [formData, setFormData] = useState({ name: '', focus: '', description: '' })
    const { addToast } = useApp()
    const sectionRef = useScrollReveal()

    useEffect(() => {
        getCollection('teams').then((data) => { if (data.length) setTeams(data) }).catch(() => { })
    }, [])

    const handleJoin = (teamId) => {
        setJoinedTeams(prev => new Set([...prev, teamId]))
        addToast('Request sent! Team leader will review your application.')
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        const newTeam = {
            id: Date.now(),
            name: formData.name,
            focus: formData.focus,
            members: [{ name: 'You', initials: 'YO' }],
            maxMembers: 4,
            pts: 0,
            description: formData.description,
        }
        try {
            await addDocument('teams', newTeam)
        } catch (err) { /* continue with local state */ }
        setTeams(prev => [newTeam, ...prev])
        setCreateOpen(false)
        setFormData({ name: '', focus: '', description: '' })
        addToast(`Team "${formData.name}" created successfully!`)
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto" ref={sectionRef}>
                <div data-reveal className="section-line mb-4" />
                <div data-reveal className="flex items-center justify-between mb-10">
                    <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-white">Find your crew</h1>
                    <Button variant="primary" onClick={() => setCreateOpen(true)} className="!text-[0.65rem]">+ Create Team</Button>
                </div>

                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {teams.map(team => (
                        <motion.div key={team.id} variants={itemVariants} layout>
                            <GlassCard className="flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar initials={team.name.split(' ').map(w => w[0]).join('').slice(0, 2)} size={48} />
                                    <div>
                                        <h3 className="font-display text-[1.1rem] text-white">{team.name}</h3>
                                        <Badge variant="violet">{team.focus}</Badge>
                                    </div>
                                </div>

                                <p className="font-sans text-[0.68rem] text-[rgba(247,247,251,0.40)] mb-3">
                                    {team.members.length} / {team.maxMembers} members
                                </p>

                                <div className="font-display text-[1.4rem] text-white mb-3">{team.pts.toLocaleString()} <span className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)]">pts</span></div>

                                <div className="flex items-center mb-4">
                                    {team.members.map((m, i) => (
                                        <div key={i} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: team.members.length - i }}>
                                            <Avatar initials={m.initials} size={32} />
                                        </div>
                                    ))}
                                    {Array.from({ length: team.maxMembers - team.members.length }).map((_, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            className="w-8 h-8 rounded-full border border-dashed border-[rgba(247,247,251,0.15)]"
                                            style={{ marginLeft: -8, opacity: 0.3 }}
                                        />
                                    ))}
                                </div>

                                <p className="font-sans text-[0.72rem] text-[rgba(247,247,251,0.40)] leading-relaxed mb-4 flex-1 line-clamp-2">
                                    {team.description}
                                </p>

                                <div className="flex gap-2">
                                    <Button variant="glass" className="!text-[0.65rem] !py-1.5" onClick={() => setViewTeam(team)}>View Team</Button>
                                    {team.members.length < team.maxMembers && !joinedTeams.has(team.id) ? (
                                        <Button variant="primary" className="!text-[0.65rem] !py-1.5" onClick={() => handleJoin(team.id)}>Request to Join →</Button>
                                    ) : joinedTeams.has(team.id) ? (
                                        <span className="font-sans text-[0.65rem] text-violet flex items-center">Request Sent ✓</span>
                                    ) : null}
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* View Team Modal */}
            <Modal isOpen={!!viewTeam} onClose={() => setViewTeam(null)} title={viewTeam?.name} maxWidth="520px">
                {viewTeam && (
                    <>
                        <Badge variant="violet" className="mb-3">{viewTeam.focus}</Badge>
                        <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.50)] leading-relaxed mb-4">{viewTeam.description}</p>
                        <div className="font-display text-2xl text-white mb-4">{viewTeam.pts.toLocaleString()} <span className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)]">points</span></div>
                        <h4 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Members</h4>
                        <div className="flex flex-col gap-2">
                            {viewTeam.members.map((m, i) => (
                                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ background: 'rgba(247,247,251,0.04)' }}>
                                    <Avatar initials={m.initials} size={32} />
                                    <span className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.60)]">{m.name}</span>
                                    {i === 0 && <Badge variant="violet" className="ml-auto">Leader</Badge>}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Modal>

            {/* Create Team Modal */}
            <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create a Team" maxWidth="480px">
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                    <input className="input-glass" placeholder="Team Name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                    <select className="input-glass" value={formData.focus} onChange={e => setFormData(p => ({ ...p, focus: e.target.value }))} required>
                        <option value="" disabled>Select Focus Area</option>
                        {['Red Team', 'Blue Team', 'CTF', 'Research', 'Cloud Security', 'Reverse Engineering', 'Cryptography', 'OSINT'].map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                    <textarea className="input-glass" rows={3} placeholder="Team Description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required />
                    <Button variant="primary" type="submit">Create Team →</Button>
                </form>
            </Modal>
        </div>
    )
}
