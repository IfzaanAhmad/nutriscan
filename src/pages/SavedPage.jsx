import { Link, useNavigate } from 'react-router-dom';
import SavedRow from '../components/SavedRow.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import styles from './SavedPage.module.css';

export default function SavedPage() {
  const { savedProducts, pinnedCodes, onToggleSaved, onTogglePinned, onClearSaved } = useProducts();
  usePageTitle('Saved products');
  const navigate = useNavigate();

  function handleClearAll() {
    if (window.confirm('Remove all saved products?')) onClearSaved();
  }

  if (savedProducts.length === 0) {
    return (
      <>
        <h1 className="page-title">Your saved products</h1>
        <StatusMessage
          type="empty"
          title="No saved products yet"
          message="Browse and save products to see them here."
          action={
            <Link to="/" className="btn btn-primary">
              Go to search
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Your saved products</h1>
        <button type="button" className="btn" onClick={handleClearAll}>
          Clear all
        </button>
      </div>

      <ul className={styles.list}>
        {savedProducts.map((product) => (
          <SavedRow
            key={product.code}
            product={product}
            isPinned={pinnedCodes.includes(product.code)}
            onRemove={onToggleSaved}
            onTogglePinned={onTogglePinned}
          />
        ))}
      </ul>

      <div className={styles.footer}>
        <button type="button"
          className="btn btn-primary"
          disabled={pinnedCodes.length !== 2}
          onClick={() => navigate('/compare')}
        >
          Compare selected ({pinnedCodes.length}) →
        </button>
      </div>
    </>
  );
}
