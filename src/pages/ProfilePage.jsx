import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { members } from '../data/members'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import { useCounter } from '../hooks/useCounter'
import { useScrollReveal } from '../hooks/useScrollReveal'

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

export default function ProfilePage() {
    const member = members[0]
    const avatarRef = useRef(null)
    const timelineRef = useRef(null)
    const sectionRef = useScrollReveal()

    useEffect(() => {
        if (avatarRef.current) {
            gsap.from(avatarRef.current, { scale: 0.85, opacity: 0, duration: 0.7, ease: 'back.out(1.4)', delay: 0.2 })
        }
    }, [])

    useEffect(() => {
        if (timelineRef.current) {
            const line = timelineRef.current.querySelector('.timeline-line')
            if (line) {
                gsap.fromTo(line,
                    { scaleY: 0 },
                    {
                        scaleY: 1, duration: 0.8, ease: 'power3.inOut',
                        scrollTrigger: { trigger: line, start: 'top 88%' },
                    }
                )
            }
            const items = timelineRef.current.querySelectorAll('.timeline-item')
            items.forEach((item, i) => {
                gsap.fromTo(item,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1, x: 0, duration: 0.6, delay: i * 0.1, ease: 'power2.out',
                        scrollTrigger: { trigger: item, start: 'top 88%' },
                    }
                )
            })
        }
    }, [])

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-[800px] mx-auto" ref={sectionRef}>
                {/* Header Card */}
                <GlassCard className="!p-0 overflow-hidden mb-8" data-reveal>
                    <div className="h-40 relative" style={{ background: 'linear-gradient(135deg, rgba(247,247,251,0.25) 0%, transparent 100%)' }}>
                        <div ref={avatarRef} className="absolute -bottom-11 left-6">
                            <Avatar initials={member.initials} size={88} className="border-4 border-[#080810]" />
                        </div>
                    </div>
                    <div className="pt-14 pb-6 px-6">
                        <h1 className="font-display text-2xl text-white mb-1">{member.name}</h1>
                        <p className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.50)] mb-1">{member.headline}</p>
                        <p className="font-sans text-[0.68rem] text-[rgba(247,247,251,0.30)]">📍 {member.location}</p>
                    </div>
                </GlassCard>

                {/* Stats */}
                <div data-reveal className="flex items-center divide-x divide-[rgba(247,247,251,0.06)] mb-8 glass p-6">
                    <ProfileStat value={member.stats.points} label="Points" />
                    <ProfileStat value={member.stats.rank} label="Rank" />
                    <ProfileStat value={member.stats.events} label="Events" />
                    <ProfileStat value={member.stats.challenges} label="Challenges" />
                </div>

                {/* About */}
                <GlassCard className="mb-6" data-reveal>
                    <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">About</h3>
                    <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.50)] leading-relaxed">{member.bio}</p>
                </GlassCard>

                {/* Skills */}
                <GlassCard className="mb-6" data-reveal>
                    <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {member.skills.map(skill => <Badge key={skill} variant="violet">{skill}</Badge>)}
                    </div>
                </GlassCard>

                {/* Links */}
                <GlassCard className="mb-6" data-reveal>
                    <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Links</h3>
                    <div className="flex flex-col gap-2">
                        {Object.entries(member.links).map(([key, value]) => (
                            <a key={key} href="#" className="font-sans text-[0.75rem] text-violet hover:underline">
                                {key}: {value}
                            </a>
                        ))}
                    </div>
                </GlassCard>

                {/* Events Timeline */}
                <GlassCard className="mb-6" data-reveal>
                    <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-4">Events Timeline</h3>
                    <div ref={timelineRef} className="relative pl-6">
                        <div className="timeline-line" />
                        {member.events.map((event, i) => (
                            <div key={i} className="timeline-item relative mb-4 last:mb-0 opacity-0">
                                <div className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-[rgba(247,247,251,0.25)] border border-violet" />
                                <p className="font-sans text-[0.75rem] text-white">{event.name}</p>
                                <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)]">{event.role} · {event.result}</p>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Badges */}
                <GlassCard className="mb-6" data-reveal>
                    <h3 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-4">Badges</h3>
                    <motion.div
                        className="grid grid-cols-3 sm:grid-cols-5 gap-3"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {member.badges.map(badge => (
                            <motion.div key={badge} variants={itemVariants}>
                                <div className="glass !rounded-xl p-3 text-center">
                                    <div className="text-xl mb-1">🛡️</div>
                                    <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.50)]">{badge}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </GlassCard>
            </div>
        </div>
    )
}
