import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useApp } from '../context/AppContext'
import { members } from '../data/members'

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

export default function MemberProfilePage() {
    const { id } = useParams()
    const { addToast } = useApp()
    const avatarRef = useRef(null)
    const sectionRef = useScrollReveal()
    const [connected, setConnected] = useState(false)

    const member = members.find(m => m.id === Number(id))

    useEffect(() => {
        if (avatarRef.current) {
            gsap.from(avatarRef.current, { scale: 0.85, opacity: 0, duration: 0.7, ease: 'back.out(1.4)', delay: 0.2 })
        }
        window.scrollTo(0, 0)
    }, [id])

    if (!member) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="font-display text-2xl text-white mb-2">Member not found</h2>
                    <p className="font-sans text-[0.8rem] text-[rgba(255,255,255,0.35)] mb-6">This profile doesn't exist or has been removed.</p>
                    <Link to="/network" className="px-5 py-2.5 text-[0.72rem] rounded-full font-medium text-white transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Back to Network</Link>
                </div>
            </div>
        )
    }

    const name = member.name
    const initials = member.initials
    const headline = member.headline
    const location = member.location || ''
    const bio = member.bio || ''
    const skills = member.skills || []
    const links = member.links || {}
    const events = member.events || []
    const badges = member.badges || []
    const stats = member.stats || { points: 0, rank: 0, events: 0, challenges: 0 }
    const experience = member.experience || []
    const education = member.education || []
    const certifications = member.certifications || []
    const avatar = member.avatar

    const handleConnect = () => {
        setConnected(!connected)
        addToast(connected ? `Removed connection with ${name}` : `Connected with ${name}!`)
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-[1100px] mx-auto" ref={sectionRef}>
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ═══════ LEFT COLUMN ═══════ */}
                    <div className="flex-1 min-w-0">

                        {/* ── Hero Card ── */}
                        <GlassCard className="!p-0 overflow-hidden mb-5" data-reveal>
                            <div className="h-48 sm:h-56 relative"
                                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.20) 0%, rgba(139,92,246,0.15) 40%, rgba(14,14,22,0.4) 100%)' }}>
                                <div className="absolute inset-0 opacity-[0.04]"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                                                          linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                                        backgroundSize: '40px 40px',
                                    }}
                                />
                            </div>
                            <div className="relative px-6 pb-6">
                                <div ref={avatarRef} className="absolute -top-16 left-6">
                                    {avatar ? (
                                        <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-[#0e0e16] bg-white">
                                            <img src={avatar} alt={name} className="w-full h-full object-cover brightness-[1.3]" style={{ opacity: 1, objectPosition: 'center', backgroundColor: 'white' }} />
                                        </div>
                                    ) : (
                                        <Avatar initials={initials} size={120} className="border-4 border-[#0e0e16]" />
                                    )}
                                </div>
                                <div className="flex justify-end pt-3 mb-6" />
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="font-display text-[1.8rem] sm:text-[2.2rem] text-white leading-tight">{name}</h1>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-1">
                                            <path d="M9 12l2 2 4-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="1.5" />
                                        </svg>
                                    </div>
                                    <p className="font-sans text-[0.82rem] text-[rgba(255,255,255,0.55)] mb-1 max-w-[500px]">{headline}</p>
                                    {location && (
                                        <p className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.30)] mb-2">📍 {location}</p>
                                    )}
                                    <p className="font-sans text-[0.72rem] text-[rgba(139,92,246,0.8)]">{stats.events || 0} connections</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                    <button onClick={handleConnect}
                                        className="px-5 py-1.5 rounded-full text-[0.65rem] font-medium uppercase tracking-wider transition-all hover:scale-105"
                                        style={{
                                            background: connected ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                                            color: 'white',
                                            border: connected ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(99,102,241,0.3)',
                                        }}>
                                        {connected ? '✓ Connected' : '+ Connect'}
                                    </button>
                                    <Button variant="glass" className="!text-[0.62rem] !py-1.5 !rounded-full"
                                        onClick={() => addToast(`Message sent to ${name}!`)}>Message</Button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                        onClick={() => addToast('More options coming soon!')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </GlassCard>

                        {/* ── Stats ── */}
                        <div data-reveal className="flex items-center divide-x divide-[rgba(247,247,251,0.06)] mb-5 glass p-6">
                            <div className="text-center flex-1">
                                <div className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-white">{stats.points.toLocaleString()}</div>
                                <div className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mt-1">Points</div>
                            </div>
                            <div className="text-center flex-1">
                                <div className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-white">#{stats.rank}</div>
                                <div className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mt-1">Rank</div>
                            </div>
                            <div className="text-center flex-1">
                                <div className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-white">{stats.events}</div>
                                <div className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mt-1">Events</div>
                            </div>
                            <div className="text-center flex-1">
                                <div className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-white">{stats.challenges}</div>
                                <div className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mt-1">Challenges</div>
                            </div>
                        </div>

                        {/* ── About ── */}
                        {bio && (
                            <GlassCard className="mb-5" data-reveal>
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">About</h3>
                                <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.50)] leading-relaxed">{bio}</p>
                            </GlassCard>
                        )}

                        {/* ── Experience ── */}
                        {experience.length > 0 && (
                            <GlassCard className="mb-5" data-reveal>
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Experience</h3>
                                <div className="flex flex-col gap-4">
                                    {experience.map(exp => (
                                        <div key={exp.id} className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span className="text-sm">💼</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-sans text-[0.78rem] text-white font-medium">{exp.title}</p>
                                                <p className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.40)]">{exp.company}</p>
                                                {exp.duration && <p className="font-sans text-[0.58rem] text-[rgba(255,255,255,0.22)] mt-0.5">{exp.duration}</p>}
                                                {exp.description && <p className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.35)] mt-1 leading-relaxed">{exp.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* ── Education ── */}
                        {education.length > 0 && (
                            <GlassCard className="mb-5" data-reveal>
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Education</h3>
                                <div className="flex flex-col gap-4">
                                    {education.map(edu => (
                                        <div key={edu.id} className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span className="text-sm">🎓</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-sans text-[0.78rem] text-white font-medium">{edu.school}</p>
                                                <p className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.40)]">{edu.degree}</p>
                                                {edu.year && <p className="font-sans text-[0.58rem] text-[rgba(255,255,255,0.22)] mt-0.5">{edu.year}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* ── Certifications ── */}
                        {certifications.length > 0 && (
                            <GlassCard className="mb-5" data-reveal>
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Certifications</h3>
                                <div className="flex flex-col gap-4">
                                    {certifications.map(cert => (
                                        <div key={cert.id} className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span className="text-sm">📜</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-sans text-[0.78rem] text-white font-medium">{cert.name}</p>
                                                <p className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.40)]">{cert.issuer}</p>
                                                {cert.year && <p className="font-sans text-[0.58rem] text-[rgba(255,255,255,0.22)] mt-0.5">Issued {cert.year}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* ── Skills ── */}
                        {skills.length > 0 && (
                            <GlassCard className="mb-5" data-reveal>
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(skill => <Badge key={skill} variant="violet">{skill}</Badge>)}
                                </div>
                            </GlassCard>
                        )}

                        {/* ── Activity ── */}
                        {events.length > 0 && (
                            <GlassCard className="mb-5" data-reveal>
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-4">Activity</h3>
                                <div className="relative pl-6">
                                    <div className="timeline-line" />
                                    {events.map((event, i) => (
                                        <div key={i} className="timeline-item relative mb-4 last:mb-0">
                                            <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-[rgba(247,247,251,0.25)] border border-violet" />
                                            <p className="font-sans text-[0.75rem] text-white">{event.name}</p>
                                            <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)]">{event.role} · {event.result}</p>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* ── Badges ── */}
                        {badges.length > 0 && (
                            <GlassCard className="mb-5" data-reveal>
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-4">Badges</h3>
                                <motion.div className="grid grid-cols-3 sm:grid-cols-5 gap-3" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                    {badges.map(badge => (
                                        <motion.div key={badge} variants={itemVariants}>
                                            <div className="glass !rounded-xl p-3 text-center">
                                                <div className="text-xl mb-1">🛡️</div>
                                                <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.50)]">{badge}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </GlassCard>
                        )}
                    </div>

                    {/* ═══════ RIGHT SIDEBAR ═══════ */}
                    <div className="lg:w-[300px] shrink-0 flex flex-col gap-5">
                        {/* Links */}
                        {Object.keys(links).length > 0 && (
                            <GlassCard className="!p-4" data-reveal>
                                <h3 className="font-sans text-[0.72rem] text-white font-medium mb-3">Links</h3>
                                <div className="flex flex-col gap-2">
                                    {Object.entries(links).map(([key, value]) => (
                                        <a key={key} href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
                                            className="font-sans text-[0.68rem] text-[rgba(139,92,246,0.8)] hover:text-white transition-colors flex items-center gap-2">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                            {key}: {value}
                                        </a>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* People also viewed */}
                        <GlassCard className="!p-4" data-reveal>
                            <h3 className="font-sans text-[0.72rem] text-white font-medium mb-3">People also viewed</h3>
                            <div className="flex flex-col gap-3">
                                {members.filter(m => m.id !== member.id).slice(0, 4).map(m => (
                                    <Link key={m.id} to={`/member/${m.id}`} className="flex items-center gap-2.5 group">
                                        {m.avatar ? (
                                            <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <Avatar initials={m.initials} size={32} />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-sans text-[0.68rem] text-white group-hover:text-violet transition-colors truncate">{m.name}</p>
                                            <p className="font-sans text-[0.55rem] text-[rgba(255,255,255,0.25)] truncate">{m.headline}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Similar profiles */}
                        <GlassCard className="!p-4" data-reveal>
                            <h3 className="font-sans text-[0.72rem] text-white font-medium mb-3">Similar profiles</h3>
                            <div className="flex flex-col gap-3">
                                {members.filter(m => m.id !== member.id && m.skills?.some(s => skills.includes(s))).slice(0, 3).map(m => (
                                    <Link key={m.id} to={`/member/${m.id}`} className="flex items-center gap-2.5 group">
                                        {m.avatar ? (
                                            <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <Avatar initials={m.initials} size={32} />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-sans text-[0.68rem] text-white group-hover:text-violet transition-colors truncate">{m.name}</p>
                                            <p className="font-sans text-[0.55rem] text-[rgba(255,255,255,0.25)] truncate">{m.headline}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    )
}
