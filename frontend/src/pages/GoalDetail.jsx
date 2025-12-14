import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Edit2, Trash2, Plus, Check, 
  Calendar, Tag, MoreVertical, GripVertical
} from 'lucide-react'
import { goalsApi, milestonesApi } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import styles from './GoalDetail.module.css'

function GoalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { refreshStats } = useAuth()
  
  const [goal, setGoal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingGoal, setEditingGoal] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '' })
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [celebratingMilestone, setCelebratingMilestone] = useState(null)

  useEffect(() => {
    fetchGoal()
  }, [id])

  const fetchGoal = async () => {
    try {
      setLoading(true)
      const response = await goalsApi.getById(id)
      setGoal(response.goal)
      setEditForm({
        title: response.goal.title,
        description: response.goal.description || '',
        category: response.goal.category || '',
        targetDate: response.goal.target_date?.split('T')[0] || '',
        status: response.goal.status
      })
    } catch (error) {
      console.error('Failed to fetch goal:', error)
      navigate('/goals')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGoal = async () => {
    try {
      await goalsApi.update(id, {
        title: editForm.title,
        description: editForm.description || null,
        category: editForm.category || null,
        targetDate: editForm.targetDate || null,
        status: editForm.status
      })
      await fetchGoal()
      setEditingGoal(false)
      refreshStats()
    } catch (error) {
      console.error('Failed to update goal:', error)
      alert('Failed to update goal')
    }
  }

  const handleDeleteGoal = async () => {
    if (!window.confirm('Are you sure you want to delete this goal? This will also delete all milestones.')) {
      return
    }

    try {
      await goalsApi.delete(id)
      refreshStats()
      navigate('/goals')
    } catch (error) {
      console.error('Failed to delete goal:', error)
      alert('Failed to delete goal')
    }
  }

  const handleAddMilestone = async (e) => {
    e.preventDefault()
    if (!newMilestone.title.trim()) return

    try {
      await milestonesApi.create(id, {
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim() || null
      })
      setNewMilestone({ title: '', description: '' })
      setShowAddMilestone(false)
      await fetchGoal()
      refreshStats()
    } catch (error) {
      console.error('Failed to add milestone:', error)
      alert('Failed to add milestone')
    }
  }

  const handleToggleMilestone = async (milestoneId) => {
    try {
      const milestone = goal.milestones.find(m => m.id === milestoneId)
      const wasCompleted = milestone.completed
      
      await milestonesApi.toggle(milestoneId)
      
      // Show celebration animation if completing
      if (!wasCompleted) {
        setCelebratingMilestone(milestoneId)
        setTimeout(() => setCelebratingMilestone(null), 1000)
      }
      
      await fetchGoal()
      refreshStats()
    } catch (error) {
      console.error('Failed to toggle milestone:', error)
    }
  }

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await milestonesApi.delete(milestoneId)
      await fetchGoal()
      refreshStats()
    } catch (error) {
      console.error('Failed to delete milestone:', error)
    }
  }

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

  if (!goal) {
    return (
      <div className={styles.notFound}>
        <h2>Goal not found</h2>
        <Link to="/goals" className="btn btn-primary">Back to Goals</Link>
      </div>
    )
  }

  return (
    <div className={styles.goalDetail}>
      {/* Header */}
      <header className={styles.header}>
        <Link to="/goals" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Goals
        </Link>
        
        <div className={styles.headerActions}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setEditingGoal(!editingGoal)}
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button 
            className="btn btn-danger btn-sm"
            onClick={handleDeleteGoal}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </header>

      {/* Goal Info */}
      <section className={`${styles.goalInfo} animate-fade-in`}>
        {editingGoal ? (
          <div className={styles.editForm}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className={styles.editFormRow}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editForm.targetDate}
                  onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input form-select"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className={styles.editActions}>
              <button 
                className="btn btn-secondary"
                onClick={() => setEditingGoal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateGoal}
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.goalHeader}>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(goal.status)}`}>
                {goal.status}
              </span>
              <h1>{goal.title}</h1>
              {goal.description && (
                <p className={styles.goalDescription}>{goal.description}</p>
              )}
            </div>

            <div className={styles.goalMeta}>
              {goal.category && (
                <span className={styles.metaItem}>
                  <Tag size={16} />
                  {goal.category}
                </span>
              )}
              {goal.target_date && (
                <span className={styles.metaItem}>
                  <Calendar size={16} />
                  Due: {new Date(goal.target_date).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span>Overall Progress</span>
                <span className={styles.progressPercent}>{goal.progress || 0}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${goal.progress || 0}%` }}
                />
              </div>
            </div>
          </>
        )}
      </section>

      {/* Milestones Section */}
      <section className={`${styles.milestonesSection} animate-fade-in stagger-1`}>
        <div className={styles.milestonesHeader}>
          <h2>Milestones</h2>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddMilestone(!showAddMilestone)}
          >
            <Plus size={16} />
            Add Milestone
          </button>
        </div>

        {/* Add Milestone Form */}
        {showAddMilestone && (
          <form onSubmit={handleAddMilestone} className={styles.addMilestoneForm}>
            <input
              type="text"
              className="form-input"
              placeholder="Milestone title"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              autoFocus
            />
            <input
              type="text"
              className="form-input"
              placeholder="Description (optional)"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
            />
            <div className={styles.addMilestoneActions}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddMilestone(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Add
              </button>
            </div>
          </form>
        )}

        {/* Milestones List */}
        {goal.milestones && goal.milestones.length > 0 ? (
          <div className={styles.milestonesList}>
            {goal.milestones.map((milestone, index) => (
              <div 
                key={milestone.id}
                className={`${styles.milestoneItem} ${milestone.completed ? styles.milestoneCompleted : ''} ${celebratingMilestone === milestone.id ? styles.milestoneCelebrate : ''}`}
                data-testid={`milestone-${milestone.id}`}
              >
                <button
                  className={styles.milestoneCheckbox}
                  onClick={() => handleToggleMilestone(milestone.id)}
                  data-testid={`milestone-checkbox-${milestone.id}`}
                >
                  {milestone.completed && <Check size={14} />}
                </button>
                
                <div className={styles.milestoneContent}>
                  <span className={styles.milestoneTitle}>{milestone.title}</span>
                  {milestone.description && (
                    <span className={styles.milestoneDescription}>{milestone.description}</span>
                  )}
                  {milestone.completed_at && (
                    <span className={styles.milestoneCompletedAt}>
                      Completed {new Date(milestone.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <button
                  className={styles.milestoneDelete}
                  onClick={() => handleDeleteMilestone(milestone.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyMilestones}>
            <p>No milestones yet. Add milestones to track your progress!</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default GoalDetail
