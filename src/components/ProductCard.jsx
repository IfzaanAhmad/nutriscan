import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import NutriScoreBadge from './NutriScoreBadge.jsx';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, isSaved, isPinned, onToggleSaved, onTogglePinned }) {
  const meta = [product.brands, product.quantity].filter(Boolean).join(' · ');

  return (
    <article className={styles.card}>
      <Link to={`/product/${product.code}`} className={styles.body}>
        <ProductImage product={product} />
        <div className={styles.text}>
          <h2 className={styles.name}>{product.product_name}</h2>
          <p className={styles.meta}>{meta || 'Brand not available'}</p>
        </div>
        <NutriScoreBadge grade={product.nutriscore_grade} size="sm" />
      </Link>

      <div className={styles.actions}>
        <button type="button"
          className={`btn ${isPinned ? 'btn-active' : ''}`}
          onClick={() => onTogglePinned(product)}
        >
          {isPinned ? 'Pinned ✓' : 'Pin to compare'}
        </button>
        <button type="button"
          className={`btn ${isSaved ? 'btn-active' : ''}`}
          onClick={() => onToggleSaved(product)}
        >
          {isSaved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </article>
  );
}
