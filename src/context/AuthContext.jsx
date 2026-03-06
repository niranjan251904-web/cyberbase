import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { auth, db } from '../firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { members } from '../data/members'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showAuth, setShowAuth] = useState(false)
    const [authMode, setAuthMode] = useState('login')
    const [authError, setAuthError] = useState('')
    // Flag to prevent onAuthStateChanged from writing during signup
    const isSigningUp = useRef(false)

    // Listen to Firebase auth state and load profile from Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // If signup is in progress, let the signup function handle profile creation
                if (isSigningUp.current) {
                    setLoading(false)
                    return
                }

                try {
                    // Try to load profile from Firestore
                    const userDocRef = doc(db, 'users', firebaseUser.uid)
                    const userDoc = await getDoc(userDocRef)

                    if (userDoc.exists()) {
                        // Profile found in Firestore
                        const data = userDoc.data()
                        setUser({ ...data, uid: firebaseUser.uid })
                    } else {
                        // No Firestore profile (e.g. old account) — build and save one
                        const profile = buildProfile(firebaseUser)
                        await setDoc(userDocRef, profile)
                        setUser(profile)
                    }
                } catch (err) {
                    console.error('Firestore profile error:', err)
                    // Fall back to local profile
                    setUser(buildProfile(firebaseUser))
                }
            } else {
                setUser(null)
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    function buildProfile(firebaseUser) {
        const emailName = firebaseUser.email?.split('@')[0]?.toLowerCase() || ''
        const matched = members.find(
            (m) =>
                m.name.toLowerCase().replace(/\s+/g, '') === emailName ||
                m.name.toLowerCase().replace(/\s+/g, '.') === emailName
        )

        if (matched) {
            return {
                id: matched.id,
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || matched.name,
                initials: matched.initials,
                email: firebaseUser.email,
                headline: matched.headline,
                location: matched.location,
                bio: matched.bio,
                skills: matched.skills,
                links: matched.links,
                events: matched.events,
                badges: matched.badges,
                stats: matched.stats,
                avatar: matched.avatar,
                experience: matched.experience || [],
                education: matched.education || [],
                certifications: matched.certifications || [],
                createdAt: new Date().toISOString(),
            }
        }

        return {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            initials: (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'U')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
            email: firebaseUser.email,
            headline: 'New Member',
            location: 'Earth',
            bio: 'Just joined CyberBase!',
            skills: ['Cybersecurity', 'Networking'],
            links: {},
            events: [],
            badges: ['Newcomer'],
            stats: { points: 0, rank: members.length + 1, events: 0, challenges: 0 },
            experience: [],
            education: [],
            certifications: [],
            createdAt: new Date().toISOString(),
        }
    }

    const login = async (email, password) => {
        setAuthError('')
        try {
            await signInWithEmailAndPassword(auth, email, password)
            setShowAuth(false)
        } catch (err) {
            const msg = err.code === 'auth/invalid-credential'
                ? 'Invalid email or password'
                : err.code === 'auth/user-not-found'
                    ? 'No account found with this email'
                    : err.code === 'auth/wrong-password'
                        ? 'Incorrect password'
                        : err.code === 'auth/too-many-requests'
                            ? 'Too many attempts. Try again later'
                            : err.message
            setAuthError(msg)
            throw err
        }
    }

    const signup = async (name, email, password) => {
        setAuthError('')
        isSigningUp.current = true
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password)
            await updateProfile(cred.user, { displayName: name })

            // Build the user profile
            const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
            const profile = {
                id: cred.user.uid,
                uid: cred.user.uid,
                name,
                initials,
                email,
                headline: 'New Member',
                location: 'Earth',
                bio: 'Just joined CyberBase! Excited to learn and contribute.',
                skills: ['Cybersecurity', 'Networking'],
                links: {},
                events: [],
                badges: ['Newcomer'],
                stats: { points: 0, rank: members.length + 1, events: 0, challenges: 0 },
                experience: [],
                education: [],
                certifications: [],
                createdAt: new Date().toISOString(),
            }

            // Write to Firestore `users` collection
            const userDocRef = doc(db, 'users', cred.user.uid)
            await setDoc(userDocRef, profile)

            // Set user state directly
            setUser(profile)
            setShowAuth(false)
            setLoading(false)
        } catch (err) {
            const msg = err.code === 'auth/email-already-in-use'
                ? 'An account with this email already exists'
                : err.code === 'auth/weak-password'
                    ? 'Password must be at least 6 characters'
                    : err.code === 'auth/invalid-email'
                        ? 'Invalid email address'
                        : err.message
            setAuthError(msg)
            throw err
        } finally {
            isSigningUp.current = false
        }
    }

    const updateUserProfile = async (updates) => {
        const updated = user ? { ...user, ...updates } : null
        setUser(updated)
        // Sync to Firestore
        if (updated?.uid) {
            try {
                await setDoc(doc(db, 'users', updated.uid), updated, { merge: true })
            } catch (err) {
                console.warn('Could not update profile in Firestore:', err.message)
            }
        }
    }

    const logout = async () => {
        await signOut(auth)
        setUser(null)
    }

    const openAuth = (mode = 'login') => {
        setAuthMode(mode)
        setShowAuth(true)
        setAuthError('')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                logout,
                updateProfile: updateUserProfile,
                showAuth,
                setShowAuth,
                authMode,
                setAuthMode,
                openAuth,
                authError,
                setAuthError,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
