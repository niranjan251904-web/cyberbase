import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Button({ children, variant = 'primary', className = '', onClick, disabled, type = 'button' }) {
    const base = variant === 'primary' ? 'btn-primary' : 'btn-glass'
    return (
        <motion.button
            type={type}
            className={clsx(base, className)}
            whileHover={{ scale: variant === 'primary' ? 1.02 : 1.01, y: -2 }}
            whileTap={{ scale: variant === 'primary' ? 0.97 : 0.98 }}
            transition={{ type: 'spring', stiffness: variant === 'primary' ? 400 : 500, damping: variant === 'primary' ? 25 : 30 }}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </motion.button>
    )
}
