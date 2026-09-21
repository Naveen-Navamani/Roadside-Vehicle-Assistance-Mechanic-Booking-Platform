import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CostBreakdown, ServiceType, VehicleType } from '../../types';
import * as api from '../../services/api';
import {
  AlertTriangle,
  BatteryCharging,
  Car,
  CheckCircle,
  Clock,
  Disc,
  DollarSign,
  Fuel,
  Home,
  Key,
  MapPin,
  Truck,
  Wrench,
  X,
  Zap
} from 'lucide-react';

interface SOSWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSWizardModal: React.FC<SOSWizardModalProps> = ({ isOpen, onClose }) => {
  const { catalog, setActiveBooking, setRole } = useApp();

  const [step, setStep] = useState<number>(1);
  const [serviceType, setServiceType] = useState<ServiceType>('flat_tire');
  const [vehicleType, setVehicleType] = useState<VehicleType>('suv');
  const [vehicleModel, setVehicleModel] = useState<string>('Tesla Model Y');
  const [licensePlate, setLicensePlate] = useState<string>('7XYZ892');
  const [customerName, setCustomerName] = useState<string>('Alex Mercer');
  const [customerPhone, setCustomerPhone] = useState<string>('+1 (415) 555-0192');
  const [notes, setNotes] = useState<string>('Right rear tire blown on highway shoulder.');
  const [hasDropOff, setHasDropOff] = useState<boolean>(false);
  const [dropOffAddress, setDropOffAddress] = useState<string>('742 Evergreen Terrace, SF');
  const [isUrgent, setIsUrgent] = useState<boolean>(true);
  const [locationAddress, setLocationAddress] = useState<string>('Market St & 5th Ave, San Francisco, CA');
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>({ lat: 37.7833, lng: -122.4080 });

  const [estimate, setEstimate] = useState<CostBreakdown | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Recalculate price estimate whenever parameters change
  useEffect(() => {
    let isMounted = true;
    api.fetchPriceEstimate({
      serviceType,
      vehicleType,
      distanceKm: 4.2,
      isUrgent,
      hasDropOff
    }).then(est => {
      if (isMounted) setEstimate(est);
    }).catch(console.error);

    return () => { isMounted = false; };
  }, [serviceType, vehicleType, isUrgent, hasDropOff]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newBooking = await api.createBooking({
        customerName,
        customerPhone,
        serviceType,
        vehicleType,
        vehicleModel,
        licensePlate,
        notes,
        breakdownLocation: {
          lat: latLng.lat,
          lng: latLng.lng,
          address: locationAddress
        },
        dropOffLocation: hasDropOff ? {
          lat: 37.7700,
          lng: -122.4400,
          address: dropOffAddress
        } : null,
        isUrgent
      });

      setActiveBooking(newBooking);
      onClose();
    } catch (err) {
      alert('Error creating booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceIcon = (id: ServiceType) => {
    switch (id) {
      case 'flat_tire': return <Disc className="w-5 h-5 text-amber-400" />;
      case 'battery_jump': return <BatteryCharging className="w-5 h-5 text-emerald-400" />;
      case 'towing': return <Truck className="w-5 h-5 text-orange-400" />;
      case 'fuel_delivery': return <Fuel className="w-5 h-5 text-blue-400" />;
      case 'lockout': return <Key className="w-5 h-5 text-yellow-400" />;
      case 'engine_diagnostic': return <Wrench className="w-5 h-5 text-rose-400" />;
      case 'brake_service': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'drop_off': return <Home className="w-5 h-5 text-purple-400" />;
      default: return <Wrench className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600/20 via-slate-800 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Emergency Roadside Assistance</h2>
              <p className="text-xs text-slate-400">Instant dispatch of vetted master mechanics in your area</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar */}
        <div className="grid grid-cols-3 border-b border-slate-800/80 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`py-3 text-center border-b-2 transition ${
              step === 1 ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-slate-400'
            }`}
          >
            1. Select Issue
          </button>
          <button
            onClick={() => setStep(2)}
            className={`py-3 text-center border-b-2 transition ${
              step === 2 ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-slate-400'
            }`}
          >
            2. Vehicle & Location
          </button>
          <button
            onClick={() => setStep(3)}
            className={`py-3 text-center border-b-2 transition ${
              step === 3 ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-slate-400'
            }`}
          >
            3. Pricing & Dispatch
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* STEP 1: SERVICE CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 font-medium">What type of roadside assistance do you need?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {catalog.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setServiceType(cat.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                      serviceType === cat.id
                        ? 'bg-orange-600/10 border-orange-500 ring-1 ring-orange-500'
                        : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                      {getServiceIcon(cat.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white truncate">{cat.title}</h4>
                        <span className="text-xs font-mono font-bold text-orange-400">${cat.basePrice}+</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-orange-600/30"
                >
                  Continue to Vehicle Details →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VEHICLE & LOCATION */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Vehicle Type selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Vehicle Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'sedan', label: 'Sedan' },
                    { id: 'suv', label: 'SUV' },
                    { id: 'hatchback', label: 'Hatchback' },
                    { id: 'ev', label: 'EV / Hybrid' },
                    { id: 'heavy_truck', label: 'Truck/Van' },
                    { id: 'motorcycle', label: 'Motorcycle' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVehicleType(v.id as VehicleType)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                        vehicleType === v.id
                          ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Make & Model</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g. Ford Explorer, Honda Civic"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">License Plate Number</label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono uppercase"
                    placeholder="e.g. 7XYZ892"
                  />
                </div>
              </div>

              {/* Location Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Current Breakdown Location</span>
                  <span className="text-[11px] text-emerald-400 font-mono">● Auto-detected GPS</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-rose-500" />
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Post-Repair Drop-Off Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Post-Repair Vehicle Drop-Off</p>
                      <p className="text-[11px] text-slate-400">Deliver vehicle to home/office after garage repair (+$40)</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasDropOff}
                    onChange={(e) => setHasDropOff(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                </div>

                {hasDropOff && (
                  <input
                    type="text"
                    value={dropOffAddress}
                    onChange={(e) => setDropOffAddress(e.target.value)}
                    placeholder="Enter delivery drop-off address"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-orange-600/30"
                >
                  Review Transparent Estimate →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TRANSPARENT PRICING BREAKDOWN & DISPATCH */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Upfront Guaranteed Price Breakdown</h3>
                  <span className="text-xs text-emerald-400 font-mono">No Hidden Surge Fees</span>
                </div>

                {estimate && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Base Service Fee ({serviceType.replace('_', ' ')})</span>
                      <span className="font-mono font-medium">${estimate.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Vehicle Class Multiplier ({vehicleType})</span>
                      <span className="font-mono">×{estimate.vehicleMultiplier}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Distance Transit Fee (~4.2 km)</span>
                      <span className="font-mono font-medium">${estimate.distancePrice.toFixed(2)}</span>
                    </div>
                    {isUrgent && (
                      <div className="flex justify-between text-orange-400">
                        <span>Emergency Priority Dispatch Surge</span>
                        <span className="font-mono font-medium">+${estimate.urgencyFee.toFixed(2)}</span>
                      </div>
                    )}
                    {hasDropOff && (
                      <div className="flex justify-between text-purple-400">
                        <span>Chauffeured Post-Repair Drop-off</span>
                        <span className="font-mono font-medium">+${estimate.dropOffFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white">Total Estimated Cost</span>
                      <span className="text-2xl font-black text-orange-400 font-mono">
                        ${estimate.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Contact Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Callback Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Situation Notes for Mechanic</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="Describe sounds, smoke, exact spot, safety hazards..."
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-600/40 flex items-center gap-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Locating Mechanics...' : 'Confirm & Dispatch Verified Mechanic'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};