import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
}

const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: 'spring', stiffness: 350, damping: 28, delay: 0.05 },
    },
    exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2 } },
}

export default function Modal({ isOpen, onClose, children, title, maxWidth = '480px' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
                    style={{ background: 'rgba(8,8,16,0.80)' }}
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose}
                >
                    <motion.div
                        className="glass w-full overflow-y-auto"
                        style={{ maxWidth, maxHeight: '85vh' }}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 pb-0">
                            {title && <h2 className="font-display text-xl text-white">{title}</h2>}
                            <button onClick={onClose} className="ml-auto text-[rgba(247,247,251,0.30)] hover:text-white transition-colors text-lg">✕</button>
                        </div>
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
