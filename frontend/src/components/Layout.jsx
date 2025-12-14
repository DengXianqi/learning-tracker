import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  LayoutDashboard, 
  Target, 
  BookOpen, 
  User, 
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import styles from './Layout.module.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/courses', label: 'Courses', icon: BookOpen },
  { path: '/profile', label: 'Profile', icon: User }
]

function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Target size={28} className={styles.logoIcon} />
            <span className={styles.logoText}>LearnTrack</span>
          </div>
          <button 
            className={styles.mobileClose}
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button 
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <div className={styles.userSection}>
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className={styles.userAvatar}
              />
            ) : (
              <div className={styles.userAvatarPlaceholder}>
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>

          <button 
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className={styles.pageTitle}>
            {navItems.find(item => location.pathname.startsWith(item.path))?.label || 'Dashboard'}
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
