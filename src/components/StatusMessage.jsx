import styles from './StatusMessage.module.css';

const ICONS = { error: '⚠️', empty: '🔍', idle: '🥗' };

// One component for the loading, error, empty and idle (not searched yet) states.
// headingLevel: 1 when the message is the whole page (404, product not found),
// otherwise 2, so heading levels never skip.
export default function StatusMessage({ type = 'empty', title, message, action, headingLevel = 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <div
      className={`${styles.box} ${styles[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {type === 'loading' ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <span className={styles.icon} aria-hidden="true">
          {ICONS[type]}
        </span>
      )}
      <Heading className={styles.title}>{title}</Heading>
      {message && <p>{message}</p>}
      {action && <div className={styles.actions}>{action}</div>}
    </div>
  );
}
