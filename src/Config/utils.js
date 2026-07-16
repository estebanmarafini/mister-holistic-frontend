/**
 * Formats a number as a currency string with dot (.) as thousands separator and comma (,) as decimals separator.
 * Example: 40000 -> "$40.000,00"
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '$0,00';
  return '$' + Number(price).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
