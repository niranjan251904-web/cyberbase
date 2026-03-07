import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import { useCounter } from '../hooks/useCounter'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

gsap.registerPlugin(ScrollTrigger)

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

function ProfileStat({ value, label }) {
    const ref = useCounter(value)
    return (
        <div className="text-center flex-1">
            <div ref={ref} className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-white">0</div>
            <div className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mt-1">{label}</div>
        </div>
    )
}

const profileViewers = [
    { name: 'Someone in Penetration Testing', initials: 'PT' },
    { name: 'Someone in Cloud Security...', initials: 'CS' },
    { name: 'Someone at CrowdStrike...', initials: 'CR' },
    { name: 'Someone in Threat Intelligence...', initials: 'TI' },
]

/* ─── Reusable inline input row ─── */
function InlineField({ label, children }) {
    return (
        <div className="mb-3.5">
            <label className="font-sans text-[0.6rem] text-[rgba(255,255,255,0.30)] uppercase tracking-[0.15em] mb-1.5 block">{label}</label>
            {children}
        </div>
    )
}

export default function ProfilePage() {
    const { user, openAuth, updateProfile } = useAuth()
    const { addToast } = useApp()
    const avatarRef = useRef(null)
    const timelineRef = useRef(null)
    const sectionRef = useScrollReveal()
    const avatarInputRef = useRef(null)
    const coverInputRef = useRef(null)
    const [uploading, setUploading] = useState(false)

    /* ── Modal states ── */
    const [editOpen, setEditOpen] = useState(false)
    const [editData, setEditData] = useState({ name: '', headline: '', location: '', bio: '' })
    const [openToWork, setOpenToWork] = useState(true)

    /* Section modals */
    const [skillsOpen, setSkillsOpen] = useState(false)
    const [newSkill, setNewSkill] = useState('')
    const [linksOpen, setLinksOpen] = useState(false)
    const [newLinkKey, setNewLinkKey] = useState('')
    const [newLinkVal, setNewLinkVal] = useState('')

    const [expOpen, setExpOpen] = useState(false)
    const [expForm, setExpForm] = useState({ title: '', company: '', duration: '', description: '' })

    const [eduOpen, setEduOpen] = useState(false)
    const [eduForm, setEduForm] = useState({ school: '', degree: '', year: '' })

    const [certOpen, setCertOpen] = useState(false)
    const [certForm, setCertForm] = useState({ name: '', issuer: '', year: '' })

    const [addSectionOpen, setAddSectionOpen] = useState(false)

    /* ── Base64 image helper ── */
    const fileToBase64 = (file, maxWidth = 400) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const scale = Math.min(1, maxWidth / img.width)
                    canvas.width = img.width * scale
                    canvas.height = img.height * scale
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                    resolve(canvas.toDataURL('image/jpeg', 0.7))
                }
                img.onerror = reject
                img.src = e.target.result
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    /* ── Photo upload handlers ── */
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const base64 = await fileToBase64(file, 300)
            await updateProfile({ avatar: base64 })
            addToast('Profile photo updated!')
        } catch (err) {
            console.error('Avatar upload error:', err)
            addToast('Failed to upload photo')
        }
        setUploading(false)
        e.target.value = ''
    }

    const handleCoverUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const base64 = await fileToBase64(file, 1200)
            await updateProfile({ coverPhoto: base64 })
            addToast('Cover photo updated!')
        } catch (err) {
            console.error('Cover upload error:', err)
            addToast('Failed to upload cover photo')
        }
        setUploading(false)
        e.target.value = ''
    }

    /* ── Animations ── */
    useEffect(() => {
        if (avatarRef.current) {
            gsap.from(avatarRef.current, { scale: 0.85, opacity: 0, duration: 0.7, ease: 'back.out(1.4)', delay: 0.2 })
        }
    }, [user])

    useEffect(() => {
        if (timelineRef.current) {
            const line = timelineRef.current.querySelector('.timeline-line')
            if (line) {
                gsap.fromTo(line, { scaleY: 0 }, {
                    scaleY: 1, duration: 0.8, ease: 'power3.inOut',
                    scrollTrigger: { trigger: line, start: 'top 88%' },
                })
            }
        }
    }, [user])

    /* ─── Not logged in ─── */
    if (!user) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h2 className="font-display text-2xl text-white mb-2">Sign in to view your profile</h2>
                    <p className="font-sans text-[0.8rem] text-[rgba(255,255,255,0.35)] mb-6">Log in or create an account to see your stats, badges, and more</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => openAuth('login')} className="px-5 py-2.5 text-[0.72rem] rounded-full font-medium text-white transition-all hover:scale-105"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Login</button>
                        <button onClick={() => openAuth('signup')} className="px-5 py-2.5 text-[0.72rem] rounded-full font-medium text-white transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>Sign Up</button>
                    </div>
                </div>
            </div>
        )
    }

    /* ─── User data with safe fallbacks ─── */
    const name = user.name || 'User'
    const initials = user.initials || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const headline = user.headline || 'CyberBase Member'
    const location = user.location || ''
    const bio = user.bio || ''
    const skills = user.skills || []
    const links = user.links || {}
    const events = user.events || []
    const badges = user.badges || []
    const stats = user.stats || { points: 0, rank: 0, events: 0, challenges: 0 }
    const experience = user.experience || []
    const education = user.education || []
    const certifications = user.certifications || []

    /* ── Handlers ── */
    const openEdit = () => {
        setEditData({ name, headline, location, bio })
        setEditOpen(true)
    }
    const handleSaveEdit = (e) => {
        e.preventDefault()
        const newInitials = editData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        updateProfile({ ...editData, initials: newInitials })
        setEditOpen(false)
        addToast('Profile updated!')
    }

    /* Skills */
    const addSkill = () => {
        const s = newSkill.trim()
        if (!s || skills.includes(s)) return
        updateProfile({ skills: [...skills, s] })
        setNewSkill('')
        addToast(`Skill "${s}" added!`)
    }
    const removeSkill = (skill) => {
        updateProfile({ skills: skills.filter(s => s !== skill) })
        addToast(`Skill removed`)
    }

    /* Links */
    const addLink = () => {
        const key = newLinkKey.trim()
        const val = newLinkVal.trim()
        if (!key || !val) return
        updateProfile({ links: { ...links, [key]: val } })
        setNewLinkKey('')
        setNewLinkVal('')
        addToast(`Link "${key}" added!`)
    }
    const removeLink = (key) => {
        const updated = { ...links }
        delete updated[key]
        updateProfile({ links: updated })
        addToast(`Link removed`)
    }

    /* Experience */
    const addExperience = (e) => {
        e.preventDefault()
        if (!expForm.title || !expForm.company) return
        updateProfile({ experience: [...experience, { ...expForm, id: Date.now() }] })
        setExpForm({ title: '', company: '', duration: '', description: '' })
        setExpOpen(false)
        addToast('Experience added!')
    }
    const removeExperience = (id) => {
        updateProfile({ experience: experience.filter(x => x.id !== id) })
        addToast('Experience removed')
    }

    /* Education */
    const addEducation = (e) => {
        e.preventDefault()
        if (!eduForm.school || !eduForm.degree) return
        updateProfile({ education: [...education, { ...eduForm, id: Date.now() }] })
        setEduForm({ school: '', degree: '', year: '' })
        setEduOpen(false)
        addToast('Education added!')
    }
    const removeEducation = (id) => {
        updateProfile({ education: education.filter(x => x.id !== id) })
        addToast('Education removed')
    }

    /* Certifications */
    const addCertification = (e) => {
        e.preventDefault()
        if (!certForm.name || !certForm.issuer) return
        updateProfile({ certifications: [...certifications, { ...certForm, id: Date.now() }] })
        setCertForm({ name: '', issuer: '', year: '' })
        setCertOpen(false)
        addToast('Certification added!')
    }
    const removeCertification = (id) => {
        updateProfile({ certifications: certifications.filter(x => x.id !== id) })
        addToast('Certification removed')
    }

    /* ─── Small delete button ─── */
    const DeleteBtn = ({ onClick }) => (
        <button onClick={onClick} className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    )

    /* ─── Edit (pencil) button ─── */
    const PencilBtn = ({ onClick, className = '' }) => (
        <button onClick={onClick} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 shrink-0 ${className}`}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
        </button>
    )

    /* ─── Inline + Add button ─── */
    const AddBtn = ({ onClick, label }) => (
        <button onClick={onClick} className="font-sans text-[0.65rem] text-[rgba(139,92,246,0.8)] hover:text-white transition-colors flex items-center gap-1 mt-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {label}
        </button>
    )

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-[1100px] mx-auto" ref={sectionRef}>
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ═══════ LEFT COLUMN ═══════ */}
                    <div className="flex-1 min-w-0">

                        {/* ── Hero Card (Cover + Avatar + Info) ── */}
                        <GlassCard className="!p-0 overflow-hidden mb-5" data-reveal>
                            <div className="h-48 sm:h-56 relative"
                                style={{
                                    background: user?.coverPhoto
                                        ? `url(${user.coverPhoto}) center/cover no-repeat`
                                        : 'linear-gradient(135deg, rgba(99,102,241,0.20) 0%, rgba(139,92,246,0.15) 40%, rgba(14,14,22,0.4) 100%)'
                                }}>
                                {!user?.coverPhoto && (
                                    <div className="absolute inset-0 opacity-[0.04]"
                                        style={{
                                            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                                                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                                            backgroundSize: '40px 40px',
                                        }}
                                    />
                                )}
                                <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={handleCoverUpload} />
                                <button className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    onClick={() => coverInputRef.current?.click()}
                                    disabled={uploading}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                                    </svg>
                                </button>
                            </div>
                            <div className="relative px-6 pb-6">
                                <div ref={avatarRef} className="absolute -top-16 left-6">
                                    <div className="relative cursor-pointer group" onClick={() => avatarInputRef.current?.click()}>
                                        <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                        {user?.avatar ? (
                                            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-[#0e0e16] bg-white">
                                                <img src={user.avatar} alt={name} className="w-full h-full object-cover brightness-[1.3]" style={{ opacity: 1 }} />
                                            </div>
                                        ) : (
                                            <Avatar initials={initials} size={120} className="border-4 border-[#0e0e16]" />
                                        )}
                                        {/* Upload overlay on hover */}
                                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-4 border-transparent">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                                            </svg>
                                        </div>
                                        {openToWork && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[0.45rem] font-bold uppercase tracking-wider text-white whitespace-nowrap"
                                                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: '2px solid #0e0e16' }}>
                                                #OpenToWork
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end pt-3 mb-6">
                                    <PencilBtn onClick={openEdit} />
                                </div>
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
                                        <p className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.30)] mb-2">
                                            📍 {location} · <span className="text-violet cursor-pointer hover:underline">Contact info</span>
                                        </p>
                                    )}
                                    <p className="font-sans text-[0.72rem] text-[rgba(139,92,246,0.8)] cursor-pointer hover:underline">
                                        {stats.events || 0} connections
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                    <button onClick={() => setOpenToWork(!openToWork)}
                                        className="px-4 py-1.5 rounded-full text-[0.65rem] font-medium uppercase tracking-wider transition-all hover:scale-105"
                                        style={{
                                            background: openToWork ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.06)',
                                            color: 'white',
                                            border: '1px solid ' + (openToWork ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'),
                                        }}>
                                        {openToWork ? '✓ Open to Work' : 'Open to'}
                                    </button>
                                    <Button variant="glass" className="!text-[0.62rem] !py-1.5 !rounded-full" onClick={() => setAddSectionOpen(true)}>+ Add Section</Button>
                                    <Button variant="glass" className="!text-[0.62rem] !py-1.5 !rounded-full" onClick={() => addToast('Profile enhancement suggestions coming soon!')}>Enhance Profile</Button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                        onClick={() => addToast('More options coming soon!')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                                        </svg>
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {openToWork && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                                                <div className="flex-1">
                                                    <p className="font-sans text-[0.72rem] text-[rgba(255,255,255,0.7)] font-medium">Open to work · Visible to everyone on CyberBase</p>
                                                    <p className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.35)] mt-0.5">{skills.slice(0, 3).join(', ') || 'Any'} roles</p>
                                                </div>
                                                <PencilBtn onClick={openEdit} className="!w-7 !h-7" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </GlassCard>

                        {/* ── Stats ── */}
                        <div data-reveal className="flex items-center divide-x divide-[rgba(247,247,251,0.06)] mb-5 glass p-6">
                            <ProfileStat value={stats.points} label="Points" />
                            <ProfileStat value={stats.rank} label="Rank" />
                            <ProfileStat value={stats.events} label="Events" />
                            <ProfileStat value={stats.challenges} label="Challenges" />
                        </div>

                        {/* ── About ── */}
                        <GlassCard className="mb-5" data-reveal>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em]">About</h3>
                                <PencilBtn onClick={openEdit} className="!w-7 !h-7" />
                            </div>
                            <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.50)] leading-relaxed">{bio || 'Tell the community about yourself...'}</p>
                        </GlassCard>

                        {/* ── Experience ── */}
                        <GlassCard className="mb-5" data-reveal>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em]">Experience</h3>
                                <button onClick={() => setExpOpen(true)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>
                            {experience.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="font-sans text-[0.72rem] text-[rgba(255,255,255,0.25)] mb-2">No experience added yet</p>
                                    <AddBtn onClick={() => setExpOpen(true)} label="Add experience" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {experience.map((exp) => (
                                        <div key={exp.id} className="group flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors">
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
                                            <DeleteBtn onClick={() => removeExperience(exp.id)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>

                        {/* ── Education ── */}
                        <GlassCard className="mb-5" data-reveal>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em]">Education</h3>
                                <button onClick={() => setEduOpen(true)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>
                            {education.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="font-sans text-[0.72rem] text-[rgba(255,255,255,0.25)] mb-2">No education added yet</p>
                                    <AddBtn onClick={() => setEduOpen(true)} label="Add education" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {education.map((edu) => (
                                        <div key={edu.id} className="group flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span className="text-sm">🎓</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-sans text-[0.78rem] text-white font-medium">{edu.school}</p>
                                                <p className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.40)]">{edu.degree}</p>
                                                {edu.year && <p className="font-sans text-[0.58rem] text-[rgba(255,255,255,0.22)] mt-0.5">{edu.year}</p>}
                                            </div>
                                            <DeleteBtn onClick={() => removeEducation(edu.id)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>

                        {/* ── Certifications ── */}
                        <GlassCard className="mb-5" data-reveal>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em]">Certifications</h3>
                                <button onClick={() => setCertOpen(true)} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>
                            {certifications.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="font-sans text-[0.72rem] text-[rgba(255,255,255,0.25)] mb-2">No certifications added yet</p>
                                    <AddBtn onClick={() => setCertOpen(true)} label="Add certification" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {certifications.map((cert) => (
                                        <div key={cert.id} className="group flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span className="text-sm">📜</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-sans text-[0.78rem] text-white font-medium">{cert.name}</p>
                                                <p className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.40)]">{cert.issuer}</p>
                                                {cert.year && <p className="font-sans text-[0.58rem] text-[rgba(255,255,255,0.22)] mt-0.5">{cert.year}</p>}
                                            </div>
                                            <DeleteBtn onClick={() => removeCertification(cert.id)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>

                        {/* ── Skills ── */}
                        <GlassCard className="mb-5" data-reveal>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em]">Skills</h3>
                                <PencilBtn onClick={() => setSkillsOpen(true)} className="!w-7 !h-7" />
                            </div>
                            {skills.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="font-sans text-[0.72rem] text-[rgba(255,255,255,0.25)] mb-2">No skills added yet</p>
                                    <AddBtn onClick={() => setSkillsOpen(true)} label="Add skills" />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(skill => (
                                        <div key={skill} className="group relative">
                                            <Badge variant="violet">{skill}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>

                        {/* ── Links ── */}
                        <GlassCard className="mb-5" data-reveal>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em]">Links</h3>
                                <PencilBtn onClick={() => setLinksOpen(true)} className="!w-7 !h-7" />
                            </div>
                            {Object.keys(links).length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="font-sans text-[0.72rem] text-[rgba(255,255,255,0.25)] mb-2">No links added yet</p>
                                    <AddBtn onClick={() => setLinksOpen(true)} label="Add links" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {Object.entries(links).map(([key, value]) => (
                                        <div key={key} className="group flex items-center gap-2">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                            <span className="font-sans text-[0.72rem] text-[rgba(139,92,246,0.8)] flex-1">{key}: {value}</span>
                                            <DeleteBtn onClick={() => removeLink(key)} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </GlassCard>

                        {/* ── Activity / Events Timeline ── */}
                        {events.length > 0 && (
                            <GlassCard className="mb-5" data-reveal>
                                <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-4">Activity</h3>
                                <div ref={timelineRef} className="relative pl-6">
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
                        <GlassCard className="!p-4" data-reveal>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-sans text-[0.72rem] text-white font-medium">Profile Language</h3>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                </svg>
                            </div>
                            <p className="font-sans text-[0.62rem] text-[rgba(255,255,255,0.30)]">English</p>
                        </GlassCard>
                        <GlassCard className="!p-4" data-reveal>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-sans text-[0.72rem] text-white font-medium">Public Profile & URL</h3>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                </svg>
                            </div>
                            <p className="font-sans text-[0.58rem] text-[rgba(255,255,255,0.25)]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                cyberbase.io/in/{name.toLowerCase().replace(/\s+/g, '-')}
                            </p>
                        </GlassCard>
                        <GlassCard className="!p-4" data-reveal>
                            <h3 className="font-sans text-[0.72rem] text-white font-medium mb-1">Who viewed your profile</h3>
                            <p className="font-sans text-[0.58rem] text-[rgba(255,255,255,0.25)] mb-3">Private to you</p>
                            <div className="flex flex-col gap-3">
                                {profileViewers.map((viewer, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <Avatar initials={viewer.initials} size={32} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.50)] truncate">{viewer.name}</p>
                                        </div>
                                        <button className="text-[0.55rem] px-2.5 py-1 rounded-full font-medium transition-all hover:scale-105"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>View</button>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                        <GlassCard className="!p-4" data-reveal>
                            <h3 className="font-sans text-[0.72rem] text-white font-medium mb-0.5">Suggested for you</h3>
                            <p className="font-sans text-[0.58rem] text-[rgba(255,255,255,0.25)] mb-3">Private to you</p>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Avatar initials={initials} size={28} />
                                <p className="font-sans text-[0.65rem] text-[rgba(255,255,255,0.40)] flex-1">Tell your network what roles and companies you're open to</p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* ═══════ MODALS ═══════ */}

            {/* ── Edit Profile ── */}
            <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" maxWidth="480px">
                <form onSubmit={handleSaveEdit} className="flex flex-col gap-0">
                    <InlineField label="Name">
                        <input className="input-glass" value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} required />
                    </InlineField>
                    <InlineField label="Headline">
                        <input className="input-glass" value={editData.headline} onChange={e => setEditData(p => ({ ...p, headline: e.target.value }))} placeholder="e.g. Penetration Tester · OSCP" />
                    </InlineField>
                    <InlineField label="Location">
                        <input className="input-glass" value={editData.location} onChange={e => setEditData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Madurai, Tamil Nadu, India" />
                    </InlineField>
                    <InlineField label="About">
                        <textarea className="input-glass" rows={4} value={editData.bio} onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} placeholder="Tell the community about you..." />
                    </InlineField>
                    <Button variant="primary" type="submit">Save Changes</Button>
                </form>
            </Modal>

            {/* ── Add Section ── */}
            <Modal isOpen={addSectionOpen} onClose={() => setAddSectionOpen(false)} title="Add Section" maxWidth="420px">
                <div className="flex flex-col gap-1">
                    {[
                        { icon: '💼', label: 'Experience', desc: 'Add your work history', action: () => { setAddSectionOpen(false); setExpOpen(true) } },
                        { icon: '🎓', label: 'Education', desc: 'Add schools, universities', action: () => { setAddSectionOpen(false); setEduOpen(true) } },
                        { icon: '📜', label: 'Certifications', desc: 'OSCP, CEH, GCIH, etc.', action: () => { setAddSectionOpen(false); setCertOpen(true) } },
                        { icon: '⚡', label: 'Skills', desc: 'Highlight what you know', action: () => { setAddSectionOpen(false); setSkillsOpen(true) } },
                        { icon: '🔗', label: 'Links', desc: 'Portfolio, GitHub, socials', action: () => { setAddSectionOpen(false); setLinksOpen(true) } },
                    ].map(item => (
                        <button key={item.label} onClick={item.action}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-[rgba(255,255,255,0.04)]">
                            <span className="text-lg">{item.icon}</span>
                            <div>
                                <p className="font-sans text-[0.75rem] text-white">{item.label}</p>
                                <p className="font-sans text-[0.6rem] text-[rgba(255,255,255,0.30)]">{item.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </Modal>

            {/* ── Add Experience ── */}
            <Modal isOpen={expOpen} onClose={() => setExpOpen(false)} title="Add Experience" maxWidth="480px">
                <form onSubmit={addExperience} className="flex flex-col gap-0">
                    <InlineField label="Title *">
                        <input className="input-glass" value={expForm.title} onChange={e => setExpForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Security Analyst" required />
                    </InlineField>
                    <InlineField label="Company / Organization *">
                        <input className="input-glass" value={expForm.company} onChange={e => setExpForm(p => ({ ...p, company: e.target.value }))} placeholder="e.g. CrowdStrike" required />
                    </InlineField>
                    <InlineField label="Duration">
                        <input className="input-glass" value={expForm.duration} onChange={e => setExpForm(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. Jan 2024 – Present" />
                    </InlineField>
                    <InlineField label="Description">
                        <textarea className="input-glass" rows={3} value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} placeholder="What did you do in this role?" />
                    </InlineField>
                    <Button variant="primary" type="submit">Add Experience</Button>
                </form>
            </Modal>

            {/* ── Add Education ── */}
            <Modal isOpen={eduOpen} onClose={() => setEduOpen(false)} title="Add Education" maxWidth="480px">
                <form onSubmit={addEducation} className="flex flex-col gap-0">
                    <InlineField label="School / University *">
                        <input className="input-glass" value={eduForm.school} onChange={e => setEduForm(p => ({ ...p, school: e.target.value }))} placeholder="e.g. SRM College, Madurai" required />
                    </InlineField>
                    <InlineField label="Degree *">
                        <input className="input-glass" value={eduForm.degree} onChange={e => setEduForm(p => ({ ...p, degree: e.target.value }))} placeholder="e.g. B.E in CSE (Cyber Security)" required />
                    </InlineField>
                    <InlineField label="Year">
                        <input className="input-glass" value={eduForm.year} onChange={e => setEduForm(p => ({ ...p, year: e.target.value }))} placeholder="e.g. 2022 – 2026" />
                    </InlineField>
                    <Button variant="primary" type="submit">Add Education</Button>
                </form>
            </Modal>

            {/* ── Add Certification ── */}
            <Modal isOpen={certOpen} onClose={() => setCertOpen(false)} title="Add Certification" maxWidth="480px">
                <form onSubmit={addCertification} className="flex flex-col gap-0">
                    <InlineField label="Certification Name *">
                        <input className="input-glass" value={certForm.name} onChange={e => setCertForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. OSCP, CEH, GCIH" required />
                    </InlineField>
                    <InlineField label="Issuing Organization *">
                        <input className="input-glass" value={certForm.issuer} onChange={e => setCertForm(p => ({ ...p, issuer: e.target.value }))} placeholder="e.g. Offensive Security" required />
                    </InlineField>
                    <InlineField label="Year">
                        <input className="input-glass" value={certForm.year} onChange={e => setCertForm(p => ({ ...p, year: e.target.value }))} placeholder="e.g. 2025" />
                    </InlineField>
                    <Button variant="primary" type="submit">Add Certification</Button>
                </form>
            </Modal>

            {/* ── Manage Skills ── */}
            <Modal isOpen={skillsOpen} onClose={() => setSkillsOpen(false)} title="Manage Skills" maxWidth="420px">
                <div className="flex gap-2 mb-4">
                    <input className="input-glass flex-1" value={newSkill} onChange={e => setNewSkill(e.target.value)}
                        placeholder="Type a skill..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} />
                    <Button variant="primary" className="!text-[0.65rem] !py-2 shrink-0" onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                        <motion.div key={skill} layout className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.20)' }}>
                            <span className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.70)]">{skill}</span>
                            <button onClick={() => removeSkill(skill)} className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors ml-0.5">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </motion.div>
                    ))}
                </div>
                {skills.length === 0 && <p className="font-sans text-[0.72rem] text-[rgba(255,255,255,0.25)] text-center py-4">No skills yet. Add one above!</p>}
            </Modal>

            {/* ── Manage Links ── */}
            <Modal isOpen={linksOpen} onClose={() => setLinksOpen(false)} title="Manage Links" maxWidth="420px">
                <div className="flex gap-2 mb-4">
                    <input className="input-glass flex-1" value={newLinkKey} onChange={e => setNewLinkKey(e.target.value)} placeholder="Label (e.g. GitHub)" />
                    <input className="input-glass flex-1" value={newLinkVal} onChange={e => setNewLinkVal(e.target.value)} placeholder="URL"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink() } }} />
                    <Button variant="primary" className="!text-[0.65rem] !py-2 shrink-0" onClick={addLink}>Add</Button>
                </div>
                <div className="flex flex-col gap-2">
                    {Object.entries(links).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <span className="font-sans text-[0.68rem] text-[rgba(255,255,255,0.5)] flex-1 truncate">{key}: {value}</span>
                            <button onClick={() => removeLink(key)} className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                {Object.keys(links).length === 0 && <p className="font-sans text-[0.72rem] text-[rgba(255,255,255,0.25)] text-center py-4">No links yet.</p>}
            </Modal>
        </div>
    )
}
