import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

export default function AuthModal() {
    const { showAuth, setShowAuth, authMode, setAuthMode, login, signup } = useAuth()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            if (authMode === 'login') {
                login(form.email, form.password)
            } else {
                signup(form.name, form.email, form.password)
            }
            setLoading(false)
            setForm({ name: '', email: '', password: '' })
        }, 800)
    }

    return (
        <Modal isOpen={showAuth} onClose={() => setShowAuth(false)} title={authMode === 'login' ? 'Welcome back' : 'Join CyberBase'} maxWidth="420px">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {authMode === 'signup' && (
                    <input className="input-glass" placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                )}
                <input className="input-glass" placeholder="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                <input className="input-glass" placeholder="Password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <motion.div whileTap={{ scale: 0.97 }}>
                    <Button variant="primary" type="submit" className="w-full" disabled={loading}>
                        {loading ? '...' : authMode === 'login' ? 'Login →' : 'Create Account →'}
                    </Button>
                </motion.div>
                <button
                    type="button"
                    className="font-sans text-[0.7rem] text-[rgba(247,247,251,0.40)] hover:text-white transition-colors text-center"
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                >
                    {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
            </form>
        </Modal>
    )
}
