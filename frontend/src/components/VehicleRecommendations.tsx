import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Fuel, Shield, Search, Loader2, Gauge, Car } from 'lucide-react';
import { api } from '../api/client';
import type { VehicleRecommendation } from '../types';
import VehicleImage from './VehicleImage';

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtMiles = (n: number) => n.toLocaleString('en-US') + ' mi';

function CarCard({ vehicle, index }: { vehicle: VehicleRecommendation; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Car visual */}
      <VehicleImage
        imageUrl={vehicle.image_url}
        make={vehicle.make}
        model={vehicle.model}
        bodyType={vehicle.type}
        gradient={vehicle.image_gradient || ['#ccc', '#999']}
        className="h-28 flex items-center justify-center"
        silhouetteSize="w-32"
      >
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-700 z-10">{vehicle.match_score.toFixed(0)}% match</div>
        <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur text-[10px] text-white px-2 py-0.5 rounded-full z-10">{vehicle.color}</div>
      </VehicleImage>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </div>
            <div className="text-lg font-extrabold text-[#00aed9]">{fmt(vehicle.price)}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Gauge size={11} /> {fmtMiles(vehicle.mileage)}</span>
          <span className="flex items-center gap-1"><Fuel size={11} /> {vehicle.mpg} MPG</span>
          <span className="flex items-center gap-1">
            <Star size={11} className="text-amber-500 fill-amber-500" /> {vehicle.safety_rating}/5
          </span>
        </div>

        {/* Match reasons */}
        {vehicle.match_reasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vehicle.match_reasons.slice(0, 3).map((r, j) => (
              <span key={j} className="text-[10px] bg-[#e0f7fc] text-[#0090b3] px-1.5 py-0.5 rounded font-medium">
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function VehicleRecommendations() {
  const [budget, setBudget] = useState(35000);
  const [vehicleType, setVehicleType] = useState('');
  const [priorities, setPriorities] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<VehicleRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const togglePriority = (p: string) => {
    setPriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const search = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const results = await api.getVehicleRecommendations({
        budget,
        type: vehicleType || undefined,
        priorities: priorities.length > 0 ? priorities : undefined,
      });
      // Normalize price/match_score from string to number (Postgres decimals come as strings)
      setRecommendations(results.map((v: VehicleRecommendation) => ({
        ...v,
        price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
        match_score: typeof v.match_score === 'string' ? parseFloat(v.match_score) : v.match_score,
        safety_rating: typeof v.safety_rating === 'string' ? parseFloat(v.safety_rating) : v.safety_rating,
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] text-white px-4 py-3 font-bold text-sm flex items-center gap-2">
        <Car size={18} />
        Vehicle Finder
      </div>

      <div className="p-4 space-y-4">
        {/* Budget */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Budget</span>
            <span className="font-bold text-gray-900">{fmt(budget)}</span>
          </div>
          <input
            type="range" min={10000} max={80000} step={1000}
            value={budget} onChange={e => setBudget(Number(e.target.value))}
            className="w-full accent-[#00aed9]"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>$10k</span><span>$80k</span>
          </div>
        </div>

        {/* Type */}
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Type</div>
          <div className="flex flex-wrap gap-1.5">
            {['sedan', 'suv', 'truck', 'wagon'].map(t => (
              <button
                key={t}
                onClick={() => setVehicleType(vehicleType === t ? '' : t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  vehicleType === t
                    ? 'bg-[#00aed9] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Priorities */}
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">I care about</div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'fuel_efficiency', label: 'Fuel Economy', icon: <Fuel size={12} /> },
              { key: 'safety', label: 'Safety', icon: <Shield size={12} /> },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => togglePriority(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                  priorities.includes(p.key)
                    ? 'bg-[#00aed9] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={search}
          disabled={loading}
          className="w-full py-2.5 bg-[#00aed9] hover:bg-[#0090b3] text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Searching...</>
          ) : (
            <><Search size={16} /> Find My Car</>
          )}
        </button>

        {/* Results */}
        <AnimatePresence>
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 overflow-hidden"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {recommendations.length} vehicles found
              </div>
              {recommendations.map((v, i) => (
                <CarCard key={v.id} vehicle={v} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {searched && recommendations.length === 0 && !loading && (
          <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
            No vehicles match your criteria. Try adjusting your budget or type.
          </div>
        )}
      </div>
    </motion.div>
  );
}
