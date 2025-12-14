import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Target, MoreVertical, Trash2, Edit } from 'lucide-react'
import { goalsApi } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import styles from './Goals.module.css'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' }
]

function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    fetchGoals()
  }, [statusFilter])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter) params.status = statusFilter
      
      const response = await goalsApi.getAll(params)
      setGoals(response.goals || [])
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal? This will also delete all milestones.')) {
      return
    }

    try {
      await goalsApi.delete(goalId)
      setGoals(goals.filter(g => g.id !== goalId))
    } catch (error) {
      console.error('Failed to delete goal:', error)
      alert('Failed to delete goal')
    }
    setOpenMenu(null)
  }

  const filteredGoals = goals.filter(goal =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return styles.badgeActive
      case 'completed': return styles.badgeCompleted
      case 'paused': return styles.badgePaused
      case 'cancelled': return styles.badgeCancelled
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={styles.goalsPage}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>My Goals</h1>
          <p className={styles.subtitle}>{goals.length} goal{goals.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/goals/new" className="btn btn-primary">
          <Plus size={20} />
          New Goal
        </Link>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterWrapper}>
          <Filter size={20} className={styles.filterIcon} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className={styles.goalsGrid}>
          {filteredGoals.map((goal, index) => (
            <div 
              key={goal.id} 
              className={`${styles.goalCard} animate-fade-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={styles.cardHeader}>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(goal.status)}`}>
                  {goal.status}
                </span>
                <div className={styles.cardMenu}>
                  <button 
                    className={styles.menuBtn}
                    onClick={() => setOpenMenu(openMenu === goal.id ? null : goal.id)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === goal.id && (
                    <div className={styles.menuDropdown}>
                      <Link to={`/goals/${goal.id}`} className={styles.menuItem}>
                        <Edit size={16} />
                        Edit
                      </Link>
                      <button 
                        className={`${styles.menuItem} ${styles.menuItemDanger}`}
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Link to={`/goals/${goal.id}`} className={styles.cardContent}>
                <h3 className={styles.goalTitle}>{goal.title}</h3>
                {goal.description && (
                  <p className={styles.goalDescription}>{goal.description}</p>
                )}
                
                <div className={styles.goalMeta}>
                  {goal.category && (
                    <span className={styles.category}>{goal.category}</span>
                  )}
                  {goal.target_date && (
                    <span className={styles.targetDate}>
                      Due: {new Date(goal.target_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span>Progress</span>
                    <span className={styles.progressPercent}>{goal.progress || 0}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                  <div className={styles.milestoneCount}>
                    {goal.completed_milestone_count || 0} / {goal.milestone_count || 0} milestones
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Target size={64} />
          <h2>No goals found</h2>
          <p>
            {searchQuery || statusFilter 
              ? 'Try adjusting your search or filters'
              : 'Create your first learning goal to get started'
            }
          </p>
          {!searchQuery && !statusFilter && (
            <Link to="/goals/new" className="btn btn-primary">
              <Plus size={20} />
              Create Goal
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default Goals
