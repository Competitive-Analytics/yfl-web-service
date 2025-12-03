/**
 * Shared formatting utilities for leaderboard components
 */

/**
 * Format a number as a percentage with 2 decimal places
 */
export const formatPercent = (value: number | null): string => {
  if (value === null) return "—";
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (value: number | null): string => {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number as a decimal with specified decimal places
 */
export const formatDecimal = (value: number | null, decimals: number = 4): string => {
  if (value === null) return "—";
  return value.toFixed(decimals);
};

/**
 * Format a number as an integer
 */
export const formatInteger = (value: number | null): string => {
  if (value === null) return "—";
  return value.toString();
};
