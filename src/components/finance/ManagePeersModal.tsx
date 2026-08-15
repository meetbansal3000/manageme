import React, { useState } from 'react';
import { X, Users, Plus, Trash2, Check, DollarSign, Mail, Phone, ExternalLink } from 'lucide-react';

export interface PeerProfile {
  name: string;
  defaultSplitPct?: number; // e.g. 50
  email?: string;
  phone?: string;
  paymentHandle?: string; // e.g. @monzo, revolut.me/alex, upi@okaxis
  notes?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  peers: PeerProfile[];
  onSavePeers: (peers: PeerProfile[]) => void;
}

export const ManagePeersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  peers,
  onSavePeers
}) => {
  const [list, setList] = useState<PeerProfile[]>(peers);
  const [newPeer, setNewPeer] = useState<PeerProfile>({ name: '', defaultSplitPct: 50, email: '', paymentHandle: '' });

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmed = newPeer.name.trim();
    if (!trimmed) return;
    if (list.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('A peer contact with this name already exists.');
      return;
    }

    setList([...list, { ...newPeer, name: trimmed }]);
    setNewPeer({ name: '', defaultSplitPct: 50, email: '', paymentHandle: '' });
  };

  const handleRemove = (name: string) => {
    setList(list.filter(p => p.name !== name));
  };

  const handleUpdate = (name: string, partial: Partial<PeerProfile>) => {
    setList(list.map(p => p.name === name ? { ...p, ...partial } : p));
  };

  const handleSave = () => {
    onSavePeers(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#1c1c1e] border border-[var(--border)] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Manage Peer Directory & Settle Links</h3>
              <p className="text-xs text-[var(--text-secondary)]">Manage friends, default split % & payment handles (Monzo, Revolut, UPI)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Peer Form */}
        <div className="bg-[#141416] p-3.5 rounded-2xl border border-[var(--border)] space-y-3">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Add New Peer Contact
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Peer Name (e.g. Alex, Maya)"
              value={newPeer.name}
              onChange={e => setNewPeer({ ...newPeer, name: e.target.value })}
              className="apple-input bg-[#1c1c1e] text-xs p-2.5 w-full"
            />
            <input
              type="text"
              placeholder="Payment Handle (e.g. monzo.me/alex, revolut)"
              value={newPeer.paymentHandle || ''}
              onChange={e => setNewPeer({ ...newPeer, paymentHandle: e.target.value })}
              className="apple-input bg-[#1c1c1e] text-xs p-2.5 w-full"
            />
            <input
              type="email"
              placeholder="Email address (for Settle-Up emails)"
              value={newPeer.email || ''}
              onChange={e => setNewPeer({ ...newPeer, email: e.target.value })}
              className="apple-input bg-[#1c1c1e] text-xs p-2.5 w-full"
            />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="99"
                  placeholder="Split %"
                  value={newPeer.defaultSplitPct || 50}
                  onChange={e => setNewPeer({ ...newPeer, defaultSplitPct: Number(e.target.value) })}
                  className="apple-input bg-[#1c1c1e] text-xs p-2.5 w-full text-center"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!newPeer.name.trim()}
                className="bg-emerald-500 text-white text-xs font-semibold px-4 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Existing Peers List */}
        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[320px]">
          <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Saved Peer Profiles ({list.length})
          </h4>
          {list.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] italic text-center py-4">No peer contacts added yet.</p>
          ) : (
            list.map(p => (
              <div
                key={p.name}
                className="p-3.5 rounded-2xl bg-[#141416] border border-[var(--border)] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[var(--text-primary)]">{p.name}</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Default Split: {p.defaultSplitPct || 50}%
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(p.name)}
                    className="p-1 text-[var(--text-secondary)] hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-[var(--text-secondary)] block">Payment Handle</label>
                    <input
                      type="text"
                      placeholder="e.g. monzo.me/..."
                      value={p.paymentHandle || ''}
                      onChange={e => handleUpdate(p.name, { paymentHandle: e.target.value })}
                      className="apple-input bg-[#1c1c1e] text-xs p-1.5 w-full mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-secondary)] block">Email</label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={p.email || ''}
                      onChange={e => handleUpdate(p.name, { email: e.target.value })}
                      className="apple-input bg-[#1c1c1e] text-xs p-1.5 w-full mt-0.5"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-4 h-4" />
            Save Contacts
          </button>
        </div>
      </div>
    </div>
  );
};
