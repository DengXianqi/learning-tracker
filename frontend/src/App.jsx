import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import GoalDetail from './pages/GoalDetail'
import CreateGoal from './pages/CreateGoal'
import Courses from './pages/Courses'
import Profile from './pages/Profile'
import LoadingSpinner from './components/LoadingSpinner'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner fullScreen />
  }
  
  if (!user) {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner fullScreen />
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicRoute>
          <Landing />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/goals/new" element={<CreateGoal />} />
        <Route path="/goals/:id" element={<GoalDetail />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
