import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const tabs = [
    {
        to: '/network',
        label: 'Network',
        icon: (active) => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#a78bfa' : 'rgba(255,255,255,0.4)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        to: '/feed',
        label: 'Feed',
        icon: (active) => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#a78bfa' : 'rgba(255,255,255,0.4)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
            </svg>
        ),
    },
    {
        to: '/messages',
        label: 'Messages',
        icon: (active) => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#a78bfa' : 'rgba(255,255,255,0.4)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        to: '/profile',
        label: 'Profile',
        icon: (active) => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#a78bfa' : 'rgba(255,255,255,0.4)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
]

export default function MobileBottomNav() {
    const location = useLocation()

    const isActive = (to) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to))

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-[900] md:hidden"
            style={{
                background: 'rgba(10,10,18,0.92)',
                backdropFilter: 'blur(40px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
                {tabs.map((tab) => {
                    const active = isActive(tab.to)
                    return (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all"
                            style={{ textDecoration: 'none' }}
                        >
                            {/* Active background glow */}
                            {active && (
                                <motion.div
                                    layoutId="mobile-bottom-active"
                                    className="absolute inset-x-2 top-1 bottom-1 rounded-xl"
                                    style={{
                                        background: 'rgba(139,92,246,0.08)',
                                        border: '1px solid rgba(139,92,246,0.12)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative z-10">
                                {tab.icon(active)}
                            </div>

                            {/* Label */}
                            <span
                                className="relative z-10 text-[0.55rem] font-medium tracking-wider uppercase"
                                style={{
                                    color: active ? '#c4b5fd' : 'rgba(255,255,255,0.35)',
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                {tab.label}
                            </span>

                            {/* Active dot indicator */}
                            {active && (
                                <motion.div
                                    layoutId="mobile-bottom-dot"
                                    className="absolute -top-0.5 w-1 h-1 rounded-full"
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}
