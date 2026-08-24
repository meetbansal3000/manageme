// Component: Interactive Real-Time Live Tick & Price Chart

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Maximize2, BarChart2 } from 'lucide-react';
import { SpatialCard } from '../../ui/SpatialCard';

export interface LiveTickPoint {
  time: string;
  price: number;
  volume?: number;
}

export interface LiveTickChartProps {
  symbol?: string;
  currentPrice?: number;
  chartData?: LiveTickPoint[] | number[];
  isUp?: boolean;
  change?: string;
  changePercent?: number;
  height?: number;
  showControls?: boolean;
}

export const LiveTickChart: React.FC<LiveTickChartProps> = ({
  symbol = 'AAPL',
  currentPrice = 224.50,
  chartData,
  isUp: propIsUp,
  change = '+1.2%',
  changePercent = 1.2,
  height = 320,
  showControls = true
}) => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1D');
  const [hoveredPoint, setHoveredPoint] = useState<LiveTickPoint | null>(null);

  // Normalize points defensively
  const points: LiveTickPoint[] = useMemo(() => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      // Default initial baseline points to prevent SVG / Canvas crash
      const base = currentPrice || 224.50;
      const now = new Date();
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now.getTime() - (29 - i) * 60 * 1000);
        const hours = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        const variance = Math.sin(i / 3) * (base * 0.015) + (Math.random() - 0.5) * (base * 0.005);
        return {
          time: `${hours}:${mins}`,
          price: Number((base + variance).toFixed(2)),
          volume: Math.floor(10000 + Math.random() * 45000)
        };
      });
    }

    if (typeof chartData[0] === 'number') {
      const numArr = chartData as number[];
      return numArr.map((val, idx) => ({
        time: `${idx * 2}m`,
        price: Number(val) || currentPrice,
        volume: 25000
      }));
    }

    return chartData as LiveTickPoint[];
  }, [chartData, currentPrice]);

  const prices = useMemo(() => points.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p)), [points]);
  const minPrice = useMemo(() => (prices.length > 0 ? Math.min(...prices) * 0.998 : currentPrice * 0.99), [prices, currentPrice]);
  const maxPrice = useMemo(() => (prices.length > 0 ? Math.max(...prices) * 1.002 : currentPrice * 1.01), [prices, currentPrice]);
  const priceRange = useMemo(() => (maxPrice - minPrice > 0 ? maxPrice - minPrice : 1), [maxPrice, minPrice]);

  const firstPrice = points[0]?.price ?? currentPrice;
  const lastPrice = points[points.length - 1]?.price ?? currentPrice;
  const isPositive = propIsUp !== undefined ? propIsUp : lastPrice >= firstPrice;

  const svgWidth = 800;
  const svgHeight = height;
  const chartPaddingTop = 20;
  const chartPaddingBottom = 40;
  const chartPaddingLeft = 10;
  const chartPaddingRight = 60;

  const effectiveWidth = svgWidth - chartPaddingLeft - chartPaddingRight;
  const effectiveHeight = svgHeight - chartPaddingTop - chartPaddingBottom;

  // Path coordinates
  const coords = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((p, idx) => {
      const x = chartPaddingLeft + (idx / Math.max(points.length - 1, 1)) * effectiveWidth;
      const y = chartPaddingTop + effectiveHeight - ((p.price - minPrice) / priceRange) * effectiveHeight;
      return { x, y, point: p };
    });
  }, [points, minPrice, priceRange, effectiveWidth, effectiveHeight, chartPaddingLeft, chartPaddingTop]);

  const pathD = useMemo(() => {
    if (coords.length === 0) return `M ${chartPaddingLeft} ${svgHeight / 2} L ${svgWidth - chartPaddingRight} ${svgHeight / 2}`;
    return coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }, [coords, chartPaddingLeft, svgHeight, svgWidth, chartPaddingRight]);

  const areaD = useMemo(() => {
    if (coords.length === 0) return '';
    const lastCoord = coords[coords.length - 1];
    const firstCoord = coords[0];
    return `${pathD} L ${lastCoord.x} ${chartPaddingTop + effectiveHeight} L ${firstCoord.x} ${chartPaddingTop + effectiveHeight} Z`;
  }, [coords, pathD, chartPaddingTop, effectiveHeight]);

  const strokeColor = isPositive ? '#10B981' : '#F43F5E';
  const gradientId = `chartGradient_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <SpatialCard className="p-4 sm:p-5 border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-white/[0.03] backdrop-blur-2xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-[var(--text-primary)] font-mono tracking-tight">{symbol}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/10 text-[var(--text-muted)] font-mono">
              Live Feed
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono tabular-nums tracking-tight font-semibold">
            <span className="text-lg font-extrabold text-[var(--text-primary)]">
              ${(hoveredPoint?.price ?? lastPrice).toFixed(2)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </span>
          </div>
        </div>

        {/* Time range selector */}
        {showControls && (
          <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/5 p-1 rounded-xl">
            {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden select-none" style={{ height }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={chartPaddingLeft}
            y1={chartPaddingTop}
            x2={svgWidth - chartPaddingRight}
            y2={chartPaddingTop}
            stroke="currentColor"
            className="text-black/[0.04] dark:text-white/[0.04]"
            strokeDasharray="4 4"
          />
          <line
            x1={chartPaddingLeft}
            y1={chartPaddingTop + effectiveHeight / 2}
            x2={svgWidth - chartPaddingRight}
            y2={chartPaddingTop + effectiveHeight / 2}
            stroke="currentColor"
            className="text-black/[0.04] dark:text-white/[0.04]"
            strokeDasharray="4 4"
          />
          <line
            x1={chartPaddingLeft}
            y1={chartPaddingTop + effectiveHeight}
            x2={svgWidth - chartPaddingRight}
            y2={chartPaddingTop + effectiveHeight}
            stroke="currentColor"
            className="text-black/[0.04] dark:text-white/[0.04]"
          />

          {/* Shaded Area */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Price Scale Markers on Right */}
          <text
            x={svgWidth - chartPaddingRight + 8}
            y={chartPaddingTop + 4}
            className="fill-[var(--text-muted)] text-[10px] font-mono"
          >
            ${maxPrice.toFixed(2)}
          </text>
          <text
            x={svgWidth - chartPaddingRight + 8}
            y={chartPaddingTop + effectiveHeight / 2 + 4}
            className="fill-[var(--text-muted)] text-[10px] font-mono"
          >
            ${((maxPrice + minPrice) / 2).toFixed(2)}
          </text>
          <text
            x={svgWidth - chartPaddingRight + 8}
            y={chartPaddingTop + effectiveHeight + 4}
            className="fill-[var(--text-muted)] text-[10px] font-mono"
          >
            ${minPrice.toFixed(2)}
          </text>

          {/* Hover interactive overlay */}
          {coords.map((c, idx) => (
            <circle
              key={idx}
              cx={c.x}
              cy={c.y}
              r="6"
              className="opacity-0 hover:opacity-100 fill-white stroke-[var(--accent)] stroke-2 cursor-pointer transition-opacity"
              onMouseEnter={() => setHoveredPoint(c.point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover details badge */}
        {hoveredPoint && (
          <div className="absolute top-2 left-3 bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums text-white">
            <span>{hoveredPoint.time}</span> • <span className="text-emerald-400 font-bold">${hoveredPoint.price.toFixed(2)}</span>
          </div>
        )}
      </div>
    </SpatialCard>
  );
};

export default LiveTickChart;
