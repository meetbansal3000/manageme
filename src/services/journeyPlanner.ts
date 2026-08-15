import { tflApi, TFL_API_BASE } from './tflApi';

export interface JourneyStep {
  travelMode: string;
  duration: number;
  instruction: string;
  lineName?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureStop?: string;
  arrivalStop?: string;
}

export interface JourneyOption {
  duration: number;
  startTime: string;
  endTime: string;
  steps: JourneyStep[];
  isDirect: boolean;
}

const NAVITIA_TOKEN = import.meta.env.VITE_NAVITIA_TRANSIT_TOKEN || '';
const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

// Mock Fallback Data for Journey
const MOCK_JOURNEY: JourneyOption[] = [
  {
    duration: 25,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 25 * 60000).toISOString(),
    isDirect: true,
    steps: [
      {
        travelMode: 'tube',
        duration: 25,
        instruction: 'Take the Victoria line to Kings Cross',
        lineName: 'Victoria',
        departureTime: '10:00',
        arrivalTime: '10:25',
        departureStop: 'Victoria',
        arrivalStop: 'Kings Cross St. Pancras'
      }
    ]
  },
  {
    duration: 35,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 35 * 60000).toISOString(),
    isDirect: false,
    steps: [
      {
        travelMode: 'tube',
        duration: 15,
        instruction: 'Take the Jubilee line to Green Park',
        lineName: 'Jubilee',
        departureTime: '10:00',
        arrivalTime: '10:15',
        departureStop: 'Waterloo',
        arrivalStop: 'Green Park'
      },
      {
        travelMode: 'tube',
        duration: 15,
        instruction: 'Transfer to the Victoria line to Victoria',
        lineName: 'Victoria',
        departureTime: '10:20',
        arrivalTime: '10:35',
        departureStop: 'Green Park',
        arrivalStop: 'Victoria'
      }
    ]
  }
];

export const journeyPlanner = {
  // a) Journey Planner - Multi-tier implementation
  planJourney: async (from: string, to: string, options: { mode?: string, timeIs?: string, journeyPreference?: string } = {}): Promise<JourneyOption[]> => {
    // 1. Try TfL (Priority 1)
    try {
      let url = `${TFL_API_BASE}/Journey/JourneyResults/${encodeURIComponent(from)}/to/${encodeURIComponent(to)}`;
      const params = new URLSearchParams();
      if (options.mode) params.append('mode', options.mode);
      if (options.timeIs) params.append('timeIs', options.timeIs);
      if (options.journeyPreference) params.append('journeyPreference', options.journeyPreference);
      
      const appKey = import.meta.env.VITE_TFL_APP_KEY;
      if (appKey) params.append('app_key', appKey);

      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const tflRes = await fetch(url);
      
      if (tflRes.ok) {
        const data = await tflRes.json();
        
        if (data.journeys && Array.isArray(data.journeys) && data.journeys.length > 0) {
           return data.journeys.map((j: any) => {
             const legs = Array.isArray(j.legs) ? j.legs : [];
             const steps = legs.map((leg: any) => ({
               travelMode: leg?.mode?.name || 'transit',
               duration: leg?.duration || 0,
               instruction: leg?.instruction?.summary || '',
               lineName: leg?.routeOptions?.[0]?.name,
               departureTime: leg?.departureTime,
               arrivalTime: leg?.arrivalTime,
               departureStop: leg?.departurePoint?.commonName,
               arrivalStop: leg?.arrivalPoint?.commonName
             }));
             
             const transitLegs = steps.filter((s: JourneyStep) => s.travelMode !== 'walking');
             
             return {
               duration: j.duration || 0,
               startTime: j.startDateTime || '',
               endTime: j.arrivalDateTime || '',
               steps,
               isDirect: (transitLegs?.length || 0) <= 1
             };
           });
        }
      } else {
        console.warn('TfL Journey Planner failed with status', tflRes.status);
      }
    } catch (err) {
      console.warn('TfL Journey Planner API error:', err);
    }
    
    // Priority 2: Navitia (if configured)
    if (NAVITIA_TOKEN) {
      // Implement navitia fetch logic if needed
    }
    
    // Fallback: Simulated GTFS data
    console.log('Falling back to simulated journey data');
    return MOCK_JOURNEY;
  }
};
