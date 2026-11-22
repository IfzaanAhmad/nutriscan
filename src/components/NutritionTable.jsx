import { NUTRIENT_ROWS, formatNutrient } from '../utils/nutrition.js';
import styles from './NutritionTable.module.css';


const LIMIT_KEYS = { sugars_100g: 'sugar', salt_100g: 'salt' };

export default function NutritionTable({ nutriments, highlights = {}, limits = null }) {
  return (
    <table className={styles.table}>
      <caption className={styles.caption}>Nutrition per 100 g</caption>
      <tbody>
        {NUTRIENT_ROWS.map((row) => {
          const raw = nutriments[row.key];
          const value = formatNutrient(raw, row.unit);
          const missing = raw == null;
          const limitName = LIMIT_KEYS[row.key];
          const overLimit = Boolean(limits && limitName && !missing && raw > limits[limitName]);
          const rowClass = overLimit ? styles.over : highlights[row.key] ? styles.better : '';
          return (
            <tr key={row.key} className={rowClass}>
              <th scope="row">{row.label}</th>
              <td className={missing ? styles.missing : ''}>
                {value}
                {highlights[row.key] && <span className={styles.tick}> ✓</span>}
                {overLimit && <span className={styles.overTag}>Above your limit</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
