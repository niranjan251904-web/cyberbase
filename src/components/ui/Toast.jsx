import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

export default function Toast() {
    const { toasts, removeToast } = useApp()

    return (
        <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3" style={{ maxWidth: 340 }}>
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        className="glass px-4 py-3 flex items-center gap-3"
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ x: 60, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                        <span className="text-[0.75rem] font-sans text-[rgba(247,247,251,0.60)] flex-1">
                            {toast.message}
                        </span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-[rgba(247,247,251,0.30)] hover:text-white text-xs transition-colors"
                        >
                            ✕
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
