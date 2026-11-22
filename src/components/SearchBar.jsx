import styles from './SearchBar.module.css';

// Controlled input: the parent owns the value (and decides what is valid),
// so the same component can be reused anywhere a search box is needed.
// `error` is shown right under the box, in red, and linked to the input with
// aria-describedby so screen readers read it too.
export default function SearchBar({ value, onChange, onSubmit, error = '', placeholder = 'Search for a food product…' }) {
  function handleSubmit(event) {
    event.preventDefault(); // stop the browser reloading the page
    onSubmit?.(value);
  }

  return (
    <div className={styles.wrap}>
      {/* noValidate: we show our own messages, not the browser's pop-ups */}
      <form className={styles.form} onSubmit={handleSubmit} role="search" noValidate>
        <input
          className={`${styles.input} ${error ? styles.invalid : ''}`}
          type="search"
          value={value}
          placeholder={placeholder}
          aria-label="Search products"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'search-error' : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>
      {error && (
        <p id="search-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
