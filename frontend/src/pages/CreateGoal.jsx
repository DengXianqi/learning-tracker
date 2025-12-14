import { useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, ChevronRight, Check, Target, 
  ListChecks, Calendar, Tag, Plus, X, Sparkles
} from 'lucide-react'
import { goalsApi } from '../utils/api'
import styles from './CreateGoal.module.css'

// Initial state for the multi-step form
const initialState = {
  currentStep: 1,
  totalSteps: 3,
  formData: {
    title: '',
    description: '',
    category: '',
    targetDate: '',
    milestones: []
  },
  errors: {},
  isSubmitting: false
}

// Action types
const ACTIONS = {
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  UPDATE_FIELD: 'UPDATE_FIELD',
  ADD_MILESTONE: 'ADD_MILESTONE',
  REMOVE_MILESTONE: 'REMOVE_MILESTONE',
  UPDATE_MILESTONE: 'UPDATE_MILESTONE',
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_SUBMITTING: 'SET_SUBMITTING',
  RESET: 'RESET'
}

// Reducer function
function formReducer(state, action) {
  switch (action.type) {
    case ACTIONS.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps)
      }

    case ACTIONS.PREV_STEP:
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      }

    case ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value
        },
        errors: {
          ...state.errors,
          [action.payload.field]: null
        }
      }

    case ACTIONS.ADD_MILESTONE:
      return {
        ...state,
        formData: {
          ...state.formData,
          milestones: [
            ...state.formData.milestones,
            { id: Date.now(), title: '', description: '' }
          ]
        }
      }

    case ACTIONS.REMOVE_MILESTONE:
      return {
        ...state,
        formData: {
          ...state.formData,
          milestones: state.formData.milestones.filter(m => m.id !== action.payload)
        }
      }

    case ACTIONS.UPDATE_MILESTONE:
      return {
        ...state,
        formData: {
          ...state.formData,
          milestones: state.formData.milestones.map(m =>
            m.id === action.payload.id
              ? { ...m, [action.payload.field]: action.payload.value }
              : m
          )
        }
      }

    case ACTIONS.SET_ERRORS:
      return {
        ...state,
        errors: action.payload
      }

    case ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: {}
      }

    case ACTIONS.SET_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.payload
      }

    case ACTIONS.RESET:
      return initialState

    default:
      return state
  }
}

// Category suggestions
const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Design',
  'Languages',
  'Business',
  'Personal Development',
  'Other'
]

function CreateGoal() {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(formReducer, initialState)
  const { currentStep, totalSteps, formData, errors, isSubmitting } = state

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Goal title is required'
      } else if (formData.title.length > 255) {
        newErrors.title = 'Title must be less than 255 characters'
      }
    }

    if (step === 2) {
      // Milestones are optional, but if added, they need titles
      formData.milestones.forEach((m, index) => {
        if (!m.title.trim()) {
          newErrors[`milestone_${m.id}`] = 'Milestone title is required'
        }
      })
    }

    dispatch({ type: ACTIONS.SET_ERRORS, payload: newErrors })
    return Object.keys(newErrors).length === 0
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      dispatch({ type: ACTIONS.NEXT_STEP })
    }
  }

  // Handle previous step
  const handlePrev = () => {
    dispatch({ type: ACTIONS.PREV_STEP })
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    dispatch({ type: ACTIONS.SET_SUBMITTING, payload: true })

    try {
      const goalData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category || null,
        targetDate: formData.targetDate || null,
        milestones: formData.milestones
          .filter(m => m.title.trim())
          .map(m => ({
            title: m.title.trim(),
            description: m.description.trim() || null
          }))
      }

      const response = await goalsApi.create(goalData)
      navigate(`/goals/${response.goal.id}`)
    } catch (error) {
      console.error('Failed to create goal:', error)
      dispatch({ 
        type: ACTIONS.SET_ERRORS, 
        payload: { submit: error.message || 'Failed to create goal' }
      })
    } finally {
      dispatch({ type: ACTIONS.SET_SUBMITTING, payload: false })
    }
  }

  // Update field handler
  const updateField = (field, value) => {
    dispatch({ type: ACTIONS.UPDATE_FIELD, payload: { field, value } })
  }

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <Target className={styles.stepIcon} size={32} />
              <h2>Define Your Goal</h2>
              <p>What do you want to learn or achieve?</p>
            </div>

            <div className="form-group">
              <label className="form-label">Goal Title *</label>
              <input
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g., Master React Development"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                autoFocus
              />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe what you want to achieve..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">
                  <Tag size={16} /> Category
                </label>
                <select
                  className="form-input form-select"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} /> Target Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.targetDate}
                  onChange={(e) => updateField('targetDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <ListChecks className={styles.stepIcon} size={32} />
              <h2>Add Milestones</h2>
              <p>Break down your goal into smaller, achievable steps</p>
            </div>

            <div className={styles.milestonesList}>
              {formData.milestones.map((milestone, index) => (
                <div 
                  key={milestone.id} 
                  className={`${styles.milestoneItem} animate-fade-in`}
                >
                  <div className={styles.milestoneNumber}>{index + 1}</div>
                  <div className={styles.milestoneFields}>
                    <input
                      type="text"
                      className={`form-input ${errors[`milestone_${milestone.id}`] ? 'error' : ''}`}
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => dispatch({
                        type: ACTIONS.UPDATE_MILESTONE,
                        payload: { id: milestone.id, field: 'title', value: e.target.value }
                      })}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Description (optional)"
                      value={milestone.description}
                      onChange={(e) => dispatch({
                        type: ACTIONS.UPDATE_MILESTONE,
                        payload: { id: milestone.id, field: 'description', value: e.target.value }
                      })}
                    />
                    {errors[`milestone_${milestone.id}`] && (
                      <p className="form-error">{errors[`milestone_${milestone.id}`]}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.removeMilestoneBtn}
                    onClick={() => dispatch({ 
                      type: ACTIONS.REMOVE_MILESTONE, 
                      payload: milestone.id 
                    })}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className={styles.addMilestoneBtn}
                onClick={() => dispatch({ type: ACTIONS.ADD_MILESTONE })}
              >
                <Plus size={20} />
                Add Milestone
              </button>
            </div>

            {formData.milestones.length === 0 && (
              <div className={styles.milestoneHint}>
                <Sparkles size={20} />
                <p>Milestones help you track progress. Add at least one!</p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <Check className={styles.stepIcon} size={32} />
              <h2>Review & Create</h2>
              <p>Double-check your goal details</p>
            </div>

            <div className={styles.reviewCard}>
              <h3>{formData.title}</h3>
              {formData.description && (
                <p className={styles.reviewDescription}>{formData.description}</p>
              )}

              <div className={styles.reviewMeta}>
                {formData.category && (
                  <span className={styles.reviewTag}>
                    <Tag size={14} /> {formData.category}
                  </span>
                )}
                {formData.targetDate && (
                  <span className={styles.reviewTag}>
                    <Calendar size={14} /> {new Date(formData.targetDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {formData.milestones.length > 0 && (
                <div className={styles.reviewMilestones}>
                  <h4>Milestones ({formData.milestones.filter(m => m.title).length})</h4>
                  <ul>
                    {formData.milestones
                      .filter(m => m.title)
                      .map((m, i) => (
                        <li key={m.id}>
                          <span className={styles.milestoneCheckbox} />
                          {m.title}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {errors.submit && (
              <div className={styles.submitError}>
                {errors.submit}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={styles.createGoal}>
      {/* Progress Steps */}
      <div className={styles.progressSteps}>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`${styles.step} ${currentStep >= step ? styles.stepActive : ''} ${currentStep > step ? styles.stepComplete : ''}`}
          >
            <div className={styles.stepNumber}>
              {currentStep > step ? <Check size={16} /> : step}
            </div>
            <span className={styles.stepLabel}>
              {step === 1 ? 'Details' : step === 2 ? 'Milestones' : 'Review'}
            </span>
          </div>
        ))}
        <div className={styles.stepLine}>
          <div 
            className={styles.stepLineProgress}
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={(e) => e.preventDefault()}>
        {renderStep()}

        {/* Navigation Buttons */}
        <div className={styles.formActions}>
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrev}
              disabled={isSubmitting}
            >
              <ChevronLeft size={20} />
              Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
              <Check size={20} />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default CreateGoal
