import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  CheckCircle2,
  ClipboardCheck,
  Navigation,
  PartyPopper,
  MapPin,
  Calendar,
  Phone,
  User,
  Hash,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../api/client';
import type { Delivery, DeliveryTimeline } from '../types';
import VehicleImage from '../components/VehicleImage';

interface DeliveryPageProps {}

const STEP_ICONS: Record<string, React.ReactNode> = {
  order_confirmed: <CheckCircle2 size={18} />,
  inspection: <ClipboardCheck size={18} />,
  in_transit: <Truck size={18} />,
  out_for_delivery: <Navigation size={18} />,
  delivered: <PartyPopper size={18} />,
};

const STEP_KEYS = [
  'order_confirmed',
  'inspection',
  'in_transit',
  'out_for_delivery',
  'delivered',
];

function getStepIcon(key: string, fallbackIndex: number): React.ReactNode {
  if (STEP_ICONS[key]) return STEP_ICONS[key];
  const fallbackKey = STEP_KEYS[fallbackIndex];
  return fallbackKey ? STEP_ICONS[fallbackKey] : <CheckCircle2 size={18} />;
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  } catch {
    return dateStr;
  }
}

function getStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'out_for_delivery':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'in_transit':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function TimelineStep({
  step,
  index,
  isLast,
}: {
  step: DeliveryTimeline;
  index: number;
  isLast: boolean;
}) {
  const icon = getStepIcon(step.key, index);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.12, duration: 0.4, ease: 'easeOut' }}
      className="flex gap-4"
    >
      {/* Left rail: dot + connector */}
      <div className="flex flex-col items-center">
        {/* Step circle */}
        {step.completed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + index * 0.12, type: 'spring', stiffness: 300, damping: 20 }}
            className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/30"
          >
            <CheckCircle2 size={20} />
          </motion.div>
        ) : step.current ? (
          <div className="relative w-10 h-10 shrink-0">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-[#00aed9]/30"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.12, type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute inset-0 rounded-full border-2 border-[#00aed9] bg-white flex items-center justify-center text-[#00aed9] shadow-sm shadow-[#00aed9]/20"
            >
              {icon}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + index * 0.12, type: 'spring', stiffness: 300, damping: 20 }}
            className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"
          >
            {icon}
          </motion.div>
        )}

        {/* Connector line */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.4 + index * 0.12, duration: 0.3 }}
            style={{ transformOrigin: 'top' }}
            className={`w-0.5 flex-1 min-h-[32px] my-1 ${
              step.completed
                ? 'bg-emerald-400'
                : step.current
                  ? 'bg-gradient-to-b from-[#00aed9] to-gray-200'
                  : 'border-l-2 border-dashed border-gray-300 w-0'
            }`}
          />
        )}
      </div>

      {/* Right content */}
      <div className={`pb-6 pt-1.5 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <h4
            className={`text-sm font-bold ${
              step.completed
                ? 'text-gray-900'
                : step.current
                  ? 'text-[#00aed9]'
                  : 'text-gray-400'
            }`}
          >
            {step.label}
          </h4>
          {step.current && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] font-bold uppercase tracking-wider bg-[#00aed9]/10 text-[#00aed9] px-2 py-0.5 rounded-full"
            >
              Current
            </motion.span>
          )}
        </div>
        <p
          className={`text-xs mt-0.5 ${
            step.completed || step.current ? 'text-gray-500' : 'text-gray-400'
          }`}
        >
          {step.description}
        </p>
        {step.completed_at && (
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            {formatDateTime(step.completed_at)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function DeliveryCard({ delivery }: { delivery: Delivery }) {
  const { vehicle, timeline } = delivery;
  const [gradFrom, gradTo] = vehicle.image_gradient;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Vehicle info card */}
      <VehicleImage
        imageUrl={vehicle.image_url}
        make={vehicle.make}
        model={vehicle.model}
        bodyType={vehicle.body_type}
        gradient={[gradFrom, gradTo]}
        className="relative rounded-2xl overflow-hidden text-white p-6 min-h-[140px] shadow-xl"
        silhouetteSize="w-48 h-48 absolute right-0 bottom-0"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusColor(delivery.status)}`}>
              {getStatusLabel(delivery.status)}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold mt-3">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
          <div className="flex items-center gap-2 mt-1 text-white/70 text-sm">
            <Hash size={14} />
            <span>Tracking: {delivery.tracking_number}</span>
          </div>
        </div>
      </VehicleImage>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Package size={16} className="text-[#00aed9]" />
          Delivery Timeline
        </h3>
        <div>
          {timeline.map((step, i) => (
            <TimelineStep
              key={step.key}
              step={step}
              index={i}
              isLast={i === timeline.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Delivery details */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6"
      >
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Truck size={16} className="text-[#00aed9]" />
          Delivery Details
        </h3>
        <div className="space-y-3">
          {/* Estimated delivery */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-[#00aed9]/10 rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-[#00aed9]" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Estimated Delivery</div>
              <div className="text-sm font-bold text-gray-900">
                {formatDate(delivery.estimated_delivery_date)}
              </div>
              {delivery.actual_delivery_date && (
                <div className="text-xs text-emerald-600 font-medium mt-0.5">
                  Delivered {formatDate(delivery.actual_delivery_date)}
                </div>
              )}
            </div>
          </div>

          {/* Delivery address */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-[#1b3a5c]/10 rounded-lg flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-[#1b3a5c]" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Delivery Address</div>
              <div className="text-sm font-bold text-gray-900">
                {delivery.delivery_address}
              </div>
            </div>
          </div>

          {/* Driver info */}
          {delivery.driver_name && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                <User size={16} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Your Driver</div>
                <div className="text-sm font-bold text-gray-900">
                  {delivery.driver_name}
                </div>
                {delivery.driver_phone && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Phone size={11} />
                    {delivery.driver_phone}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {delivery.notes && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-800">{delivery.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DeliveryPage({}: DeliveryPageProps) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDeliveries()
      .then((res) => setDeliveries(res.deliveries))
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load deliveries');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00aed9]/25">
            <Truck size={22} className="text-white" />
          </div>
          <div className="absolute inset-0 w-12 h-12 bg-[#00aed9]/20 rounded-2xl animate-ping" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck size={24} className="text-red-400" />
          </div>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden"><div className="absolute top-0 right-0 w-80 h-80 bg-[#00aed9]/5 rounded-full blur-3xl" /></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-[#00aed9]/20 rounded-xl flex items-center justify-center">
              <Truck size={20} className="text-[#00aed9]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Delivery Tracking</h1>
              <p className="text-white/50 text-sm">
                {deliveries.length > 0
                  ? `${deliveries.length} active ${deliveries.length === 1 ? 'delivery' : 'deliveries'}`
                  : 'Track your vehicle deliveries'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {deliveries.length > 0 ? (
          <div className="space-y-8">
            {deliveries.map((delivery) => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
              className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-5"
            >
              <Truck size={36} className="text-gray-400" />
            </motion.div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">
              No deliveries yet
            </h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
              Once you purchase a vehicle, you'll be able to track your delivery
              right here.
            </p>
            <button className="bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] shadow-lg shadow-[#00aed9]/25 btn-press text-white font-bold text-sm px-6 py-3 rounded-xl transition-all hover:shadow-md active:scale-[0.97]">
              Browse Vehicles
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
