import { NavLink } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="border-t border-[rgba(247,247,251,0.06)] py-16 px-6 mt-32">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
                <div>
                    <h3 className="text-2xl italic text-white mb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>CyberBase</h3>
                    <p className="font-sans text-[0.7rem] text-[rgba(247,247,251,0.30)] max-w-xs leading-relaxed">
                        The digital home for the next generation of AI and cybersecurity professionals.
                    </p>
                </div>
                <div className="flex gap-16">
                    <div>
                        <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.2em] mb-4">Platform</p>
                        <div className="flex flex-col gap-2">
                            {['Events', 'Teams', 'Leaderboard', 'Feed'].map(l => (
                                <NavLink key={l} to={`/${l.toLowerCase()}`} className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.40)] hover:text-white transition-colors">
                                    {l}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.30)] uppercase tracking-[0.2em] mb-4">Community</p>
                        <div className="flex flex-col gap-2">
                            {['Discord', 'Twitter', 'GitHub', 'Blog'].map(l => (
                                <a key={l} href="#" className="font-sans text-[0.75rem] text-[rgba(247,247,251,0.40)] hover:text-white transition-colors">
                                    {l}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[rgba(247,247,251,0.06)]">
                <p className="font-sans text-[0.6rem] text-[rgba(247,247,251,0.20)]">
                    © 2025 CyberBase. Build. Secure. Lead.
                </p>
            </div>
        </footer>
    )
}
