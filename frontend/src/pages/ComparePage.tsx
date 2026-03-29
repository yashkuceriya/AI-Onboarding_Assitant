import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Columns3,
  X,
  Plus,
  Check,
  Minus,
  Trash2,
  Search,
} from 'lucide-react';
import { api } from '../api/client';
import type { Vehicle } from '../types';
import { fmt, fmtMiles, calcMonthly } from '../utils/format';
import VehicleImage from '../components/VehicleImage';


/* ─── Props ─── */
interface ComparePageProps {
  compareIds: number[];
  onRemove: (id: number) => void;
  onClear: () => void;
  onViewVehicle: (id: number) => void;
}

/* ─── Types for comparison rows ─── */
type WinDirection = 'lowest' | 'highest' | 'newest' | 'none';

interface SpecRow {
  label: string;
  key: string;
  getValue: (v: Vehicle) => string | number;
  getNumeric?: (v: Vehicle) => number;
  winDirection: WinDirection;
}

const specRows: SpecRow[] = [
  {
    label: 'Price',
    key: 'price',
    getValue: (v) => fmt(v.price),
    getNumeric: (v) => v.price,
    winDirection: 'lowest',
  },
  {
    label: 'Mileage',
    key: 'mileage',
    getValue: (v) => fmtMiles(v.mileage),
    getNumeric: (v) => v.mileage,
    winDirection: 'lowest',
  },
  {
    label: 'MPG',
    key: 'mpg',
    getValue: (v) => `${v.mpg} MPG`,
    getNumeric: (v) => v.mpg,
    winDirection: 'highest',
  },
  {
    label: 'Safety Rating',
    key: 'safety_rating',
    getValue: (v) => `${v.safety_rating}/5`,
    getNumeric: (v) => v.safety_rating,
    winDirection: 'highest',
  },
  {
    label: 'Year',
    key: 'year',
    getValue: (v) => String(v.year),
    getNumeric: (v) => v.year,
    winDirection: 'newest',
  },
  {
    label: 'Engine',
    key: 'engine',
    getValue: (v) => v.engine,
    winDirection: 'none',
  },
  {
    label: 'Transmission',
    key: 'transmission',
    getValue: (v) => v.transmission,
    winDirection: 'none',
  },
  {
    label: 'Drivetrain',
    key: 'drivetrain',
    getValue: (v) => v.drivetrain,
    winDirection: 'none',
  },
  {
    label: 'Body Type',
    key: 'body_type',
    getValue: (v) => v.body_type,
    winDirection: 'none',
  },
  {
    label: 'Location',
    key: 'location',
    getValue: (v) => v.location,
    winDirection: 'none',
  },
];

/* ─── Determine winner index for a numeric row ─── */
function getWinnerIds(
  vehicles: Vehicle[],
  getNumeric: (v: Vehicle) => number,
  direction: WinDirection,
): Set<number> {
  if (vehicles.length === 0) return new Set();

  const values = vehicles.map(getNumeric);
  let best: number;

  if (direction === 'lowest') {
    best = Math.min(...values);
  } else {
    // 'highest' or 'newest'
    best = Math.max(...values);
  }

  // If all values are equal, no winner
  const allSame = values.every((v) => v === best);
  if (allSame) return new Set();

  const winners = new Set<number>();
  vehicles.forEach((v, i) => {
    if (values[i] === best) winners.add(v.id);
  });
  return winners;
}

/* ─── Skeleton loader ─── */
function LoadingSkeleton({ count }: { count: number }) {
  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
      <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <Columns3 size={24} className="text-[#00aed9]" />
            <h1 className="text-2xl font-extrabold">Compare Vehicles</h1>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(count, 3)}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-40 animate-shimmer" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-white dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export default function ComparePage({
  compareIds,
  onRemove,
  onClear,
  onViewVehicle,
}: ComparePageProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (compareIds.length === 0) {
      setVehicles([]);
      return;
    }

    setLoading(true);
    setError(null);
    api
      .compareVehicles(compareIds)
      .then((res) => {
        // Preserve the order from compareIds
        const vehicleMap = new Map(res.vehicles.map((v) => [v.id, v]));
        const ordered = compareIds
          .map((id) => vehicleMap.get(id))
          .filter(Boolean) as Vehicle[];
        setVehicles(ordered);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load vehicles for comparison.');
      })
      .finally(() => setLoading(false));
  }, [compareIds]);

  /* ─── All unique features across vehicles ─── */
  const allFeatures = useMemo(() => {
    const featureSet = new Set<string>();
    vehicles.forEach((v) => {
      v.features?.forEach((f) => featureSet.add(f));
    });
    return Array.from(featureSet).sort();
  }, [vehicles]);

  /* ─── Column count for the grid ─── */
  const colCount = Math.min(compareIds.length + 1, 4); // vehicles + potential "add" card, max 4

  /* ─── Stagger animation variants ─── */
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  /* ─── Loading state ─── */
  if (loading && vehicles.length === 0) {
    return <LoadingSkeleton count={compareIds.length} />;
  }

  /* ─── Empty state ─── */
  if (compareIds.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3">
              <Columns3 size={24} className="text-[#00aed9]" />
              <h1 className="text-2xl font-extrabold">Compare Vehicles</h1>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Columns3 size={28} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Add vehicles to compare
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Select up to 3 vehicles from our inventory to compare them side by
              side. See how they stack up on price, features, and specs.
            </p>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <Search size={14} />
              Browse Inventory to add vehicles
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
        <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3">
              <Columns3 size={24} className="text-[#00aed9]" />
              <h1 className="text-2xl font-extrabold">Compare Vehicles</h1>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  /* ─── Main comparison view ─── */
  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Columns3 size={24} className="text-[#00aed9]" />
              <h1 className="text-2xl font-extrabold">Compare Vehicles</h1>
              <span className="text-xs font-bold bg-[#00aed9] px-2.5 py-0.5 rounded-full">
                {vehicles.length} of 3 vehicles
              </span>
            </div>
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
          <p className="text-white/50 text-sm mt-1 ml-[36px]">
            Side-by-side comparison of specs, features, and value.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Vehicle cards (top row) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${colCount > 3 ? 3 : colCount}, minmax(0, 1fr))`,
          }}
        >
          {vehicles.map((vehicle) => {
            const monthly = calcMonthly(vehicle.price);

            return (
              <motion.div
                key={vehicle.id}
                variants={itemVariants}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative card-shine"
                onClick={() => onViewVehicle(vehicle.id)}
              >
                {/* Gradient + car visual */}
                <VehicleImage
                  imageUrl={vehicle.image_url}
                  make={vehicle.make}
                  model={vehicle.model}
                  bodyType={vehicle.body_type}
                  gradient={vehicle.image_gradient || ['#ccc', '#999']}
                  className="h-40 flex items-center justify-center"
                  silhouetteSize="w-40"
                >
                  <button onClick={(e) => { e.stopPropagation(); onRemove(vehicle.id); }} className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/40 backdrop-blur rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-10" aria-label={`Remove ${vehicle.year} ${vehicle.make} ${vehicle.model} from comparison`}>
                    <X size={14} className="text-white" />
                  </button>
                </VehicleImage>

                {/* Vehicle info */}
                <div className="p-4 space-y-1.5">
                  <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#1b3a5c] transition-colors">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-2xl font-extrabold text-[#00aed9]">
                    {fmt(vehicle.price)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Est. {fmt(Math.round(monthly))}/mo for 60 months
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* "Add Another Vehicle" placeholder */}
          {vehicles.length < 3 && (
            <motion.div
              variants={itemVariants}
              className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center min-h-[260px] hover:border-[#00aed9] hover:bg-[#00aed9]/5 hover:shadow-lg transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-slate-600 group-hover:border-[#00aed9] flex items-center justify-center mb-3 transition-colors">
                <Plus
                  size={20}
                  className="text-gray-400 group-hover:text-[#00aed9] transition-colors"
                />
              </div>
              <span className="text-sm font-semibold text-gray-400 group-hover:text-[#00aed9] transition-colors">
                Add Another Vehicle
              </span>
              <span className="text-xs text-gray-300 mt-1">
                {3 - vehicles.length} slot{3 - vehicles.length !== 1 ? 's' : ''}{' '}
                remaining
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Specs comparison table ── */}
        {vehicles.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-10"
          >
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">
              Specifications
            </h2>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[600px] px-4 sm:px-0">
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {/* Table header */}
                  <div
                    className="grid border-b border-gray-100 bg-gray-50 dark:bg-slate-700"
                    style={{
                      gridTemplateColumns: `180px repeat(${vehicles.length}, minmax(0, 1fr))`,
                    }}
                  >
                    <div className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Spec
                    </div>
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="px-4 py-3 text-xs font-bold text-[#1b3a5c] dark:text-[#00aed9] text-center truncate"
                      >
                        {v.year} {v.make} {v.model}
                      </div>
                    ))}
                  </div>

                  {/* Spec rows */}
                  {specRows.map((row, rowIndex) => {
                    const winnerIds =
                      row.getNumeric && row.winDirection !== 'none'
                        ? getWinnerIds(
                            vehicles,
                            row.getNumeric,
                            row.winDirection,
                          )
                        : new Set<number>();

                    return (
                      <div
                        key={row.key}
                        className={`grid ${rowIndex < specRows.length - 1 ? 'border-b border-gray-50' : ''} ${rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-700/30'}`}
                        style={{
                          gridTemplateColumns: `180px repeat(${vehicles.length}, minmax(0, 1fr))`,
                        }}
                      >
                        <div className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {row.label}
                        </div>
                        {vehicles.map((v) => {
                          const isWinner = winnerIds.has(v.id);
                          return (
                            <div
                              key={v.id}
                              className={`px-4 py-3 text-sm text-center font-medium ${
                                isWinner
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {String(row.getValue(v))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Features comparison ── */}
        {vehicles.length >= 2 && allFeatures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mt-10 mb-8"
          >
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">
              Features
            </h2>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[600px] px-4 sm:px-0">
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {/* Feature table header */}
                  <div
                    className="grid border-b border-gray-100 bg-gray-50 dark:bg-slate-700"
                    style={{
                      gridTemplateColumns: `180px repeat(${vehicles.length}, minmax(0, 1fr))`,
                    }}
                  >
                    <div className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Feature
                    </div>
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="px-4 py-3 text-xs font-bold text-[#1b3a5c] dark:text-[#00aed9] text-center truncate"
                      >
                        {v.year} {v.make} {v.model}
                      </div>
                    ))}
                  </div>

                  {/* Feature rows */}
                  {allFeatures.map((feature, fIndex) => (
                    <div
                      key={feature}
                      className={`grid ${fIndex < allFeatures.length - 1 ? 'border-b border-gray-50' : ''} ${fIndex % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-700/30'}`}
                      style={{
                        gridTemplateColumns: `180px repeat(${vehicles.length}, minmax(0, 1fr))`,
                      }}
                    >
                      <div className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </div>
                      {vehicles.map((v) => {
                        const hasFeature = v.features?.includes(feature);
                        return (
                          <div
                            key={v.id}
                            className="px-4 py-2.5 flex items-center justify-center"
                          >
                            {hasFeature ? (
                              <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                                <Check
                                  size={14}
                                  className="text-emerald-500"
                                />
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                                <Minus size={14} className="text-gray-300" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
