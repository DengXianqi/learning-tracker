import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { Target, CheckCircle, TrendingUp, BookOpen, ArrowRight, Play } from 'lucide-react'
import styles from './Landing.module.css'

const features = [
  { icon: Target, title: 'Set Learning Goals', description: 'Define clear objectives for your learning journey with deadlines and categories.' },
  { icon: CheckCircle, title: 'Track Milestones', description: 'Break down goals into achievable milestones and mark them complete as you progress.' },
  { icon: TrendingUp, title: 'Visualize Progress', description: 'See your learning journey unfold with beautiful charts and statistics.' },
  { icon: BookOpen, title: 'Discover Courses', description: 'Find relevant courses and resources to help you achieve your goals.' }
]

function Landing() {
  const { loginWithGoogle, loginDemo, loading, error } = useAuth()

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google login success, credential received')
    await loginWithGoogle(credentialResponse.credential)
  }

  const handleGoogleError = () => {
    console.error('Google login failed')
  }

  return (
    <div className={styles.landing}>
      <div className={styles.bgDecoration}>
        <div className={styles.bgCircle1}></div>
        <div className={styles.bgCircle2}></div>
        <div className={styles.bgCircle3}></div>
      </div>

      <header className={styles.header}>
        <div className={styles.logo}>
          <Target size={32} className={styles.logoIcon} />
          <span className={styles.logoText}>LearnTrack</span>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} animate-fade-in`}>
            Track Your Learning<span className={styles.heroTitleAccent}> Journey</span>
          </h1>
          <p className={`${styles.heroSubtitle} animate-fade-in stagger-1`}>
            Set goals, track milestones, and visualize your progress. Your personal learning companion to help you grow.
          </p>
          
          <div className={`${styles.heroActions} animate-fade-in stagger-2`}>
            {/* Google Sign-In Button */}
            <div className={styles.googleBtnWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            {/* Demo Button */}
            <button className={styles.demoBtn} onClick={loginDemo} disabled={loading}>
              <Play size={20} />
              {loading ? 'Loading...' : 'Try Demo'}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.heroImage}>
          <div className={styles.dashboardPreview}>
            <div className={styles.previewHeader}>
              <div className={styles.previewDots}><span></span><span></span><span></span></div>
            </div>
            <div className={styles.previewContent}>
              <div className={styles.previewCard}>
                <div className={styles.previewCardTitle}></div>
                <div className={styles.previewProgress}><div className={styles.previewProgressFill} style={{ width: '75%' }}></div></div>
              </div>
              <div className={styles.previewCard}>
                <div className={styles.previewCardTitle}></div>
                <div className={styles.previewProgress}><div className={styles.previewProgressFill} style={{ width: '45%' }}></div></div>
              </div>
              <div className={styles.previewCard}>
                <div className={styles.previewCardTitle}></div>
                <div className={styles.previewProgress}><div className={styles.previewProgressFill} style={{ width: '90%' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Everything you need to succeed</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={feature.title} className={`${styles.featureCard} animate-fade-in stagger-${index + 1}`}>
              <div className={styles.featureIcon}><feature.icon size={24} /></div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Ready to start your learning journey?</h2>
        <p className={styles.ctaSubtitle}>Join thousands of learners tracking their progress</p>
        <button className={styles.ctaBtn} onClick={loginDemo} disabled={loading}>
          Get Started Free <ArrowRight size={20} />
        </button>
      </section>

      <footer className={styles.footer}>
        <p>Built as a Full-Stack Capstone Project</p>
      </footer>
    </div>
  )
}

export default Landing
