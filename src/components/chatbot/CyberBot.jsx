import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

const chatVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: 40, scale: 0.97, transition: { duration: 0.2, ease: 'easeIn' } },
}

const responses = {
    ctf: 'Start with picoCTF or OverTheWire for beginners. Practice web challenges first, then move to binary exploitation. Our CyberCTF 2025 is live right now — jump in!',
    team: 'Check out the Teams page to browse open teams. You can also create your own team and invite members. Most teams focus on specific areas like Red Team, CTF, or Cloud Security.',
    event: 'We have 2 live events and 3 upcoming ones. Head to the Events page to filter by type (CTF, Hackathon, Workshop, Conference) and register for what interests you.',
    learn: 'Start with our Ethical Hacking Workshop (upcoming). For self-study, try HackTheBox, TryHackMe, or our community writeups in the Feed section.',
    default: 'I can help with info about CTFs, teams, events, and learning paths. Try asking about any of these topics!',
}

function getResponse(msg) {
    const lower = msg.toLowerCase()
    if (lower.includes('ctf') || lower.includes('capture') || lower.includes('flag')) return responses.ctf
    if (lower.includes('team') || lower.includes('crew') || lower.includes('group')) return responses.team
    if (lower.includes('event') || lower.includes('hackathon') || lower.includes('workshop')) return responses.event
    if (lower.includes('learn') || lower.includes('start') || lower.includes('begin') || lower.includes('how')) return responses.learn
    return responses.default
}

export default function CyberBot() {
    const { chatOpen, setChatOpen } = useApp()
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hey! I\'m CyberBot. Ask me about CTFs, teams, events, or how to get started.' },
    ])
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, typing])

    const send = () => {
        if (!input.trim()) return
        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setTyping(true)
        setTimeout(() => {
            setTyping(false)
            setMessages(prev => [...prev, { role: 'bot', text: getResponse(userMsg) }])
        }, 1200)
    }

    return (
        <>
            {/* Floating button */}
            <motion.button
                className="fixed bottom-6 left-6 z-[1500] w-12 h-12 rounded-full flex items-center justify-center text-lg"
                style={{ background: '#080810', border: '1px solid rgba(247,247,251,0.15)', color: '#F7F7FB' }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setChatOpen(!chatOpen)}
            >
                {chatOpen ? '✕' : '◈'}
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {chatOpen && (
                    <motion.div
                        className="fixed bottom-20 left-3 right-3 sm:left-6 sm:right-auto z-[1500] glass flex flex-col"
                        style={{ width: 'auto', maxWidth: 360, height: 'min(440px, 70vh)' }}
                        variants={chatVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-[rgba(247,247,251,0.06)]">
                            <p className="font-sans text-[0.7rem] text-white font-medium">CyberBot</p>
                            <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)]">AI Assistant</p>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            <AnimatePresence>
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
                                    >
                                        <div
                                            className="px-3 py-2 rounded-xl font-sans text-[0.72rem] leading-relaxed"
                                            style={{
                                                background: msg.role === 'user' ? 'rgba(139,92,246,0.15)' : 'rgba(247,247,251,0.06)',
                                                color: 'rgba(247,247,251,0.60)',
                                            }}
                                        >
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {typing && (
                                <div className="self-start px-3 py-2 rounded-xl" style={{ background: 'rgba(247,247,251,0.06)' }}>
                                    <span className="typing-dot" />{' '}
                                    <span className="typing-dot" />{' '}
                                    <span className="typing-dot" />
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-[rgba(247,247,251,0.06)]">
                            <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask CyberBot..."
                                    className="input-glass flex-1 !py-2 !text-[0.72rem]"
                                />
                                <motion.button
                                    type="submit"
                                    className="btn-primary !px-3 !py-2 !text-[0.65rem]"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Send
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
