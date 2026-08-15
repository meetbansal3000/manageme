/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Train, Bus, MapPin, Clock, ArrowRight, AlertTriangle, AlertCircle } from 'lucide-react';
import { NetworkStatusBanner, LiveArrivalsBoard, CycleHireBoard } from './TflIntegrationWidgets';

const MAPS_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY as string;

function TransitRouter() {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLib || !map) return;
    directionsRendererRef.current = new routesLib.DirectionsRenderer({ map });
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [routesLib, map]);

  const handleSearch = () => {
    if (!routesLib || !origin || !destination) return;
    setIsLoading(true);
    setError(null);

    const directionsService = new routesLib.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
          modes: [google.maps.TransitMode.TRAIN, google.maps.TransitMode.BUS],
          routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
        }
      },
      (result, status) => {
        setIsLoading(false);
        if (status === 'OK' && result) {
          setDirections(result);
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
          }
        } else {
          setError('Could not find transit route. Please try different locations.');
          setDirections(null);
        }
      }
    );
  };

  const handleSaveRoute = () => {
    try {
      const raw = localStorage.getItem('saved_transit_routes');
      const saved = raw ? JSON.parse(raw) : [];
      const newRoute = { origin, destination };
      if (!saved.some((r: any) => r.origin === origin && r.destination === destination)) {
        localStorage.setItem('saved_transit_routes', JSON.stringify([...saved, newRoute]));
        console.log('Route saved to offline vault!');
      }
    } catch (e) {
      console.warn('Could not save route:', e);
    }
  };

  const loadSavedRoutes = () => {
    try {
      const raw = localStorage.getItem('saved_transit_routes');
      const saved = raw ? JSON.parse(raw) : [];
      if (saved.length > 0) {
        setOrigin(saved[0].origin);
        setDestination(saved[0].destination);
      }
    } catch (e) {
      console.warn('Could not load routes:', e);
    }
  };

  // Process the primary route
  let direct = false;
  let steps: any[] = [];
  let transitLegs = 0;
  
  if (directions?.routes && directions.routes.length > 0 && directions.routes[0]?.legs?.length > 0) {
    const route = directions.routes[0].legs[0];
    steps = route?.steps || [];
    transitLegs = steps.filter(s => s.travel_mode === 'TRANSIT').length;
    direct = transitLegs === 1;
  }

  return (
    <div className="space-y-6">
      <NetworkStatusBanner />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LiveArrivalsBoard />
        <CycleHireBoard />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar: Controls & Results */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="glass-panel border border-[var(--border)] rounded-2xl p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
            <Train className="w-5 h-5 text-purple-400" />
            Route Planner
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Origin</label>
              <input 
                value={origin} 
                onChange={e => setOrigin(e.target.value)}
                placeholder="e.g. Central Station"
                className="w-full bg-black/20 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Destination</label>
              <input 
                value={destination} 
                onChange={e => setDestination(e.target.value)}
                placeholder="e.g. Airport Terminal"
                className="w-full bg-black/20 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={isLoading || !origin || !destination}
              className="w-full py-2 mt-2 bg-[var(--accent)] text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Searching...' : 'Find Route'}
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handleSaveRoute}
                disabled={!origin || !destination}
                className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/20 disabled:opacity-50 transition-colors text-xs"
              >
                Save to Vault
              </button>
              <button 
                onClick={loadSavedRoutes}
                className="flex-1 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-xl hover:bg-blue-500/20 transition-colors text-xs"
              >
                Load Saved
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
        </div>

        {directions?.routes && directions.routes.length > 0 && directions.routes[0]?.legs?.[0] && (
          <div className="glass-panel border border-[var(--border)] rounded-2xl p-5 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
              <div>
                <h4 className="font-bold text-lg">{directions.routes[0].legs[0].duration?.text}</h4>
                <p className="text-xs text-[var(--text-secondary)]">{directions.routes[0].legs[0].distance?.text}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${direct ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                {direct ? '🟢 DIRECT' : '🟡 TRANSFER REQUIRED'}
              </div>
            </div>

            <div className="space-y-4">
              {steps.map((step, idx) => {
                if (step.travel_mode === 'TRANSIT' && step.transit) {
                  const t = step.transit;
                  // Mock live status logic based on time
                  const isDelayed = Math.random() > 0.7; // 30% chance for demo
                  return (
                    <div key={idx} className="p-3 bg-black/20 rounded-xl border border-[var(--border)] relative">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: t.line?.color || '#3b82f6' }}>
                            {t.line?.vehicle?.type === 'BUS' ? <Bus className="w-4 h-4"/> : <Train className="w-4 h-4"/>}
                          </div>
                          <div>
                            <span className="font-bold text-sm">{t.line?.short_name || t.line?.name}</span>
                            <p className="text-xs text-[var(--text-secondary)]">Towards {t.headsign}</p>
                          </div>
                        </div>
                        {isDelayed ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                            <AlertCircle className="w-3 h-3" /> Delayed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                            <Clock className="w-3 h-3" /> On Time
                          </span>
                        )}
                      </div>
                      
                      <div className="pl-10 space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold w-12">{t.departure_time?.text}</span>
                          <span className="w-2 h-2 rounded-full border-2 border-[var(--accent)]"></span>
                          <span className="truncate">{t.departure_stop?.name}</span>
                        </div>
                        <div className="border-l-2 border-dashed border-[var(--border)] ml-1 pl-4 py-1 text-[10px] text-[var(--text-secondary)]">
                          {t.num_stops} stops • {step.duration?.text}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold w-12">{t.arrival_time?.text}</span>
                          <span className="w-2 h-2 rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]"></span>
                          <span className="truncate">{t.arrival_stop?.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                } else if (step.travel_mode === 'WALKING' && step.duration?.value > 120) { // Only show significant walks
                  return (
                    <div key={idx} className="flex items-center gap-3 py-2 text-xs text-[var(--text-secondary)]">
                      <div className="w-1 border-l-2 border-dotted border-[var(--border)] h-8 ml-3"></div>
                      <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3"/> Walk {step.duration?.text}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Map Area */}
      <div className="w-full md:w-2/3 h-[500px] md:h-auto min-h-[500px] rounded-2xl overflow-hidden border border-[var(--border)]">
        <Map 
          defaultCenter={{ lat: 54.7753, lng: -1.5849 }} // City center default
          defaultZoom={12}
          mapId="transit_map_1"
          gestureHandling="greedy"
          disableDefaultUI={true}
          internalUsageAttributionIds={["transit_hub"]}
        />
      </div>
    </div>
    </div>
  );
}

export default function LiveTransitIntelligence() {
  if (!MAPS_API_KEY) {
    return (
      <div className="p-6 glass-panel rounded-2xl text-center">
        <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold">Google Maps API Key Missing</h3>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Please add <code>GOOGLE_MAPS_PLATFORM_KEY</code> to your environment variables to enable real-time transit routing.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={MAPS_API_KEY}>
      <TransitRouter />
    </APIProvider>
  );
}
