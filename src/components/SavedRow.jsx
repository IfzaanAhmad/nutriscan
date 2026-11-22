import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import NutriScoreBadge from './NutriScoreBadge.jsx';
import styles from './SavedRow.module.css';

export default function SavedRow({ product, isPinned, onRemove, onTogglePinned }) {
  return (
    <li className={styles.row}>
      <ProductImage product={product} size="sm" />

      <Link to={`/product/${product.code}`} className={styles.info}>
        <span className={styles.name}>{product.product_name}</span>
        <span className={styles.qty}>{[product.brands, product.quantity].filter(Boolean).join(' · ')}</span>
      </Link>

      <NutriScoreBadge grade={product.nutriscore_grade} size="sm" />

      <div className={styles.actions}>
        <button type="button"
          className={`btn ${isPinned ? 'btn-active' : ''}`}
          onClick={() => onTogglePinned(product)}
        >
          {isPinned ? 'Pinned ✓' : 'Pin'}
        </button>
        <button type="button" className="btn" onClick={() => onRemove(product)}>
          Remove
        </button>
      </div>
    </li>
  );
}
