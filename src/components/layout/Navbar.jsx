import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

const links = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/teams', label: 'Teams' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/feed', label: 'Feed' },
    { to: '/profile', label: 'Profile' },
]

const mobileMenuVariants = {
    hidden: { opacity: 0, scale: 0.92, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.15 } },
}

export default function Navbar() {
    const { user, openAuth, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

    const closeMobile = () => setMobileOpen(false)

    return (
        <>
            {/* Desktop Dynamic Island */}
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[900] rounded-full px-2 hidden md:block" style={{ background: 'rgba(200,200,210,0.08)', backdropFilter: 'blur(40px) saturate(1.6)', WebkitBackdropFilter: 'blur(40px) saturate(1.6)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-1 h-12 px-4">
                    <NavLink to="/" className="text-lg text-white italic tracking-tight mr-4" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                        CyberBase
                    </NavLink>

                    <div className="flex items-center gap-0.5">
                        {links.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `relative px-3 py-1.5 font-sans text-[0.65rem] tracking-wider uppercase transition-all rounded-full ${isActive ? 'text-white bg-[rgba(255,255,255,0.1)]' : 'text-[rgba(247,247,251,0.45)] hover:text-[rgba(247,247,251,0.70)]'}`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        {user ? (
                            <div className="flex items-center gap-2">
                                <span className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.40)]">{user.name}</span>
                                <Button variant="glass" onClick={logout} className="!py-1 !px-3 !text-[0.6rem] !rounded-full">Logout</Button>
                            </div>
                        ) : (
                            <>
                                <Button variant="glass" onClick={() => openAuth('login')} className="!py-1 !px-3 !text-[0.6rem] !rounded-full !border-[rgba(255,255,255,0.1)]">Login</Button>
                                <Button variant="primary" onClick={() => openAuth('signup')} className="!py-1 !px-3 !text-[0.6rem] !rounded-full">Sign Up</Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className="fixed top-3 left-3 right-3 z-[900] rounded-2xl px-4 md:hidden" style={{ background: 'rgba(200,200,210,0.08)', backdropFilter: 'blur(40px) saturate(1.6)', WebkitBackdropFilter: 'blur(40px) saturate(1.6)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between h-12">
                    <NavLink to="/" className="text-lg text-white italic tracking-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }} onClick={closeMobile}>
                        CyberBase
                    </NavLink>

                    <div className="flex items-center gap-2">
                        {!user && (
                            <Button variant="primary" onClick={() => openAuth('signup')} className="!py-1 !px-3 !text-[0.55rem] !rounded-full">Sign Up</Button>
                        )}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-full transition-colors"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            <motion.span
                                className="block w-4 h-px bg-white rounded-full"
                                animate={mobileOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
                                transition={{ duration: 0.2 }}
                            />
                            <motion.span
                                className="block w-4 h-px bg-white rounded-full"
                                animate={mobileOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
                                transition={{ duration: 0.2 }}
                            />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-[899] bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobile}
                        />
                        <motion.div
                            className="fixed top-[4.5rem] left-3 right-3 z-[901] rounded-2xl p-4"
                            style={{ background: 'rgba(16,16,24,0.95)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.1)' }}
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="flex flex-col gap-1 mb-4">
                                {links.map(link => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        onClick={closeMobile}
                                        className={({ isActive }) =>
                                            `px-4 py-3 font-sans text-[0.75rem] tracking-wider uppercase rounded-xl transition-all ${isActive ? 'text-white bg-[rgba(255,255,255,0.08)]' : 'text-[rgba(247,247,251,0.45)]'}`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                            <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 flex gap-2">
                                {user ? (
                                    <>
                                        <span className="font-sans text-[0.7rem] text-[rgba(247,247,251,0.40)] flex-1 flex items-center">{user.name}</span>
                                        <Button variant="glass" onClick={() => { logout(); closeMobile() }} className="!py-1.5 !px-4 !text-[0.65rem] !rounded-full">Logout</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="glass" onClick={() => { openAuth('login'); closeMobile() }} className="flex-1 !py-2 !text-[0.65rem] !rounded-xl">Login</Button>
                                        <Button variant="primary" onClick={() => { openAuth('signup'); closeMobile() }} className="flex-1 !py-2 !text-[0.65rem] !rounded-xl">Sign Up</Button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
