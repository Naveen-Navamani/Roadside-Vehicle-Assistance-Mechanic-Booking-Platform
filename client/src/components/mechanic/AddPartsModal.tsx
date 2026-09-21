import React, { useState } from 'react';
import * as api from '../../services/api';
import { PackagePlus, Plus, X } from 'lucide-react';

interface AddPartsModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const PRESET_PARTS = [
  { name: '12V AGM Heavy-Duty Battery', price: 135 },
  { name: 'Radial Tire Patch & Plug Kit', price: 35 },
  { name: 'DOT-4 High-Temp Brake Fluid', price: 25 },
  { name: 'Full Synthetic 5W-30 Oil (1 Qt)', price: 18 },
  { name: 'Mobile EV Fast Charge Top-Up (15 kWh)', price: 45 },
  { name: 'Heavy Duty Radiator Hose & Clamp', price: 40 },
  { name: 'Universal Serpentine Belt', price: 55 }
];

export const AddPartsModal: React.FC<AddPartsModalProps> = ({ bookingId, isOpen, onClose, onAdded }) => {
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: { name: string; price: number }) => {
    setName(preset.name);
    setPrice(preset.price.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setIsSubmitting(true);
    try {
      await api.addPartToBooking(bookingId, name, parseFloat(price), quantity);
      setName('');
      setPrice('');
      setQuantity(1);
      onAdded();
      onClose();
    } catch (err) {
      alert('Failed to add part to work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 via-slate-800 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Diagnostic Parts & Supplies</h3>
              <p className="text-xs text-slate-400">Dynamically update customer work order in real time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Quick Select Recommended Parts
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_PARTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                    name === p.name
                      ? 'bg-blue-600 text-white border-blue-500 font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {p.name} (${p.price})
                </button>
              ))}
            </div>
          </div>

          {/* Form inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Part / Service Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. 12V Battery, Tire Valve, Fuse"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="35.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Adding Item...' : 'Add to Job Sheet'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};