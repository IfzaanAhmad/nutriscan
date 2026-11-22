import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import NutriScoreBadge from './NutriScoreBadge.jsx';
import NutritionTable from './NutritionTable.jsx';
import styles from './CompareColumn.module.css';

export default function CompareColumn({ product, highlights = {}, isWinner = false, limits = null, onRemove }) {
  return (
    <section className={`${styles.column} ${isWinner ? styles.winner : ''}`}>
      <header className={styles.header}>
        <ProductImage product={product} size="sm" />
        <div className={styles.info}>
          <h2 className={styles.name}>
            <Link to={`/product/${product.code}`}>{product.product_name}</Link>
          </h2>
          <p className={styles.brand}>{product.brands || 'Brand not available'}</p>
          <NutriScoreBadge grade={product.nutriscore_grade} size="sm" />
        </div>

        <button type="button"
          className={`btn ${styles.remove}`}
          onClick={() => onRemove(product)}
          aria-label={`Remove ${product.product_name} from comparison`}
        >
          ✕ Remove
        </button>
      </header>

      <NutritionTable nutriments={product.nutriments} highlights={highlights} limits={limits} />
    </section>
  );
}