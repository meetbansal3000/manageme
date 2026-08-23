---
title: Multi-Region Trading Terminal
tags: [finance, trading, valuation, charts]
status: active
---

# 📈 Multi-Region Trading Terminal

> [[00_ManageMe_MOC]] → Core Modules → Trading Terminal

## Overview

The Trading Terminal is a simulated multi-asset paper trading environment supporting 5 regional exchanges. It provides Level-2 order book depth, real-time tick simulation, and portfolio analytics including Sharpe ratio and DuPont decomposition.

## Related Modules

- [[Live_Tick_Chart]] — Streaming candlestick / line chart with configurable timeframes
- [[Order_Ticket]] — Market / Limit order form with position sizing
- [[Region_Filters]] — UK (FTSE 100), US (S&P 500), IN (NIFTY 50), EU (DAX 40), SG (STI)

## Regional Asset Data

| Region | Index | Currency | Exchange Hours (UTC) |
|--------|-------|----------|---------------------|
| 🇬🇧 UK | FTSE 100 | GBP | 08:00–16:30 |
| 🇺🇸 US | S&P 500 | USD | 14:30–21:00 |
| 🇮🇳 IN | NIFTY 50 | INR | 03:45–10:00 |
| 🇪🇺 EU | DAX 40 | EUR | 07:00–15:30 |
| 🇸🇬 SG | STI Index | SGD | 01:00–09:00 |

## Level-2 Order Book Depth

The simulated order book displays:
- **Bid Side**: 5 price levels with volume bars
- **Ask Side**: 5 price levels with volume bars
- **Spread**: Real-time bid-ask spread in basis points
- **VIX Estimate**: Simulated volatility index

Safety guards prevent crashes from empty order books:
```tsx
const maxVolume = Math.max(1, ...bidVolumes, ...askVolumes);
```

## Portfolio Analytics

- **P&L**: Mark-to-market unrealised gains/losses
- **Sharpe Ratio**: `(Return - RiskFree) / StdDev` with NaN fallback
- **DuPont Analysis**: Net Margin × Asset Turnover × Equity Multiplier
- **Allocation %**: Per-position weight with `Number(...) || 0` guards

## Multi-Currency Support

All positions display in their native currency. The portfolio summary converts to the user's base currency (GBP by default) using simulated FX rates.

## Key Files

- `src/components/PaperTradingTab.tsx`
- `src/components/LiveMarketPanel.tsx`
- `src/components/LiveStockTicker.tsx`
- `src/hooks/useWatchlist.ts`
