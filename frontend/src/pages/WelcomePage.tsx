import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Shield, Clock, Undo2, CreditCard, CheckCircle, ChevronRight, Eye, EyeOff, Star, Zap, TrendingUp, Users } from 'lucide-react';

interface WelcomePageProps {
  onRegister: (data: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>;
  onLogin: (data: { email: string; password: string }) => Promise<void>;
  error?: string;
}

const FEATURED_CARS = [
  { make: 'Toyota', model: 'RAV4 XLE', year: 2024, price: 31200, mpg: 30, miles: 7650, color: 'Cavalry Blue', g: ['#5b7fa5', '#3d5f82'], tag: 'Popular', img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=400&q=80' },
  { make: 'Honda', model: 'Civic Sport', year: 2025, price: 24890, mpg: 36, miles: 2100, color: 'Rallye Red', g: ['#cc2233', '#991a26'], tag: 'Low Miles', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80' },
  { make: 'Tesla', model: 'Model 3', year: 2024, price: 37990, mpg: 132, miles: 3200, color: 'Midnight Silver', g: ['#4a4a4a', '#2d2d2d'], tag: 'Electric', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80' },
  { make: 'Kia', model: 'Telluride SX', year: 2024, price: 43500, mpg: 23, miles: 4500, color: 'Gravity Gray', g: ['#5c5c5c', '#3a3a3a'], tag: '3rd Row', img: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=400&q=80' },
  { make: 'Mazda', model: 'CX-5 Premium', year: 2024, price: 30500, mpg: 28, miles: 9800, color: 'Soul Red', g: ['#a11325', '#7a0e1c'], tag: 'Leather', img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=400&q=80' },
  { make: 'Ford', model: 'Maverick XLT', year: 2024, price: 26800, mpg: 33, miles: 3800, color: 'Alto Blue', g: ['#5a7fa0', '#3d5f80'], tag: 'Hybrid', img: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=400&q=80' },
  { make: 'Hyundai', model: 'Ioniq 5', year: 2024, price: 41500, mpg: 114, miles: 5600, color: 'Digital Teal', g: ['#2a8a7a', '#1e6a5c'], tag: 'Electric', img: 'https://images.unsplash.com/photo-1680024315041-764e1850a69d?auto=format&fit=crop&w=400&q=80' },
  { make: 'Subaru', model: 'Outback', year: 2024, price: 36400, mpg: 29, miles: 6300, color: 'Autumn Green', g: ['#4a6741', '#364d30'], tag: 'AWD', img: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=400&q=80' },
  { make: 'BMW', model: '330i', year: 2023, price: 39800, mpg: 26, miles: 14200, color: 'Alpine White', g: ['#e8e8e8', '#cccccc'], tag: 'Luxury', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80' },
];

const STATS = [
  { value: '20K+', label: 'Vehicles', icon: Car },
  { value: '4.9', label: 'Rating', icon: Star },
  { value: '98%', label: 'Satisfaction', icon: TrendingUp },
  { value: '50K+', label: 'Happy Buyers', icon: Users },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', location: 'Austin, TX', text: 'Bought my RAV4 in 8 minutes from my couch. The AI walked me through everything.', initials: 'SM', rating: 5 },
  { name: 'James K.', location: 'Denver, CO', text: 'Best car buying experience ever. No haggling, fair price, delivered next day.', initials: 'JK', rating: 5 },
  { name: 'Priya R.', location: 'Seattle, WA', text: 'The financing calculator saved me thousands. Transparent and honest.', initials: 'PR', rating: 5 },
];

const fmt = (n: number) => '$' + n.toLocaleString('en-US');

function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      yEnd: -30 - Math.random() * 40,
      xEnd: (Math.random() - 0.5) * 30,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 5,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-[#00aed9]/20 rounded-full"
          style={{ left: p.left, top: p.top }}
          animate={{
            y: [0, p.yEnd, 0],
            x: [0, p.xEnd, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    setDisplay(value);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

export default function WelcomePage({ onRegister, onLogin, error }: WelcomePageProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      await fetch('/api/v1/auth/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) await onLogin({ email: form.email, password: form.password });
      else await onRegister(form);
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/80 focus:bg-white focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition-all duration-200 text-sm placeholder:text-gray-400";

  if (forgotMode) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-gradient px-6 relative">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-black/20 relative z-10"
        >
          {forgotSent ? (
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-600" />
              </motion.div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6">If an account exists with that email, we've sent a password reset link.</p>
              <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="w-full py-3 bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white font-semibold rounded-xl hover:from-[#0090b3] hover:to-[#007a99] transition btn-press">Back to Sign In</button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Reset your password</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>
              <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Your email address" required className={inputClass + ' mb-4'} />
              <button type="submit" disabled={forgotLoading} className="w-full py-3 bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white font-semibold rounded-xl hover:from-[#0090b3] hover:to-[#007a99] transition disabled:opacity-50 mb-3 btn-press">
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => setForgotMode(false)} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition">Back to Sign In</button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col mesh-gradient relative overflow-hidden">
      {/* Background decorations */}
      <FloatingParticles />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#00aed9]/5 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#1b3a5c]/10 blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-xl flex items-center justify-center shadow-lg shadow-[#00aed9]/25">
            <Car size={18} className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">CARVANA</span>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-white/40 hover:text-white transition flex items-center gap-1 group"
        >
          {isLogin ? 'Create account' : 'Sign in'} <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </nav>

      {/* Hero Section */}
      <div className="px-4 sm:px-6 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-8 items-start pt-4 lg:pt-8">

          {/* Left -- Hero + Cars (3 cols) */}
          <div className="lg:col-span-3">
            <div className="animate-fadeInUp">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-5"
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/70 font-medium">AI-Powered Purchase Assistant</span>
                <Zap size={12} className="text-[#00aed9]" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] mb-4"
              >
                Find your car.<br />
                <span className="text-gradient">We deliver it.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-base sm:text-lg text-white/40 mb-8 max-w-lg leading-relaxed"
              >
                Browse thousands of vehicles, get instant financing, and have your car delivered to your door. No dealership. No haggling.
              </motion.p>
            </div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex gap-3 sm:gap-4 mb-6"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="glass rounded-xl px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-2.5 flex-1">
                  <div className="w-8 h-8 bg-[#00aed9]/15 rounded-lg flex items-center justify-center shrink-0">
                    <stat.icon size={14} className="text-[#00aed9]" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-extrabold text-white"><AnimatedCounter value={stat.value} /></div>
                    <div className="text-[10px] text-white/35">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Featured Vehicles Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/60">Featured vehicles</h3>
                <span className="text-xs text-[#00aed9] font-medium">20,000+ available</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                {FEATURED_CARS.map((car, i) => (
                  <motion.div key={car.model}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.04 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="glass rounded-xl overflow-hidden cursor-pointer group card-shine">
                    <div className="h-[72px] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${car.g[0]}, ${car.g[1]})` }}>
                      {car.img ? (
                        <img src={car.img} alt={`${car.year} ${car.make} ${car.model}`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <Car size={24} className="text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 group-hover:text-white/20 transition-all duration-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute top-1.5 right-1.5 text-[8px] font-bold text-white bg-black/50 backdrop-blur px-1.5 py-0.5 rounded z-10">{car.tag}</div>
                    </div>
                    <div className="p-2.5">
                      <div className="text-[11px] font-bold text-white truncate">{car.year} {car.make}</div>
                      <div className="text-[11px] text-white/40 truncate">{car.model}</div>
                      <div className="text-sm font-extrabold text-[#00aed9] mt-1">{fmt(car.price)}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-white/25">
                        <span>{car.miles.toLocaleString()} mi</span>
                        <span>·</span>
                        <span>{car.mpg} MPG</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="hidden lg:flex gap-3"
            >
              {[
                { icon: <Undo2 size={16} />, text: '7-Day Money Back' },
                { icon: <Shield size={16} />, text: '150-Point Inspection' },
                { icon: <CreditCard size={16} />, text: 'Instant Financing' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-2.5 glass rounded-xl px-4 py-2.5 hover:bg-white/10 transition-colors">
                  <span className="text-[#00aed9]">{b.icon}</span>
                  <span className="text-xs text-white/60 font-medium">{b.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Testimonials - auto rotating */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="hidden lg:block mt-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-xl p-4"
                >
                  <p className="text-sm text-white/50 italic leading-relaxed">
                    "{TESTIMONIALS[activeTestimonial].text}"
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                      {TESTIMONIALS[activeTestimonial].initials}
                    </div>
                    <div>
                      <div className="text-xs text-white/60 font-medium">{TESTIMONIALS[activeTestimonial].name}</div>
                      <div className="text-[10px] text-white/30">{TESTIMONIALS[activeTestimonial].location}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-[10px]">★</span>)}
                    </div>
                  </div>
                  {/* Dots indicator */}
                  <div className="flex justify-center gap-1.5 mt-3">
                    {TESTIMONIALS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTestimonial(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-[#00aed9] w-4' : 'bg-white/20 hover:bg-white/40'}`}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right -- Form (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            {/* Mobile trust badges */}
            <div className="lg:hidden flex justify-center gap-2.5 mb-4">
              {[
                { icon: <Undo2 size={12} />, text: '7-Day Return' },
                { icon: <Shield size={12} />, text: 'Inspected' },
                { icon: <CreditCard size={12} />, text: 'Financing' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-1 glass rounded-lg px-2.5 py-1.5">
                  <span className="text-[#00aed9]">{b.icon}</span>
                  <span className="text-[10px] text-white/50 font-medium">{b.text}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden border border-white/20">
              {/* Form header with gradient accent */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00aed9]/5 to-transparent" />
                <div className="px-7 pt-7 pb-1 relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isLogin ? 'login' : 'register'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h2 className="text-2xl font-extrabold text-gray-900">{isLogin ? 'Welcome back' : 'Get started free'}</h2>
                      <p className="text-sm text-gray-500 mt-1">{isLogin ? 'Pick up where you left off' : 'Create your account in seconds'}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-7 pb-6 pt-4 space-y-3.5">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input type="text" required={!isLogin} value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className={inputClass} placeholder="John Smith" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputClass} placeholder="you@email.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} required minLength={6} value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className={inputClass + ' pr-10'} placeholder={isLogin ? 'Your password' : 'Min 6 characters'} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                      <input type="password" required={!isLogin} value={form.password_confirmation}
                        onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                        className={inputClass} placeholder="Repeat password" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">{error}</motion.div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm shadow-lg shadow-[#00aed9]/25 hover:shadow-xl hover:shadow-[#00aed9]/30 btn-press relative overflow-hidden group">
                  <span className="relative z-10">
                    {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Start Browsing'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-gray-400 hover:text-[#00aed9] transition">
                    {isLogin ? 'Create account' : 'Sign in instead'}
                  </button>
                  {isLogin && <button type="button" onClick={() => setForgotMode(true)} className="text-gray-400 hover:text-[#00aed9] transition">Forgot password?</button>}
                </div>

                {!isLogin && (
                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    By signing up, you agree to our <span className="underline cursor-pointer hover:text-gray-600 transition">Terms</span> and <span className="underline cursor-pointer hover:text-gray-600 transition">Privacy Policy</span>
                  </p>
                )}
              </form>

              <div className="bg-gray-50/80 px-7 py-3 flex items-center justify-center gap-5 border-t border-gray-100">
                {[
                  { icon: <Shield size={11} className="text-emerald-500" />, text: 'SSL Encrypted' },
                  { icon: <CheckCircle size={11} className="text-emerald-500" />, text: 'No Credit Check' },
                  { icon: <Clock size={11} className="text-gray-400" />, text: '~5 min' },
                ].map(i => (
                  <span key={i.text} className="flex items-center gap-1 text-[10px] text-gray-400">{i.icon} {i.text}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <div className="relative bg-[#0a1628]/80 border-t border-white/5 py-14 px-6 mt-auto backdrop-blur-sm">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h3
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-lg font-extrabold text-white mb-10"
          >
            How it works
          </motion.h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#00aed9]/20 to-transparent hidden sm:block" />

            {[
              { n: '1', title: 'Tell us what you want', desc: 'Chat with AI about your ideal car' },
              { n: '2', title: 'See your matches', desc: 'Browse vehicles picked for you' },
              { n: '3', title: 'Quick verification', desc: 'Upload ID for financing approval' },
              { n: '4', title: 'Get it delivered', desc: 'We bring the car to your door' },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-xl flex items-center justify-center mx-auto mb-3 text-white font-extrabold text-sm shadow-lg shadow-[#00aed9]/20 hover:scale-110 transition-transform cursor-default">
                  {s.n}
                </div>
                <div className="text-sm font-bold text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/30">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#060e18] border-t border-white/5 py-4 px-6 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-lg flex items-center justify-center">
              <Car size={12} className="text-white" />
            </div>
            <span className="text-xs font-bold text-white/40">CARVANA</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-white/20">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
