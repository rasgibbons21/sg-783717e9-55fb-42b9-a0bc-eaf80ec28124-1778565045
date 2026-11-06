/** Maps prices to vertical pixels (higher prices nearer the top) and back. */
export function priceScale(min: number, max: number, height: number, pad = 0) {
  const span = max - min || 1;
  const usable = Math.max(height - pad * 2, 1);
  return {
    toY: (price: number) => pad + ((max - price) / span) * usable,
    toPrice: (y: number) => max - ((y - pad) / usable) * span,
  };
}
