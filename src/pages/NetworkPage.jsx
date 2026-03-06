import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../firebase'
import { collection, getDocs, doc, updateDoc, addDoc, query, where, deleteDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
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

const statusColors = { online: '#4ade80', away: '#facc15', offline: '#6b7280' }

export default function NetworkPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [requests, setRequests] = useState([])
    const [connections, setConnections] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const { addToast } = useApp()
    const sectionRef = useScrollReveal()

    // Fetch friend requests where current user is receiver + connections + all users for suggestions
    useEffect(() => {
        if (!user?.uid) return
        const fetchData = async () => {
            setLoading(true)
            try {
                // 1. Incoming friend requests (pending, to me)
                const reqQuery = query(
                    collection(db, 'friendRequests'),
                    where('toUid', '==', user.uid),
                    where('status', '==', 'pending')
                )
                const reqSnap = await getDocs(reqQuery)
                const incomingRequests = reqSnap.docs.map(d => ({ _id: d.id, ...d.data() }))
                setRequests(incomingRequests)

                // 2. My connections (accepted requests — both directions)
                const connQuery1 = query(
                    collection(db, 'friendRequests'),
                    where('fromUid', '==', user.uid),
                    where('status', '==', 'accepted')
                )
                const connQuery2 = query(
                    collection(db, 'friendRequests'),
                    where('toUid', '==', user.uid),
                    where('status', '==', 'accepted')
                )
                const [connSnap1, connSnap2] = await Promise.all([getDocs(connQuery1), getDocs(connQuery2)])

                const myConnections = []
                connSnap1.docs.forEach(d => {
                    const data = d.data()
                    myConnections.push({
                        _id: d.id,
                        uid: data.toUid,
                        name: data.toName,
                        email: data.toEmail,
                        initials: data.toName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
                        headline: 'Connected',
                        connectedSince: data.acceptedAt || data.createdAt,
                    })
                })
                connSnap2.docs.forEach(d => {
                    const data = d.data()
                    myConnections.push({
                        _id: d.id,
                        uid: data.fromUid,
                        name: data.fromName,
                        email: data.fromEmail,
                        initials: data.fromInitials || data.fromName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
                        headline: data.fromHeadline || 'Connected',
                        connectedSince: data.acceptedAt || data.createdAt,
                    })
                })
                setConnections(myConnections)

                // 3. All users (for suggestions) — exclude self and already connected
                const usersSnap = await getDocs(collection(db, 'users'))
                const connectedUids = new Set(myConnections.map(c => c.uid))
                const pendingUids = new Set(incomingRequests.map(r => r.fromUid))

                // Also get sent requests to know who we already requested
                const sentQuery = query(
                    collection(db, 'friendRequests'),
                    where('fromUid', '==', user.uid)
                )
                const sentSnap = await getDocs(sentQuery)
                const sentUids = new Set(sentSnap.docs.map(d => d.data().toUid))

                const suggestions = usersSnap.docs
                    .map(d => ({ _id: d.id, ...d.data() }))
                    .filter(u => {
                        const uid = u.uid || u._id
                        return uid !== user.uid && !connectedUids.has(uid) && !pendingUids.has(uid) && !sentUids.has(uid)
                    })
                    .slice(0, 8)
                setAllUsers(suggestions)
            } catch (err) {
                console.error('NetworkPage fetch error:', err)
            }
            setLoading(false)
        }
        fetchData()
    }, [user?.uid])

    // Accept request → update status to 'accepted'
    const acceptRequest = async (req) => {
        try {
            await updateDoc(doc(db, 'friendRequests', req._id), {
                status: 'accepted',
                acceptedAt: new Date().toISOString(),
            })
            setRequests(prev => prev.filter(r => r._id !== req._id))
            // Add to local connections list
            setConnections(prev => [...prev, {
                _id: req._id,
                uid: req.fromUid,
                name: req.fromName,
                initials: req.fromInitials || req.fromName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
                headline: req.fromHeadline || 'Member',
                connectedSince: new Date().toISOString(),
            }])
            addToast(`Connected with ${req.fromName}!`)
        } catch (err) {
            console.error('Accept error:', err)
            addToast(`Error: ${err.code || err.message}`)
        }
    }

    // Decline request → update status to 'declined'
    const declineRequest = async (req) => {
        try {
            await updateDoc(doc(db, 'friendRequests', req._id), {
                status: 'declined',
                declinedAt: new Date().toISOString(),
            })
            setRequests(prev => prev.filter(r => r._id !== req._id))
            addToast('Request declined')
        } catch (err) {
            console.error('Decline error:', err)
            addToast(`Error: ${err.code || err.message}`)
        }
    }

    // Send connect from suggestions
    const sendConnect = async (targetUser) => {
        const targetUid = targetUser.uid || targetUser._id
        if (!user?.uid || !targetUid) return
        try {
            await addDoc(collection(db, 'friendRequests'), {
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
            })
            // Remove from suggestions
            setAllUsers(prev => prev.filter(u => (u.uid || u._id) !== targetUid))
            addToast(`Request sent to ${targetUser.name}!`)
        } catch (err) {
            console.error('Send connect error:', err)
            addToast(`Error: ${err.code || err.message}`)
        }
    }

    const filteredConnections = search
        ? connections.filter(
            (c) =>
                c.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.headline?.toLowerCase().includes(search.toLowerCase())
        )
        : connections

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto" ref={sectionRef}>
                <div data-reveal className="section-line mb-4" />
                <div data-reveal className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-white">My Network</h1>
                        <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.35)] mt-1">
                            {connections.length} connection{connections.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="auth-spinner mx-auto mb-3" />
                        <p className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.30)]">Loading network…</p>
                    </div>
                )}

                {/* ─── Pending Requests ─── */}
                <AnimatePresence>
                    {requests.length > 0 && (
                        <motion.div
                            data-reveal
                            className="mb-10"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em]">
                                    Pending Requests
                                </h2>
                                <span
                                    className="text-[0.55rem] px-2 py-0.5 rounded-full text-white font-medium"
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                                >
                                    {requests.length}
                                </span>
                            </div>

                            <motion.div
                                className="grid md:grid-cols-3 gap-4"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <AnimatePresence>
                                    {requests.map((req) => (
                                        <motion.div
                                            key={req._id}
                                            variants={itemVariants}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            layout
                                        >
                                            <GlassCard>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Avatar initials={req.fromInitials || req.fromName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'} size={48} />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-display text-[1rem] text-white truncate">{req.fromName}</h3>
                                                        <p className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.40)] truncate">{req.fromHeadline || 'Member'}</p>
                                                    </div>
                                                </div>
                                                <p className="font-sans text-[0.62rem] text-[rgba(247,247,251,0.30)] mb-3">
                                                    {req.fromEmail} · {new Date(req.createdAt).toLocaleDateString()}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button variant="primary" className="!text-[0.62rem] !py-1.5 flex-1" onClick={() => acceptRequest(req)}>
                                                        Accept
                                                    </Button>
                                                    <Button variant="glass" className="!text-[0.62rem] !py-1.5 flex-1" onClick={() => declineRequest(req)}>
                                                        Decline
                                                    </Button>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── People You May Know ─── */}
                {allUsers.length > 0 && (
                    <div data-reveal className="mb-10">
                        <h2 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-4">
                            People You May Know
                        </h2>
                        <motion.div
                            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence>
                                {allUsers.map((person) => {
                                    const personUid = person.uid || person._id
                                    return (
                                        <motion.div
                                            key={personUid}
                                            variants={itemVariants}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            layout
                                        >
                                            <GlassCard className="flex flex-col items-center text-center relative">
                                                {/* Dismiss */}
                                                <button
                                                    onClick={() => setAllUsers(prev => prev.filter(u => (u.uid || u._id) !== personUid))}
                                                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-[rgba(255,255,255,0.2)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all"
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>

                                                <div className="flex flex-col items-center">
                                                    <Avatar initials={person.initials || person.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'} size={56} className="mb-3" />
                                                    <h3 className="font-display text-[0.95rem] text-white mb-0.5">{person.name}</h3>
                                                    <p className="font-sans text-[0.62rem] text-[rgba(247,247,251,0.40)] mb-2 line-clamp-2">{person.headline || person.email}</p>
                                                </div>
                                                {person.skills && person.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                                                        {person.skills.slice(0, 3).map((s) => (
                                                            <Badge key={s} variant="violet">{s}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                <Button variant="glass" className="!text-[0.62rem] !py-1.5 w-full" onClick={() => sendConnect(person)}>
                                                    + Connect
                                                </Button>
                                            </GlassCard>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}

                {/* ─── My Connections ─── */}
                <div data-reveal>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-sans text-[0.65rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em]">
                            My Connections ({connections.length})
                        </h2>
                        {connections.length > 0 && (
                            <input
                                className="input-glass !w-auto"
                                style={{ maxWidth: 220 }}
                                placeholder="Search connections…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        )}
                    </div>

                    <GlassCard className="!p-0 overflow-hidden">
                        {filteredConnections.length > 0 ? filteredConnections.map((conn) => (
                            <motion.div
                                key={conn._id || conn.uid}
                                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 border-b border-[rgba(247,247,251,0.04)] last:border-0 transition-colors"
                                whileHover={{ backgroundColor: 'rgba(247,247,251,0.04)' }}
                            >
                                <div className="relative shrink-0">
                                    <Avatar initials={conn.initials || '??'} size={40} />
                                    <span
                                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080810]"
                                        style={{ background: statusColors.online }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-sans text-[0.75rem] text-white truncate">{conn.name}</p>
                                    <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] truncate">{conn.headline}</p>
                                </div>
                                {conn.connectedSince && (
                                    <span className="hidden sm:block font-sans text-[0.55rem] text-[rgba(247,247,251,0.20)] shrink-0">
                                        Connected {new Date(conn.connectedSince).toLocaleDateString()}
                                    </span>
                                )}
                                <Button variant="glass" className="!text-[0.6rem] !py-1 !px-3 shrink-0" onClick={() => navigate(`/messages?uid=${conn.uid}`)}>Message</Button>
                            </motion.div>
                        )) : (
                            <div className="text-center py-12">
                                <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.30)]">
                                    {connections.length === 0 ? 'No connections yet. Start connecting!' : 'No connections found.'}
                                </p>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
