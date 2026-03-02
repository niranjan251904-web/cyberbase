import clsx from 'clsx'

export default function Badge({ children, variant = 'default', className = '' }) {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-[0.65rem] font-medium tracking-wider uppercase'
    const variants = {
        default: 'bg-[rgba(247,247,251,0.06)] text-[rgba(247,247,251,0.50)] border border-[rgba(247,247,251,0.06)]',
        violet: 'bg-[rgba(139,92,246,0.08)] text-violet border border-[rgba(139,92,246,0.15)]',
        live: 'bg-[rgba(34,197,94,0.08)] text-[#22c55e] border border-[rgba(34,197,94,0.15)]',
        upcoming: 'bg-[rgba(251,191,36,0.08)] text-[#fbbf24] border border-[rgba(251,191,36,0.15)]',
        past: 'bg-[rgba(247,247,251,0.04)] text-[rgba(247,247,251,0.30)] border border-[rgba(247,247,251,0.04)]',
    }
    return (
        <span className={clsx(base, variants[variant] || variants.default, className)}>
            {children}
        </span>
    )
}
