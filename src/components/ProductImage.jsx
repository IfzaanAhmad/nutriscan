import { useState } from 'react';
import styles from './ProductImage.module.css';

export default function ProductImage({ product, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const src = size === 'lg' ? product.image_url : product.image_small_url;

  return (
    <div className={`${styles.frame} ${styles[size]}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={product.product_name}
          className={styles.img}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.placeholder} role="img" aria-label="No photo available">
          🛒
        </span>
      )}
    </div>
  );
}
