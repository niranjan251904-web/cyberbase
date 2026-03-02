import { motion } from 'framer-motion'

export default function FilterTabs({ tabs, active, onChange }) {
    return (
        <div className="flex items-center gap-1 flex-wrap">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className="relative px-3 py-1.5 font-sans text-[0.7rem] tracking-wider uppercase transition-colors"
                    style={{ color: active === tab.id ? '#F7F7FB' : 'rgba(247,247,251,0.40)' }}
                >
                    {tab.label}
                    {active === tab.id && (
                        <motion.div
                            layoutId="filter-indicator"
                            className="absolute bottom-0 left-0 right-0"
                            style={{ height: 2, background: '#F7F7FB', borderRadius: 2 }}
                        />
                    )}
                </button>
            ))}
        </div>
    )
}
