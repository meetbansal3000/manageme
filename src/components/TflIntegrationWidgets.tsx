import React, { useState, useEffect } from 'react';
import { tflApi } from '../services/tflApi';
import { AlertCircle, CheckCircle2, Info, Bike, Navigation } from 'lucide-react';

export const NetworkStatusBanner = () => {
  const [status, setStatus] = useState<string>('Loading status...');
  const [isGood, setIsGood] = useState(true);

  useEffect(() => {
    tflApi.getNetworkStatus().then(res => {
      setStatus(res);
      setIsGood(res.includes('Good Service'));
    });
  }, []);

  return (
    <div className={`p-3 rounded-xl flex items-center justify-between border ${isGood ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
      <div className="flex items-center gap-2">
        {isGood ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <span className="font-bold text-sm">{status}</span>
      </div>
      <div className="text-xs opacity-80">Live TfL Network Status</div>
    </div>
  );
};

export const LiveArrivalsBoard = ({ naptanId = '940GZZLUVIC' }: { naptanId?: string }) => {
  const [arrivals, setArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArrivals = () => {
    tflApi.getLiveArrivals(naptanId).then(data => {
      // Sort by time to station
      const list = Array.isArray(data) ? data : [];
      const sorted = list.sort((a, b) => (a?.timeToStation || 0) - (b?.timeToStation || 0));
      setArrivals(sorted.slice(0, 5));
      setLoading(false);
    }).catch(() => {
      setArrivals([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchArrivals();
    const interval = setInterval(fetchArrivals, 30000); // 30s auto-polling
    return () => clearInterval(interval);
  }, [naptanId]);

  return (
    <div className="glass-panel border border-[var(--border)] rounded-2xl p-5">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
        <Navigation className="w-5 h-5 text-blue-400" />
        Live Station Departures
      </h3>
      {loading ? (
        <div className="text-sm text-gray-400">Connecting to Live API...</div>
      ) : (
        <div className="space-y-3">
          {(arrivals || []).map((arr) => {
            const mins = Math.floor((arr?.timeToStation || 0) / 60);
            const timeStr = mins === 0 ? 'Due' : `${mins} min`;
            return (
              <div key={arr.id} className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-[var(--border)]">
                <div>
                  <div className="font-bold text-sm text-[var(--text-primary)]">{arr.lineName} to {arr.destinationName}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{arr.platformName}</div>
                </div>
                <div className="px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg font-bold text-sm text-right min-w-[70px]">
                  {timeStr}
                </div>
              </div>
            );
          })}
          {(!arrivals || arrivals.length === 0) && (
            <div className="text-sm text-gray-400">No upcoming arrivals in the next 30 minutes.</div>
          )}
        </div>
      )}
    </div>
  );
};

export const CycleHireBoard = () => {
  const [bikes, setBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tflApi.getBikePoints().then(data => {
      const list = Array.isArray(data) ? data : [];
      setBikes(list.slice(0, 4)); // Show first 4 for demo
      setLoading(false);
    }).catch(() => {
      setBikes([]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="glass-panel border border-[var(--border)] rounded-2xl p-5">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
        <Bike className="w-5 h-5 text-emerald-400" />
        Santander Cycles Availability
      </h3>
      {loading ? (
        <div className="text-sm text-gray-400">Locating docks...</div>
      ) : (
        <div className="space-y-3">
          {(bikes || []).map((bike) => {
            const addProps = Array.isArray(bike?.additionalProperties) ? bike.additionalProperties : [];
            const availableBikes = addProps.find((p: any) => p.key === 'NbBikes')?.value || '0';
            const emptyDocks = addProps.find((p: any) => p.key === 'NbEmptyDocks')?.value || '0';
            const numBikes = parseInt(availableBikes);
            
            let badgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            if (numBikes === 0) badgeClass = 'bg-red-500/20 text-red-400 border-red-500/30';
            else if (numBikes < 3) badgeClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';

            return (
              <div key={bike.id} className="p-3 bg-black/20 rounded-xl border border-[var(--border)]">
                <div className="font-bold text-sm text-[var(--text-primary)] truncate" title={bike.commonName}>
                  {bike.commonName}
                </div>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${badgeClass}`}>
                    {availableBikes} Bikes
                  </span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-md border bg-gray-500/20 text-gray-400 border-gray-500/30">
                    {emptyDocks} Docks
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
