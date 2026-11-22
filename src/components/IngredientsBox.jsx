import { NOT_AVAILABLE } from '../utils/nutrition.js';
import styles from './IngredientsBox.module.css';

// Ingredients text plus a highlighted allergen warning.
export default function IngredientsBox({ text, allergens }) {
  return (
    <section className={styles.box}>
      <h2 className={styles.heading}>Ingredients</h2>
      <p className={text ? '' : styles.missing}>{text || NOT_AVAILABLE}</p>

      <div className={styles.allergens}>
        <span aria-hidden="true">⚠️</span>
        <strong>Allergens:</strong> {allergens || NOT_AVAILABLE}
      </div>
    </section>
  );
}
