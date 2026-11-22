import styles from './NutriScoreBadge.module.css';

export default function NutriScoreBadge({ grade, showInfo = false, size = 'md' }) {
  const letter = grade ? grade.toUpperCase() : '?';
  const gradeClass = grade ? styles[`grade${letter}`] : styles.unknown;

  return (
    <span className={`${styles.badge} ${styles[size]} ${gradeClass}`}>
      Nutri-Score {letter}
      {showInfo && (
        <span
          className={styles.info}
          title="Nutri-Score rates overall nutritional quality from A (best) to E (worst), based on sugar, salt, saturated fat and energy versus fibre, protein, fruit and vegetables."
          aria-label="What is Nutri-Score?"
        >
          ⓘ
        </span>
      )}
    </span>
  );
}
