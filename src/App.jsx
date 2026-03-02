import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { useLenis } from './hooks/useLenis'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Toast from './components/ui/Toast'
import CustomCursor from './components/ui/CustomCursor'
import AuthModal from './components/ui/AuthModal'
import CyberBot from './components/chatbot/CyberBot'
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import TeamsPage from './pages/TeamsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'

const pageVariants = {
  hidden: { opacity: 0, y: -60 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, y: 40,
    transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] },
  },
}

function AnimatedRoutes() {
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function AppInner() {
  useLenis()
  return (
    <>
      <div className="scanline-overlay" />
      <CustomCursor />
      <Navbar />
      <main>
        <AnimatedRoutes />
      </main>
      <Footer />
      <CyberBot />
      <Toast />
      <AuthModal />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppInner />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
