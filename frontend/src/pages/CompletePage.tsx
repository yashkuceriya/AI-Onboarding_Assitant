import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, BookOpen, Mail, LayoutDashboard, Car, PartyPopper, Shield, Truck, CheckCircle, Sparkles, Star } from 'lucide-react';
import { api } from '../api/client';
import type { Affirmation, SupportResource } from '../types';

/* ── Confetti Particle Component ── */
function ConfettiParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: [
        '#00aed9', '#0090b3', '#1b3a5c', '#10b981',
        '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4',
      ][i % 8],
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 4,
      shape: i % 3, // 0 = circle, 1 = square, 2 = triangle-ish
      rotation: Math.random() * 360,
      driftX: (Math.random() - 0.5) * 200,
      driftY: -(Math.random() * 400 + 200),
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${p.x}vw`,
            y: '110%',
            rotate: 0,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: '-20%',
            x: `calc(${p.x}vw + ${p.driftX}px)`,
            rotate: p.rotation + 720,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: Math.random() * 3 + 2,
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '2px' : '0',
            clipPath: p.shape === 2 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
          }}
        />
      ))}
    </div>
  );
}

/* ── Animated Checkmark SVG ── */
function AnimatedCheckmark() {
  return (
    <motion.svg
      viewBox="0 0 52 52"
      className="w-14 h-14"
      initial="hidden"
      animate="visible"
    >
      {/* Circle */}
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
              pathLength: { type: 'spring', duration: 1.2, bounce: 0.2, delay: 0.3 },
              opacity: { duration: 0.2, delay: 0.3 },
            },
          },
        }}
      />
      {/* Check */}
      <motion.path
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
              pathLength: { type: 'spring', duration: 0.8, bounce: 0.3, delay: 1.0 },
              opacity: { duration: 0.2, delay: 1.0 },
            },
          },
        }}
      />
    </motion.svg>
  );
}

/* ── Pulsing Status Dot ── */
function PulsingDot() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
    </span>
  );
}

/* ── Main Component ── */
interface CompletePageProps {
  onDashboard?: () => void;
}

export default function CompletePage({ onDashboard }: CompletePageProps = {}) {
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [resources, setResources] = useState<SupportResource[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    api.getAffirmation().then(setAffirmation).catch(console.error);
    api.getResources().then(res => setResources(res.resources)).catch(console.error);
  }, []);

  const refreshAffirmation = async () => {
    setRefreshing(true);
    try {
      setAffirmation(await api.getAffirmation());
    } finally {
      setRefreshing(false);
    }
  };

  const icons: Record<string, React.ReactNode> = {
    guide: <BookOpen size={18} className="text-[#00aed9]" />,
    support: <Mail size={18} className="text-[#1b3a5c]" />,
    dashboard: <LayoutDashboard size={18} className="text-emerald-600" />,
  };

  const timelineSteps = [
    { icon: <CheckCircle size={20} className="text-emerald-400" />, title: 'Document verification', desc: "We're reviewing your documents now. Usually done within 1 business day.", color: 'from-emerald-400 to-emerald-500' },
    { icon: <Truck size={20} className="text-[#00aed9]" />, title: 'Delivery preparation', desc: "Your vehicle will be inspected and prepped for delivery.", color: 'from-[#00aed9] to-[#0090b3]' },
    { icon: <Car size={20} className="text-[#1b3a5c]" />, title: '7-day test drive', desc: "Drive it, love it. If not, return it free — no questions asked.", color: 'from-[#1b3a5c] to-[#2a5080]' },
  ];

  return (
    <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ── Confetti Background ── */}
      <ConfettiParticles />

      {/* ── Hero Celebration ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative text-center pt-4 pb-8"
      >
        {/* Radial glow behind icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute left-1/2 top-4 -translate-x-1/2 w-64 h-64 bg-[#00aed9]/10 rounded-full blur-3xl pointer-events-none"
        />

        {/* Floating sparkles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute left-1/2 top-8 -translate-x-1/2"
        >
          {[
            { x: -80, y: -10, delay: 1.6, size: 14 },
            { x: 70, y: 5, delay: 1.8, size: 12 },
            { x: -40, y: 50, delay: 2.0, size: 10 },
            { x: 55, y: -25, delay: 2.2, size: 16 },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0, x: s.x, y: s.y }}
              animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.6] }}
              transition={{ delay: s.delay, duration: 0.6, ease: 'easeOut' }}
              className="absolute animate-float"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              <Star size={s.size} className="text-[#00aed9]/40 fill-[#00aed9]/20" />
            </motion.div>
          ))}
        </motion.div>

        {/* Main icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 6 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.2 }}
          className="relative w-24 h-24 bg-gradient-to-br from-[#00aed9] via-[#0090b3] to-[#1b3a5c] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#00aed9]/30 animate-glow"
        >
          <AnimatedCheckmark />
          {/* Smaller party icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 1.6 }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <PartyPopper size={16} className="text-[#00aed9]" />
          </motion.div>
        </motion.div>

        {/* Hero text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight"
        >
          <span className="text-gradient">You're all set!</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-base"
        >
          Your purchase is confirmed. We'll take it from here.
        </motion.p>

        {/* Vehicle preparation status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-5 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-50 border border-emerald-100"
        >
          <PulsingDot />
          <span className="text-sm font-semibold text-emerald-700">Your vehicle is being prepared</span>
        </motion.div>
      </motion.div>

      {/* ── Timeline: What happens next ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-white rounded-2xl shadow-lg shadow-black/5 p-6 sm:p-8 card-shine"
      >
        <div className="flex items-center gap-2 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">What happens next</h3>
          <Sparkles size={16} className="text-[#00aed9]" />
        </div>

        <div className="space-y-0">
          {timelineSteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-4 relative"
            >
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.7 + i * 0.15 }}
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${step.color} shadow-md`}
                >
                  <div className="text-white">{step.icon}</div>
                </motion.div>
                {i < timelineSteps.length - 1 && (
                  <div className="relative w-0.5 flex-1 min-h-[32px] bg-gray-100 dark:bg-slate-700 my-1 overflow-hidden rounded-full">
                    <motion.div
                      initial={{ height: '0%' }}
                      animate={{ height: '100%' }}
                      transition={{ delay: 0.9 + i * 0.2, duration: 0.8, ease: 'easeOut' }}
                      className={`absolute top-0 left-0 w-full bg-gradient-to-b ${step.color} rounded-full`}
                    />
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="pb-6 pt-1.5">
                <div className="text-sm font-bold text-gray-900 dark:text-white">{step.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{step.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Pro Tip / Affirmation ── */}
      <AnimatePresence mode="wait">
        {affirmation && (
          <motion.div
            key={affirmation.content}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-[#00aed9]/20 bg-gradient-to-br from-[#e0f7fc] via-white to-[#e0f7fc]/60 shadow-md shadow-[#00aed9]/5"
          >
            {/* Decorative gradient orb */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#00aed9]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00aed9] to-[#0090b3] flex items-center justify-center">
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-[#0090b3] uppercase tracking-wider">Pro tip</span>
                </div>
                <button
                  onClick={refreshAffirmation}
                  disabled={refreshing}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] flex items-center justify-center text-white transition-all btn-press shadow-sm"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">{affirmation.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resources ── */}
      {resources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-3"
        >
          <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <BookOpen size={14} className="text-[#00aed9]" />
            Resources
          </h3>
          <div className="grid gap-3">
            {resources.map((resource, i) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-start gap-3.5 hover-lift card-shine cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shrink-0 group-hover:from-[#e0f7fc] group-hover:to-[#e0f7fc]/60 transition-colors duration-300">
                  {icons[resource.type] || icons.guide}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#00aed9] transition-colors">
                    {resource.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{resource.description}</p>
                </div>
                <motion.div
                  className="text-gray-300 group-hover:text-[#00aed9] transition-colors mt-1"
                  whileHover={{ x: 2 }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Guarantee Footer ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl p-8 text-center animate-glow"
        style={{
          background: 'linear-gradient(135deg, #1b3a5c 0%, #0d2240 40%, #0a1929 70%, #112d4e 100%)',
        }}
      >
        {/* Animated glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/4 w-40 h-40 bg-[#00aed9]/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-0 right-1/4 w-32 h-32 bg-[#0090b3]/20 rounded-full blur-3xl"
          />
        </div>

        {/* Subtle noise texture */}
        <div className="noise absolute inset-0 pointer-events-none rounded-2xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 1.3 }}
            className="w-14 h-14 bg-gradient-to-br from-[#00aed9]/30 to-[#00aed9]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#00aed9]/20"
          >
            <Shield size={26} className="text-[#00aed9]" />
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="text-white font-bold text-xl mb-2"
          >
            Carvana Guarantee
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed"
          >
            7-day money-back guarantee. 100-day warranty. Free delivery. No haggling ever.
          </motion.p>

          {/* Guarantee badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="flex items-center justify-center gap-3 mt-5"
          >
            {['7-Day Return', '100-Day Warranty', 'Free Delivery'].map((label) => (
              <span
                key={label}
                className="text-[10px] font-bold uppercase tracking-wider text-[#00aed9]/80 bg-[#00aed9]/10 px-3 py-1.5 rounded-full border border-[#00aed9]/15"
              >
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Dashboard CTA ── */}
      {onDashboard && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="text-center"
        >
          <button
            onClick={onDashboard}
            className="btn-press px-8 py-3.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#00aed9]/20 inline-flex items-center gap-2 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <LayoutDashboard size={18} />
              Go to Dashboard
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
