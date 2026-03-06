import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../firebase'
import { collection, getDocs, addDoc, doc, updateDoc, query } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import GlassCard from '../components/ui/GlassCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

const categories = ['All', 'Writeup', 'Resource', 'Discussion', 'Achievement']

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function FeedPage() {
    const { user } = useAuth()
    const [posts, setPosts] = useState([])
    const [filter, setFilter] = useState('All')
    const [expandedComments, setExpandedComments] = useState(new Set())
    const [likedPosts, setLikedPosts] = useState(new Set())
    const [newComments, setNewComments] = useState({})
    const [composerOpen, setComposerOpen] = useState(false)
    const [composerData, setComposerData] = useState({ title: '', content: '', type: 'discussion', tags: '' })
    const [loading, setLoading] = useState(true)
    const { addToast } = useApp()
    const sectionRef = useScrollReveal()

    // Fetch posts from Firestore
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true)
            try {
                const q = query(collection(db, 'posts'))
                const snap = await getDocs(q)
                const firestorePosts = snap.docs.map(d => ({
                    _id: d.id,
                    id: d.id,
                    ...d.data(),
                    comments: d.data().comments || [],
                    tags: d.data().tags || [],
                    reactions: d.data().reactions || { likes: 0, comments: 0 },
                    author: d.data().author || { name: 'Unknown', initials: '??' },
                })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                setPosts(firestorePosts)
            } catch (err) {
                console.error('Failed to fetch posts:', err)
            }
            setLoading(false)
        }
        fetchPosts()
    }, [])

    const filtered = filter === 'All' ? posts : posts.filter(p => p.type?.toLowerCase() === filter.toLowerCase())

    const toggleLike = (postId) => {
        setLikedPosts(prev => {
            const next = new Set(prev)
            if (next.has(postId)) next.delete(postId)
            else next.add(postId)
            return next
        })
    }

    const toggleComments = (postId) => {
        setExpandedComments(prev => {
            const next = new Set(prev)
            if (next.has(postId)) next.delete(postId)
            else next.add(postId)
            return next
        })
    }

    const addComment = async (postId) => {
        const text = newComments[postId]
        if (!text?.trim() || !user) return

        const comment = {
            author: user.name || 'Anonymous',
            initials: user.initials || user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AN',
            text: text.trim(),
            time: 'Just now',
            uid: user.uid,
            createdAt: new Date().toISOString(),
        }

        // Update local state immediately
        setPosts(prev => prev.map(p => {
            if ((p._id || p.id) !== postId) return p
            return {
                ...p,
                comments: [...(p.comments || []), comment],
                reactions: { ...p.reactions, comments: (p.reactions?.comments || 0) + 1 },
            }
        }))
        setNewComments(prev => ({ ...prev, [postId]: '' }))

        // Update Firestore
        try {
            const post = posts.find(p => (p._id || p.id) === postId)
            if (post?._id) {
                const postRef = doc(db, 'posts', post._id)
                const updatedComments = [...(post.comments || []), comment]
                await updateDoc(postRef, {
                    comments: updatedComments,
                    reactions: { ...post.reactions, comments: (post.reactions?.comments || 0) + 1 },
                })
            }
        } catch (err) {
            console.error('Failed to save comment:', err)
        }
    }

    const handleCompose = async (e) => {
        e.preventDefault()
        if (!user) { addToast('Please log in to post'); return }

        const newPost = {
            type: composerData.type,
            author: {
                name: user.name || 'Anonymous',
                initials: user.initials || user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AN',
                uid: user.uid,
                email: user.email,
            },
            title: composerData.title,
            content: composerData.content,
            tags: composerData.tags.split(',').map(t => t.trim()).filter(Boolean),
            reactions: { likes: 0, comments: 0 },
            comments: [],
            createdAt: new Date().toISOString(),
        }

        try {
            const docRef = await addDoc(collection(db, 'posts'), newPost)
            // Add to local state with the Firestore doc ID
            setPosts(prev => [{ ...newPost, _id: docRef.id, id: docRef.id }, ...prev])
            setComposerOpen(false)
            setComposerData({ title: '', content: '', type: 'discussion', tags: '' })
            addToast('Post published!')
        } catch (err) {
            console.error('Failed to publish post:', err)
            addToast(`Error: ${err.code || err.message}`)
        }
    }

    // Time display helper
    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        if (timestamp === 'Just now') return 'Just now'
        try {
            const date = new Date(timestamp)
            const now = new Date()
            const diffMs = now - date
            const diffMins = Math.floor(diffMs / 60000)
            if (diffMins < 1) return 'Just now'
            if (diffMins < 60) return `${diffMins}m ago`
            const diffHrs = Math.floor(diffMins / 60)
            if (diffHrs < 24) return `${diffHrs}h ago`
            const diffDays = Math.floor(diffHrs / 24)
            if (diffDays < 7) return `${diffDays}d ago`
            return date.toLocaleDateString()
        } catch {
            return timestamp
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto" ref={sectionRef}>
                <div data-reveal className="section-line mb-4" />
                <div data-reveal className="flex items-center justify-between mb-10">
                    <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-white">Community</h1>
                    <Button variant="primary" onClick={() => setComposerOpen(true)} className="!text-[0.65rem]">+ New Post</Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div data-reveal className="lg:w-[240px] shrink-0">
                        <div className="glass p-4 lg:sticky lg:top-24">
                            <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.15em] mb-3">Filter</p>
                            <div className="flex flex-row lg:flex-col gap-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilter(cat)}
                                        className="relative text-left px-3 py-2 font-sans text-[0.72rem] rounded-lg transition-colors"
                                        style={{
                                            color: filter === cat ? '#F7F7FB' : 'rgba(247,247,251,0.40)',
                                            background: filter === cat ? 'rgba(247,247,251,0.04)' : 'transparent',
                                        }}
                                    >
                                        {cat}
                                        {filter === cat && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
                                                style={{ background: '#F7F7FB' }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="auth-spinner mx-auto mb-3" />
                                <p className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.30)]">Loading posts…</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={filter}
                                    className="flex flex-col gap-6"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                >
                                    {filtered.map(post => (
                                        <motion.div key={post._id || post.id} variants={itemVariants} layout>
                                            <GlassCard>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Avatar initials={post.author?.initials || '??'} size={36} />
                                                    <div>
                                                        <p className="font-sans text-[0.75rem] text-white">{post.author?.name || 'Anonymous'}</p>
                                                        <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)]">{formatTime(post.createdAt || post.time)}</p>
                                                    </div>
                                                    <Badge variant="violet" className="ml-auto">{post.type}</Badge>
                                                </div>

                                                <h3 className="font-display text-[1.1rem] text-white mb-2">{post.title}</h3>
                                                <p className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.50)] leading-relaxed mb-3">
                                                    {post.content}
                                                </p>

                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                                        {post.tags.map(tag => (
                                                            <motion.span
                                                                key={tag}
                                                                className="px-2 py-0.5 rounded-full font-sans text-[0.6rem] border"
                                                                style={{ borderColor: 'rgba(247,247,251,0.06)', color: 'rgba(247,247,251,0.40)' }}
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                {tag}
                                                            </motion.span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4">
                                                    <motion.button
                                                        className="font-sans text-[0.72rem] flex items-center gap-1.5"
                                                        style={{ color: likedPosts.has(post._id || post.id) ? '#F7F7FB' : 'rgba(247,247,251,0.40)' }}
                                                        onClick={() => toggleLike(post._id || post.id)}
                                                        animate={likedPosts.has(post._id || post.id) ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                                                        transition={{ duration: 0.3, ease: 'backOut' }}
                                                    >
                                                        {likedPosts.has(post._id || post.id) ? '♥' : '♡'} {(post.reactions?.likes || 0) + (likedPosts.has(post._id || post.id) ? 1 : 0)}
                                                    </motion.button>
                                                    <button
                                                        className="font-sans text-[0.72rem] text-[rgba(247,247,251,0.40)] hover:text-white transition-colors"
                                                        onClick={() => toggleComments(post._id || post.id)}
                                                    >
                                                        💬 {(post.comments?.length || 0)}
                                                    </button>
                                                </div>

                                                {/* Comments */}
                                                <AnimatePresence>
                                                    {expandedComments.has(post._id || post.id) && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="mt-4 pt-4 border-t border-[rgba(247,247,251,0.06)] overflow-hidden"
                                                        >
                                                            {(post.comments || []).map((comment, i) => (
                                                                <div key={i} className="flex items-start gap-2 mb-3 last:mb-0">
                                                                    <Avatar initials={comment.initials || '??'} size={24} />
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-sans text-[0.68rem] text-white">{comment.author}</span>
                                                                            <span className="font-sans text-[0.55rem] text-[rgba(247,247,251,0.25)]">{formatTime(comment.createdAt || comment.time)}</span>
                                                                        </div>
                                                                        <p className="font-sans text-[0.7rem] text-[rgba(247,247,251,0.45)] leading-relaxed">{comment.text}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="flex gap-2 mt-3">
                                                                <input
                                                                    className="input-glass flex-1 !py-1.5 !text-[0.7rem]"
                                                                    placeholder="Add a comment..."
                                                                    value={newComments[post._id || post.id] || ''}
                                                                    onChange={e => setNewComments(prev => ({ ...prev, [post._id || post.id]: e.target.value }))}
                                                                    onKeyDown={e => e.key === 'Enter' && addComment(post._id || post.id)}
                                                                />
                                                                <Button variant="glass" className="!text-[0.6rem] !py-1.5 !px-3" onClick={() => addComment(post._id || post.id)}>Send</Button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </GlassCard>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {!loading && filtered.length === 0 && (
                            <div className="text-center py-20">
                                <p className="font-sans text-[0.8rem] text-[rgba(247,247,251,0.30)]">
                                    {posts.length === 0 ? 'No posts yet. Be the first to share!' : 'No posts in this category.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Composer Modal */}
            <Modal isOpen={composerOpen} onClose={() => setComposerOpen(false)} title="New Post" maxWidth="520px">
                <form onSubmit={handleCompose} className="flex flex-col gap-4">
                    <select className="input-glass" value={composerData.type} onChange={e => setComposerData(p => ({ ...p, type: e.target.value }))}>
                        {['discussion', 'writeup', 'resource', 'achievement'].map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                    </select>
                    <input className="input-glass" placeholder="Title" value={composerData.title} onChange={e => setComposerData(p => ({ ...p, title: e.target.value }))} required />
                    <textarea className="input-glass" rows={4} placeholder="What's on your mind?" value={composerData.content} onChange={e => setComposerData(p => ({ ...p, content: e.target.value }))} required />
                    <input className="input-glass" placeholder="Tags (comma separated)" value={composerData.tags} onChange={e => setComposerData(p => ({ ...p, tags: e.target.value }))} />
                    <Button variant="primary" type="submit">Publish →</Button>
                </form>
            </Modal>
        </div>
    )
}
