import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Fuel, Star, Gauge, DollarSign, Search } from 'lucide-react';
import { api } from '../api/client';
import type { Vehicle } from '../types';
import { fmt, fmtMiles, calcMonthly } from '../utils/format';
import VehicleImage from '../components/VehicleImage';

interface FavoritesPageProps {
  onViewVehicle: (id: number) => void;
}



function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="h-32 animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 animate-shimmer rounded w-3/4" />
        <div className="h-5 animate-shimmer rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-3 animate-shimmer rounded w-16" />
          <div className="h-3 animate-shimmer rounded w-16" />
          <div className="h-3 animate-shimmer rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export default function FavoritesPage({ onViewVehicle }: FavoritesPageProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    api
      .getFavorites()
      .then((res: { vehicles: Vehicle[] }) => setVehicles(res.vehicles))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUnfavorite = async (e: React.MouseEvent, vehicleId: number) => {
    e.stopPropagation();
    setRemovingIds((prev) => new Set(prev).add(vehicleId));
    try {
      await api.toggleFavorite(vehicleId, true);
      // Slight delay to allow exit animation to start
      setTimeout(() => {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(vehicleId);
          return next;
        });
      }, 50);
    } catch (err) {
      console.error(err);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(vehicleId);
        return next;
      });
    }
  };

  const activeVehicles = vehicles.filter((v) => !removingIds.has(v.id));

  // Loading skeleton
  if (loading) {
    return (
      <div className="animate-fadeIn">
        <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden"><div className="absolute top-0 right-0 w-80 h-80 bg-[#00aed9]/5 rounded-full blur-3xl" /></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3">
              <Heart size={24} className="text-[#00aed9]" />
              <h1 className="text-2xl font-extrabold">Saved Vehicles</h1>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (vehicles.length === 0) {
    return (
      <div className="animate-fadeIn">
        <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden"><div className="absolute top-0 right-0 w-80 h-80 bg-[#00aed9]/5 rounded-full blur-3xl" /></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3">
              <Heart size={24} className="text-[#00aed9]" />
              <h1 className="text-2xl font-extrabold">Saved Vehicles</h1>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">No saved vehicles yet</h2>
            <p className="text-sm text-gray-500 mb-6">
              Browse our inventory and tap the heart icon to save vehicles you love.
            </p>
            <button className="px-6 py-2.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] shadow-lg shadow-[#00aed9]/20 btn-press text-white font-bold rounded-xl transition flex items-center gap-2 mx-auto text-sm">
              <Search size={16} />
              Browse Inventory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden"><div className="absolute top-0 right-0 w-80 h-80 bg-[#00aed9]/5 rounded-full blur-3xl" /></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <Heart size={24} className="text-[#00aed9]" />
            <h1 className="text-2xl font-extrabold">Saved Vehicles</h1>
            <span className="text-xs font-bold bg-[#00aed9] px-2.5 py-0.5 rounded-full">
              {activeVehicles.length}
            </span>
          </div>
          <p className="text-white/50 text-sm mt-1 ml-[36px]">
            Your hand-picked favorites, all in one place.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {vehicles
              .filter((v) => !removingIds.has(v.id))
              .map((vehicle, index) => {
                const monthly = calcMonthly(vehicle.price);

                return (
                  <motion.div
                    key={vehicle.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onViewVehicle(vehicle.id)}
                    className="card-shine bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-[#00aed9]/5 transition-shadow cursor-pointer group"
                  >
                    {/* Car visual */}
                    <VehicleImage
                      imageUrl={vehicle.image_url}
                      make={vehicle.make}
                      model={vehicle.model}
                      bodyType={vehicle.body_type}
                      gradient={vehicle.image_gradient || ['#ccc', '#999']}
                      className="h-32 flex items-center justify-center"
                      silhouetteSize="w-36"
                    >
                      <button onClick={(e) => handleUnfavorite(e, vehicle.id)} className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 active:scale-95 shadow-sm z-10" aria-label="Remove from favorites">
                        <Heart size={15} className="text-red-500 fill-red-500" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur text-[10px] text-white px-2 py-0.5 rounded-full z-10">{vehicle.color}</div>
                      <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur text-[10px] text-white px-2 py-0.5 rounded-full z-10">{vehicle.drivetrain}</div>
                    </VehicleImage>

                    {/* Info */}
                    <div className="p-3.5 space-y-2.5">
                      <div>
                        <div className="text-sm font-bold text-gray-900 group-hover:text-[#1b3a5c] transition-colors">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-lg font-extrabold text-[#00aed9]">
                            {fmt(vehicle.price)}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            <DollarSign size={10} className="inline -mt-px" />
                            {Math.round(monthly).toLocaleString('en-US')}/mo
                          </span>
                        </div>
                      </div>

                      {/* Specs badges */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Gauge size={11} /> {fmtMiles(vehicle.mileage)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel size={11} /> {vehicle.mpg} MPG
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={11} className="text-amber-500 fill-amber-500" />{' '}
                          {vehicle.safety_rating}/5
                        </span>
                      </div>

                      {/* Feature tags */}
                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {vehicle.features.slice(0, 3).map((f, j) => (
                            <span
                              key={j}
                              className="text-[10px] bg-[#e0f7fc] text-[#0090b3] px-1.5 py-0.5 rounded font-medium"
                            >
                              {f}
                            </span>
                          ))}
                          {vehicle.features.length > 3 && (
                            <span className="text-[10px] text-gray-400 px-1 py-0.5">
                              +{vehicle.features.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        {/* All removed state (shown after unfavoriting everything) */}
        {activeVehicles.length === 0 && vehicles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">All cleared out</h2>
            <p className="text-sm text-gray-500 mb-6">
              You've removed all your saved vehicles. Time to find new ones!
            </p>
            <button className="px-6 py-2.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] shadow-lg shadow-[#00aed9]/20 btn-press text-white font-bold rounded-xl transition flex items-center gap-2 mx-auto text-sm">
              <Search size={16} />
              Browse Inventory
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
