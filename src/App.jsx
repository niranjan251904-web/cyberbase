import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { useLenis } from './hooks/useLenis'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Toast from './components/ui/Toast'
import CustomCursor from './components/ui/CustomCursor'
import AuthModal from './components/ui/AuthModal'
import CyberBot from './components/chatbot/CyberBot'
import MobileBottomNav from './components/layout/MobileBottomNav'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import TeamsPage from './pages/TeamsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'
import NetworkPage from './pages/NetworkPage'
import NotificationsPage from './pages/NotificationsPage'
import JobsPage from './pages/JobsPage'
import MemberProfilePage from './pages/MemberProfilePage'
import FirebaseTest from './pages/FirebaseTest'
import SeedFirestore from './pages/SeedFirestore'


function AppRoutes() {
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/network" element={<NetworkPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/member/:id" element={<MemberProfilePage />} />
      <Route path="/firebase-test" element={<FirebaseTest />} />
      <Route path="/seed" element={<SeedFirestore />} />
    </Routes>
  )
}

function AppInner() {
  useLenis()
  const { user, loading } = useAuth()

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
      </div>
    )
  }

  // Not logged in → show auth page
  if (!user) {
    return <AuthPage />
  }

  // Logged in → show the full app
  return (
    <>
      <div className="scanline-overlay" />
      <CustomCursor />
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      <Footer />
      <MobileBottomNav />
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
