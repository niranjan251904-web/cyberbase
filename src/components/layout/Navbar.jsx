import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { db } from '../../firebase'
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore'
import Button from '../ui/Button'

const links = [
    { to: '/', label: 'Home' },
    { to: '/network', label: 'Network' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/events', label: 'Events' },
    { to: '/teams', label: 'Teams' },
    { to: '/leaderboard', label: 'Board' },
    { to: '/feed', label: 'Feed' },
    { to: '/messages', label: 'Messages' },
    { to: '/profile', label: 'Profile' },
]

const mobileMenuVariants = {
    hidden: { opacity: 0, scale: 0.92, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.15 } },
}

const glassSpring = {
    type: 'spring',
    stiffness: 380,
    damping: 32,
    mass: 0.8,
}

const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.92, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.12 } },
}

/* ─── SVG Icons ─── */
const SearchIcon = ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const statusColors = { online: '#4ade80', away: '#facc15', offline: '#6b7280' }

/* ─── Click outside hook ─── */
function useClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (e) => {
            if (!ref.current || ref.current.contains(e.target)) return
            handler()
        }
        document.addEventListener('mousedown', listener)
        document.addEventListener('touchstart', listener)
        return () => {
            document.removeEventListener('mousedown', listener)
            document.removeEventListener('touchstart', listener)
        }
    }, [ref, handler])
}

const panelStyle = {
    background: 'rgba(14,14,22,0.92)',
    backdropFilter: 'blur(40px) saturate(1.5)',
    WebkitBackdropFilter: 'blur(40px) saturate(1.5)',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
}

export default function Navbar() {
    const { user, openAuth, logout } = useAuth()
    const { addToast } = useApp()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [sentRequests, setSentRequests] = useState(new Set())
    const location = useLocation()
    const navigate = useNavigate()

    const searchRef = useRef(null)
    const searchInputRef = useRef(null)
    const debounceRef = useRef(null)

    useClickOutside(searchRef, () => setSearchOpen(false))

    const closeMobile = () => setMobileOpen(false)
    const isActive = (to) =>
        to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

    // Load sent requests from Firestore on mount
    useEffect(() => {
        if (!user?.uid) return
        const loadSentRequests = async () => {
            try {
                const q = query(collection(db, 'friendRequests'), where('fromUid', '==', user.uid))
                const snap = await getDocs(q)
                const ids = new Set(snap.docs.map(d => d.data().toUid))
                setSentRequests(ids)
            } catch { /* ignore */ }
        }
        loadSentRequests()
    }, [user?.uid])

    // Debounced Firestore search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }

        debounceRef.current = setTimeout(async () => {
            setSearchLoading(true)
            try {
                const snap = await getDocs(collection(db, 'users'))
                const q = searchQuery.toLowerCase()
                const results = snap.docs
                    .map(d => ({ _id: d.id, ...d.data() }))
                    .filter(u =>
                        u.uid !== user?.uid && (
                            u.name?.toLowerCase().includes(q) ||
                            u.email?.toLowerCase().includes(q) ||
                            u.headline?.toLowerCase().includes(q)
                        )
                    )
                setSearchResults(results)
            } catch (err) {
                console.error('Search error:', err)
                setSearchResults([])
            }
            setSearchLoading(false)
        }, 300)

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [searchQuery, user?.uid])

    // Send friend request
    const sendFriendRequest = async (targetUser, e) => {
        e.stopPropagation()
        e.preventDefault()
        const targetUid = targetUser.uid || targetUser._id
        if (!user?.uid) { addToast('Please log in first'); return }
        if (!targetUid) { addToast('Cannot identify user'); return }
        if (sentRequests.has(targetUid)) { addToast('Request already sent'); return }

        const requestData = {
            fromUid: user.uid,
            fromName: user.name || '',
            fromInitials: user.initials || '',
            fromEmail: user.email || '',
            fromHeadline: user.headline || 'Member',
            toUid: targetUid,
            toName: targetUser.name || '',
            toEmail: targetUser.email || '',
            status: 'pending',
            createdAt: new Date().toISOString(),
        }

        try {
            const colRef = collection(db, 'friendRequests')
            await addDoc(colRef, requestData)
            setSentRequests(prev => new Set([...prev, targetUid]))
            addToast(`Connection request sent to ${targetUser.name}!`)
        } catch (err) {
            console.error('Friend request error:', err.code, err.message, err)
            addToast(`Error: ${err.code || err.message || 'Unknown error'}`)
        }
    }

    useEffect(() => {
        if (searchOpen && searchInputRef.current) searchInputRef.current.focus()
    }, [searchOpen])

    /* Close search on route change */
    useEffect(() => {
        setSearchOpen(false)
        setSearchQuery('')
    }, [location.pathname])

    // Render a search result row
    const renderResult = (member) => {
        const memberUid = member.uid || member._id
        return (
            <div
                key={memberUid}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
            >
                <button
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); navigate(`/member/${member.id || memberUid}`) }}
                >
                    <div className="relative">
                        {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.55rem] font-semibold text-white"
                                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.4))', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {member.initials || member.name?.split(' ').map(n => n[0]).join('') || '?'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[0.72rem] text-white font-medium truncate">{member.name}</p>
                        <p className="text-[0.6rem] text-[rgba(255,255,255,0.30)] truncate" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {member.headline || member.email}
                        </p>
                    </div>
                </button>
                {/* Connect / Sent button */}
                {user?.uid && memberUid !== user.uid && (
                    <button
                        onClick={(e) => sendFriendRequest(member, e)}
                        disabled={sentRequests.has(memberUid)}
                        className="shrink-0 px-3 py-1 rounded-full text-[0.55rem] font-semibold tracking-wider uppercase transition-all"
                        style={{
                            background: sentRequests.has(memberUid)
                                ? 'rgba(255,255,255,0.05)'
                                : 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: sentRequests.has(memberUid) ? 'rgba(255,255,255,0.30)' : '#fff',
                            border: sentRequests.has(memberUid) ? '1px solid rgba(255,255,255,0.08)' : 'none',
                        }}
                    >
                        {sentRequests.has(memberUid) ? 'Sent ✓' : 'Connect'}
                    </button>
                )}
            </div>
        )
    }

    return (
        <>
            {/* ─── Desktop Dynamic Island ─── */}
            <nav
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[900] rounded-full px-2 hidden md:block"
                style={{
                    background: 'rgba(200,200,210,0.08)',
                    backdropFilter: 'blur(40px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
            >
                <div className="flex items-center gap-1 h-12 px-4">
                    <NavLink
                        to="/"
                        className="text-lg text-white italic tracking-tight mr-3"
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    >
                        CyberBase
                    </NavLink>

                    {/* ─── Inline Search Bar ─── */}
                    <div className="relative" ref={searchRef}>
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-text transition-all duration-300 mr-2"
                            style={{
                                background: searchOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                                border: searchOpen ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                boxShadow: searchOpen ? '0 0 16px rgba(139,92,246,0.1)' : 'none',
                                width: searchOpen ? 220 : 160,
                            }}
                            onClick={() => setSearchOpen(true)}
                        >
                            <SearchIcon size={12} color={searchOpen ? 'rgba(168,85,247,0.8)' : 'rgba(255,255,255,0.3)'} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search users…"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true) }}
                                onFocus={() => setSearchOpen(true)}
                                className="flex-1 bg-transparent text-white text-[0.62rem] tracking-wide placeholder-[rgba(255,255,255,0.25)] outline-none"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            />
                            {searchQuery && (
                                <button onClick={(e) => { e.stopPropagation(); setSearchQuery('') }} className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors">
                                    <CloseIcon />
                                </button>
                            )}
                        </div>

                        {/* Search dropdown */}
                        <AnimatePresence>
                            {searchOpen && searchQuery.trim() !== '' && (
                                <motion.div
                                    className="absolute top-10 left-0 w-80 rounded-2xl overflow-hidden"
                                    style={panelStyle}
                                    variants={dropdownVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                                        {searchLoading ? (
                                            <div className="px-4 py-8 text-center">
                                                <p className="text-[0.7rem] text-[rgba(255,255,255,0.25)]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                                    Searching…
                                                </p>
                                            </div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <p className="text-[0.7rem] text-[rgba(255,255,255,0.25)]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                                    No users found for "{searchQuery}"
                                                </p>
                                            </div>
                                        ) : (
                                            searchResults.map(renderResult)
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ─── Notification Bell ─── */}
                    <NavLink
                        to="/notifications"
                        className="relative w-8 h-8 flex items-center justify-center rounded-full transition-all mr-1"
                        style={{
                            background: location.pathname === '/notifications' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: location.pathname === '/notifications' ? 'white' : 'rgba(255,255,255,0.4)',
                        }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[0.45rem] font-bold flex items-center justify-center text-white"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                        >
                            4
                        </span>
                    </NavLink>

                    {/* ─── Divider ─── */}
                    <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

                    {/* Nav links */}
                    <LayoutGroup>
                        <div className="flex items-center gap-0.5">
                            {links.map((link) => {
                                const active = isActive(link.to)
                                return (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        className="relative px-3 py-1.5 font-sans text-[0.65rem] tracking-wider uppercase transition-colors duration-200 rounded-full"
                                        style={{ color: active ? 'rgba(255,255,255,1)' : 'rgba(247,247,251,0.45)' }}
                                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'rgba(247,247,251,0.70)' }}
                                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(247,247,251,0.45)' }}
                                    >
                                        {active && (
                                            <motion.span
                                                layoutId="navbar-glass-pill"
                                                className="absolute inset-0 rounded-full"
                                                style={{
                                                    background: 'rgba(255,255,255,0.10)',
                                                    backdropFilter: 'blur(15px)',
                                                    WebkitBackdropFilter: 'blur(15px)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    boxShadow: '0 0 12px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
                                                }}
                                                transition={glassSpring}
                                            />
                                        )}
                                        <span className="relative z-10">{link.label}</span>
                                    </NavLink>
                                )
                            })}
                        </div>
                    </LayoutGroup>

                    {/* Auth buttons */}
                    <div className="flex items-center gap-2 ml-3">
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

            {/* ─── Mobile Navbar ─── */}
            <nav
                className="fixed top-3 left-3 right-3 z-[900] rounded-2xl px-4 md:hidden"
                style={{
                    background: 'rgba(200,200,210,0.08)',
                    backdropFilter: 'blur(40px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
            >
                <div className="flex items-center justify-between h-12">
                    <NavLink to="/" className="text-lg text-white italic tracking-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }} onClick={closeMobile}>
                        CyberBase
                    </NavLink>

                    <div className="flex items-center gap-1.5">
                        {/* Mobile search button */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-[rgba(247,247,251,0.50)] hover:text-white"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <SearchIcon />
                        </button>

                        {!user && (
                            <Button variant="primary" onClick={() => openAuth('signup')} className="!py-1 !px-3 !text-[0.55rem] !rounded-full">Sign Up</Button>
                        )}

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-full transition-colors"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            <motion.span className="block w-4 h-px bg-white rounded-full" animate={mobileOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
                            <motion.span className="block w-4 h-px bg-white rounded-full" animate={mobileOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
                        </button>
                    </div>
                </div>

                {/* Mobile search dropdown */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            className="px-1 pb-3"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <SearchIcon size={14} color="rgba(168,85,247,0.6)" />
                                <input
                                    type="text"
                                    placeholder="Search users…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="flex-1 bg-transparent text-white text-[0.75rem] placeholder-[rgba(255,255,255,0.25)] outline-none"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="text-[rgba(255,255,255,0.3)] hover:text-white">
                                        <CloseIcon />
                                    </button>
                                )}
                            </div>
                            {/* Mobile search results */}
                            {searchQuery.trim() && (
                                <div className="mt-2 rounded-xl overflow-hidden" style={{ background: 'rgba(14,14,22,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="max-h-60 overflow-y-auto">
                                        {searchLoading ? (
                                            <div className="px-4 py-6 text-center">
                                                <p className="text-[0.7rem] text-[rgba(255,255,255,0.25)]">Searching…</p>
                                            </div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="px-4 py-6 text-center">
                                                <p className="text-[0.7rem] text-[rgba(255,255,255,0.25)]">No users found</p>
                                            </div>
                                        ) : (
                                            searchResults.map(renderResult)
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ─── Mobile Menu Dropdown ─── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div className="fixed inset-0 z-[899] bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeMobile} />
                        <motion.div
                            className="fixed top-[4.5rem] left-3 right-3 z-[901] rounded-2xl p-4"
                            style={{ background: 'rgba(16,16,24,0.95)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.1)' }}
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <LayoutGroup id="mobile-nav">
                                <div className="flex flex-col gap-1 mb-4">
                                    {links.map((link) => {
                                        const active = isActive(link.to)
                                        return (
                                            <NavLink
                                                key={link.to}
                                                to={link.to}
                                                onClick={closeMobile}
                                                className="relative px-4 py-3 font-sans text-[0.75rem] tracking-wider uppercase rounded-xl transition-colors"
                                                style={{ color: active ? 'rgba(255,255,255,1)' : 'rgba(247,247,251,0.45)' }}
                                            >
                                                {active && (
                                                    <motion.span layoutId="mobile-glass-pill" className="absolute inset-0 rounded-xl"
                                                        style={{ background: 'rgba(255,255,255,0.08)' }} transition={glassSpring} />
                                                )}
                                                <span className="relative z-10">{link.label}</span>
                                            </NavLink>
                                        )
                                    })}
                                </div>
                            </LayoutGroup>
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
