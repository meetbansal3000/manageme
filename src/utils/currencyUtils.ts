import { Currency } from '../types';

export const EXCHANGE_RATES: Record<Currency, number> = {
  GBP: 1,
  USD: 1.28,
  INR: 106.5
};

export const SYMBOLS: Record<Currency, string> = {
  GBP: '£',
  USD: '$',
  INR: '₹'
};

export const formatCurrency = (amount: number, currency: Currency = 'GBP') => {
  const rate = EXCHANGE_RATES[currency] || 1;
  const symbol = SYMBOLS[currency] || '£';
  return `${symbol}${(amount * rate).toFixed(2)}`;
};
