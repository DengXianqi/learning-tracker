import { useState, useEffect } from 'react'
import { Search, BookOpen, Star, Users, Clock, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import { coursesApi } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import styles from './Courses.module.css'

const PROVIDERS = ['All', 'Coursera', 'Udemy', 'edX']
const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

function Courses() {
  const [courses, setCourses] = useState([])
  const [savedCourses, setSavedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [provider, setProvider] = useState('All')
  const [level, setLevel] = useState('All Levels')
  const [activeTab, setActiveTab] = useState('browse')

  useEffect(() => {
    fetchCourses()
    fetchSavedCourses()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, provider, level])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery) params.q = searchQuery
      if (provider !== 'All') params.provider = provider
      if (level !== 'All Levels') params.level = level
      
      const response = await coursesApi.search(params)
      setCourses(response.courses || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedCourses = async () => {
    try {
      const response = await coursesApi.getSaved()
      setSavedCourses(response.savedCourses || [])
    } catch (error) {
      console.error('Failed to fetch saved courses:', error)
    }
  }

  const handleSave = async (courseId) => {
    try {
      const isSaved = savedCourses.some(c => c.external_id === courseId)
      
      if (isSaved) {
        await coursesApi.unsave(courseId)
        setSavedCourses(savedCourses.filter(c => c.external_id !== courseId))
      } else {
        await coursesApi.save(courseId)
        const course = courses.find(c => c.id === courseId)
        if (course) {
          setSavedCourses([...savedCourses, {
            external_id: course.id,
            title: course.title,
            provider: course.provider,
            url: course.url
          }])
        }
      }
    } catch (error) {
      console.error('Failed to save/unsave course:', error)
    }
  }

  const isSaved = (courseId) => savedCourses.some(c => c.external_id === courseId)

  const displayCourses = activeTab === 'saved' 
    ? courses.filter(c => isSaved(c.id))
    : courses

  return (
    <div className={styles.coursesPage}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>Discover Courses</h1>
          <p className={styles.subtitle}>Find courses to help you achieve your learning goals</p>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'browse' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <BookOpen size={18} />
          Browse
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'saved' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={18} />
          Saved ({savedCourses.length})
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search courses, skills, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className={styles.filterSelect}
          >
            {PROVIDERS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={styles.filterSelect}
          >
            {LEVELS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="lg" />
        </div>
      ) : displayCourses.length > 0 ? (
        <div className={styles.coursesGrid}>
          {displayCourses.map((course, index) => (
            <div 
              key={course.id}
              className={`${styles.courseCard} animate-fade-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div 
                className={styles.courseThumbnail}
                style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
              >
                <span className={styles.providerBadge}>{course.provider}</span>
                <button
                  className={`${styles.saveBtn} ${isSaved(course.id) ? styles.saveBtnActive : ''}`}
                  onClick={() => handleSave(course.id)}
                >
                  {isSaved(course.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                </button>
              </div>

              <div className={styles.courseContent}>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.courseDescription}>{course.description}</p>

                <div className={styles.courseMeta}>
                  <span className={styles.metaItem}>
                    <Star size={14} />
                    {course.rating}
                  </span>
                  <span className={styles.metaItem}>
                    <Users size={14} />
                    {(course.enrollments / 1000).toFixed(0)}k
                  </span>
                  <span className={styles.metaItem}>
                    <Clock size={14} />
                    {course.duration}
                  </span>
                </div>

                <div className={styles.courseSkills}>
                  {course.skills.slice(0, 3).map(skill => (
                    <span key={skill} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>

                <div className={styles.courseActions}>
                  <span className={styles.levelBadge}>{course.level}</span>
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewBtn}
                  >
                    View Course
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <BookOpen size={64} />
          <h2>No courses found</h2>
          <p>
            {activeTab === 'saved' 
              ? "You haven't saved any courses yet"
              : 'Try adjusting your search or filters'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default Courses
