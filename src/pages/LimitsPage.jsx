import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_LIMITS, useProducts } from '../context/ProductsContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import styles from './LimitsPage.module.css';


const FIELDS = [
  { name: 'sugar', label: 'Sugar limit', example: '10' },
  { name: 'salt', label: 'Salt limit', example: '1.2' },
];

function validate(label, example, raw) {
  const text = raw.trim();
  if (text === '') return `${label} is required. Enter grams per 100 g, for example ${example}.`;
  if (!/^\d+(\.\d+)?$/.test(text)) return `${label} must be a number like ${example} (use a dot for decimals, no letters or minus sign).`;
  const value = Number(text);
  if (value > 100) return `${label} can't be more than 100 g, because that is the whole 100 g of food.`;
  if (!/^\d+(\.\d)?$/.test(text)) return `${label} can have at most one decimal place, for example ${example}.`;
  return '';
}

export default function LimitsPage() {
  const { limits, onSaveLimits } = useProducts();
  usePageTitle('My limits');
  const [values, setValues] = useState({ sugar: String(limits.sugar), salt: String(limits.salt) });
  const [touched, setTouched] = useState({ sugar: false, salt: false });
  const [savedMessage, setSavedMessage] = useState('');
  const errors = {};
  FIELDS.forEach((f) => {
    errors[f.name] = validate(f.label, f.example, values[f.name]);
  });
  const hasErrors = FIELDS.some((f) => errors[f.name]);

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setSavedMessage(''); 
  }

  function handleBlur(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (hasErrors) {
      setTouched({ sugar: true, salt: true });
      const first = FIELDS.find((f) => errors[f.name]);
      document.getElementById(`limit-${first.name}`)?.focus();
      return; 
    }
    onSaveLimits({ sugar: Number(values.sugar), salt: Number(values.salt) });
    setSavedMessage(`Saved. Products with more than ${Number(values.sugar)} g sugar or ${Number(values.salt)} g salt per 100 g will be marked.`);
  }

  function handleReset() {
    setValues({ sugar: String(DEFAULT_LIMITS.sugar), salt: String(DEFAULT_LIMITS.salt) });
    setTouched({ sugar: false, salt: false });
    onSaveLimits(DEFAULT_LIMITS);
    setSavedMessage('Limits reset to the defaults (22.5 g sugar, 1.5 g salt).');
  }

  return (
    <>
      <h1 className="page-title">My limits</h1>
      <p className={styles.intro}>
        Set how much sugar and salt per 100 g is too much for you. Any product above your limit is marked on its
        product page. Your limits are remembered on this device.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {FIELDS.map((f) => {
          const showError = touched[f.name] && errors[f.name];
          return (
            <div key={f.name} className={styles.field}>
              <label htmlFor={`limit-${f.name}`} className={styles.label}>
                {f.label} <span className={styles.unit}>(g per 100 g)</span>
              </label>
              <input
                id={`limit-${f.name}`}
                className={`${styles.input} ${showError ? styles.invalid : ''}`}
                type="text"
                inputMode="decimal"
                value={values[f.name]}
                onChange={(e) => handleChange(f.name, e.target.value)}
                onBlur={() => handleBlur(f.name)}
                aria-invalid={Boolean(showError)}
                aria-describedby={showError ? `limit-${f.name}-error` : undefined}
              />
              {showError && (
                <p id={`limit-${f.name}-error`} className={styles.error} role="alert">
                  {errors[f.name]}
                </p>
              )}
            </div>
          );
        })}

        <div className={styles.actions}>
          <button className="btn btn-primary" type="submit">
            Save limits
          </button>
          <button className="btn" type="button" onClick={handleReset}>
            Reset to defaults
          </button>
        </div>

        {savedMessage && (
          <p className={styles.success} role="status">
            {savedMessage} <Link to="/">Search for a product</Link> to see it.
          </p>
        )}
      </form>
    </>
  );
}
