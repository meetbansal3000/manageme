// Helper: Common Utility Functions & Class Name Helpers

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  const symbolMap: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    INR: '₹'
  };
  const sym = symbolMap[currency] || '£';
  return `${sym}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function truncate(text: string, length: number = 80): string {
  if (!text || text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

export function getStoredArray<T = any>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(key);
    if (!item) return [];
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
