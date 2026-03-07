import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { db } from '../firebase'
import { collection, getDocs, addDoc, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import { useScrollReveal } from '../hooks/useScrollReveal'

const statusColors = { online: '#4ade80', away: '#facc15', offline: '#6b7280' }

function getChatId(uid1, uid2) {
    return [uid1, uid2].sort().join('_')
}

export default function MessagesPage() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const targetUid = searchParams.get('uid')

    const [conversations, setConversations] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [messageInput, setMessageInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [allFriends, setAllFriends] = useState([]) // All accepted connections
    const [searchResults, setSearchResults] = useState([])
    const [showSearchResults, setShowSearchResults] = useState(false)

    const messagesEndRef = useRef(null)
    const searchRef = useRef(null)
    const sectionRef = useScrollReveal()

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Load conversations + friends list
    useEffect(() => {
        if (!user?.uid) return
        const loadData = async () => {
            setLoading(true)
            try {
                // 1. Load all accepted friends (connections)
                const fq1 = query(collection(db, 'friendRequests'), where('fromUid', '==', user.uid), where('status', '==', 'accepted'))
                const fq2 = query(collection(db, 'friendRequests'), where('toUid', '==', user.uid), where('status', '==', 'accepted'))
                const [fs1, fs2] = await Promise.all([getDocs(fq1), getDocs(fq2)])

                const friends = []
                for (const d of fs1.docs) {
                    const data = d.data()
                    let friendAvatar = null
                    try {
                        const uDoc = await getDoc(doc(db, 'users', data.toUid))
                        if (uDoc.exists()) friendAvatar = uDoc.data().avatar || null
                    } catch (e) { /* ignore */ }
                    friends.push({
                        uid: data.toUid,
                        name: data.toName || 'User',
                        initials: data.toName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
                        headline: 'Connection',
                        avatar: friendAvatar,
                    })
                }
                for (const d of fs2.docs) {
                    const data = d.data()
                    let friendAvatar = null
                    try {
                        const uDoc = await getDoc(doc(db, 'users', data.fromUid))
                        if (uDoc.exists()) friendAvatar = uDoc.data().avatar || null
                    } catch (e) { /* ignore */ }
                    friends.push({
                        uid: data.fromUid,
                        name: data.fromName || 'User',
                        initials: data.fromInitials || data.fromName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
                        headline: data.fromHeadline || 'Connection',
                        avatar: friendAvatar,
                    })
                }
                setAllFriends(friends)

                // 2. Load conversations from messages
                const q1 = query(collection(db, 'messages'), where('fromUid', '==', user.uid))
                const q2 = query(collection(db, 'messages'), where('toUid', '==', user.uid))
                const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])

                const allMsgs = [...snap1.docs.map(d => d.data()), ...snap2.docs.map(d => d.data())]
                    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

                const chatMap = {}
                for (const msg of allMsgs) {
                    const partnerUid = msg.fromUid === user.uid ? msg.toUid : msg.fromUid
                    const partnerName = msg.fromUid === user.uid ? msg.toName : msg.fromName
                    const partnerInitials = msg.fromUid === user.uid
                        ? (msg.toName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??')
                        : (msg.fromName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??')

                    if (!chatMap[partnerUid]) {
                        // Fetch avatar from Firestore
                        let partnerAvatar = null
                        try {
                            const uDoc = await getDoc(doc(db, 'users', partnerUid))
                            if (uDoc.exists()) partnerAvatar = uDoc.data().avatar || null
                        } catch (e) { /* ignore */ }
                        chatMap[partnerUid] = {
                            uid: partnerUid,
                            name: partnerName || 'Unknown',
                            initials: partnerInitials,
                            lastMessage: msg.text,
                            lastTime: msg.createdAt,
                            avatar: partnerAvatar,
                        }
                    }
                    if (msg.createdAt > chatMap[partnerUid].lastTime) {
                        chatMap[partnerUid].lastMessage = msg.text
                        chatMap[partnerUid].lastTime = msg.createdAt
                    }
                }

                setConversations(Object.values(chatMap).sort((a, b) => (b.lastTime || '').localeCompare(a.lastTime || '')))
            } catch (err) {
                console.error('Load data error:', err)
            }
            setLoading(false)
        }
        loadData()
    }, [user?.uid])

    // Auto-open chat if ?uid= in URL
    useEffect(() => {
        if (!targetUid || !user?.uid) return
        const loadTarget = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', targetUid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setActiveChat({
                        uid: targetUid,
                        name: data.name || 'User',
                        initials: data.initials || data.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
                        headline: data.headline || 'Member',
                        avatar: data.avatar || null,
                    })
                }
            } catch (err) {
                console.error('Load target error:', err)
            }
        }
        loadTarget()
    }, [targetUid, user?.uid])

    // Real-time listener for active chat
    useEffect(() => {
        if (!activeChat?.uid || !user?.uid) { setMessages([]); return }
        const chatId = getChatId(user.uid, activeChat.uid)
        const q = query(collection(db, 'messages'), where('chatId', '==', chatId))
        const unsub = onSnapshot(q, (snap) => {
            const msgs = snap.docs.map(d => d.data()).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
            setMessages(msgs)
        }, (err) => console.error('Messages listener error:', err))
        return () => unsub()
    }, [activeChat?.uid, user?.uid])

    // Search friends when typing in search bar
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            setShowSearchResults(false)
            return
        }
        const q = searchQuery.toLowerCase()
        // Search through friends list + existing conversations
        const friendMatches = allFriends.filter(f => f.name?.toLowerCase().includes(q))
        const convoMatches = conversations.filter(c => c.name?.toLowerCase().includes(q))

        // Merge, deduplicate by uid
        const seen = new Set()
        const results = []
            ;[...friendMatches, ...convoMatches].forEach(item => {
                if (!seen.has(item.uid)) {
                    seen.add(item.uid)
                    results.push(item)
                }
            })
        setSearchResults(results)
        setShowSearchResults(true)
    }, [searchQuery, allFriends, conversations])

    // Close search dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearchResults(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Send message
    const handleSend = async () => {
        if (!messageInput.trim() || !activeChat?.uid || !user?.uid) return
        const text = messageInput.trim()
        setMessageInput('')

        const chatId = getChatId(user.uid, activeChat.uid)
        const msgData = {
            chatId,
            fromUid: user.uid,
            fromName: user.name || 'Anonymous',
            toUid: activeChat.uid,
            toName: activeChat.name,
            text,
            createdAt: new Date().toISOString(),
        }

        try {
            await addDoc(collection(db, 'messages'), msgData)
            setConversations(prev => {
                const exists = prev.find(c => c.uid === activeChat.uid)
                if (exists) {
                    return prev.map(c => c.uid === activeChat.uid
                        ? { ...c, lastMessage: text, lastTime: msgData.createdAt }
                        : c
                    ).sort((a, b) => (b.lastTime || '').localeCompare(a.lastTime || ''))
                }
                return [{
                    uid: activeChat.uid,
                    name: activeChat.name,
                    initials: activeChat.initials,
                    lastMessage: text,
                    lastTime: msgData.createdAt,
                }, ...prev]
            })
        } catch (err) {
            console.error('Send error:', err)
        }
    }

    const openChat = (person) => {
        setActiveChat({
            uid: person.uid,
            name: person.name,
            initials: person.initials || person.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??',
            headline: person.headline || 'Member',
            avatar: person.avatar || null,
        })
        setSearchQuery('')
        setShowSearchResults(false)
    }

    const formatTime = (ts) => {
        if (!ts) return ''
        try {
            const d = new Date(ts), now = new Date(), diff = Math.floor((now - d) / 60000)
            if (diff < 1) return 'Just now'
            if (diff < 60) return `${diff}m ago`
            const hrs = Math.floor(diff / 60)
            if (hrs < 24) return `${hrs}h ago`
            return d.toLocaleDateString()
        } catch { return '' }
    }

    const formatMsgTime = (ts) => {
        if (!ts) return ''
        try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        catch { return '' }
    }

    // Filtered conversations for sidebar (when not searching)
    const sidebarList = showSearchResults ? searchResults : conversations

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto" ref={sectionRef}>
                <div data-reveal className="section-line mb-4" />
                <div data-reveal className="mb-10">
                    <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-white">Messages</h1>
                    <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.35)] mt-1">
                        Private conversations with your connections
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-220px)] min-h-[500px]">
                    {/* ─── Sidebar ─── */}
                    <div
                        data-reveal
                        className={`lg:w-[340px] shrink-0 flex flex-col overflow-hidden rounded-2xl lg:rounded-r-none ${activeChat ? 'hidden lg:flex' : 'flex'}`}
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRight: 'none' }}
                    >
                        {/* Search bar */}
                        <div className="p-4 border-b border-[rgba(255,255,255,0.06)]" ref={searchRef}>
                            <div className="relative">
                                <div
                                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search friends to message…"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => { if (searchQuery.trim()) setShowSearchResults(true) }}
                                        className="flex-1 bg-transparent text-white text-[0.75rem] placeholder-[rgba(255,255,255,0.2)] outline-none"
                                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                    />
                                    {searchQuery && (
                                        <button onClick={() => { setSearchQuery(''); setShowSearchResults(false) }} className="text-[rgba(255,255,255,0.3)] hover:text-white">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Search dropdown */}
                                {showSearchResults && searchQuery.trim() && (
                                    <div
                                        className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-50 max-h-[220px] overflow-y-auto"
                                        style={{ background: 'rgba(20,20,35,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
                                    >
                                        {searchResults.length === 0 ? (
                                            <div className="px-4 py-6 text-center">
                                                <p className="text-[0.68rem] text-[rgba(255,255,255,0.25)]">No friends found</p>
                                            </div>
                                        ) : (
                                            searchResults.map(person => (
                                                <button
                                                    key={person.uid}
                                                    onClick={() => openChat(person)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                                                >
                                                    {person.avatar ? (
                                                        <img src={person.avatar} alt={person.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                                    ) : (
                                                        <Avatar initials={person.initials || '??'} size={32} />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[0.72rem] text-white font-medium truncate">{person.name}</p>
                                                        <p className="text-[0.58rem] text-[rgba(255,255,255,0.25)] truncate">{person.headline || 'Connection'}</p>
                                                    </div>
                                                    <span className="text-[0.55rem] px-2 py-0.5 rounded-full text-[rgba(255,255,255,0.4)]"
                                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        Message
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Conversation list */}
                        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
                            {loading ? (
                                <div className="px-4 py-12 text-center">
                                    <div className="auth-spinner mx-auto mb-2" />
                                    <p className="text-[0.72rem] text-[rgba(255,255,255,0.2)]">Loading…</p>
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="px-4 py-12 text-center">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <p className="text-[0.72rem] text-[rgba(255,255,255,0.2)]">No conversations yet</p>
                                    <p className="text-[0.6rem] text-[rgba(255,255,255,0.12)] mt-1">Search for a friend above to start chatting</p>
                                </div>
                            ) : (
                                conversations.map((convo) => (
                                    <button
                                        key={convo.uid}
                                        onClick={() => openChat(convo)}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left border-b border-[rgba(255,255,255,0.03)]"
                                        style={{
                                            background: activeChat?.uid === convo.uid ? 'rgba(139,92,246,0.08)' : 'transparent',
                                            borderLeft: activeChat?.uid === convo.uid ? '2px solid rgba(139,92,246,0.6)' : '2px solid transparent',
                                        }}
                                    >
                                        <div className="relative shrink-0">
                                            {convo.avatar ? (
                                                <img src={convo.avatar} alt={convo.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <Avatar initials={convo.initials || '??'} size={40} />
                                            )}
                                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                                                style={{ background: statusColors.online, borderColor: 'rgba(8,8,16,1)' }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[0.78rem] text-white truncate">{convo.name}</p>
                                                <span className="text-[0.55rem] text-[rgba(255,255,255,0.2)] ml-2 shrink-0">{formatTime(convo.lastTime)}</span>
                                            </div>
                                            <p className="text-[0.68rem] text-[rgba(255,255,255,0.22)] truncate mt-0.5">{convo.lastMessage}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ─── Chat Area ─── */}
                    <div
                        data-reveal
                        className={`flex-1 flex flex-col overflow-hidden rounded-2xl lg:rounded-l-none ${activeChat ? 'flex' : 'hidden lg:flex'}`}
                        style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        {activeChat ? (
                            <>
                                {/* Header */}
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.06)]"
                                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <button onClick={() => setActiveChat(null)}
                                        className="lg:hidden text-[rgba(255,255,255,0.4)] hover:text-white transition-colors mr-1">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    </button>
                                    <div className="relative">
                                        {activeChat.avatar ? (
                                            <img src={activeChat.avatar} alt={activeChat.name} className="w-9 h-9 rounded-full object-cover" />
                                        ) : (
                                            <Avatar initials={activeChat.initials || '??'} size={36} />
                                        )}
                                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[rgba(8,8,16,1)]"
                                            style={{ background: statusColors.online }} />
                                    </div>
                                    <div>
                                        <p className="text-[0.8rem] text-white font-medium">{activeChat.name}</p>
                                        <p className="text-[0.6rem] text-[rgba(255,255,255,0.3)]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                            {activeChat.headline || 'Member'}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3"
                                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
                                    {messages.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center">
                                            <p className="text-[0.75rem] text-[rgba(255,255,255,0.15)]">Start the conversation! Say hello 👋</p>
                                        </div>
                                    )}
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.fromUid === user?.uid ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className="max-w-[75%] px-4 py-2.5 text-[0.76rem] leading-relaxed"
                                                style={msg.fromUid === user?.uid
                                                    ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.20))', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '18px 18px 6px 18px', color: 'rgba(255,255,255,0.90)' }
                                                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px 18px 18px 6px', color: 'rgba(255,255,255,0.75)' }
                                                }
                                            >
                                                {msg.text}
                                                <span className="block text-[0.5rem] mt-1 opacity-40">{formatMsgTime(msg.createdAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.06)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <input
                                            type="text"
                                            placeholder="Type a message…"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            className="flex-1 bg-transparent text-white text-[0.8rem] placeholder-[rgba(255,255,255,0.2)] outline-none"
                                        />
                                        <button
                                            onClick={handleSend}
                                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                            style={{ background: messageInput.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.06)' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-[0.8rem] text-[rgba(255,255,255,0.25)]">Select a conversation</p>
                                    <p className="text-[0.65rem] text-[rgba(255,255,255,0.12)] mt-1">Search for a friend or choose from the list</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
