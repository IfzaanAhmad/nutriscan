import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext.jsx';
import styles from './Navbar.module.css';

// Shown on every page. <Link>/<NavLink> change the route without a full page reload.
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { savedProducts, pinnedProducts } = useProducts();
  const savedCount = savedProducts.length;
  const pinnedCount = pinnedProducts.length;

  // Escape closes the phone menu, like most menus on the web
  useEffect(() => {
    if (!menuOpen) return undefined;
    function onKey(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const linkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <button type="button"
          className={styles.menuButton}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>

        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <img src="/nutriscan-logo.svg" alt="NutriScan home" className={styles.logoImg} />
        </Link>

        <nav className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            Search
          </NavLink>
          <NavLink to="/saved" className={linkClass} onClick={() => setMenuOpen(false)}>
            Saved <span className={styles.badge}>{savedCount}</span>
          </NavLink>
          <NavLink to="/compare" className={linkClass} onClick={() => setMenuOpen(false)}>
            Compare <span className={styles.badge}>{pinnedCount}/2</span>
          </NavLink>
          <NavLink to="/limits" className={linkClass} onClick={() => setMenuOpen(false)}>
            My limits
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
