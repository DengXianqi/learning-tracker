import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid
} from 'recharts'
import { 
  Target, CheckCircle, Clock, TrendingUp, 
  Plus, ArrowRight, BookOpen, Award
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { goalsApi, coursesApi } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import styles from './Dashboard.module.css'

const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444']

function Dashboard() {
  const { user, stats, refreshStats } = useAuth()
  const [goals, setGoals] = useState([])
  const [goalStats, setGoalStats] = useState(null)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [goalsResponse, statsResponse, coursesResponse] = await Promise.all([
        goalsApi.getAll({ limit: 5 }),
        goalsApi.getStats(),
        coursesApi.getRecommended().catch(() => ({ courses: [] }))
      ])
      
      setGoals(goalsResponse.goals || [])
      setGoalStats(statsResponse)
      setRecommendedCourses(coursesResponse.courses || [])
      refreshStats()
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data
  const statusChartData = goalStats?.byStatus?.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: parseInt(item.count)
  })) || []

  const categoryChartData = goalStats?.byCategory?.slice(0, 5).map(item => ({
    name: item.category,
    progress: Math.round(parseFloat(item.avg_progress) || 0),
    count: parseInt(item.count)
  })) || []

  // Calculate completion rate
  const completionRate = stats 
    ? Math.round((stats.completedMilestones / Math.max(stats.totalMilestones, 1)) * 100)
    : 0

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <section className={`${styles.welcome} animate-fade-in`}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className={styles.welcomeSubtitle}>
            Here's your learning progress overview
          </p>
        </div>
        <Link to="/goals/new" className="btn btn-primary">
          <Plus size={20} />
          New Goal
        </Link>
      </section>

      {/* Stats Cards */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} animate-fade-in stagger-1`}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4F46E5, #818CF8)' }}>
            <Target size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats?.totalGoals || 0}</span>
            <span className={styles.statLabel}>Total Goals</span>
          </div>
        </div>

        <div className={`${styles.statCard} animate-fade-in stagger-2`}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats?.completedGoals || 0}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>

        <div className={`${styles.statCard} animate-fade-in stagger-3`}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats?.totalMilestones || 0}</span>
            <span className={styles.statLabel}>Milestones</span>
          </div>
        </div>

        <div className={`${styles.statCard} animate-fade-in stagger-4`}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{completionRate}%</span>
            <span className={styles.statLabel}>Completion Rate</span>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className={styles.chartsSection}>
        {/* Status Distribution */}
        <div className={`${styles.chartCard} animate-fade-in stagger-2`}>
          <h3 className={styles.chartTitle}>Goal Status</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyChart}>
              <Award size={48} />
              <p>No goals yet. Create your first goal!</p>
            </div>
          )}
        </div>

        {/* Category Progress */}
        <div className={`${styles.chartCard} animate-fade-in stagger-3`}>
          <h3 className={styles.chartTitle}>Progress by Category</h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--color-surface)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="progress" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyChart}>
              <TrendingUp size={48} />
              <p>Add categories to your goals to see progress</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Goals and Courses */}
      <section className={styles.bottomSection}>
        {/* Recent Goals */}
        <div className={`${styles.recentCard} animate-fade-in stagger-4`}>
          <div className={styles.recentHeader}>
            <h3>Recent Goals</h3>
            <Link to="/goals" className={styles.viewAllLink}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
          
          {goals.length > 0 ? (
            <div className={styles.goalsList}>
              {goals.map((goal) => (
                <Link 
                  key={goal.id} 
                  to={`/goals/${goal.id}`}
                  className={styles.goalItem}
                >
                  <div className={styles.goalInfo}>
                    <span className={styles.goalTitle}>{goal.title}</span>
                    <span className={styles.goalCategory}>
                      {goal.category || 'Uncategorized'}
                    </span>
                  </div>
                  <div className={styles.goalProgress}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${goal.progress || 0}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{goal.progress || 0}%</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Target size={40} />
              <p>No goals yet</p>
              <Link to="/goals/new" className="btn btn-primary btn-sm">
                Create Goal
              </Link>
            </div>
          )}
        </div>

        {/* Recommended Courses */}
        <div className={`${styles.recentCard} animate-fade-in stagger-5`}>
          <div className={styles.recentHeader}>
            <h3>Recommended Courses</h3>
            <Link to="/courses" className={styles.viewAllLink}>
              Browse all <ArrowRight size={16} />
            </Link>
          </div>
          
          {recommendedCourses.length > 0 ? (
            <div className={styles.coursesList}>
              {recommendedCourses.slice(0, 3).map((course) => (
                <a 
                  key={course.id}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.courseItem}
                >
                  <div className={styles.courseThumbnail}>
                    <BookOpen size={20} />
                  </div>
                  <div className={styles.courseInfo}>
                    <span className={styles.courseTitle}>{course.title}</span>
                    <span className={styles.courseProvider}>{course.provider}</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <BookOpen size={40} />
              <p>Add goals to get personalized recommendations</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      {goalStats?.recentActivity?.length > 0 && (
        <section className={`${styles.activitySection} animate-fade-in stagger-5`}>
          <h3>Recent Activity</h3>
          <div className={styles.activityList}>
            {goalStats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles[activity.status]}`} />
                <div className={styles.activityContent}>
                  <span className={styles.activityTitle}>{activity.title}</span>
                  <span className={styles.activityMeta}>
                    {activity.type === 'milestone' ? 'Milestone' : 'Goal'} • 
                    {new Date(activity.activity_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Dashboard
