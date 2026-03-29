import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  Heart,
  Fuel,
  Shield,
  Gauge,
  ChevronLeft,
  ChevronRight,
  Car,
  ArrowUpDown,
  RotateCcw,
  SearchX,
  GitCompareArrows,
} from 'lucide-react';
import { api } from '../api/client';
import type { Vehicle, VehicleMeta } from '../types';
import { fmt, fmtMiles, calcMonthly } from '../utils/format';
import VehicleImage from '../components/VehicleImage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InventoryPageProps {
  onViewVehicle: (id: number) => void;
  compareIds?: number[];
  onToggleCompare?: (id: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Body type icons & labels
// ---------------------------------------------------------------------------

const BODY_TYPES = ['All', 'Sedan', 'SUV', 'Truck', 'Wagon'] as const;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price Low' },
  { value: 'price_desc', label: 'Price High' },
  { value: 'mileage_asc', label: 'Low Mileage' },
] as const;

const PRICE_MIN = 15000;
const PRICE_MAX = 80000;
const PRICE_STEP = 1000;
const YEAR_MIN = 2020;
const YEAR_MAX = 2026;
const MILEAGE_MAX_LIMIT = 150000;
const MILEAGE_STEP = 5000;

// ---------------------------------------------------------------------------
// Filter state
// ---------------------------------------------------------------------------

interface Filters {
  search: string;
  bodyType: string;
  priceMin: number;
  priceMax: number;
  yearMin: number;
  yearMax: number;
  mileageMax: number;
  sort: string;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  bodyType: 'All',
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  yearMin: YEAR_MIN,
  yearMax: YEAR_MAX,
  mileageMax: MILEAGE_MAX_LIMIT,
  sort: 'newest',
};

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="h-44 animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 animate-shimmer rounded w-3/4" />
        <div className="h-6 animate-shimmer rounded w-1/2" />
        <div className="h-3 animate-shimmer rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 animate-shimmer rounded-full w-16" />
          <div className="h-6 animate-shimmer rounded-full w-16" />
          <div className="h-6 animate-shimmer rounded-full w-16" />
        </div>
        <div className="h-10 animate-shimmer rounded-xl" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vehicle card
// ---------------------------------------------------------------------------

function VehicleCard({
  vehicle,
  index,
  onFavorite,
  onView,
  inCompare,
  onToggleCompare,
}: {
  vehicle: Vehicle;
  index: number;
  onFavorite: (id: number, favorited: boolean) => void;
  onView: (id: number) => void;
  inCompare?: boolean;
  onToggleCompare?: (id: number) => void;
}) {
  const monthly = calcMonthly(vehicle.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#00aed9]/5 transition-all duration-300 group flex flex-col card-shine"
    >
      {/* Image area */}
      <VehicleImage
        imageUrl={vehicle.image_url}
        make={vehicle.make}
        model={vehicle.model}
        bodyType={vehicle.body_type}
        gradient={vehicle.image_gradient || ['#64748b', '#475569']}
        className="h-44 flex items-center justify-center"
        silhouetteSize="w-40 group-hover:scale-110 transition-transform duration-500"
      >
        {/* Color tag */}
        <span className="absolute bottom-2.5 left-2.5 bg-black/40 backdrop-blur-sm text-[11px] text-white px-2.5 py-1 rounded-full font-medium z-10">
          {vehicle.color}
        </span>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(vehicle.id, vehicle.favorited);
          }}
          className="absolute top-2.5 right-2.5 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform active:scale-95 z-10"
          aria-label={vehicle.favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={17}
            className={
              vehicle.favorited
                ? 'text-rose-500 fill-rose-500'
                : 'text-gray-400'
            }
          />
        </button>
      </VehicleImage>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col gap-2.5">
        {/* Title */}
        <h3 className="text-[15px] font-bold text-[#1b3a5c] leading-tight">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>

        {/* Price */}
        <div>
          <span className="text-xl font-extrabold text-[#00aed9]">
            {fmt(vehicle.price)}
          </span>
          <span className="block text-xs text-gray-400 mt-0.5">
            Est. {fmt(Math.round(monthly))}/mo
            <span className="text-gray-300"> | </span>
            60 mo @ 5.9% APR
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-auto">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
            <Gauge size={11} className="text-gray-400" />
            {fmtMiles(vehicle.mileage)}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
            <Fuel size={11} className="text-gray-400" />
            {vehicle.mpg} MPG
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
            <Shield size={11} className="text-amber-400" />
            {vehicle.safety_rating}/5
          </span>
        </div>

        {/* CTA */}
        <div className="mt-1 flex gap-2">
          <button
            onClick={() => onView(vehicle.id)}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] hover:from-[#142d4a] hover:to-[#1b3a5c] text-white text-sm font-semibold rounded-xl transition-all btn-press shadow-sm hover:shadow-md"
          >
            View Details
          </button>
          {onToggleCompare && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(vehicle.id); }}
              className={`px-3 py-2.5 text-sm font-semibold rounded-xl transition-all btn-press border-2 ${
                inCompare
                  ? 'bg-gradient-to-r from-[#00aed9] to-[#0090b3] border-transparent text-white shadow-sm shadow-[#00aed9]/20'
                  : 'border-gray-200 text-gray-500 hover:border-[#00aed9] hover:text-[#00aed9]'
              }`}
              title={inCompare ? 'Remove from compare' : 'Add to compare'}
            >
              <GitCompareArrows size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Filter sidebar content (shared between desktop & mobile sheet)
// ---------------------------------------------------------------------------

function FilterControls({
  filters,
  setFilters,
  onClear,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClear: () => void;
}) {
  const hasActiveFilters =
    filters.bodyType !== 'All' ||
    filters.priceMin !== PRICE_MIN ||
    filters.priceMax !== PRICE_MAX ||
    filters.yearMin !== YEAR_MIN ||
    filters.yearMax !== YEAR_MAX ||
    filters.mileageMax !== MILEAGE_MAX_LIMIT ||
    filters.sort !== 'newest';

  return (
    <div className="space-y-6">
      {/* Body type */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Body Type
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {BODY_TYPES.map((bt) => (
            <button
              key={bt}
              onClick={() => setFilters((f) => ({ ...f, bodyType: bt }))}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                filters.bodyType === bt
                  ? 'bg-[#00aed9] text-white shadow-sm shadow-[#00aed9]/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {bt}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Price Range
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Min</span>
              <span className="font-bold text-gray-800">{fmt(filters.priceMin)}</span>
            </div>
            <input
              type="range"
              min={PRICE_MIN}
              max={filters.priceMax - PRICE_STEP}
              step={PRICE_STEP}
              value={filters.priceMin}
              onChange={(e) =>
                setFilters((f) => ({ ...f, priceMin: Number(e.target.value) }))
              }
              className="w-full accent-[#00aed9]"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Max</span>
              <span className="font-bold text-gray-800">{fmt(filters.priceMax)}</span>
            </div>
            <input
              type="range"
              min={filters.priceMin + PRICE_STEP}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={filters.priceMax}
              onChange={(e) =>
                setFilters((f) => ({ ...f, priceMax: Number(e.target.value) }))
              }
              className="w-full accent-[#00aed9]"
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{fmt(PRICE_MIN)}</span>
            <span>{fmt(PRICE_MAX)}</span>
          </div>
        </div>
      </div>

      {/* Year range */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Year Range
        </h4>
        <div className="flex items-center gap-3">
          <select
            value={filters.yearMin}
            onChange={(e) =>
              setFilters((f) => ({ ...f, yearMin: Number(e.target.value) }))
            }
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition"
          >
            {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i)
              .filter((y) => y <= filters.yearMax)
              .map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
          </select>
          <span className="text-xs text-gray-400 font-medium">to</span>
          <select
            value={filters.yearMax}
            onChange={(e) =>
              setFilters((f) => ({ ...f, yearMax: Number(e.target.value) }))
            }
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition"
          >
            {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i)
              .filter((y) => y >= filters.yearMin)
              .map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Mileage max */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Max Mileage
        </h4>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Up to</span>
          <span className="font-bold text-gray-800">
            {filters.mileageMax >= MILEAGE_MAX_LIMIT
              ? 'Any'
              : fmtMiles(filters.mileageMax)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={MILEAGE_MAX_LIMIT}
          step={MILEAGE_STEP}
          value={filters.mileageMax}
          onChange={(e) =>
            setFilters((f) => ({ ...f, mileageMax: Number(e.target.value) }))
          }
          className="w-full accent-[#00aed9]"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
          <span>0 mi</span>
          <span>150k mi</span>
        </div>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Sort By
        </h4>
        <div className="relative">
          <ArrowUpDown
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sort: e.target.value }))
            }
            className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 bg-white focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear button */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="w-full py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  const delta = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6 pb-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
              p === page
                ? 'bg-[#00aed9] text-white shadow-sm shadow-[#00aed9]/25'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-20 px-6"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <SearchX size={28} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">No vehicles found</h3>
      <p className="text-sm text-gray-400 text-center max-w-xs mb-5">
        Try adjusting your filters or search terms to discover more vehicles.
      </p>
      <button
        onClick={onClear}
        className="px-5 py-2.5 bg-[#00aed9] hover:bg-[#0090b3] text-white text-sm font-semibold rounded-xl transition active:scale-[0.97]"
      >
        Clear All Filters
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function InventoryPage({ onViewVehicle, compareIds = [], onToggleCompare }: InventoryPageProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [meta, setMeta] = useState<VehicleMeta | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch vehicles whenever filters or page change
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        per_page: 12,
        sort: filters.sort,
        price_min: filters.priceMin,
        price_max: filters.priceMax,
        year_min: filters.yearMin,
        year_max: filters.yearMax,
      };

      if (filters.search) params.q = filters.search;
      if (filters.bodyType !== 'All') params.body_type = filters.bodyType.toLowerCase();
      if (filters.mileageMax < MILEAGE_MAX_LIMIT) params.mileage_max = filters.mileageMax;

      const result = await api.getVehicles(params);
      setVehicles(result.vehicles);
      setMeta(result.meta);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Reset to page 1 when filters change (not on page change itself)
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    if (prevFiltersRef.current !== filters) {
      prevFiltersRef.current = filters;
      if (page !== 1) setPage(1);
    }
  }, [filters, page]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  // Debounced search
  const handleSearchChange = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value }));
    }, 350);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleFavorite = async (vehicleId: number, currentlyFavorited: boolean) => {
    // Optimistic update
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId ? { ...v, favorited: !currentlyFavorited } : v
      )
    );
    try {
      await api.toggleFavorite(vehicleId, currentlyFavorited);
    } catch {
      // Revert on error
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId ? { ...v, favorited: currentlyFavorited } : v
        )
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeFilterCount = [
    filters.bodyType !== 'All',
    filters.priceMin !== PRICE_MIN,
    filters.priceMax !== PRICE_MAX,
    filters.yearMin !== YEAR_MIN,
    filters.yearMax !== YEAR_MAX,
    filters.mileageMax < MILEAGE_MAX_LIMIT,
    filters.sort !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900">
      {/* Header / Search bar */}
      <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#234a6e] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00aed9]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-[#00aed9]/3 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-10 relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#00aed9]/15 rounded-xl flex items-center justify-center">
              <Car size={22} className="text-[#00aed9]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Browse Inventory</h1>
              <p className="text-white/40 text-sm">
                Find your perfect ride from our curated selection
              </p>
            </div>
          </div>

          {/* Search input */}
          <div className="relative max-w-2xl mt-5">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by make, model, or color..."
              defaultValue={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/95 backdrop-blur-md rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#00aed9]/30 outline-none transition-all shadow-lg shadow-black/10 border border-white/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4">
        <div className="flex gap-6" ref={gridRef}>
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-[#1b3a5c] flex items-center gap-2">
                  <SlidersHorizontal size={15} />
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold bg-[#00aed9] text-white px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterControls
                filters={filters}
                setFilters={setFilters}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 min-w-0 pb-10">
            {/* Mobile filter toggle + result count */}
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-gray-500">
                {loading ? (
                  <span className="inline-block w-28 h-4 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>
                    <span className="font-bold text-gray-800">
                      {meta?.total ?? 0}
                    </span>{' '}
                    vehicles found
                  </>
                )}
              </div>

              {/* Mobile filters button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold bg-[#00aed9] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Vehicle grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {vehicles.map((vehicle, i) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      index={i}
                      onFavorite={handleFavorite}
                      onView={onViewVehicle}
                      inCompare={compareIds.includes(vehicle.id)}
                      onToggleCompare={onToggleCompare}
                    />
                  ))}
                </div>

                {meta && (
                  <Pagination
                    page={meta.page}
                    totalPages={meta.total_pages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter sheet overlay */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-[320px] max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden flex flex-col"
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <h3 className="text-base font-bold text-[#1b3a5c] flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  Filters
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
                  aria-label="Close filters"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Scrollable filter content */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <FilterControls
                  filters={filters}
                  setFilters={setFilters}
                  onClear={clearFilters}
                />
              </div>

              {/* Apply button */}
              <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 bg-[#00aed9] hover:bg-[#0090b3] text-white font-bold text-sm rounded-xl transition active:scale-[0.98] shadow-sm shadow-[#00aed9]/25"
                >
                  Show Results
                  {meta ? ` (${meta.total})` : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
