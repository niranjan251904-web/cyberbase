import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
    const { login, signup, authError, setAuthError } = useAuth()
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login')
        setAuthError('')
        setForm({ name: '', email: '', password: '' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (mode === 'login') {
                await login(form.email, form.password)
            } else {
                await signup(form.name, form.email, form.password)
            }
        } catch {
            // error is already set in context
        }
        setLoading(false)
    }

    return (
        <div className="auth-page">
            {/* Background effects */}
            <div className="auth-bg-orb auth-bg-orb-1" />
            <div className="auth-bg-orb auth-bg-orb-2" />
            <div className="auth-bg-orb auth-bg-orb-3" />
            <div className="scanline-overlay" />

            <div className="auth-container">
                {/* Left — Branding */}
                <motion.div
                    className="auth-branding"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <h1 className="auth-logo">CyberBase</h1>
                    <p className="auth-tagline">
                        The digital home for the next generation of AI and cybersecurity professionals.
                    </p>
                    <div className="auth-features">
                        <div className="auth-feature">
                            <span className="auth-feature-icon">🛡️</span>
                            <div>
                                <p className="auth-feature-title">CTF Competitions</p>
                                <p className="auth-feature-desc">Compete in live capture-the-flag events</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-icon">👥</span>
                            <div>
                                <p className="auth-feature-title">Build Your Network</p>
                                <p className="auth-feature-desc">Connect with security professionals worldwide</p>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <span className="auth-feature-icon">🏆</span>
                            <div>
                                <p className="auth-feature-title">Climb the Ranks</p>
                                <p className="auth-feature-desc">Earn badges and top the leaderboard</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right — Auth Form */}
                <motion.div
                    className="auth-form-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="auth-form-title">
                                {mode === 'login' ? 'Welcome back' : 'Create your account'}
                            </h2>
                            <p className="auth-form-subtitle">
                                {mode === 'login'
                                    ? 'Sign in to continue to CyberBase'
                                    : 'Join the cybersecurity community'}
                            </p>

                            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                                {mode === 'signup' && (
                                    <div className="auth-field">
                                        <label className="auth-label">Full Name</label>
                                        <input
                                            className="input-glass"
                                            placeholder="John Doe"
                                            value={form.name}
                                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                            required
                                            autoComplete="new-name"
                                            name="signup-name"
                                        />
                                    </div>
                                )}

                                <div className="auth-field">
                                    <label className="auth-label">Email</label>
                                    <input
                                        className="input-glass"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                        required
                                        autoComplete="new-email"
                                        name="auth-email"
                                    />
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label">Password</label>
                                    <input
                                        className="input-glass"
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        value={form.password}
                                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        name="auth-password"
                                    />
                                </div>

                                {authError && (
                                    <motion.div
                                        className="auth-error"
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {authError}
                                    </motion.div>
                                )}

                                <motion.button
                                    type="submit"
                                    className="btn-primary auth-submit"
                                    disabled={loading}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {loading
                                        ? '...'
                                        : mode === 'login'
                                            ? 'Sign In →'
                                            : 'Create Account →'}
                                </motion.button>
                            </form>

                            <div className="auth-switch">
                                <span className="auth-switch-text">
                                    {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                                </span>
                                <button className="auth-switch-btn" onClick={switchMode}>
                                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    )
}
