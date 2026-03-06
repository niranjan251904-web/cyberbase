import { useState } from 'react'
import { seedCollection } from '../services/firestoreService'
import { events } from '../data/events'
import { jobs } from '../data/jobs'
import { teams } from '../data/teams'
import { connectionRequests, suggestions, myConnections } from '../data/connections'
import { feed } from '../data/feed'
import { leaderboard } from '../data/leaderboard'
import { notifications } from '../data/notifications'

const COLLECTIONS = [
    { name: 'events', data: events },
    { name: 'jobs', data: jobs },
    { name: 'teams', data: teams },
    { name: 'connectionRequests', data: connectionRequests },
    { name: 'suggestions', data: suggestions },
    { name: 'myConnections', data: myConnections },
    { name: 'feed', data: feed },
    { name: 'leaderboard', data: leaderboard },
    { name: 'notifications', data: notifications },
    {
        name: 'conversations',
        data: [
            {
                id: 1, name: 'Anya Sharma', initials: 'AS', role: 'Red Team Lead', status: 'online',
                messages: [
                    { from: 'them', text: 'Hey! Ready for the CTF tonight?', time: '10:42 PM' },
                    { from: 'them', text: 'I set up the practice env already', time: '10:43 PM' },
                ],
                lastTime: '2m ago', unread: 2,
            },
            {
                id: 2, name: 'Kai Nakamura', initials: 'KN', role: 'Exploit Dev', status: 'online',
                messages: [
                    { from: 'them', text: 'I pushed the exploit code to the repo.', time: '10:24 PM' },
                    { from: 'me', text: "Nice, I'll review the PR in a bit", time: '10:25 PM' },
                    { from: 'them', text: 'Cool, lmk if the payload needs tweaking', time: '10:26 PM' },
                ],
                lastTime: '18m ago', unread: 1,
            },
            {
                id: 3, name: 'Rhea Patel', initials: 'RP', role: 'SOC Analyst', status: 'away',
                messages: [
                    { from: 'me', text: "When's the team meeting?", time: '9:10 PM' },
                    { from: 'them', text: 'Team meeting at 9 PM IST.', time: '9:12 PM' },
                    { from: 'me', text: 'Perfect, see you there', time: '9:13 PM' },
                ],
                lastTime: '1h ago', unread: 0,
            },
            {
                id: 4, name: 'Viktor Osei', initials: 'VO', role: 'Pen Tester', status: 'offline',
                messages: [
                    { from: 'them', text: 'Great write-up on the XSS challenge!', time: '7:30 PM' },
                    { from: 'me', text: 'Thanks! Took me a while to figure out the CSP bypass', time: '7:35 PM' },
                    { from: 'them', text: 'The DOM clobbering technique was clever', time: '7:36 PM' },
                ],
                lastTime: '3h ago', unread: 0,
            },
            {
                id: 5, name: 'Luna Chen', initials: 'LC', role: 'Malware Analyst', status: 'online',
                messages: [
                    { from: 'them', text: 'Found a new C2 framework sample, want to reverse it together?', time: '6:15 PM' },
                    { from: 'me', text: 'Absolutely, share the hash', time: '6:18 PM' },
                ],
                lastTime: '4h ago', unread: 0,
            },
            {
                id: 6, name: 'Zara Al-Farsi', initials: 'ZA', role: 'Threat Intel', status: 'away',
                messages: [
                    { from: 'them', text: 'Published the APT report on the feed, check it out', time: '3:00 PM' },
                ],
                lastTime: '7h ago', unread: 0,
            },
        ],
    },
]

export default function SeedFirestore() {
    const [results, setResults] = useState({})
    const [loading, setLoading] = useState({})

    const seed = async (col) => {
        setLoading((p) => ({ ...p, [col.name]: true }))
        try {
            const count = await seedCollection(col.name, col.data)
            setResults((p) => ({ ...p, [col.name]: `✅ ${count} docs seeded` }))
        } catch (err) {
            setResults((p) => ({ ...p, [col.name]: `❌ ${err.message}` }))
        }
        setLoading((p) => ({ ...p, [col.name]: false }))
    }

    const seedAll = async () => {
        for (const col of COLLECTIONS) {
            await seed(col)
        }
    }

    return (
        <div style={{ padding: '100px 40px 40px', maxWidth: 700, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: 28, marginBottom: 8, color: '#fff' }}>Seed Firestore</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
                Push mock data into Firestore collections. Run this once.
            </p>

            <button
                onClick={seedAll}
                style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    marginBottom: 32,
                }}
            >
                🚀 Seed All Collections
            </button>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                        <th style={{ padding: 10, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Collection</th>
                        <th style={{ padding: 10, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Docs</th>
                        <th style={{ padding: 10, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Status</th>
                        <th style={{ padding: 10 }}></th>
                    </tr>
                </thead>
                <tbody>
                    {COLLECTIONS.map((col) => (
                        <tr key={col.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: 10, color: '#fff', fontSize: 14, fontFamily: "'IBM Plex Mono', monospace" }}>{col.name}</td>
                            <td style={{ padding: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{col.data.length}</td>
                            <td style={{ padding: 10, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                                {loading[col.name] ? '⏳ Seeding...' : results[col.name] || '—'}
                            </td>
                            <td style={{ padding: 10 }}>
                                <button
                                    onClick={() => seed(col)}
                                    disabled={loading[col.name]}
                                    style={{
                                        padding: '6px 16px',
                                        background: 'rgba(255,255,255,0.06)',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 6,
                                        fontSize: 12,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Seed
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
