import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('cyberbase_user')
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    })
    const [showAuth, setShowAuth] = useState(false)
    const [authMode, setAuthMode] = useState('login')

    useEffect(() => {
        if (user) {
            localStorage.setItem('cyberbase_user', JSON.stringify(user))
        } else {
            localStorage.removeItem('cyberbase_user')
        }
    }, [user])

    const login = (email, password) => {
        const mockUser = {
            id: 1,
            name: 'Ava Sinclair',
            initials: 'AS',
            email,
            headline: 'Security Architect · Red Team Lead',
        }
        setUser(mockUser)
        setShowAuth(false)
        return mockUser
    }

    const signup = (name, email, password) => {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        const mockUser = { id: Date.now(), name, initials, email, headline: 'New Member' }
        setUser(mockUser)
        setShowAuth(false)
        return mockUser
    }

    const logout = () => {
        setUser(null)
    }

    const openAuth = (mode = 'login') => {
        setAuthMode(mode)
        setShowAuth(true)
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, showAuth, setShowAuth, authMode, setAuthMode, openAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
