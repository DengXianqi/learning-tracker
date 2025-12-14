import styles from './LoadingSpinner.module.css'

function LoadingSpinner({ size = 'md', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        <div className={`${styles.spinner} ${styles[size]}`}>
          <div className={styles.ring}></div>
          <div className={styles.ring}></div>
          <div className={styles.ring}></div>
        </div>
        <p className={styles.text}>Loading...</p>
      </div>
    )
  }

  return (
    <div className={`${styles.spinner} ${styles[size]}`}>
      <div className={styles.ring}></div>
      <div className={styles.ring}></div>
      <div className={styles.ring}></div>
    </div>
  )
}

export default LoadingSpinner
