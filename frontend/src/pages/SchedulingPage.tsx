import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Sun, Moon, CheckCircle, Loader2, Truck } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { api } from '../api/client';
import type { AvailableSlots, AvailableSlot } from '../types';

interface SchedulingPageProps {
  onComplete: () => void;
}

export default function SchedulingPage({ onComplete }: SchedulingPageProps) {
  const [slots, setSlots] = useState<AvailableSlots>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const result = await api.getAvailableSlots();
      setSlots(result.slots);
    } catch {
      setError('Failed to load available times. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setError(null);
    try {
      await api.bookAppointment(selectedSlot.id);
      setBooked(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Booking failed';
      if (message.includes('no longer available') || message.includes('conflict')) {
        setError('That time was just taken. Refreshing...');
        setSelectedSlot(null);
        loadSlots();
      } else {
        setError(message);
      }
    } finally {
      setBooking(false);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const dates = Object.keys(slots).sort();
  const morningSlots = selectedDate
    ? (slots[selectedDate] || []).filter((s) => s.period === 'morning')
    : [];
  const afternoonSlots = selectedDate
    ? (slots[selectedDate] || []).filter((s) => s.period === 'afternoon')
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00aed9]/25">
            <Calendar size={22} className="text-white" />
          </div>
          <div className="absolute inset-0 w-12 h-12 bg-[#00aed9]/20 rounded-2xl animate-ping" />
        </div>
        <p className="text-sm text-gray-400">Loading available times...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#00aed9]/10 rounded-full px-3 py-1 mb-2">
          <Truck size={12} className="text-[#00aed9]" />
          <span className="text-[11px] font-semibold text-[#00aed9]">Free Delivery</span>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Schedule your delivery</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Choose when you'd like your vehicle delivered to your door</p>
      </div>

      {/* Context card */}
      <div className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] rounded-xl p-4 mb-5 flex items-center gap-3 text-white shadow-lg shadow-[#1b3a5c]/15">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
          <Truck size={18} className="text-[#00aed9]" />
        </div>
        <div className="text-sm">
          <div className="font-semibold">Free delivery to your address</div>
          <div className="text-white/50 text-xs">We'll bring your car to you. Stay home and have your ID ready.</div>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2" aria-label="Dismiss">&times;</button>
        </div>
      )}

      {/* Booked confirmation */}
      <AnimatePresence>
        {booked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Truck size={48} className="mx-auto mb-2 text-emerald-500" />
            </motion.div>
            <h3 className="text-lg font-bold text-gray-900">Delivery Scheduled!</h3>
            <p className="text-sm text-gray-600">
              {selectedDate && formatDateLabel(selectedDate)} at {selectedSlot?.time}
            </p>
            <p className="text-xs text-gray-400">We'll send you tracking details and a reminder before delivery.</p>
            <button
              onClick={onComplete}
              className="mt-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition"
            >
              Continue to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!booked && (
        <div className="space-y-4">
          {dates.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
              <Calendar size={32} className="mx-auto mb-3 text-gray-300" />
              <h3 className="font-bold text-gray-900 mb-1">No Delivery Slots Available</h3>
              <p className="text-sm text-gray-500">Please check back soon — new slots open daily.</p>
            </div>
          )}

          {dates.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-[#00aed9]" />
                <h3 className="font-bold text-gray-900 dark:text-white">Select a Date</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={`p-3 rounded-xl text-sm font-medium transition ${
                      selectedDate === date
                        ? 'bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white shadow-md shadow-[#00aed9]/20'
                        : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fc] dark:hover:bg-[#00aed9]/10'
                    }`}
                  >
                    {formatDateLabel(date)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className="text-[#00aed9]" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Select a Time</h3>
                </div>

                {morningSlots.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2 text-xs text-gray-500 font-medium">
                      <Sun size={14} />
                      <span>Morning</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {morningSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-lg text-sm font-medium transition ${
                            selectedSlot?.id === slot.id
                              ? 'bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white shadow-md shadow-[#00aed9]/20'
                              : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fc] dark:hover:bg-[#00aed9]/10'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2 text-xs text-gray-500 font-medium">
                      <Moon size={14} />
                      <span>Afternoon</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {afternoonSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-lg text-sm font-medium transition ${
                            selectedSlot?.id === slot.id
                              ? 'bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white shadow-md shadow-[#00aed9]/20'
                              : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fc] dark:hover:bg-[#00aed9]/10'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-4 border-t border-gray-100"
                  >
                    <div className="bg-[#e0f7fc] dark:bg-[#00aed9]/10 rounded-xl p-4 mb-4 flex items-center gap-3">
                      <Truck size={18} className="text-[#00aed9] shrink-0" />
                      <p className="text-sm font-medium text-gray-900">
                        Delivery: {formatDateLabel(selectedDate)} at {selectedSlot.time}
                      </p>
                    </div>
                    <button
                      onClick={handleBook}
                      disabled={booking}
                      className="w-full py-3 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#00aed9]/20 btn-press flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {booking ? (
                        <><Loader2 size={18} className="animate-spin" /> Booking...</>
                      ) : (
                        <><CheckCircle size={18} /> Confirm Delivery</>
                      )}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
