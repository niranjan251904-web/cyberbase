import { motion } from 'framer-motion'

const cardVariants = {
    rest: {
        y: 0,
        borderColor: 'rgba(247,247,251,0.08)',
        boxShadow: 'none',
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    hover: {
        y: -6,
        borderColor: 'rgba(139,92,246,0.25)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
}

export default function GlassCard({ children, className = '', onClick, style }) {
    return (
        <motion.div
            className={`glass p-6 ${className}`}
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            onClick={onClick}
            style={style}
        >
            {children}
        </motion.div>
    )
}
