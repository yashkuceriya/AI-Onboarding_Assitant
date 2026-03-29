import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Gauge,
  Fuel,
  Shield,
  Cog,
  CircleDot,
  Check,
  MapPin,
  Calendar,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api/client';
import type { Vehicle } from '../types';
import { fmt, fmtMiles, calcMonthly } from '../utils/format';
import VehicleImage from '../components/VehicleImage';


/* ─── Props ─── */
interface VehicleDetailPageProps {
  vehicleId: number;
  onBack: () => void;
  onViewVehicle: (id: number) => void;
}

/* ─── Skeleton Loader ─── */
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg animate-shimmer ${className}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Back button skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <Skeleton className="h-5 w-36" />
      </div>

      {/* Hero skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <Skeleton className="h-64 sm:h-80 w-full rounded-2xl" />
      </div>

      {/* Title skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 space-y-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-5 w-56" />
      </div>

      {/* Specs skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-32 mt-6" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Spec Badge ─── */
function SpecBadge({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="hover-lift bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:shadow-[#00aed9]/5 transition-shadow"
    >
      <div className="w-9 h-9 rounded-lg bg-[#e0f7fc] flex items-center justify-center text-[#00aed9] mb-2">
        {icon}
      </div>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{value}</span>
    </motion.div>
  );
}

/* ─── Similar Vehicle Card ─── */
function SimilarCard({
  vehicle,
  index,
  onClick,
}: {
  vehicle: Vehicle;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      onClick={onClick}
      className="card-shine min-w-[220px] sm:min-w-[240px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-[#00aed9]/5 transition-all hover:-translate-y-1 text-left flex-shrink-0 group"
    >
      <VehicleImage
        imageUrl={vehicle.image_url}
        make={vehicle.make}
        model={vehicle.model}
        bodyType={vehicle.body_type}
        gradient={vehicle.image_gradient || ['#ccc', '#999']}
        className="h-28 flex items-center justify-center"
        silhouetteSize="w-28"
      >
        <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur text-[10px] text-white px-2 py-0.5 rounded-full z-10">
          {vehicle.color}
        </div>
      </VehicleImage>
      <div className="p-3 space-y-1.5">
        <div className="text-sm font-bold text-gray-900 truncate">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </div>
        <div className="text-base font-extrabold text-[#00aed9]">
          {fmt(vehicle.price)}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <Gauge size={10} /> {fmtMiles(vehicle.mileage)}
          </span>
          <span className="flex items-center gap-1">
            <Fuel size={10} /> {vehicle.mpg} MPG
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#00aed9] font-medium opacity-0 group-hover:opacity-100 transition-opacity pt-1">
          View details <ChevronRight size={12} />
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Main Component ─── */
export default function VehicleDetailPage({
  vehicleId,
  onBack,
  onViewVehicle,
}: VehicleDetailPageProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [similar, setSimilar] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [favAnimating, setFavAnimating] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api
      .getVehicle(vehicleId)
      .then(({ vehicle: v, similar: s }) => {
        setVehicle(v);
        setSimilar(s);
        setFavorited(v.favorited);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load vehicle');
      })
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const toggleFavorite = async () => {
    if (!vehicle) return;
    const wasFavorited = favorited;
    setFavorited(!wasFavorited);
    setFavAnimating(true);
    setTimeout(() => setFavAnimating(false), 400);
    try {
      await api.toggleFavorite(vehicle.id, wasFavorited);
    } catch {
      setFavorited(wasFavorited);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !vehicle) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 text-lg font-semibold">
          {error || 'Vehicle not found'}
        </div>
        <button
          onClick={onBack}
          className="text-sm text-[#00aed9] hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to inventory
        </button>
      </div>
    );
  }

  const [g1] = vehicle.image_gradient || ['#6b7280', '#374151'];
  const monthly = calcMonthly(vehicle.price);

  const specs = [
    { icon: <Gauge size={18} />, label: 'Mileage', value: fmtMiles(vehicle.mileage) },
    { icon: <Fuel size={18} />, label: 'MPG', value: `${vehicle.mpg} MPG` },
    {
      icon: <Shield size={18} />,
      label: 'Safety',
      value: `${vehicle.safety_rating}/5`,
    },
    { icon: <CircleDot size={18} />, label: 'Drivetrain', value: vehicle.drivetrain },
    { icon: <Cog size={18} />, label: 'Engine', value: vehicle.engine },
    {
      icon: <Cog size={18} className="rotate-45" />,
      label: 'Transmission',
      value: vehicle.transmission,
    },
  ];

  const detailRows = [
    { label: 'VIN', value: vehicle.vin },
    { label: 'Location', value: vehicle.location },
    { label: 'Body Type', value: vehicle.body_type },
    { label: 'Exterior Color', value: vehicle.exterior_color },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900 pb-16">
      {/* ── Back Button ── */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 pt-6"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#00aed9] transition-colors font-medium group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to inventory
        </button>
      </motion.div>

      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 mt-6"
      >
        <VehicleImage
          imageUrl={vehicle.image_url}
          make={vehicle.make}
          model={vehicle.model}
          bodyType={vehicle.body_type}
          gradient={vehicle.image_gradient || ['#6b7280', '#374151']}
          className="relative rounded-2xl h-64 sm:h-80 flex items-center justify-center"
          silhouetteSize="w-56 sm:w-72"
        >
          {/* Color badge */}
          <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
            <span
              className="w-3 h-3 rounded-full border border-white/30"
              style={{ background: g1 }}
            />
            {vehicle.color}
          </div>

          {/* Favorite button */}
          <motion.button
            onClick={toggleFavorite}
            animate={favAnimating ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.35 }}
            className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10 ${
              favorited
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={20}
              className={favorited ? 'fill-current' : ''}
            />
          </motion.button>

          {/* Availability badge */}
          {vehicle.available && (
            <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Available
            </div>
          )}
        </VehicleImage>
      </motion.div>

      {/* ── Title & Price ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 mt-6"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b3a5c] dark:text-white">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <div className="flex flex-wrap items-baseline gap-3 mt-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#00aed9]">
            {fmt(vehicle.price)}
          </span>
          <span className="text-sm text-gray-400 font-medium">
            est. {fmt(Math.round(monthly))}/mo
            <span className="text-xs ml-1 text-gray-300">(60 mo @ 5.9% APR)</span>
          </span>
        </div>
      </motion.div>

      {/* ── Key Specs Row ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {specs.map((spec, i) => (
            <SpecBadge
              key={spec.label}
              icon={spec.icon}
              label={spec.label}
              value={spec.value}
              delay={0.3 + i * 0.06}
            />
          ))}
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <h2 className="text-lg font-bold text-[#1b3a5c] dark:text-white mb-3">About this vehicle</h2>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {vehicle.description}
            </p>
          </motion.div>

          {/* Features Grid */}
          {vehicle.features && vehicle.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <h2 className="text-lg font-bold text-[#1b3a5c] dark:text-white mb-3">Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vehicle.features.map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.03, duration: 0.3 }}
                    className="flex items-center gap-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {feature}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Vehicle Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] text-white px-4 py-3 font-bold text-sm">
              Vehicle Details
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-700">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="space-y-3"
          >
            <button
              onClick={() => { setShowToast('Test drive request sent! We\'ll contact you shortly.'); setTimeout(() => setShowToast(null), 3000); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-slate-800 border-2 border-[#00aed9] text-[#00aed9] font-bold text-sm rounded-xl hover:bg-[#e0f7fc] dark:hover:bg-[#00aed9]/10 transition-all btn-press"
            >
              <Calendar size={18} />
              Schedule Test Drive
            </button>
            <button
              onClick={() => { setShowToast('Purchase started! Redirecting to documents...'); setTimeout(() => setShowToast(null), 3000); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#00aed9]/20 hover:shadow-xl hover:shadow-[#00aed9]/30 transition-all btn-press relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2"><ShoppingCart size={18} /> Start Purchase</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
            <p className="text-[11px] text-center text-gray-400">
              7-day money-back guarantee. Free delivery.
            </p>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-[#e0f7fc] rounded-lg flex items-center justify-center text-[#00aed9] flex-shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Pickup Location</span>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {vehicle.location}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Similar Vehicles ── */}
      {similar.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 mt-14"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1b3a5c] dark:text-white">Similar Vehicles</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>Scroll</span>
              <ChevronRight size={12} />
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
            {similar.slice(0, 4).map((v, i) => (
              <SimilarCard
                key={v.id}
                vehicle={v}
                index={i}
                onClick={() => onViewVehicle(v.id)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Bottom Sticky CTA (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 p-3 flex items-center gap-3 sm:hidden z-40">
        <div className="flex-1">
          <div className="text-lg font-extrabold text-[#1b3a5c] dark:text-white">
            {fmt(vehicle.price)}
          </div>
          <div className="text-[10px] text-gray-400">
            {fmt(Math.round(monthly))}/mo est.
          </div>
        </div>
        <button
          onClick={() => { setShowToast('Purchase started! Redirecting to documents...'); setTimeout(() => setShowToast(null), 3000); }}
          className="btn-press bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-[#00aed9]/20 active:scale-[0.97] transition-all flex items-center gap-2"
        >
          <ShoppingCart size={16} />
          Purchase
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1b3a5c]/95 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-fadeIn">
          {showToast}
        </div>
      )}
    </div>
  );
}
