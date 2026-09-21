import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';
import { CheckCircle2, DollarSign, Receipt, Star, ThumbsUp, X } from 'lucide-react';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({ isOpen, onClose }) => {
  const { activeBooking, setActiveBooking, refreshData, mechanics } = useApp();
  const [stars, setStars] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('Super fast response, had my tire changed safely in 15 minutes. Highly recommended!');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !activeBooking) return null;

  const assignedMechanic = mechanics.find(m => m.id === activeBooking.mechanicId);

  const handlePayAndReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitBookingReview(activeBooking.id, stars, feedback);
      setIsPaid(true);
      setTimeout(() => {
        refreshData();
        setActiveBooking(null);
        onClose();
      }, 1800);
    } catch (err) {
      alert('Error saving review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/20 via-slate-800 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Digital Service Invoice</h2>
              <p className="text-xs text-slate-400">Order #{activeBooking.id} • Verified Mechanic Completion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isPaid ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-white">Payment Confirmed!</h3>
            <p className="text-xs text-slate-400">
              Thank you for using ResQAuto. A copy of your itemized receipt has been sent to your phone.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePayAndReview} className="p-6 space-y-5">
            {/* Itemized breakdown table */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>{activeBooking.serviceType.replace('_', ' ').toUpperCase()} Labor</span>
                <span className="font-mono">${activeBooking.costBreakdown.basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Distance Transit (~{activeBooking.distanceKm.toFixed(1)} km)</span>
                <span className="font-mono">${activeBooking.costBreakdown.distancePrice.toFixed(2)}</span>
              </div>
              {activeBooking.costBreakdown.urgencyFee > 0 && (
                <div className="flex justify-between text-orange-400">
                  <span>Emergency Dispatch Priority</span>
                  <span className="font-mono">+${activeBooking.costBreakdown.urgencyFee.toFixed(2)}</span>
                </div>
              )}
              {activeBooking.costBreakdown.dropOffFee > 0 && (
                <div className="flex justify-between text-purple-400">
                  <span>Vehicle Home Drop-off Service</span>
                  <span className="font-mono">+${activeBooking.costBreakdown.dropOffFee.toFixed(2)}</span>
                </div>
              )}

              {/* Parts */}
              {activeBooking.parts.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-amber-400">Parts Supplied:</span>
                  {activeBooking.parts.map(p => (
                    <div key={p.id} className="flex justify-between text-slate-300 pl-2">
                      <span>• {p.name} (x{p.quantity})</span>
                      <span className="font-mono">${(p.price * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Amount Due</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ${activeBooking.estimatedCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Rate & Review Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Rate Technician ({assignedMechanic ? assignedMechanic.name : 'Mechanic'})
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStars(star)}
                      className="p-1 focus:outline-none transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= stars
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                placeholder="Share your experience (punctuality, diagnosis, professionalism)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Payment...' : `Approve & Pay $${activeBooking.estimatedCost.toFixed(2)}`}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};