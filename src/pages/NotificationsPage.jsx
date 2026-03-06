import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { notifications as notifData } from '../data/notifications'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { useScrollReveal } from '../hooks/useScrollReveal'

const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'connection', label: 'Connections' },
    { id: 'post', label: 'Posts' },
    { id: 'event', label: 'Events' },
    { id: 'achievement', label: 'Achievements' },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(notifData)
    const [activeFilter, setActiveFilter] = useState('all')
    const sectionRef = useScrollReveal()

    const unreadCount = notifications.filter((n) => !n.read).length

    const filtered =
        activeFilter === 'all'
            ? notifications
            : notifications.filter((n) => n.type === activeFilter)

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const markRead = (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }

    const dismissNotif = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-3xl mx-auto" ref={sectionRef}>
                <div data-reveal className="section-line mb-4" />
                <div data-reveal className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-white">Notifications</h1>
                        {unreadCount > 0 && (
                            <span
                                className="text-[0.6rem] px-2.5 py-1 rounded-full text-white font-medium"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                            >
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="glass" className="!text-[0.62rem] !py-1.5" onClick={markAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Filter tabs */}
                <div data-reveal className="flex flex-wrap gap-1.5 mb-8">
                    {filterTabs.map((tab) => {
                        const count = tab.id === 'all'
                            ? notifications.length
                            : notifications.filter((n) => n.type === tab.id).length
                        const isActive = activeFilter === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFilter(tab.id)}
                                className="relative px-3.5 py-1.5 rounded-full font-sans text-[0.65rem] tracking-wider uppercase transition-all"
                                style={{
                                    color: isActive ? 'rgba(255,255,255,1)' : 'rgba(247,247,251,0.40)',
                                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    border: isActive ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
                                }}
                            >
                                {tab.label}
                                <span className="ml-1.5 opacity-40">{count}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Notification list */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    >
                        <GlassCard className="!p-0 overflow-hidden">
                            <AnimatePresence>
                                {filtered.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        variants={itemVariants}
                                        exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                                        layout
                                        className="flex items-start gap-3 px-5 py-4 border-b border-[rgba(247,247,251,0.04)] last:border-0 transition-colors cursor-pointer group"
                                        style={{
                                            background: notif.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                                        }}
                                        onClick={() => markRead(notif.id)}
                                        whileHover={{ backgroundColor: 'rgba(247,247,251,0.03)' }}
                                    >
                                        {/* Unread indicator */}
                                        <div className="w-2 pt-2 shrink-0">
                                            {!notif.read && (
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }}
                                                />
                                            )}
                                        </div>

                                        {/* Icon */}
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-[1.1rem] shrink-0"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                            }}
                                        >
                                            {notif.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-sans text-[0.78rem] leading-snug mb-0.5 ${notif.read ? 'text-[rgba(255,255,255,0.60)]' : 'text-white font-medium'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="font-sans text-[0.68rem] text-[rgba(247,247,251,0.30)] leading-relaxed line-clamp-1">
                                                {notif.description}
                                            </p>
                                            <p className="font-sans text-[0.55rem] text-[rgba(247,247,251,0.20)] mt-1">{notif.time}</p>
                                        </div>

                                        {/* Dismiss */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); dismissNotif(notif.id) }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-full text-[rgba(255,255,255,0.2)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] shrink-0 mt-1"
                                        >
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filtered.length === 0 && (
                                <div className="text-center py-16">
                                    <p className="text-[0.8rem] text-[rgba(247,247,251,0.25)]">No notifications</p>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
