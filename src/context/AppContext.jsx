import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

let toastId = 0

export function AppProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const [chatOpen, setChatOpen] = useState(false)

    const addToast = useCallback((message, type = 'success') => {
        const id = ++toastId
        setToasts(prev => [...prev.slice(-2), { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <AppContext.Provider value={{ toasts, addToast, removeToast, chatOpen, setChatOpen }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be used within AppProvider')
    return ctx
}
