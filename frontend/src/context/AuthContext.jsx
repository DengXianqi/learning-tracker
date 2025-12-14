import { createContext, useContext, useReducer, useEffect } from 'react'
import { api } from '../utils/api'

const initialState = {
  user: null,
  stats: null,
  loading: true,
  error: null
}

const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_STATS: 'UPDATE_STATS',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return { ...state, user: action.payload.user, stats: action.payload.stats || null, loading: false, error: null }
    case AUTH_ACTIONS.LOGIN_ERROR:
      return { ...state, user: null, stats: null, loading: false, error: action.payload }
    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, loading: false }
    case AUTH_ACTIONS.UPDATE_STATS:
      return { ...state, stats: action.payload }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }
    default:
      return state
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const checkAuth = async () => {
      // Check demo mode first
      if (localStorage.getItem('demoMode') === 'true') {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: { id: 1, email: 'demo@example.com', name: 'Demo User', avatarUrl: null },
            stats: { totalGoals: 3, completedGoals: 1, totalMilestones: 8, completedMilestones: 4 }
          }
        })
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        return
      }

      try {
        const response = await api.get('/auth/me')
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: response.user, stats: response.stats } })
      } catch (error) {
        localStorage.removeItem('token')
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    }
    checkAuth()
  }, [])

  const loginWithGoogle = async (credential) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    try {
      const response = await api.post('/auth/google', { credential })
      localStorage.setItem('token', response.token)
      localStorage.removeItem('demoMode')
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: response.user, stats: null } })
      
      // Fetch stats
      try {
        const meResponse = await api.get('/auth/me')
        dispatch({ type: AUTH_ACTIONS.UPDATE_STATS, payload: meResponse.stats })
      } catch (e) {}
      
      return { success: true }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_ERROR, payload: error.message || 'Login failed' })
      return { success: false, error: error.message }
    }
  }

  const loginDemo = () => {
    localStorage.setItem('demoMode', 'true')
    localStorage.removeItem('token')
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: {
        user: { id: 1, email: 'demo@example.com', name: 'Demo User', avatarUrl: null },
        stats: { totalGoals: 3, completedGoals: 1, totalMilestones: 8, completedMilestones: 4 }
      }
    })
  }

  const logout = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('demoMode')
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  const refreshStats = async () => {
    if (localStorage.getItem('demoMode') === 'true') return
    try {
      const response = await api.get('/auth/me')
      dispatch({ type: AUTH_ACTIONS.UPDATE_STATS, payload: response.stats })
    } catch (error) {}
  }

  return (
    <AuthContext.Provider value={{
      user: state.user,
      stats: state.stats,
      loading: state.loading,
      error: state.error,
      isAuthenticated: !!state.user,
      loginWithGoogle,
      loginDemo,
      logout,
      refreshStats,
      clearError: () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export default AuthContext
