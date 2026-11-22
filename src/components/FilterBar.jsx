import styles from './FilterBar.module.css';

const GRADES = ['a', 'b', 'c', 'd', 'e'];

export default function FilterBar({ categories, category, grade, onCategoryChange, onGradeChange, onClear, disabled = false }) {
  return (
    <div className={styles.bar}>
      <span className={styles.label}>Filter by:</span>

      <select
        className={styles.select}
        value={category}
        aria-label="Category"
        disabled={disabled}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.tag} value={c.tag}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={grade}
        aria-label="Nutri-Score"
        disabled={disabled}
        onChange={(e) => onGradeChange(e.target.value)}
      >
        <option value="">Any Nutri-Score</option>
        {GRADES.map((g) => (
          <option key={g} value={g}>
            Nutri-Score {g.toUpperCase()}
          </option>
        ))}
      </select>

      <button className={`btn ${styles.clear}`} type="button" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
