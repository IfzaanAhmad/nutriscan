import styles from './SkeletonGrid.module.css';

// Grey placeholder cards shown while products load (the loading state).
// Same grid as the real results, so the page doesn't jump when data arrives.
export default function SkeletonGrid({ count = 8, label = 'Loading products…' }) {
  return (
    <div role="status" aria-live="polite">
      <p className={styles.label}>
        <span className={styles.spinner} aria-hidden="true" /> {label}
      </p>
      <div className={styles.grid} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          // Placeholders have no data and never reorder, so the index is a safe key here
          <div key={i} className={styles.card}>
            <div className={`${styles.block} ${styles.image}`} />
            <div className={`${styles.block} ${styles.line}`} />
            <div className={`${styles.block} ${styles.lineShort}`} />
            <div className={`${styles.block} ${styles.badge}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
