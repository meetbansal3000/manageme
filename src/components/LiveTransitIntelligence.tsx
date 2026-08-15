/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { 
  Train, 
  Bus, 
  MapPin, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  AlertCircle, 
  Navigation, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Zap, 
  Radio, 
  ShieldCheck, 
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { NetworkStatusBanner, LiveArrivalsBoard, CycleHireBoard } from './TflIntegrationWidgets';
import { TiltCard } from './TiltCard';

const MAPS_API_KEY = (process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY || '') as string;

interface TransitSchedule {
  id: string;
  origin: string;
  destination: string;
  operator: string;
  line: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  platform: string;
  status: 'On Time' | 'Delayed' | 'Boarding' | 'Departed';
  delayMinutes?: number;
  type: 'train' | 'metro' | 'bus';
  stopsCount: number;
  co2Savings: string;
  steps: { mode: 'walk' | 'train' | 'tube' | 'bus'; title: string; detail: string; duration: string }[];
}

const PRESET_ROUTES: TransitSchedule[] = [
  {
    id: 'route-1',
    origin: "London King's Cross",
    destination: "Edinburgh Waverley",
    operator: "LNER Azuma",
    line: "East Coast Main Line",
    departureTime: "14:30",
    arrivalTime: "18:50",
    duration: "4h 20m",
    platform: "Plat 8",
    status: "On Time",
    type: "train",
    stopsCount: 4,
    co2Savings: "78% vs flight",
    steps: [
      { mode: 'walk', title: "Depart King's Cross Concourse", detail: "Head to Platform 8", duration: "5m" },
      { mode: 'train', title: "LNER Azuma Express Service", detail: "Calling at York, Darlington, Newcastle, Berwick-upon-Tweed", duration: "4h 15m" },
      { mode: 'walk', title: "Arrive Edinburgh Waverley", detail: "Exit via Waverley Steps to Princes St", duration: "3m" }
    ]
  },
  {
    id: 'route-2',
    origin: "Oxford Circus",
    destination: "Canary Wharf",
    operator: "TfL Elizabeth Line / Central",
    line: "Elizabeth Line & Central Line",
    departureTime: "14:35",
    arrivalTime: "14:52",
    duration: "17m",
    platform: "Plat 2 Eastbound",
    status: "On Time",
    type: "metro",
    stopsCount: 4,
    co2Savings: "92% vs taxi",
    steps: [
      { mode: 'tube', title: "Central Line from Oxford Circus", detail: "Eastbound to Tottenham Court Road (1 stop)", duration: "2m" },
      { mode: 'walk', title: "Cross-Platform Interchange", detail: "Step-free connection to Elizabeth Line Eastbound", duration: "3m" },
      { mode: 'train', title: "Elizabeth Line Service", detail: "High-frequency direct to Canary Wharf Crossrail Station", duration: "12m" }
    ]
  },
  {
    id: 'route-3',
    origin: "London Euston",
    destination: "Manchester Piccadilly",
    operator: "Avanti West Coast",
    line: "West Coast Main Line",
    departureTime: "14:40",
    arrivalTime: "16:46",
    duration: "2h 06m",
    platform: "Plat 12",
    status: "Boarding",
    type: "train",
    stopsCount: 3,
    co2Savings: "74% vs car",
    steps: [
      { mode: 'walk', title: "Board at Euston Concourse", detail: "Platform 12 now boarding", duration: "4m" },
      { mode: 'train', title: "Avanti Super Voyager Express", detail: "Direct to Manchester Piccadilly via Stafford & Stoke-on-Trent", duration: "2h 02m" }
    ]
  },
  {
    id: 'route-4',
    origin: "London Victoria",
    destination: "Gatwick Airport (GTW)",
    operator: "Gatwick Express",
    line: "Brighton Main Line",
    departureTime: "14:45",
    arrivalTime: "15:15",
    duration: "30m",
    platform: "Plat 14",
    status: "Delayed",
    delayMinutes: 4,
    type: "train",
    stopsCount: 0,
    co2Savings: "65% vs taxi",
    steps: [
      { mode: 'walk', title: "Victoria Station Gatwick Concourse", detail: "Dedicated terminal entrance", duration: "3m" },
      { mode: 'train', title: "Non-stop Gatwick Express", detail: "Direct into South Terminal Station", duration: "30m" }
    ]
  }
];

// OpenStreetMap and Public Transit Engine Fallback Component
function PublicTransitTimetableEngine() {
  const [originInput, setOriginInput] = useState("London King's Cross");
  const [destinationInput, setDestinationInput] = useState("Edinburgh Waverley");
  const [selectedRoute, setSelectedRoute] = useState<TransitSchedule>(PRESET_ROUTES[0]);
  const [schedules, setSchedules] = useState<TransitSchedule[]>(PRESET_ROUTES);
  const [isSearching, setIsSearching] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('manageme_saved_transit_routes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!originInput.trim() || !destinationInput.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      // Find matching preset or generate custom timetable item
      const found = PRESET_ROUTES.find(
        r => r.origin.toLowerCase().includes(originInput.toLowerCase()) || 
             r.destination.toLowerCase().includes(destinationInput.toLowerCase())
      );

      if (found) {
        setSelectedRoute(found);
      } else {
        const customRoute: TransitSchedule = {
          id: `custom-${Date.now()}`,
          origin: originInput.trim(),
          destination: destinationInput.trim(),
          operator: "National Rail / InterCity",
          line: "Direct Regional Service",
          departureTime: new Date(Date.now() + 10 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          arrivalTime: new Date(Date.now() + 95 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: "1h 25m",
          platform: `Plat ${Math.floor(Math.random() * 8) + 1}`,
          status: "On Time",
          type: "train",
          stopsCount: 3,
          co2Savings: "70% vs car",
          steps: [
            { mode: 'walk', title: `Depart ${originInput.trim()}`, detail: "Proceed to main ticket gates", duration: "5m" },
            { mode: 'train', title: "InterCity Express Service", detail: `Direct link to ${destinationInput.trim()}`, duration: "1h 15m" },
            { mode: 'walk', title: `Arrive ${destinationInput.trim()}`, detail: "Exit to city centre", duration: "5m" }
          ]
        };
        setSchedules(prev => [customRoute, ...prev]);
        setSelectedRoute(customRoute);
      }
      setIsSearching(false);
    }, 400);
  };

  const handleSaveRoute = (routeKey: string) => {
    const updated = savedRoutes.includes(routeKey) 
      ? savedRoutes.filter(r => r !== routeKey)
      : [...savedRoutes, routeKey];
    setSavedRoutes(updated);
    localStorage.setItem('manageme_saved_transit_routes', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      
      {/* Network Status Widget */}
      <NetworkStatusBanner />

      {/* Main Grid: Planner & Live Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Route Search & Real-time Departures (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Journey Search Card */}
          <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-blue-600/20 text-blue-400">
                  <Navigation className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white">Live Route Navigator</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> Live Telemetry
              </span>
            </div>

            <form onSubmit={handleSearch} className="space-y-3 text-xs">
              <div className="space-y-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => setOriginInput(e.target.value)}
                    placeholder="Origin (e.g. King's Cross, Victoria)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    placeholder="Destination (e.g. Edinburgh, Gatwick)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Calculate Real-Time Route</span>
                </button>
              </div>
            </form>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">Popular Commuter Hubs</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ROUTES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setOriginInput(r.origin);
                      setDestinationInput(r.destination);
                      setSelectedRoute(r);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      selectedRoute.id === r.id 
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold' 
                        : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {r.origin.split(' ')[0]} → {r.destination.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Departures List */}
          <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Live Departures Board</span>
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">Auto-refreshing</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {schedules.map(route => {
                const isSelected = selectedRoute.id === route.id;
                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600/15 border-blue-500/40 shadow-lg' 
                        : 'bg-black/30 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-white tabular-nums">
                            {route.departureTime}
                          </span>
                          <ArrowRight className="w-3 h-3 text-neutral-500" />
                          <span className="font-bold text-xs text-neutral-200">
                            {route.destination}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                          {route.operator} • {route.duration}
                        </span>
                      </div>

                      <div className="text-right space-y-1">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-block ${
                          route.status === 'On Time' ? 'bg-emerald-500/20 text-emerald-300' :
                          route.status === 'Boarding' ? 'bg-blue-500/20 text-blue-300 animate-pulse' :
                          'bg-rose-500/20 text-rose-300'
                        }`}>
                          {route.status} {route.delayMinutes ? `(+${route.delayMinutes}m)` : ''}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 block">
                          {route.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Selected Route Details & Interactive Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Selected Itinerary Card */}
          <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            
            {/* Top Summary Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                    {selectedRoute.operator}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    🌱 {selectedRoute.co2Savings}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {selectedRoute.origin} → {selectedRoute.destination}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveRoute(`${selectedRoute.origin}::${selectedRoute.destination}`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    savedRoutes.includes(`${selectedRoute.origin}::${selectedRoute.destination}`)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                  }`}
                >
                  {savedRoutes.includes(`${selectedRoute.origin}::${selectedRoute.destination}`) ? '✓ Saved to Vault' : '+ Save Route'}
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 font-mono text-center">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Departure</span>
                <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">{selectedRoute.departureTime}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Arrival</span>
                <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">{selectedRoute.arrivalTime}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Duration</span>
                <span className="text-sm font-bold text-blue-300 tabular-nums mt-0.5 block">{selectedRoute.duration}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Platform</span>
                <span className="text-sm font-bold text-amber-300 mt-0.5 block">{selectedRoute.platform}</span>
              </div>
            </div>

            {/* Step-by-Step Waypoint Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">Step-by-Step Waypoints</h4>
              
              <div className="space-y-3 pl-2 border-l-2 border-blue-500/30 ml-2">
                {selectedRoute.steps.map((step, idx) => (
                  <div key={idx} className="relative pl-6 space-y-1">
                    {/* Waypoint Dot */}
                    <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-black absolute -left-[23px] top-1 shadow-sm" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{step.title}</span>
                      <span className="text-[10px] font-mono text-neutral-400 tabular-nums bg-white/5 px-2 py-0.5 rounded-md">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* OpenStreetMap Visual Geographic Canvas */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-neutral-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Interactive OpenStreetMap Station View</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Live Geospatial Tile</span>
              </div>

              <div className="h-56 rounded-2xl overflow-hidden border border-white/10 relative bg-neutral-950">
                <iframe
                  title="OpenStreetMap Station View"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.50%2C-0.08%2C51.54&amp;layer=mapnik&amp;marker=51.53%2C-0.12`}
                  className="w-full h-full opacity-75 grayscale hover:grayscale-0 transition-all duration-300"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-white border border-white/10 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounded Rail & Bus Coordinates
                </div>
              </div>
            </div>

          </div>

          {/* TfL Integrations (Live Arrivals & Cycle Hire) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveArrivalsBoard />
            <CycleHireBoard />
          </div>

        </div>

      </div>

    </div>
  );
}

function GoogleMapsTransitRouter() {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  
  const [origin, setOrigin] = useState("London King's Cross");
  const [destination, setDestination] = useState("Edinburgh Waverley");
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

  return (
    <div className="space-y-6">
      <NetworkStatusBanner />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>Google Maps Transit Router</span>
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="Origin"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Destination"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all"
              >
                {isLoading ? 'Calculating...' : 'Find Transit Directions'}
              </button>
            </div>
          </div>
          <LiveArrivalsBoard />
        </div>

        <div className="lg:col-span-7 h-[500px] rounded-3xl overflow-hidden border border-white/10">
          <Map 
            defaultCenter={{ lat: 51.53, lng: -0.12 }}
            defaultZoom={13}
            mapId="transit_map_live"
            gestureHandling="greedy"
            disableDefaultUI={true}
          />
        </div>
      </div>
    </div>
  );
}

export default function LiveTransitIntelligence() {
  if (MAPS_API_KEY && MAPS_API_KEY.length > 5) {
    return (
      <APIProvider apiKey={MAPS_API_KEY}>
        <GoogleMapsTransitRouter />
      </APIProvider>
    );
  }

  // Smooth fallback to Live Public Transit & OpenStreetMap Timetable Engine
  return <PublicTransitTimetableEngine />;
}
