import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

const cardVariants = {
    rest: {
        y: 0,
        scale: 1,
        borderColor: 'rgba(247,247,251,0.08)',
        boxShadow: '0 0 0 rgba(139,92,246,0), 0 4px 12px rgba(0,0,0,0.2)',
        transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
    hover: {
        y: -8,
        scale: 1.015,
        borderColor: 'rgba(139,92,246,0.5)',
        boxShadow: '0 0 40px rgba(139,92,246,0.25), 0 0 80px rgba(99,102,241,0.15), 0 0 120px rgba(168,85,247,0.08), 0 30px 60px rgba(0,0,0,0.5)',
        transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
}

export default function GlassCard({ children, className = '', onClick, style, noGlow = false }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)
    const cardRef = useRef(null)

    const handleMouseMove = (e) => {
        if (!cardRef.current || noGlow) return
        const rect = cardRef.current.getBoundingClientRect()
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    return (
        <motion.div
            ref={cardRef}
            className={`glass-card p-6 ${className}`}
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            onClick={onClick}
            style={style}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main radial glow — follows cursor */}
            {!noGlow && (
                <div
                    className="glass-card-glow"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139,92,246,0.20), rgba(99,102,241,0.10) 35%, rgba(168,85,247,0.04) 55%, transparent 70%)`,
                    }}
                />
            )}
            {/* Secondary warm glow layer */}
            {!noGlow && (
                <div
                    className="glass-card-glow"
                    style={{
                        opacity: isHovered ? 0.7 : 0,
                        background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(168,85,247,0.15), transparent 60%)`,
                    }}
                />
            )}
            {/* Border glow overlay */}
            {!noGlow && (
                <div
                    className="glass-card-border-glow"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139,92,246,0.45), rgba(168,85,247,0.15) 40%, transparent 60%)`,
                    }}
                />
            )}
            {/* Shimmer streak */}
            {!noGlow && (
                <div
                    className="glass-card-shimmer"
                    style={{ opacity: isHovered ? 1 : 0 }}
                />
            )}
            <div className="glass-card-content">
                {children}
            </div>
        </motion.div>
    )
}
