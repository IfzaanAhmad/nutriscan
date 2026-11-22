import { Link, useNavigate } from 'react-router-dom';
import CompareColumn from '../components/CompareColumn.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { NUTRIENT_ROWS, compareNutrient, pickWinner } from '../utils/nutrition.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import styles from './ComparePage.module.css';

export default function ComparePage() {
  const { pinnedProducts, onTogglePinned, onClearPinned, limits } = useProducts();
  usePageTitle('Compare');
  const navigate = useNavigate();
  const products = pinnedProducts;
  function goBack() {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/');
  }

  const header = (
    <div className="page-header">
      <h1 className="page-title">Compare products</h1>
      <div className={styles.headerActions}>
        {products.length > 0 && (
          <button type="button" className="btn" onClick={onClearPinned}>
            Clear comparison
          </button>
        )}
        <button type="button" className="btn" onClick={goBack}>
          ← Back
        </button>
      </div>
    </div>
  );

  // Nothing pinned
  if (products.length === 0) {
    return (
      <>
        {header}
        <StatusMessage
          type="empty"
          title="Pick two products to compare"
          message={'Use "Pin to compare" on any product to add it here.'}
          action={
            <Link to="/" className="btn btn-primary">
              Go to search
            </Link>
          }
        />
      </>
    );
  }

  // One pinned: show it, and an empty slot asking for a second product
  if (products.length === 1) {
    return (
      <>
        {header}
        <div className={styles.grid}>
          <CompareColumn product={products[0]} limits={limits} onRemove={onTogglePinned} />
          <div className={styles.slot}>
            <p className={styles.slotTitle}>Pick one more product</p>
            <p className={styles.slotText}>Pin a second product to see them side by side.</p>
            <Link to="/" className="btn btn-primary">
              Find a product
            </Link>
          </div>
        </div>
      </>
    );
  }

  const [a, b] = products;

  // Work out, row by row, which product has the healthier value.
  const highlightsA = {};
  const highlightsB = {};
  NUTRIENT_ROWS.forEach((row) => {
    const result = compareNutrient(row, a.nutriments[row.key], b.nutriments[row.key]);
    if (result === 'a') highlightsA[row.key] = true;
    if (result === 'b') highlightsB[row.key] = true;
  });

  const { winner, reason } = pickWinner(a, b);

  return (
    <>
      {header}

      <div className={styles.grid}>
        {products.map((product, i) => (
          <CompareColumn
            key={product.code}
            product={product}
            highlights={i === 0 ? highlightsA : highlightsB}
            isWinner={winner?.code === product.code}
            limits={limits}
            onRemove={onTogglePinned}
          />
        ))}
      </div>

      <p className={styles.verdict}>
        {winner ? (
          <>
            🏆 <strong>Better choice: {winner.product_name}</strong> ({reason})
          </>
        ) : (
          <>These two are {reason}.</>
        )}
      </p>
      <p className={styles.limitNote}>
        Red rows are above your limits ({limits.sugar} g sugar, {limits.salt} g salt per 100 g).{' '}
        <Link to="/limits">Change limits</Link>
      </p>
    </>
  );
}