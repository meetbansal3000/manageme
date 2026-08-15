import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  Calendar, 
  Users, 
  Upload, 
  FileText, 
  DollarSign, 
  Train, 
  MapPin, 
  ExternalLink, 
  Plus, 
  Map, 
  CreditCard, 
  ChevronDown, 
  ChevronUp,
  MessageCircle, 
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  Receipt,
  Sparkles,
  Tag,
  Search,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { Trip, TripExpense, TransitRoute, PlaceRecommendation } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { useOwnerSecurity } from '../context/OwnerSecurityContext';
import LiveTransitIntelligence from './LiveTransitIntelligence';
import { AddToCalendar } from "./AddToCalendar";
import { TiltCard } from './TiltCard';

interface Props {
  userData: UserTrackerData;
  updateData: (d: Partial<UserTrackerData>) => void;
  defaultView?: 'trips' | 'transit' | 'places';
}

const DEFAULT_PLACES: PlaceRecommendation[] = [
  {
    id: 'place-1',
    name: 'Edinburgh Old Town & Castle',
    city: 'Edinburgh',
    country: 'UK',
    category: 'UK',
    tags: ['Sightseeing', 'Castle', 'Whiskey Tasting'],
    budget: '£60',
    priority: 'High',
    notes: 'Walk the Royal Mile, climb Arthur\'s Seat at sunrise, and visit the national gallery.',
    visited: false
  },
  {
    id: 'place-2',
    name: 'Amsterdam Jordaan & Canals',
    city: 'Amsterdam',
    country: 'Netherlands',
    category: 'Abroad',
    tags: ['Eurostar', 'Museums', 'Bikes'],
    budget: '£140',
    priority: 'High',
    notes: 'Post-graduation celebration trip. Book Eurostar 6 weeks early for lowest fares.',
    visited: false
  },
  {
    id: 'place-3',
    name: 'Dishoom & Covent Garden Food Tour',
    city: 'London',
    country: 'UK',
    category: 'Food & Dining',
    tags: ['Dinner', 'Indian Street Food', 'Cocktails'],
    budget: '£40',
    priority: 'Medium',
    notes: 'House Black Daal and Bacon Naan Roll. Walk-in only for small groups after 6 PM.',
    visited: true
  },
  {
    id: 'place-4',
    name: 'Lake District Hiking & Windermere',
    city: 'Cumbria',
    country: 'UK',
    category: 'Weekend Getaway',
    tags: ['Hiking', 'Lakes', 'Cabins'],
    budget: '£85',
    priority: 'Medium',
    notes: 'Rent a lakeside cabin with friends. Direct Avanti train from London Euston to Oxenholme.',
    visited: false
  },
  {
    id: 'place-5',
    name: 'Tate Modern & Southbank Walk',
    city: 'London',
    country: 'UK',
    category: 'Culture',
    tags: ['Modern Art', 'Thames Walk', 'Free Entry'],
    budget: '£15',
    priority: 'Low',
    notes: 'Free permanent collection on level 2. Great rooftop espresso bar overlooking St Paul\'s.',
    visited: true
  }
];

export const TravelTripsTab: React.FC<Props> = ({ userData, updateData, defaultView = 'trips' }) => {
  const [activeView, setActiveView] = useState<'trips' | 'transit' | 'places'>(defaultView);
  const { requireOwnerPermission } = useOwnerSecurity();

  // Trips State
  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripForm, setTripForm] = useState({ destination: '', startDate: '', endDate: '', companions: '', notes: '' });

  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [tripForExpense, setTripForExpense] = useState<Trip | null>(null);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: '', splitWith: [] as string[] });
  const [expandedTripExpenses, setExpandedTripExpenses] = useState<Record<string, boolean>>({});
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);

  // Places & Recommendations State
  const [places, setPlaces] = useState<PlaceRecommendation[]>(() => {
    if (userData && userData.places && userData.places.length > 0) return userData.places;
    const saved = localStorage.getItem('manageme_places_wishlist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PLACES;
  });

  const [selectedPlaceCategory, setSelectedPlaceCategory] = useState<string>('All');
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [placeForm, setPlaceForm] = useState<{
    name: string;
    city: string;
    country: string;
    category: 'UK' | 'Abroad' | 'Food & Dining' | 'Weekend Getaway' | 'Culture';
    tags: string;
    budget: string;
    priority: 'High' | 'Medium' | 'Low';
    notes: string;
  }>({
    name: '',
    city: '',
    country: 'UK',
    category: 'UK',
    tags: '',
    budget: '£50',
    priority: 'High',
    notes: ''
  });

  useScrollLock(showTripModal || !!tripToDelete || !!tripForExpense || showPlaceModal);
  useModalDismiss(showTripModal, () => setShowTripModal(false));
  useModalDismiss(!!tripToDelete, () => setTripToDelete(null));
  useModalDismiss(!!tripForExpense, () => setTripForExpense(null));
  useModalDismiss(showPlaceModal, () => setShowPlaceModal(false));

  const trips = userData.trips || [];
  const tripExpenses = userData.tripExpenses || [];

  // ================= TRIP HANDLERS =================
  const handleOpenCreateTrip = () => {
    requireOwnerPermission('Create New Travel Trip', () => {
      setEditingTripId(null);
      setTripForm({ destination: '', startDate: '', endDate: '', companions: '', notes: '' });
      setShowTripModal(true);
    });
  };

  const handleOpenEditTrip = (trip: Trip) => {
    requireOwnerPermission('Edit Travel Trip Details', () => {
      setEditingTripId(trip.id);
      setTripForm({
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        companions: trip.companions ? trip.companions.join(', ') : '',
        notes: trip.notes || ''
      });
      setShowTripModal(true);
    });
  };


  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripForm.destination.trim()) return;

    const companionList = tripForm.companions
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    requireOwnerPermission(editingTripId ? 'Save Updated Trip' : 'Save New Trip', () => {
      if (editingTripId) {
        const updatedTrips = trips.map(t => {
          if (t.id === editingTripId) {
            return {
              ...t,
              destination: tripForm.destination.trim(),
              startDate: tripForm.startDate,
              endDate: tripForm.endDate,
              companions: companionList
            };
          }
          return t;
        });
        updateData({ trips: updatedTrips });
      } else {
        const newTrip: Trip = {
          id: Date.now().toString(),
          destination: tripForm.destination.trim(),
          startDate: tripForm.startDate,
          endDate: tripForm.endDate,
          companions: companionList
        };
        updateData({ trips: [...trips, newTrip] });
      }
      setShowTripModal(false);
    });
  };

  const handlePromptDeleteTrip = (trip: Trip) => {
    requireOwnerPermission('Delete Travel Trip', () => {
      setTripToDelete(trip);
    });
  };

  const handleConfirmDeleteTrip = () => {
    if (!tripToDelete) return;
    const remainingTrips = trips.filter(t => t.id !== tripToDelete.id);
    const remainingExpenses = tripExpenses.filter(e => e.tripId !== tripToDelete.id);
    updateData({ trips: remainingTrips, tripExpenses: remainingExpenses });
    setTripToDelete(null);
  };

  const handleOpenAddExpense = (trip: Trip) => {
    setTripForExpense(trip);
    setExpenseForm({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      splitWith: trip.companions || []
    });
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripForExpense || !expenseForm.description || !expenseForm.amount) return;
    const numAmount = parseFloat(expenseForm.amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const newExp: TripExpense = {
      id: Date.now().toString(),
      tripId: tripForExpense.id,
      amount: numAmount,
      description: expenseForm.description,
      date: expenseForm.date || new Date().toISOString().split('T')[0],
      splitWith: tripForExpense.companions || []
    };

    updateData({ tripExpenses: [...tripExpenses, newExp] });
    setTripForExpense(null);
  };

  const handleDeleteExpense = (expenseId: string) => {
    requireOwnerPermission('Delete Trip Expense', () => {
      updateData({
        tripExpenses: tripExpenses.filter(e => e.id !== expenseId)
      });
    });
  };

  const toggleExpenseList = (tripId: string) => {
    setExpandedTripExpenses(prev => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
  };

  // ================= PLACES HANDLERS =================
  const savePlacesState = (newPlaces: PlaceRecommendation[]) => {
    setPlaces(newPlaces);
    localStorage.setItem('manageme_places_wishlist', JSON.stringify(newPlaces));
    updateData({ places: newPlaces });
  };

  const handleOpenCreatePlace = () => {
    setEditingPlaceId(null);
    setPlaceForm({
      name: '',
      city: '',
      country: 'UK',
      category: 'UK',
      tags: '',
      budget: '£50',
      priority: 'High',
      notes: ''
    });
    setShowPlaceModal(true);
  };

  const handleOpenEditPlace = (place: PlaceRecommendation) => {
    setEditingPlaceId(place.id);
    setPlaceForm({
      name: place.name,
      city: place.city,
      country: place.country,
      category: place.category,
      tags: place.tags ? place.tags.join(', ') : '',
      budget: place.budget,
      priority: place.priority,
      notes: place.notes
    });
    setShowPlaceModal(true);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeForm.name.trim() || !placeForm.city.trim()) return;

    const tagList = placeForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingPlaceId) {
      const updated = places.map(p => {
        if (p.id === editingPlaceId) {
          return {
            ...p,
            name: placeForm.name.trim(),
            city: placeForm.city.trim(),
            country: placeForm.country.trim(),
            category: placeForm.category,
            tags: tagList,
            budget: placeForm.budget.trim(),
            priority: placeForm.priority,
            notes: placeForm.notes.trim()
          };
        }
        return p;
      });
      savePlacesState(updated);
    } else {
      const newPlace: PlaceRecommendation = {
        id: `place-${Date.now()}`,
        name: placeForm.name.trim(),
        city: placeForm.city.trim(),
        country: placeForm.country.trim(),
        category: placeForm.category,
        tags: tagList,
        budget: placeForm.budget.trim(),
        priority: placeForm.priority,
        notes: placeForm.notes.trim(),
        visited: false
      };
      savePlacesState([newPlace, ...places]);
    }

    setShowPlaceModal(false);
  };

  const handleDeletePlace = (placeId: string) => {
    const updated = places.filter(p => p.id !== placeId);
    savePlacesState(updated);
  };

  const handleToggleVisited = (placeId: string) => {
    const updated = places.map(p => p.id === placeId ? { ...p, visited: !p.visited } : p);
    savePlacesState(updated);
  };

  const PLACE_CATEGORIES = ['All', 'UK', 'Abroad', 'Food & Dining', 'Weekend Getaway', 'Culture'];

  const filteredPlaces = places.filter(p => {
    const matchesCategory = selectedPlaceCategory === 'All' || p.category === selectedPlaceCategory;
    const matchesSearch = placeSearchQuery === '' ||
      p.name.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(placeSearchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 p-5 sm:p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <Compass className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              Global Logistics & Itineraries
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Travel & Transit Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-1 max-w-xl">
            Manage itineraries, companion splits, live transit departures, and curated recommendations.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 dark:bg-neutral-950/80 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm w-full md:w-auto">
          <button 
            id="tab-trips-view"
            onClick={() => setActiveView('trips')} 
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeView === 'trips' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Trips & Splits
          </button>
          <button 
            id="tab-transit-view"
            onClick={() => setActiveView('transit')} 
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeView === 'transit' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Transit Hub
          </button>
          <button 
            id="tab-places-view"
            onClick={() => setActiveView('places')} 
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeView === 'places' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Places to Visit
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TRIPS & SPLITS VIEW */}
      {/* ========================================================================= */}
      {activeView === 'trips' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
              <span>Active & Upcoming Trips</span>
            </h2>
            <button 
              id="btn-new-trip"
              onClick={handleOpenCreateTrip} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Trip
            </button>
          </div>
          
          {trips.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                <Plane className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Trips Saved Yet</h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400">Create your first trip to start tracking itineraries, companion splitting, and booking receipts.</p>
              </div>
              <button 
                onClick={handleOpenCreateTrip}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" /> Plan a Journey
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map(trip => {
                const exps = tripExpenses.filter(e => e.tripId === trip.id);
                const totalCost = exps.reduce((sum, e) => sum + e.amount, 0);
                const companionCount = (trip.companions?.length || 0) + 1;
                const costPerPerson = totalCost / companionCount;
                const isExpensesExpanded = !!expandedTripExpenses[trip.id];

                return (
                  <TiltCard key={trip.id} maxTilt={5} scale={1.01}>
                    <div 
                      id={`trip-card-${trip.id}`}
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Top Header Controls */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="text-lg font-bold truncate text-slate-900 dark:text-white" title={trip.destination}>
                              {trip.destination}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-neutral-400 flex items-center gap-1.5 mt-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0"/> 
                              <span className="truncate">
                                {trip.startDate && trip.endDate 
                                  ? `${trip.startDate} to ${trip.endDate}` 
                                  : trip.startDate || trip.endDate || 'Dates not set'}
                              </span>
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                            <button 
                              onClick={() => {
                                window.dispatchEvent(new CustomEvent('shareToChat', { 
                                  detail: { 
                                    type: 'trip', 
                                    title: `Trip to ${trip.destination}`, 
                                    description: `${trip.startDate || ''} - ${trip.endDate || ''}` 
                                  } 
                                }));
                              }}
                              className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                              title="Share to Peer Chat"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            
                            <AddToCalendar 
                              title={`Trip to ${trip.destination}`} 
                              startDate={trip.startDate ? `${trip.startDate}T00:00:00` : new Date().toISOString()} 
                              endDate={trip.endDate ? `${trip.endDate}T23:59:59` : undefined} 
                            />

                            <button
                              onClick={() => handleOpenEditTrip(trip)}
                              className="p-1.5 rounded-lg bg-amber-50 dark:bg-white/5 hover:bg-amber-100 dark:hover:bg-white/15 text-amber-600 dark:text-amber-400 transition-colors"
                              title="Edit Trip"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handlePromptDeleteTrip(trip)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-600 dark:text-red-400 transition-colors"
                              title="Delete Trip"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Companions */}
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500 dark:text-neutral-400 shrink-0" />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="flex -space-x-1.5 items-center">
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white z-10 border border-white dark:border-black">
                                Me
                              </div>
                              {(trip.companions || []).map((c, i) => (
                                <div 
                                  key={i} 
                                  className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white border border-white dark:border-black shadow-sm" 
                                  title={c}
                                >
                                  {c.charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-slate-600 dark:text-neutral-400">
                              {(trip.companions?.length || 0) === 0 ? 'Solo trip' : `${(trip.companions?.length || 0) + 1} travelers`}
                            </span>
                          </div>
                        </div>

                        {/* Cost Summary */}
                        <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-1.5 font-mono">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-neutral-400">Total Trip Cost:</span>
                            <span className="font-bold text-slate-900 dark:text-white tabular-nums">£{totalCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600 dark:text-neutral-400">Cost per person:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">£{costPerPerson.toFixed(2)}</span>
                          </div>

                          {exps.length > 0 && (
                            <button
                              onClick={() => toggleExpenseList(trip.id)}
                              className="w-full mt-2 pt-1 text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span>{exps.length} attached {exps.length === 1 ? 'expense' : 'expenses'}</span>
                              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                {isExpensesExpanded ? 'Hide' : 'View'}
                                {isExpensesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </span>
                            </button>
                          )}

                          {isExpensesExpanded && exps.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/5 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                              {exps.map(e => (
                                <div key={e.id} className="p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                                  <div className="space-y-0.5">
                                    <span className="font-semibold text-slate-900 dark:text-white block">{e.description}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">{e.date}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">£{e.amount.toFixed(2)}</span>
                                    <button 
                                      onClick={() => handleDeleteExpense(e.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                      title="Delete Expense"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Bottom Add Expense Button */}
                      <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex gap-2">
                        <button
                          onClick={() => handleOpenAddExpense(trip)}
                          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-white/5"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Add Expense / Booking</span>
                        </button>
                      </div>

                    </div>
                  </TiltCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TRANSIT HUB VIEW */}
      {/* ========================================================================= */}
      {activeView === 'transit' && (
        <div className="space-y-6">
          <LiveTransitIntelligence />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PLACES & RECOMMENDATIONS VIEW */}
      {/* ========================================================================= */}
      {activeView === 'places' && (
        <div className="space-y-6">
           {/* Top Bar: Search, Filter Chips, Add Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
              {PLACE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedPlaceCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedPlaceCategory === cat
                      ? 'bg-blue-600 text-white font-bold shadow-md'
                      : 'bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={placeSearchQuery}
                  onChange={(e) => setPlaceSearchQuery(e.target.value)}
                  placeholder="Search spots, cities, tags..."
                  className="w-full bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Add Place Button */}
              <button
                onClick={handleOpenCreatePlace}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Recommendation</span>
              </button>
            </div>

          </div>

          {/* Places Grid */}
          {filteredPlaces.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900/40 border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <MapPin className="w-10 h-10 text-slate-400 dark:text-neutral-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No places matched</h3>
              <p className="text-xs text-slate-600 dark:text-neutral-400">Add your favorite travel destinations, restaurants, or weekend getaways.</p>
              <button
                onClick={handleOpenCreatePlace}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5 mt-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Place
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map(place => (
                <TiltCard key={place.id} maxTilt={5} scale={1.01}>
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
                    
                    {/* Top Row: Tags & Priority Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                          {place.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          place.priority === 'High' ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' :
                          place.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' :
                          'bg-slate-100 dark:bg-neutral-500/20 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-500/30'
                        }`}>
                          {place.priority} Priority
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleVisited(place.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            place.visited ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                          title={place.visited ? 'Mark as Unvisited' : 'Mark as Visited'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEditPlace(place)}
                          className="p-1.5 rounded-lg bg-amber-50 dark:bg-white/5 hover:bg-amber-100 dark:hover:bg-white/15 text-amber-600 dark:text-amber-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeletePlace(place.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-600 dark:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Spot Title & City */}
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{place.name}</span>
                        {place.budget && (
                          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                            {place.budget}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>{place.city}, {place.country}</span>
                      </p>
                    </div>

                    {/* Notes */}
                    {place.notes && (
                      <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed bg-slate-50 dark:bg-black/30 p-3 rounded-2xl border border-slate-200 dark:border-white/5">
                        {place.notes}
                      </p>
                    )}

                    {/* Tags */}
                    {place.tags && place.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {place.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-transparent">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                </TiltCard>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ================= MODALS ================= */}
      
      {/* Create / Edit Trip Modal */}
      <AnimatePresence>
        {showTripModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" 
            onClick={(e) => { if (e.target === e.currentTarget) setShowTripModal(false); }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl space-y-4 text-slate-900 dark:text-white"
            >
              <button 
                onClick={() => setShowTripModal(false)} 
                className="absolute top-4 right-4 p-1.5 text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {editingTripId ? 'Edit Journey' : 'Create New Journey'}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-neutral-400">Plan destinations, dates, and companion splitting</p>
                </div>
              </div>

              <form onSubmit={handleSaveTrip} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Destination *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Paris, Edinburgh, Tokyo"
                    value={tripForm.destination} 
                    onChange={e => setTripForm({ ...tripForm, destination: e.target.value })} 
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={tripForm.startDate} 
                      onChange={e => setTripForm({ ...tripForm, startDate: e.target.value })} 
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={tripForm.endDate} 
                      onChange={e => setTripForm({ ...tripForm, endDate: e.target.value })} 
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Companions (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex, Maya, Liam"
                    value={tripForm.companions} 
                    onChange={e => setTripForm({ ...tripForm, companions: e.target.value })} 
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Itinerary Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Flights, hotels, key attractions..."
                    value={tripForm.notes} 
                    onChange={e => setTripForm({ ...tripForm, notes: e.target.value })} 
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowTripModal(false)} 
                    className="px-4 py-2 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm"
                  >
                    {editingTripId ? 'Save Changes' : 'Create Journey'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Trip Confirmation Modal */}
      <AnimatePresence>
        {tripToDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setTripToDelete(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-neutral-950/95 border border-rose-500/30 rounded-3xl p-6 relative shadow-2xl space-y-4 text-white"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Delete Journey</h3>
                  <p className="text-xs text-neutral-300 mt-1">
                    Are you sure you want to remove the trip to <strong className="text-white">{tripToDelete.destination}</strong>?
                  </p>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setTripToDelete(null)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteTrip}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Journey
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {tripForExpense && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" 
            onClick={(e) => { if (e.target === e.currentTarget) setTripForExpense(null); }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl space-y-4 text-slate-900 dark:text-white"
            >
              <button 
                onClick={() => setTripForExpense(null)} 
                className="absolute top-4 right-4 p-1.5 text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Add Booking / Expense</h2>
                  <p className="text-xs text-slate-600 dark:text-neutral-400">Log cost for {tripForExpense.destination}</p>
                </div>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Description *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Eurostar Tickets, Airbnb, Dinner"
                    value={expenseForm.description} 
                    onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} 
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Amount (£) *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01" 
                      required
                      placeholder="0.00" 
                      value={expenseForm.amount} 
                      onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} 
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Date</label>
                    <input 
                      type="date" 
                      value={expenseForm.date} 
                      onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} 
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setTripForExpense(null)} 
                    className="px-4 py-2 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Place Recommendation Modal */}
      <AnimatePresence>
        {showPlaceModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" 
            onClick={(e) => { if (e.target === e.currentTarget) setShowPlaceModal(false); }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 relative shadow-2xl space-y-4 text-slate-900 dark:text-white"
            >
              <button 
                onClick={() => setShowPlaceModal(false)} 
                className="absolute top-4 right-4 p-1.5 text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {editingPlaceId ? 'Edit Recommendation' : '+ Add Place / Recommendation'}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-neutral-400">Save curated restaurants, cities, and travel getaways</p>
                </div>
              </div>

              <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Place / Spot Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Arthur's Seat, Dishoom Soho, Lake Windermere"
                    value={placeForm.name} 
                    onChange={e => setPlaceForm({ ...placeForm, name: e.target.value })} 
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">City / Region *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Edinburgh, London"
                      value={placeForm.city} 
                      onChange={e => setPlaceForm({ ...placeForm, city: e.target.value })} 
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Country</label>
                    <input 
                      type="text" 
                      placeholder="e.g. UK, Netherlands"
                      value={placeForm.country} 
                      onChange={e => setPlaceForm({ ...placeForm, country: e.target.value })} 
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Category</label>
                    <select
                      value={placeForm.category}
                      onChange={e => setPlaceForm({ ...placeForm, category: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="UK">UK</option>
                      <option value="Abroad">Abroad</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Weekend Getaway">Weekend Getaway</option>
                      <option value="Culture">Culture</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Priority</label>
                    <select
                      value={placeForm.priority}
                      onChange={e => setPlaceForm({ ...placeForm, priority: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Estimated Budget</label>
                    <input 
                      type="text" 
                      placeholder="e.g. £50 or Free"
                      value={placeForm.budget} 
                      onChange={e => setPlaceForm({ ...placeForm, budget: e.target.value })} 
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Scenic, Castle, Food"
                      value={placeForm.tags} 
                      onChange={e => setPlaceForm({ ...placeForm, tags: e.target.value })} 
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-neutral-200 block mb-1">Notes & Recommendations</label>
                  <textarea 
                    rows={3}
                    placeholder="e.g. Best view at sunset, take sturdy walking shoes..."
                    value={placeForm.notes} 
                    onChange={e => setPlaceForm({ ...placeForm, notes: e.target.value })} 
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" 
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowPlaceModal(false)} 
                    className="px-4 py-2 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm"
                  >
                    {editingPlaceId ? 'Update Place' : 'Save Recommendation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default TravelTripsTab;
