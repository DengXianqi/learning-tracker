import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { User, Mail, Calendar, Target, CheckCircle, Award, Moon, Sun, LogOut } from 'lucide-react'
import styles from './Profile.module.css'

function Profile() {
  const { user, stats, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout()
    }
  }

  const completionRate = stats 
    ? Math.round((stats.completedMilestones / Math.max(stats.totalMilestones, 1)) * 100)
    : 0

  return (
    <div className={styles.profilePage}>
      {/* Profile Card */}
      <section className={`${styles.profileCard} animate-fade-in`}>
        <div className={styles.profileHeader}>
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className={styles.profileInfo}>
            <h1>{user?.name}</h1>
            <p className={styles.email}>
              <Mail size={16} />
              {user?.email}
            </p>
            {user?.createdAt && (
              <p className={styles.joinDate}>
                <Calendar size={16} />
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`${styles.statsSection} animate-fade-in stagger-1`}>
        <h2>Your Progress</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Target size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats?.totalGoals || 0}</span>
              <span className={styles.statLabel}>Total Goals</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats?.completedGoals || 0}</span>
              <span className={styles.statLabel}>Completed Goals</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
              <Award size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats?.completedMilestones || 0}</span>
              <span className={styles.statLabel}>Milestones Done</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconAccent}`}>
              <Target size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{completionRate}%</span>
              <span className={styles.statLabel}>Completion Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Section */}
      <section className={`${styles.settingsSection} animate-fade-in stagger-2`}>
        <h2>Settings</h2>
        
        <div className={styles.settingsList}>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingIcon}>
                {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <div>
                <span className={styles.settingLabel}>Theme</span>
                <span className={styles.settingDescription}>
                  {theme === 'light' ? 'Light mode' : 'Dark mode'}
                </span>
              </div>
            </div>
            <button 
              className={styles.toggleBtn}
              onClick={toggleTheme}
            >
              <span className={`${styles.toggleTrack} ${theme === 'dark' ? styles.toggleActive : ''}`}>
                <span className={styles.toggleThumb} />
              </span>
            </button>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={`${styles.settingIcon} ${styles.settingIconDanger}`}>
                <LogOut size={20} />
              </div>
              <div>
                <span className={styles.settingLabel}>Sign Out</span>
                <span className={styles.settingDescription}>
                  Sign out of your account
                </span>
              </div>
            </div>
            <button 
              className="btn btn-danger btn-sm"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={`${styles.aboutSection} animate-fade-in stagger-3`}>
        <h2>About</h2>
        <div className={styles.aboutContent}>
          <p>
            <strong>Learning Progress Tracker</strong> is a full-stack web application 
            built as a capstone project. It helps you track your learning goals, 
            courses, and milestones.
          </p>
          <p className={styles.version}>Version 1.0.0</p>
        </div>
      </section>
    </div>
  )
}

export default Profile
