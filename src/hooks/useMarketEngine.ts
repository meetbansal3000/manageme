import { useState, useEffect, useRef } from 'react';

export type VolatilityProfile = 'low' | 'normal' | 'high';

export interface OrderBookEntry {
  price: number;
  volume: number;
  totalVolume: number;
}

export interface LiveMarketData {
  symbol: string;
  currentPrice: number;
  bidPrice: number;
  askPrice: number;
  spread: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  change: number;
  changePercent: number;
  isUp: boolean;
  atr: number;
  vixEstimate: number;
  high24h: number;
  low24h: number;
  volumeSpike: boolean;
  candles: any[];
}

export const useMarketEngine = (initialPrice: number, symbol: string) => {
  const [volatility, setVolatility] = useState<VolatilityProfile>('normal');
  const [marketData, setMarketData] = useState<LiveMarketData>({
    symbol,
    currentPrice: initialPrice,
    bidPrice: initialPrice * 0.999,
    askPrice: initialPrice * 1.001,
    spread: 0,
    bids: [],
    asks: [],
    change: 0,
    changePercent: 0,
    isUp: true,
    atr: initialPrice * 0.001,
    vixEstimate: 15,
    high24h: initialPrice * 1.01,
    low24h: initialPrice * 0.99,
    volumeSpike: false,
    candles: []
  });

  const priceRef = useRef(initialPrice);
  const basePriceRef = useRef(initialPrice);

  useEffect(() => {
    priceRef.current = initialPrice;
    basePriceRef.current = initialPrice;
    const spreadPct = volatility === 'low' ? 0.0002 : volatility === 'high' ? 0.002 : 0.0005;
    const spreadValue = initialPrice * spreadPct;
    setMarketData(prev => ({
      ...prev,
      symbol,
      currentPrice: initialPrice,
      bidPrice: initialPrice - (spreadValue / 2),
      askPrice: initialPrice + (spreadValue / 2),
      spread: spreadValue,
      high24h: Math.max(prev.high24h || 0, initialPrice),
      low24h: Math.min(prev.low24h || initialPrice, initialPrice)
    }));
  }, [initialPrice, symbol, volatility]);

  useEffect(() => {
    let tickInterval: NodeJS.Timeout;

    const generateTick = () => {
      // Geometric Brownian Motion setup
      let mu = 0.0001; // Drift
      let sigma = 0.001; // Volatility factor

      if (volatility === 'low') {
        sigma = 0.0002;
        mu = 0.00005;
      } else if (volatility === 'high') {
        sigma = 0.005;
        mu = 0.0005 * (Math.random() > 0.5 ? 1 : -1);
      }

      const randomShock = (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 1.5;
      
      const current = priceRef.current;
      const drift = (mu - (sigma * sigma) / 2);
      const shock = sigma * randomShock;
      const newPrice = current * Math.exp(drift + shock);
      priceRef.current = newPrice;

      // Calculate Bid-Ask
      const spreadPct = volatility === 'low' ? 0.0002 : volatility === 'high' ? 0.002 : 0.0005;
      const spreadValue = newPrice * spreadPct;
      const bid = newPrice - (spreadValue / 2);
      const ask = newPrice + (spreadValue / 2);

      // Generate Order Book
      const bids: OrderBookEntry[] = [];
      const asks: OrderBookEntry[] = [];
      
      let bidTotal = 0;
      let askTotal = 0;
      
      for (let i = 0; i < 5; i++) {
        const bPrice = bid - (i * spreadValue * 0.5);
        const bVol = Math.floor(Math.random() * 500) + 50 * (i+1);
        bidTotal += bVol;
        bids.push({ price: bPrice, volume: bVol, totalVolume: bidTotal });

        const aPrice = ask + (i * spreadValue * 0.5);
        const aVol = Math.floor(Math.random() * 500) + 50 * (i+1);
        askTotal += aVol;
        asks.push({ price: aPrice, volume: aVol, totalVolume: askTotal });
      }

      // Stats
      const change = newPrice - basePriceRef.current;
      const changePercent = (change / basePriceRef.current) * 100;
      
      setMarketData(prev => {
        let h24 = Math.max(prev.high24h, newPrice);
        let l24 = Math.min(prev.low24h, newPrice);
        let vix = volatility === 'low' ? 10 + Math.random()*2 : volatility === 'high' ? 30 + Math.random()*15 : 15 + Math.random()*5;
        let isVolumeSpike = volatility === 'high' && Math.random() > 0.8;
        
        return {
          symbol,
          currentPrice: newPrice,
          bidPrice: bid,
          askPrice: ask,
          spread: spreadValue,
          bids,
          asks,
          change,
          changePercent,
          isUp: change >= 0,
          atr: spreadValue * 2,
          vixEstimate: vix,
          high24h: h24,
          low24h: l24,
          volumeSpike: isVolumeSpike,
          candles: prev.candles // We can expand this later
        };
      });
    };

    const speed = volatility === 'high' ? 500 : volatility === 'low' ? 2000 : 1000;
    tickInterval = setInterval(generateTick, speed);

    return () => clearInterval(tickInterval);
  }, [volatility, symbol]);

  return { marketData, volatility, setVolatility };
};
