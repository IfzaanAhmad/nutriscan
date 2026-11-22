export const NUTRIENT_ROWS = [
  { key: 'energy-kcal_100g', label: 'Energy', unit: 'kcal', better: 'lower' },
  { key: 'fat_100g', label: 'Fat', unit: 'g', better: 'lower' },
  { key: 'saturated-fat_100g', label: 'Saturated fat', unit: 'g', better: 'lower' },
  { key: 'carbohydrates_100g', label: 'Carbohydrates', unit: 'g', better: null },
  { key: 'sugars_100g', label: 'Sugars', unit: 'g', better: 'lower' },
  { key: 'fiber_100g', label: 'Fibre', unit: 'g', better: 'higher' },
  { key: 'proteins_100g', label: 'Protein', unit: 'g', better: 'higher' },
  { key: 'salt_100g', label: 'Salt', unit: 'g', better: 'lower' },
];

export const NOT_AVAILABLE = 'Not available';
export function formatNutrient(value, unit) {
  if (value === null || value === undefined || value === '') return NOT_AVAILABLE;
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
}

// Returns 'a' | 'b' | 'tie' | null for one nutrient row.
export function compareNutrient(row, valueA, valueB) {
  if (!row.better || valueA == null || valueB == null) return null;
  if (valueA === valueB) return 'tie';
  const aIsLower = valueA < valueB;
  if (row.better === 'lower') return aIsLower ? 'a' : 'b';
  return aIsLower ? 'b' : 'a';
}

// Nutri-Score A is best, E is worst.
const GRADE_ORDER = ['a', 'b', 'c', 'd', 'e'];

function bySugar(productA, productB, reason) {
  const sugarA = productA.nutriments.sugars_100g;
  const sugarB = productB.nutriments.sugars_100g;
  if (sugarA != null && sugarB != null && sugarA !== sugarB) {
    return { winner: sugarA < sugarB ? productA : productB, reason };
  }
  return null;
}

export function pickWinner(productA, productB) {
  const rankA = GRADE_ORDER.indexOf(productA.nutriscore_grade);
  const rankB = GRADE_ORDER.indexOf(productB.nutriscore_grade);

  // Only compare grades when BOTH products have one. A missing grade means
  // "unknown", not "worse than E", so it can't lose on Nutri-Score.
  if (rankA !== -1 && rankB !== -1) {
    if (rankA !== rankB) {
      return { winner: rankA < rankB ? productA : productB, reason: 'better Nutri-Score' };
    }
    return bySugar(productA, productB, 'same Nutri-Score, lower sugar') ?? { winner: null, reason: 'too close to call' };
  }

  const missing = rankA === -1 && rankB === -1 ? 'neither has a Nutri-Score' : 'one has no Nutri-Score';
  return bySugar(productA, productB, `${missing}, so compared on sugar: lower sugar`) ?? {
    winner: null,
    reason: `impossible to rank (${missing} and sugar is missing or equal)`,
  };
}
