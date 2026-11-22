import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import NutriScoreBadge from '../components/NutriScoreBadge.jsx';
import NutritionTable from '../components/NutritionTable.jsx';
import IngredientsBox from '../components/IngredientsBox.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useProduct } from '../hooks/useProduct.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import styles from './ProductDetailPage.module.css';

function round(value, decimals = 0) {
  if (value == null) return null;
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export default function ProductDetailPage() {
  const { savedCodes, pinnedCodes, onToggleSaved, onTogglePinned, limits } = useProducts();
  const { code } = useParams();
  const navigate = useNavigate();
  const { status, product, error, retry } = useProduct(code);
  usePageTitle(status === 'success' ? product.product_name : status === 'error' ? 'Product not found' : 'Loading product');

  function goBack() {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/');
  }

  const backButton = (
    <button type="button" className="btn" onClick={goBack}>
      ← Back to results
    </button>
  );

  if (status === 'loading') {
    return (
      <>
        {backButton}
        <div className={styles.stateWrap}>
          <StatusMessage headingLevel={1} type="loading" title="Loading product…" message={`Fetching barcode ${code} from Open Food Facts.`} />
        </div>
      </>
    );
  }

  if (status === 'error') {
    const notFound = error?.kind === 'not-found';
    return (
      <>
        {backButton}
        <div className={styles.stateWrap}>
          <StatusMessage
            headingLevel={1}
            type="error"
            title={notFound ? 'Product not found' : 'Couldn’t load this product'}
            message={notFound ? `No product with barcode ${code} is in the Open Food Facts database.` : error?.message}
            action={
              notFound ? null : (
                <button type="button" className="btn btn-primary" onClick={retry}>
                  Try again
                </button>
              )
            }
          />
        </div>
      </>
    );
  }

  const isSaved = savedCodes.includes(product.code);
  const isPinned = pinnedCodes.includes(product.code);
  const { nutriments } = product;
  const meta = [product.brands, product.quantity].filter(Boolean).join(' · ');
  const kcal = round(nutriments['energy-kcal_100g']);
  const protein = round(nutriments.proteins_100g, 1);

  return (
    <>
      {backButton}

      <div className={styles.layout}>
        <ProductImage product={product} size="lg" />

        <div className={styles.summary}>
          <h1 className="page-title">{product.product_name}</h1>
          <p className={styles.brand}>{meta || 'Brand not available'}</p>
          <NutriScoreBadge grade={product.nutriscore_grade} showInfo />


          <div className={styles.keyStats}>
            <div>
              <span className={styles.statValue}>{kcal ?? '—'}</span>
              <span className={styles.statLabel}>kcal / 100 g</span>
            </div>
            <div>
              <span className={styles.statValue}>{protein != null ? `${protein} g` : '—'}</span>
              <span className={styles.statLabel}>protein / 100 g</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={`btn ${isPinned ? 'btn-active' : ''}`} onClick={() => onTogglePinned(product)}>
              {isPinned ? 'Pinned ✓' : '📌 Pin to compare'}
            </button>
            <button type="button" className={`btn ${isSaved ? 'btn-active' : ''}`} onClick={() => onToggleSaved(product)}>
              {isSaved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.panels}>
        <section className={styles.panel}>
          <NutritionTable nutriments={nutriments} limits={limits} />
          <p className={styles.limitNote}>
            Marked against your limits: {limits.sugar} g sugar, {limits.salt} g salt per 100 g.{' '}
            <Link to="/limits">Change limits</Link>
          </p>
        </section>
        <IngredientsBox text={product.ingredients_text} allergens={product.allergens} />
      </div>

      <p className={styles.source}>
        Data from{' '}
        <a href={`https://world.openfoodfacts.org/product/${product.code}`} target="_blank" rel="noreferrer">
          Open Food Facts
        </a>{' '}
        · barcode {product.code}
      </p>
    </>
  );
}
