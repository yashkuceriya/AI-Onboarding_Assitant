import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  CheckCircle2,
  Shield,
  Clock,
  Truck,
  DollarSign,
  Camera,
  CalendarDays,
  PartyPopper,
  Sparkles,
  Star,
  ThumbsUp,
  AlertCircle,
  MapPin,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Info,
  X,
  Image,
} from 'lucide-react';
import { api } from '../api/client';
import type { SellOffer } from '../types';

/* ─── Helpers ─── */

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

/* ─── Types ─── */

interface SellCarPageProps {}

interface VehicleForm {
  make: string;
  model: string;
  year: string;
  mileage: string;
  condition: string;
  color: string;
  vin: string;
}

type StepKey = 1 | 2 | 3 | 4 | 5;

/* ─── Constants ─── */

const STEPS: { key: StepKey; label: string }[] = [
  { key: 1, label: 'Vehicle' },
  { key: 2, label: 'Offer' },
  { key: 3, label: 'Photos' },
  { key: 4, label: 'Pickup' },
  { key: 5, label: 'Done' },
];

const MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia',
  'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Ram',
  'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
];

const YEARS = Array.from({ length: 17 }, (_, i) => 2026 - i); // 2026 down to 2010

const CONDITIONS = [
  {
    value: 'excellent',
    label: 'Excellent',
    description: 'Like new, no visible wear',
    icon: <Sparkles size={22} />,
    color: 'emerald',
  },
  {
    value: 'good',
    label: 'Good',
    description: 'Minor wear, fully functional',
    icon: <ThumbsUp size={22} />,
    color: 'blue',
  },
  {
    value: 'fair',
    label: 'Fair',
    description: 'Some dents or cosmetic issues',
    icon: <AlertCircle size={22} />,
    color: 'amber',
  },
  {
    value: 'rough',
    label: 'Rough',
    description: 'Significant wear or damage',
    icon: <Car size={22} />,
    color: 'red',
  },
] as const;

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front' },
  { key: 'back', label: 'Back' },
  { key: 'driver_side', label: 'Driver Side' },
  { key: 'interior', label: 'Interior' },
];

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', time: '9 AM - 12 PM', icon: <Sun size={20} /> },
  { value: 'afternoon', label: 'Afternoon', time: '12 - 4 PM', icon: <Sunset size={20} /> },
  { value: 'evening', label: 'Evening', time: '4 - 7 PM', icon: <Moon size={20} /> },
];

/* ─── Animation variants ─── */

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.35,
};

/* ─── Date helpers ─── */

function getWeekdaysFromToday(count: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  let d = new Date(today);
  d.setDate(d.getDate() + 1); // start from tomorrow
  while (dates.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/* ═══════════════════════════════════════════════════════════════════════════
   Step Indicator
   ═══════════════════════════════════════════════════════════════════════════ */

function StepIndicator({ current }: { current: StepKey }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-5 px-4">
      {STEPS.map((step, i) => {
        const isComplete = step.key < current;
        const isCurrent = step.key === current;

        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2">
            {/* Dot */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{
                  scale: isCurrent ? 1 : 0.85,
                  backgroundColor: isComplete
                    ? '#10b981'
                    : isCurrent
                      ? '#00aed9'
                      : '#e5e7eb',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold"
              >
                {isComplete ? (
                  <CheckCircle2 size={16} className="text-white" />
                ) : (
                  <span className={isCurrent ? 'text-white' : 'text-gray-400 dark:text-gray-500'}>
                    {step.key}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-[10px] sm:text-xs font-medium ${
                  isCurrent
                    ? 'text-[#00aed9]'
                    : isComplete
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 rounded-full mb-5 ${
                  isComplete
                    ? 'bg-emerald-400 dark:bg-emerald-500'
                    : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Trust Badge
   ═══════════════════════════════════════════════════════════════════════════ */

function TrustBadge({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
        {icon}
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Step 1 - Vehicle Details
   ═══════════════════════════════════════════════════════════════════════════ */

function Step1VehicleDetails({
  form,
  setForm,
  onSubmit,
  loading,
  error,
}: {
  form: VehicleForm;
  setForm: React.Dispatch<React.SetStateAction<VehicleForm>>;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}) {
  const updateField = (field: keyof VehicleForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    form.make && form.model && form.year && form.mileage && form.condition;

  const conditionColor = (value: string, color: string) => {
    const selected = form.condition === value;
    const map: Record<string, { ring: string; bg: string; text: string }> = {
      emerald: {
        ring: 'ring-emerald-400 dark:ring-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
      },
      blue: {
        ring: 'ring-blue-400 dark:ring-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
      },
      amber: {
        ring: 'ring-amber-400 dark:ring-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        text: 'text-amber-600 dark:text-amber-400',
      },
      red: {
        ring: 'ring-red-400 dark:ring-red-500',
        bg: 'bg-red-50 dark:bg-red-900/30',
        text: 'text-red-600 dark:text-red-400',
      },
    };
    const c = map[color] || map.blue;
    return selected
      ? `ring-2 ${c.ring} ${c.bg} border-transparent`
      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-br from-[#00aed9] to-[#1b3a5c] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00aed9]/20"
        >
          <Car size={28} className="text-white" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          Get your no-obligation offer
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mx-auto">
          No haggling. No pressure. Just a fair, transparent price.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 sm:p-6 space-y-5">
        <h3 className="font-bold text-gray-900 dark:text-white text-base">
          Tell us about your car
        </h3>

        {/* Make + Model row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Make <span className="text-red-400">*</span>
            </label>
            <select
              value={form.make}
              onChange={(e) => updateField('make', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition"
            >
              <option value="">Select make...</option>
              {MAKES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Model <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => updateField('model', e.target.value)}
              placeholder="e.g. Camry, Civic, Model 3"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Year + Mileage row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Year <span className="text-red-400">*</span>
            </label>
            <select
              value={form.year}
              onChange={(e) => updateField('year', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 text-sm focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition"
            >
              <option value="">Select year...</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Mileage <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.mileage}
              onChange={(e) => updateField('mileage', e.target.value)}
              placeholder="e.g. 45000"
              min={0}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Color + VIN row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Color
            </label>
            <input
              type="text"
              value={form.color}
              onChange={(e) => updateField('color', e.target.value)}
              placeholder="e.g. Silver, Black, White"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              VIN <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.vin}
              onChange={(e) => updateField('vin', e.target.value)}
              placeholder="17 characters"
              maxLength={17}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition"
            />
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Info size={11} />
              Check your dashboard or door frame
            </p>
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2.5">
            Condition <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => updateField('condition', c.value)}
                className={`relative p-3.5 rounded-xl border-2 text-center transition-all ${conditionColor(
                  c.value,
                  c.color,
                )}`}
              >
                <div
                  className={`mx-auto mb-2 w-10 h-10 rounded-lg flex items-center justify-center ${
                    form.condition === c.value
                      ? `bg-${c.color}-100 dark:bg-${c.color}-900/40 text-${c.color}-600 dark:text-${c.color}-400`
                      : 'bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {c.icon}
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {c.label}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {c.description}
                </div>
                {form.condition === c.value && (
                  <motion.div
                    layoutId="condition-check"
                    className="absolute top-2 right-2"
                  >
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Trust badges */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TrustBadge icon={<Shield size={16} />} text="Offer guaranteed for 7 days" />
          <TrustBadge icon={<Truck size={16} />} text="Free pickup at your door" />
          <TrustBadge icon={<DollarSign size={16} />} text="Payment within 24 hours" />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!isValid || loading}
        className="w-full py-3.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] text-white font-bold text-base rounded-xl shadow-lg shadow-[#00aed9]/20 transition-all hover:shadow-xl hover:shadow-[#00aed9]/25 btn-press disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Calculating your offer...
          </>
        ) : (
          <>
            <DollarSign size={18} />
            Get My Offer
          </>
        )}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Step 2 - Instant Offer
   ═══════════════════════════════════════════════════════════════════════════ */

function Step2Offer({
  offer,
  onAccept,
  onBack,
  loading,
}: {
  offer: SellOffer;
  onAccept: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const breakdown = offer.offer_breakdown;

  return (
    <div className="space-y-6">
      {/* Celebration header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20"
        >
          <Sparkles size={28} className="text-white" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
          Your Instant Offer
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          For your {offer.year} {offer.make} {offer.model}
        </p>
      </div>

      {/* Big offer amount */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, delay: 0.25 }}
        className="bg-gradient-to-br from-[#1b3a5c] to-[#2a5080] rounded-2xl p-6 sm:p-8 text-center text-white relative overflow-hidden"
      >
        {/* Sparkle decorations */}
        <motion.div
          animate={{ rotate: 360, opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' as const }}
          className="absolute top-4 right-6 text-[#00aed9]/40"
        >
          <Star size={20} />
        </motion.div>
        <motion.div
          animate={{ rotate: -360, opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' as const }}
          className="absolute bottom-6 left-8 text-emerald-400/30"
        >
          <Sparkles size={16} />
        </motion.div>
        <motion.div
          animate={{ rotate: 180, opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' as const }}
          className="absolute top-8 left-12 text-white/20"
        >
          <Star size={12} />
        </motion.div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium mb-2">
            We'd love to buy your car for
          </p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2"
          >
            {fmt(offer.offer_amount)}
          </motion.div>
          <p className="text-white/40 text-xs">
            Range: {fmt(offer.range_low)} &mdash; {fmt(offer.range_high)}
          </p>
        </div>
      </motion.div>

      {/* Transparent breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 sm:p-6"
      >
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
          <Info size={14} className="text-[#00aed9]" />
          How we calculated your offer
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Base market value</span>
            <span className="font-bold text-gray-900 dark:text-white">{fmt(breakdown.base_value)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Age adjustment ({breakdown.age_years} {breakdown.age_years === 1 ? 'year' : 'years'})
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {breakdown.age_factor < 1 ? '-' : '+'}{fmt(Math.abs(breakdown.base_value - breakdown.base_value * breakdown.age_factor))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Mileage adjustment ({breakdown.mileage.toLocaleString()} mi)
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {breakdown.mileage_factor < 1 ? '-' : '+'}{fmt(Math.abs(breakdown.base_value * breakdown.age_factor - breakdown.base_value * breakdown.age_factor * breakdown.mileage_factor))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Condition ({breakdown.condition})
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {breakdown.condition_factor < 1 ? '-' : '+'}{fmt(Math.abs(breakdown.estimated_value - breakdown.base_value * breakdown.age_factor * breakdown.mileage_factor))}
            </span>
          </div>
          <div className="border-t border-gray-100 dark:border-slate-700 pt-3 mt-3 flex items-center justify-between">
            <span className="font-bold text-gray-900 dark:text-white">Final offer</span>
            <span className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
              {fmt(offer.offer_amount)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Reassurance */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5">
        <Shield size={16} className="shrink-0 mt-0.5" />
        <span>
          This offer is guaranteed for 7 days. No hidden fees. We handle all the paperwork.
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAccept}
          disabled={loading}
          className="flex-1 py-3.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] text-white font-bold text-base rounded-xl shadow-lg shadow-[#00aed9]/20 transition-all hover:shadow-xl hover:shadow-[#00aed9]/25 btn-press disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Accept Offer
            </>
          )}
        </button>
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3.5 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-base rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Not ready yet
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        No pressure — take your time. Your offer is locked in for 7 days.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Step 3 - Photo Upload
   ═══════════════════════════════════════════════════════════════════════════ */

function Step3Photos({
  offerId,
  onContinue,
  loading,
  setLoading: _setLoading,
}: {
  offerId: number;
  onContinue: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const [photos, setPhotos] = useState<Record<string, File | null>>({
    front: null,
    back: null,
    driver_side: null,
    interior: null,
  });
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = (key: string, file: File | null) => {
    if (!file) return;
    setPhotos((prev) => ({ ...prev, [key]: file }));
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews((prev) => ({ ...prev, [key]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (key: string) => {
    setPhotos((prev) => ({ ...prev, [key]: null }));
    setPreviews((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleDrop = (key: string, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(key, file);
    }
  };

  const photoCount = Object.values(photos).filter(Boolean).length;

  const handleUploadAndContinue = async () => {
    const files = Object.values(photos).filter(Boolean) as File[];
    if (files.length > 0) {
      setUploading(true);
      setUploadProgress(0);
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 15, 90));
        }, 200);
        await api.uploadSellPhotos(offerId, files);
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => {
          setUploading(false);
          onContinue();
        }, 400);
      } catch {
        setUploading(false);
        setUploadProgress(0);
        // Still allow continuing even if upload fails
        onContinue();
      }
    } else {
      onContinue();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-br from-[#00aed9] to-[#1b3a5c] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00aed9]/20"
        >
          <Camera size={28} className="text-white" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          Show us your car
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mx-auto">
          A few photos help us verify the offer. No professional quality needed!
        </p>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-4">
        {PHOTO_SLOTS.map((slot) => (
          <div key={slot.key}>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              {slot.label}
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(slot.key, e)}
              onClick={() => fileInputRefs.current[slot.key]?.click()}
              className={`relative aspect-[4/3] rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 overflow-hidden ${
                previews[slot.key]
                  ? 'border-emerald-300 dark:border-emerald-600'
                  : 'border-gray-200 dark:border-slate-700 hover:border-[#00aed9] dark:hover:border-[#00aed9] bg-gray-50 dark:bg-slate-800/50'
              }`}
            >
              {previews[slot.key] ? (
                <>
                  <img
                    src={previews[slot.key]}
                    alt={slot.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(slot.key);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition z-10"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <Image size={20} />
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-center px-2">
                    <span className="text-[#00aed9] font-semibold">Click</span> or drag photo
                  </div>
                </>
              )}
              <input
                ref={(el) => { fileInputRefs.current[slot.key] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(slot.key, e.target.files?.[0] || null)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Upload progress */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Uploading {photoCount} {photoCount === 1 ? 'photo' : 'photos'}...</span>
            <span className="font-bold text-[#00aed9]">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-full bg-[#00aed9] rounded-full"
              transition={{ ease: 'easeOut' as const }}
            />
          </div>
        </motion.div>
      )}

      {/* Reassurance */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2.5">
        <Camera size={16} className="shrink-0 mt-0.5" />
        <span>
          Photos are optional but may increase your offer. Phone camera quality is perfectly fine.
        </span>
      </div>

      {/* Continue */}
      <button
        onClick={handleUploadAndContinue}
        disabled={uploading || loading}
        className="w-full py-3.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] text-white font-bold text-base rounded-xl shadow-lg shadow-[#00aed9]/20 transition-all hover:shadow-xl hover:shadow-[#00aed9]/25 btn-press disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ChevronRight size={18} />
            {photoCount > 0 ? `Upload ${photoCount} ${photoCount === 1 ? 'Photo' : 'Photos'} & Continue` : 'Skip Photos & Continue'}
          </>
        )}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Step 4 - Schedule Pickup
   ═══════════════════════════════════════════════════════════════════════════ */

function Step4Schedule({
  onSchedule,
  loading,
}: {
  offerId: number;
  onSchedule: (date: string, timeSlot: string, address: string) => void;
  loading: boolean;
}) {
  const [address, setAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekdays = getWeekdaysFromToday(10);
  const isValid = address.trim() && selectedDate && selectedTime;

  const handleSubmit = () => {
    if (!isValid) return;
    setError(null);
    onSchedule(selectedDate!, selectedTime!, address.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-br from-[#00aed9] to-[#1b3a5c] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00aed9]/20"
        >
          <CalendarDays size={28} className="text-white" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          Schedule Pickup
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mx-auto">
          We'll come to you. Pick a day and time that works.
        </p>
      </div>

      {/* Address */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 sm:p-6">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3">
          <MapPin size={16} className="text-[#00aed9]" />
          Pickup Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your full address"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition"
        />
      </div>

      {/* Date selection */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 sm:p-6">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3">
          <CalendarDays size={16} className="text-[#00aed9]" />
          Select a Date
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {weekdays.map((d) => {
            const iso = formatDateISO(d);
            const isSelected = selectedDate === iso;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#00aed9] text-white shadow-md shadow-[#00aed9]/20'
                    : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fc] dark:hover:bg-slate-600'
                }`}
              >
                {formatDateShort(d)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time selection */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 sm:p-6"
          >
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3">
              <Clock size={16} className="text-[#00aed9]" />
              Select a Time
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot.value;
                return (
                  <button
                    key={slot.value}
                    onClick={() => setSelectedTime(slot.value)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-[#00aed9] text-white shadow-md shadow-[#00aed9]/20'
                        : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fc] dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className={`mx-auto mb-1.5 ${isSelected ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                      {slot.icon}
                    </div>
                    <div className="text-sm font-bold">{slot.label}</div>
                    <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                      {slot.time}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Note */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
        <Clock size={16} className="shrink-0 mt-0.5" />
        <span>
          You can reschedule anytime — no penalties. We handle all the paperwork.
        </span>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="w-full py-3.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] text-white font-bold text-base rounded-xl shadow-lg shadow-[#00aed9]/20 transition-all hover:shadow-xl hover:shadow-[#00aed9]/25 btn-press disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Scheduling...
          </>
        ) : (
          <>
            <Truck size={18} />
            Schedule Pickup
          </>
        )}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Step 5 - Confirmation
   ═══════════════════════════════════════════════════════════════════════════ */

function Step5Confirmation({ offer }: { offer: SellOffer }) {
  const timeline = offer.timeline;

  const timeSlotLabel = (slot: string | null) => {
    const found = TIME_SLOTS.find((s) => s.value === slot);
    return found ? `${found.label} (${found.time})` : slot || '';
  };

  return (
    <div className="space-y-6">
      {/* Celebration header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 6 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 bg-gradient-to-br from-[#00aed9] to-[#1b3a5c] rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#00aed9]/20"
        >
          <PartyPopper size={36} className="text-white -rotate-6" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2"
        >
          You're all set!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto"
        >
          We'll take care of everything from here. Sit back and relax.
        </motion.p>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-br from-[#1b3a5c] to-[#2a5080] rounded-2xl p-5 sm:p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Car size={20} className="text-[#00aed9]" />
          </div>
          <div>
            <div className="font-extrabold text-lg">
              {offer.year} {offer.make} {offer.model}
            </div>
            <div className="text-white/50 text-xs">
              {offer.mileage.toLocaleString()} miles &middot; {offer.condition}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-white/50 text-xs mb-0.5">Offer Amount</div>
            <div className="font-extrabold text-lg text-emerald-300">{fmt(offer.offer_amount)}</div>
          </div>
          {offer.pickup_date && (
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white/50 text-xs mb-0.5">Pickup Date</div>
              <div className="font-bold text-sm">
                {new Date(offer.pickup_date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          )}
          {offer.pickup_time_slot && (
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-white/50 text-xs mb-0.5">Time Slot</div>
              <div className="font-bold text-sm">{timeSlotLabel(offer.pickup_time_slot)}</div>
            </div>
          )}
        </div>

        {offer.pickup_address && (
          <div className="mt-3 bg-white/10 rounded-xl p-3 flex items-start gap-2">
            <MapPin size={14} className="text-[#00aed9] shrink-0 mt-0.5" />
            <div>
              <div className="text-white/50 text-xs mb-0.5">Pickup Address</div>
              <div className="font-medium text-sm">{offer.pickup_address}</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 sm:p-6"
      >
        <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <Clock size={16} className="text-[#00aed9]" />
          Your Timeline
        </h3>
        <div>
          {timeline.map((step, i) => {
            const isLast = i === timeline.length - 1;
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
                className="flex gap-4"
              >
                {/* Left rail */}
                <div className="flex flex-col items-center">
                  {step.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.55 + i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/30"
                    >
                      <CheckCircle2 size={18} />
                    </motion.div>
                  ) : step.current ? (
                    <div className="relative w-9 h-9 shrink-0">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full bg-[#00aed9]/30"
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.55 + i * 0.08, type: 'spring' }}
                        className="absolute inset-0 rounded-full border-2 border-[#00aed9] bg-white dark:bg-slate-800 flex items-center justify-center text-[#00aed9]"
                      >
                        <Clock size={16} />
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.55 + i * 0.08, type: 'spring' }}
                      className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0"
                    >
                      <Clock size={14} />
                    </motion.div>
                  )}

                  {/* Connector */}
                  {!isLast && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                      style={{ transformOrigin: 'top' }}
                      className={`w-0.5 flex-1 min-h-[24px] my-1 ${
                        step.completed
                          ? 'bg-emerald-400'
                          : step.current
                            ? 'bg-gradient-to-b from-[#00aed9] to-gray-200 dark:to-slate-700'
                            : 'border-l-2 border-dashed border-gray-300 dark:border-slate-600 w-0'
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-5 pt-1.5 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-sm font-bold ${
                        step.completed
                          ? 'text-gray-900 dark:text-white'
                          : step.current
                            ? 'text-[#00aed9]'
                            : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {step.current && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00aed9]/10 text-[#00aed9] px-2 py-0.5 rounded-full">
                        Up next
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      step.completed || step.current
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Reassuring note */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5">
        <DollarSign size={16} className="shrink-0 mt-0.5" />
        <span>
          Payment is typically sent within 24 hours of pickup. We handle all the paperwork — you don't have to worry about a thing.
        </span>
      </div>

      {/* Guarantee footer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-[#1b3a5c] dark:bg-slate-700 rounded-2xl p-6 text-center"
      >
        <Shield size={24} className="text-[#00aed9] mx-auto mb-3" />
        <h3 className="text-white font-bold text-lg mb-1">Stress-Free Guarantee</h3>
        <p className="text-white/50 text-sm max-w-xs mx-auto">
          Free pickup. No hidden fees. Payment within 24 hours. We handle everything.
        </p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SellCarPage({}: SellCarPageProps) {
  const [step, setStep] = useState<StepKey>(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [form, setForm] = useState<VehicleForm>({
    make: '',
    model: '',
    year: '',
    mileage: '',
    condition: '',
    color: '',
    vin: '',
  });
  const [offer, setOffer] = useState<SellOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goTo = useCallback((next: StepKey) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  /* ── Step 1 handler: create offer ── */
  const handleCreateOffer = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.createSellOffer({
        make: form.make,
        model: form.model,
        year: Number(form.year),
        mileage: Number(form.mileage),
        condition: form.condition,
        color: form.color || undefined,
        vin: form.vin || undefined,
      });
      setOffer(result);
      goTo(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2 handler: accept offer ── */
  const handleAcceptOffer = async () => {
    if (!offer) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.acceptSellOffer(offer.id);
      setOffer(result);
      goTo(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3 handler: continue after photos ── */
  const handlePhotosContinue = () => {
    goTo(4);
  };

  /* ── Step 4 handler: schedule pickup ── */
  const handleSchedulePickup = async (date: string, timeSlot: string, address: string) => {
    if (!offer) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.scheduleSellPickup(offer.id, {
        pickup_date: date,
        pickup_time_slot: timeSlot,
        pickup_address: address,
      });
      setOffer(result);
      goTo(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule pickup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1VehicleDetails
            form={form}
            setForm={setForm}
            onSubmit={handleCreateOffer}
            loading={loading}
            error={error}
          />
        );
      case 2:
        return offer ? (
          <Step2Offer
            offer={offer}
            onAccept={handleAcceptOffer}
            onBack={() => goTo(1)}
            loading={loading}
          />
        ) : null;
      case 3:
        return offer ? (
          <Step3Photos
            offerId={offer.id}
            onContinue={handlePhotosContinue}
            loading={loading}
            setLoading={setLoading}
          />
        ) : null;
      case 4:
        return offer ? (
          <Step4Schedule
            offerId={offer.id}
            onSchedule={handleSchedulePickup}
            loading={loading}
          />
        ) : null;
      case 5:
        return offer ? <Step5Confirmation offer={offer} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden"><div className="absolute top-0 right-0 w-80 h-80 bg-[#00aed9]/5 rounded-full blur-3xl" /></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-[#00aed9]/20 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-[#00aed9]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">Sell Your Car</h1>
              <p className="text-white/50 text-xs sm:text-sm">
                Fair price. Free pickup. Zero stress.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="max-w-3xl mx-auto">
          <StepIndicator current={step} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
