import { AddToCalendar } from "./AddToCalendar";
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
  Receipt
} from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { Trip, TripExpense, TransitRoute } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { useOwnerSecurity } from '../context/OwnerSecurityContext';
import LiveTransitIntelligence from './LiveTransitIntelligence';

interface Props {
  userData: UserTrackerData;
  updateData: (d: Partial<UserTrackerData>) => void;
  defaultView?: 'trips' | 'transit' | 'places';
}

export const TravelTripsTab: React.FC<Props> = ({ userData, updateData, defaultView = 'trips' }) => {
  const [activeView, setActiveView] = useState<'trips' | 'transit' | 'places'>(defaultView);
  const { requireOwnerPermission } = useOwnerSecurity();

  // Trip Create / Edit Modal State
  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripForm, setTripForm] = useState({ destination: '', startDate: '', endDate: '', companions: '' });

  // Delete Confirmation State
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  // Add Expense Modal State
  const [tripForExpense, setTripForExpense] = useState<Trip | null>(null);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: '', splitWith: [] as string[] });
  const [expandedTripExpenses, setExpandedTripExpenses] = useState<Record<string, boolean>>({});

  useScrollLock(showTripModal || !!tripToDelete || !!tripForExpense);
  useModalDismiss(showTripModal, () => setShowTripModal(false));
  useModalDismiss(!!tripToDelete, () => setTripToDelete(null));
  useModalDismiss(!!tripForExpense, () => setTripForExpense(null));

  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trips = userData.trips || [];
  const tripExpenses = userData.tripExpenses || [];

  // Open Create Trip modal
  const handleOpenCreateTrip = () => {
    requireOwnerPermission('Create New Travel Trip', () => {
      setEditingTripId(null);
      setTripForm({ destination: '', startDate: '', endDate: '', companions: '' });
      setShowTripModal(true);
    });
  };

  // Open Edit Trip modal
  const handleOpenEditTrip = (trip: Trip) => {
    requireOwnerPermission('Edit Travel Trip Details', () => {
      setEditingTripId(trip.id);
      setTripForm({
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        companions: trip.companions ? trip.companions.join(', ') : ''
      });
      setShowTripModal(true);
    });
  };

  // Save (Create or Update) Trip
  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripForm.destination.trim()) {
      alert('Please provide a destination.');
      return;
    }

    const companionList = tripForm.companions
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    requireOwnerPermission(editingTripId ? 'Save Updated Trip' : 'Save New Trip', () => {
      if (editingTripId) {
        // Update existing trip
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
        // Create new trip
        const newTripItem: Trip = {
          id: Date.now().toString(),
          destination: tripForm.destination.trim(),
          startDate: tripForm.startDate,
          endDate: tripForm.endDate,
          companions: companionList
        };
        updateData({ trips: [...trips, newTripItem] });
      }

      setShowTripModal(false);
      setEditingTripId(null);
      setTripForm({ destination: '', startDate: '', endDate: '', companions: '' });
    });
  };

  // Prompt delete trip
  const handlePromptDeleteTrip = (trip: Trip) => {
    requireOwnerPermission('Delete Travel Trip', () => {
      setTripToDelete(trip);
    });
  };

  // Confirm delete trip and clean up associated expenses and OCR receipts
  const handleConfirmDeleteTrip = () => {
    if (!tripToDelete) return;
    const targetId = tripToDelete.id;

    // Filter out the trip
    const updatedTrips = trips.filter(t => t.id !== targetId);

    // Clean up attached expenses and receipts
    const updatedTripExpenses = tripExpenses.filter(e => e.tripId !== targetId);

    updateData({
      trips: updatedTrips,
      tripExpenses: updatedTripExpenses
    });

    setTripToDelete(null);
  };

  // Manual Add Expense
  const handleOpenAddExpense = (trip: Trip) => {
    requireOwnerPermission('Add Trip Expense', () => {
      setTripForExpense(trip);
      setExpenseForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        splitWith: trip.companions || []
      });
    });
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripForExpense) return;
    const amt = parseFloat(expenseForm.amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    requireOwnerPermission('Save Trip Expense', () => {
      const newExp: TripExpense = {
        id: Date.now().toString(),
        tripId: tripForExpense.id,
        amount: amt,
        description: expenseForm.description.trim() || 'Trip Expense',
        date: expenseForm.date || new Date().toISOString().split('T')[0],
        splitWith: expenseForm.splitWith
      };

      updateData({ tripExpenses: [...tripExpenses, newExp] });
      setTripForExpense(null);
    });
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

  const handleUploadBooking = async (e: React.ChangeEvent<HTMLInputElement>, tripId: string, companions: string[]) => {
    const file = e.target.files?.[0];
    const target = e.target;
    if (!file) return;
    setIsProcessingReceipt(true);
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to parse receipt');
      const data = await response.json();
      
      const totalAmount = data.amount || 0;
      const totalPeople = (companions?.length || 0) + 1;
      const splitAmount = data.splitAmount || (totalAmount / totalPeople);

      const exp: TripExpense = {
        id: Date.now().toString(),
        tripId,
        amount: totalAmount,
        description: data.merchant || 'Hotel/Travel Booking',
        date: data.date || new Date().toISOString().split('T')[0],
        splitWith: companions || []
      };
      
      updateData({ tripExpenses: [...tripExpenses, exp] });
      alert(`Parsed Booking: ${data.merchant || 'Receipt'}. Total: £${totalAmount.toFixed(2)}. Split amount per person: £${splitAmount.toFixed(2)}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to parse booking');
    } finally {
      setIsProcessingReceipt(false);
      target.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Complete Trip Planning & Travel Suite</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage itineraries, trip splitting, and transit passes.</p>
        </div>
        <div className="flex bg-black/40 p-1 rounded-xl border border-[var(--border)]">
          <button 
            id="tab-trips-view"
            onClick={() => setActiveView('trips')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'trips' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Trips & Splits
          </button>
          <button 
            id="tab-transit-view"
            onClick={() => setActiveView('transit')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'transit' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Transit Hub
          </button>
          <button 
            id="tab-places-view"
            onClick={() => setActiveView('places')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'places' ? 'bg-[var(--accent)] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Places to Visit
          </button>
        </div>
      </div>

      {activeView === 'trips' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2"><Plane className="w-5 h-5 text-blue-400"/> Active & Upcoming Trips</h2>
            <button 
              id="btn-new-trip"
              onClick={handleOpenCreateTrip} 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-bold hover:brightness-110 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> New Trip
            </button>
          </div>
          
          {trips.length === 0 ? (
            <div className="glass-panel border border-[var(--border)] rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                <Plane className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">No Trips Saved Yet</h3>
                <p className="text-sm text-[var(--text-secondary)]">Create your first trip to start tracking itineraries, companion splitting, and booking receipts.</p>
              </div>
              <button 
                onClick={handleOpenCreateTrip}
                className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Plan a Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map(trip => {
                const exps = tripExpenses.filter(e => e.tripId === trip.id);
                const totalCost = exps.reduce((sum, e) => sum + e.amount, 0);
                const companionCount = (trip.companions?.length || 0) + 1; // +1 for self
                const costPerPerson = totalCost / companionCount;
                const isExpensesExpanded = !!expandedTripExpenses[trip.id];

                return (
                  <div 
                    key={trip.id} 
                    id={`trip-card-${trip.id}`}
                    className="glass-panel border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--accent)]/50 transition-colors space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top Header Controls */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-xl font-bold truncate text-[var(--text-primary)]" title={trip.destination}>
                            {trip.destination}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0"/> 
                            <span className="truncate">
                              {trip.startDate && trip.endDate 
                                ? `${trip.startDate} to ${trip.endDate}` 
                                : trip.startDate || trip.endDate || 'Dates not set'}
                            </span>
                          </p>
                        </div>

                        {/* Action buttons (Share, Calendar, Edit, Delete) */}
                        <div className="flex items-center gap-1 shrink-0 bg-black/20 p-1 rounded-xl border border-white/5">
                          <button 
                            id={`share-trip-${trip.id}`}
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('shareToChat', { 
                                detail: { 
                                  type: 'trip', 
                                  title: `Trip to ${trip.destination}`, 
                                  description: `${trip.startDate || ''} - ${trip.endDate || ''}` 
                                } 
                              }));
                            }}
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                            title="Share to Peer Chat"
                            aria-label="Share to Peer Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          
                          <AddToCalendar 
                            title={`Trip to ${trip.destination}`} 
                            startDate={trip.startDate ? `${trip.startDate}T00:00:00` : new Date().toISOString()} 
                            endDate={trip.endDate ? `${trip.endDate}T23:59:59` : undefined} 
                          />

                          {/* Edit Trip Button */}
                          <button
                            id={`edit-trip-btn-${trip.id}`}
                            onClick={() => handleOpenEditTrip(trip)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                            title="Edit Trip"
                            aria-label="Edit Trip"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* Delete Trip Button */}
                          <button
                            id={`delete-trip-btn-${trip.id}`}
                            onClick={() => handlePromptDeleteTrip(trip)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Trip"
                            aria-label="Delete Trip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Companions */}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="flex -space-x-1.5 items-center">
                            <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-white z-10 border border-black" title="You">
                              Me
                            </div>
                            {(trip.companions || []).map((c, i) => (
                              <div 
                                key={i} 
                                className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white border border-black shadow-sm" 
                                title={c}
                              >
                                {c.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {(trip.companions?.length || 0) === 0 ? 'Solo trip' : `${(trip.companions?.length || 0) + 1} travelers`}
                          </span>
                        </div>
                      </div>

                      {/* Cost Summary */}
                      <div className="pt-3 border-t border-[var(--border)] space-y-1.5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[var(--text-secondary)]">Total Trip Cost:</span>
                          <span className="font-bold text-[var(--text-primary)]">£{totalCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[var(--text-secondary)]">Cost per person:</span>
                          <span className="font-bold text-amber-400">£{costPerPerson.toFixed(2)}</span>
                        </div>

                        {/* Expandable Expense Details Trigger */}
                        {exps.length > 0 && (
                          <button
                            onClick={() => toggleExpenseList(trip.id)}
                            className="w-full mt-2 pt-1 text-xs text-[var(--text-secondary)] hover:text-white flex items-center justify-between transition-colors"
                          >
                            <span>{exps.length} attached {exps.length === 1 ? 'expense' : 'expenses'}</span>
                            <span className="flex items-center gap-1 text-[var(--accent)]">
                              {isExpensesExpanded ? 'Hide' : 'View'}
                              {isExpensesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </span>
                          </button>
                        )}

                        {/* Expense Items Breakdown */}
                        {isExpensesExpanded && exps.length > 0 && (
                          <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar p-2 bg-black/20 rounded-lg border border-white/5">
                            {exps.map(exp => (
                              <div key={exp.id} className="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-b-0">
                                <div className="truncate pr-2">
                                  <span className="font-medium text-gray-200">{exp.description}</span>
                                  <span className="text-[10px] text-gray-400 block">{exp.date}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-semibold text-gray-200">£{exp.amount.toFixed(2)}</span>
                                  <button 
                                    onClick={() => handleDeleteExpense(exp.id)}
                                    className="text-gray-500 hover:text-red-400 p-0.5 transition-colors"
                                    title="Remove Expense"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[var(--border)] flex gap-2">
                      <label 
                        id={`upload-booking-btn-${trip.id}`}
                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-gray-300 hover:text-white border border-white/5"
                      >
                        <input 
                          type="file" 
                          onChange={(e) => handleUploadBooking(e, trip.id, trip.companions || [])} 
                          className="hidden" 
                          accept="image/*,.pdf" 
                        />
                        <Upload className="w-3.5 h-3.5 text-blue-400"/> 
                        {isProcessingReceipt ? 'Parsing OCR...' : 'OCR Booking'}
                      </label>
                      <button 
                        id={`add-expense-btn-${trip.id}`}
                        onClick={() => handleOpenAddExpense(trip)}
                        className="flex-1 py-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[var(--accent)]/20"
                      >
                        <DollarSign className="w-3.5 h-3.5"/> Add Expense
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeView === 'transit' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Train className="w-5 h-5 text-purple-400"/> Live Transit Intelligence</h2>
          <LiveTransitIntelligence />
        </div>
      )}

      {activeView === 'places' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-red-400"/> Places to Visit Wishlist</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel border border-[var(--border)] rounded-2xl overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-blue-900/40 to-black relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold border border-white/10">UK</div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">Edinburgh</h3>
                  <p className="text-sm text-gray-300 flex items-center gap-1"><MapPin className="w-3 h-3"/> Scotland</p>
                </div>
              </div>
              <div className="p-4 space-y-3 bg-black/40">
                <p className="text-sm text-gray-400">High priority weekend trip. Visit the castle, Arthur's seat, and try local whiskey.</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">Sightseeing</span>
                  <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">Weekend</span>
                </div>
              </div>
            </div>

            <div className="glass-panel border border-[var(--border)] rounded-2xl overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-orange-900/40 to-black relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold border border-white/10">Abroad</div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">Amsterdam</h3>
                  <p className="text-sm text-gray-300 flex items-center gap-1"><MapPin className="w-3 h-3"/> Netherlands</p>
                </div>
              </div>
              <div className="p-4 space-y-3 bg-black/40">
                <p className="text-sm text-gray-400">After graduation trip. Book Eurostar early for discounts.</p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">Graduation</span>
                  <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">Friends</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              className="w-full max-w-md glass-panel border border-[var(--border)] rounded-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl"
            >
              <button 
                id="close-trip-modal-btn"
                onClick={() => setShowTripModal(false)} 
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white transition-colors z-20"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-5 pr-8">
                <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  {editingTripId ? <Pencil className="w-5 h-5 text-amber-400" /> : <Plane className="w-5 h-5 text-blue-400" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {editingTripId ? 'Edit Trip' : 'Create New Trip'}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {editingTripId ? 'Update your destination dates and traveling companions' : 'Add an upcoming journey to plan costs and dates'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveTrip} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1.5">
                    Destination *
                  </label>
                  <input 
                    id="input-trip-destination"
                    type="text" 
                    required
                    placeholder="e.g. Paris, Edinburgh, Tokyo"
                    value={tripForm.destination} 
                    onChange={e => setTripForm({ ...tripForm, destination: e.target.value })} 
                    className="w-full bg-black/25 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1.5">
                      Start Date
                    </label>
                    <input 
                      id="input-trip-start-date"
                      type="date" 
                      value={tripForm.startDate} 
                      onChange={e => setTripForm({ ...tripForm, startDate: e.target.value })} 
                      className="w-full bg-black/25 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1.5">
                      End Date
                    </label>
                    <input 
                      id="input-trip-end-date"
                      type="date" 
                      value={tripForm.endDate} 
                      onChange={e => setTripForm({ ...tripForm, endDate: e.target.value })} 
                      className="w-full bg-black/25 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1.5">
                    Companions (comma separated)
                  </label>
                  <input 
                    id="input-trip-companions"
                    type="text" 
                    placeholder="e.g. Alex, Jamie, Samantha" 
                    value={tripForm.companions} 
                    onChange={e => setTripForm({ ...tripForm, companions: e.target.value })} 
                    className="w-full bg-black/25 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors" 
                  />
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">Expenses and bookings will be automatically divided among you and these companions.</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-end gap-3">
                  <button 
                    id="btn-cancel-trip-form"
                    type="button" 
                    onClick={() => setShowTripModal(false)} 
                    className="px-4 py-2.5 text-sm text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    id="btn-save-trip-form"
                    type="submit" 
                    className="px-5 py-2.5 bg-[var(--accent)] text-white font-bold rounded-xl hover:brightness-110 shadow-md transition-all text-sm"
                  >
                    {editingTripId ? 'Update Trip' : 'Save Trip'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Trip Confirmation Prompt Modal */}
      <AnimatePresence>
        {tripToDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setTripToDelete(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-panel border border-red-500/30 rounded-2xl p-6 relative shadow-2xl space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 shrink-0 border border-red-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Delete Trip</h3>
                  <p className="text-sm text-gray-300">
                    Are you sure you want to delete this trip to <strong className="text-white">{tripToDelete.destination}</strong>?
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-black/30 rounded-xl border border-white/5 text-xs text-[var(--text-secondary)] space-y-1">
                <p>• Removes this trip card and itinerary records.</p>
                <p>• Cleans up all attached expenses and OCR receipt records stored for this trip.</p>
              </div>

              <div className="flex justify-end items-center gap-3 pt-2">
                <button
                  id="btn-cancel-delete-trip"
                  type="button"
                  onClick={() => setTripToDelete(null)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete-trip"
                  type="button"
                  onClick={handleConfirmDeleteTrip}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Trip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Manual Expense Modal */}
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
              className="w-full max-w-md glass-panel border border-[var(--border)] rounded-2xl p-6 relative shadow-2xl space-y-4"
            >
              <button 
                onClick={() => setTripForExpense(null)} 
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Add Expense to {tripForExpense.destination}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Record meals, activities, or transit tickets</p>
                </div>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1">Description *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Dinner in Soho, Museum Tickets"
                    value={expenseForm.description}
                    onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full bg-black/25 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1">Amount (£) *</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full bg-black/25 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1">Date</label>
                    <input 
                      type="date"
                      value={expenseForm.date}
                      onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      className="w-full bg-black/25 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[var(--border)] flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setTripForExpense(null)} 
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-[var(--accent)] text-white font-bold rounded-xl hover:brightness-110 shadow-md text-sm"
                  >
                    Add Expense
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
