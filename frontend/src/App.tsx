import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { api } from './api/client';

// Eager load critical pages
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import DocumentsPage from './pages/DocumentsPage';
import SchedulingPage from './pages/SchedulingPage';
import CompletePage from './pages/CompletePage';

// Lazy load secondary pages for better initial load
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const SellCarPage = lazy(() => import('./pages/SellCarPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
import ProgressBar from './components/ProgressBar';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { NotificationBell } from './components/NotificationPanel';
import CommandPalette, { triggerCommandPalette } from './components/CommandPalette';
import type { User, OnboardingStep } from './types';
import { Car, AlertTriangle, Search, Heart, Truck, User as UserIcon, LayoutDashboard, GitCompareArrows, DollarSign } from 'lucide-react';

const STEP_ORDER: OnboardingStep[] = ['welcome', 'assessment', 'documents', 'scheduling', 'complete'];

function LazyFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [appError] = useState(false);
  const [completionDismissed, setCompletionDismissed] = useState(() => localStorage.getItem('completion_dismissed') === 'true');
  const [compareIds, setCompareIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('compare_ids');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('compare_ids', JSON.stringify(compareIds));
  }, [compareIds]);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const userData = await api.getUser();
        setUser(userData);
      } catch {
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  };

  const handleRegister = async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
    setError('');
    try {
      const result = await api.register(data);
      localStorage.setItem('auth_token', result.token);
      setUser(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('');
    try {
      const result = await api.login(data);
      localStorage.setItem('auth_token', result.token);
      setUser(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const advanceStep = useCallback(async () => {
    try {
      const updated = await api.getUser();
      setUser(updated);
    } catch {
      if (user) {
        const idx = STEP_ORDER.indexOf(user.onboarding_step);
        if (idx >= 0 && idx < STEP_ORDER.length - 1) {
          setUser({ ...user, onboarding_step: STEP_ORDER[idx + 1] });
        }
      }
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('completion_dismissed');
    setUser(null);
    setError('');
    setCompletionDismissed(false);
    navigate('/');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const removeFromCompare = useCallback((id: number) => {
    setCompareIds(prev => prev.filter(v => v !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  if (appError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please refresh the page to continue.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-[#00aed9] text-white font-semibold rounded-xl hover:bg-[#0090b3] transition">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00aed9]/25 animate-scalePop">
            <Car size={22} className="text-white" />
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

  if (!user) {
    return <WelcomePage onRegister={handleRegister} onLogin={handleLogin} error={error} />;
  }

  const step = user.onboarding_step;
  const isOnboarding = step !== 'complete';

  // Show completion celebration screen once after finishing onboarding
  if (step === 'complete' && !completionDismissed) {
    return (
      <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900 flex flex-col">
        <header className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] dark:from-slate-800 dark:to-slate-800 text-white px-4 sm:px-6 py-3.5 shrink-0 shadow-lg shadow-[#1b3a5c]/10">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-lg flex items-center justify-center shadow-md shadow-[#00aed9]/20">
                <Car size={16} className="text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">CARVANA</span>
            </div>
            <button onClick={() => { setCompletionDismissed(true); localStorage.setItem('completion_dismissed', 'true'); }}
              className="text-sm text-white/50 hover:text-white transition">Go to Dashboard</button>
          </div>
        </header>
        <main className="flex-1">
          <CompletePage onDashboard={() => { setCompletionDismissed(true); localStorage.setItem('completion_dismissed', 'true'); }} />
        </main>
      </div>
    );
  }

  if (isOnboarding) {
    const renderStep = () => {
      switch (step) {
        case 'welcome':
        case 'assessment':
          return <AssessmentPage onComplete={advanceStep} />;
        case 'documents':
          return <DocumentsPage onComplete={advanceStep} />;
        case 'scheduling':
          return <SchedulingPage onComplete={advanceStep} />;
        default:
          return <AssessmentPage onComplete={advanceStep} />;
      }
    };

    return (
      <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900 flex flex-col">
        <header className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] dark:from-slate-800 dark:to-slate-800 text-white px-4 sm:px-6 py-3.5 shrink-0 shadow-lg shadow-[#1b3a5c]/10">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-lg flex items-center justify-center shadow-md shadow-[#00aed9]/20">
                <Car size={16} className="text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">CARVANA</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeToggle />
              <span className="text-sm text-white/50 hidden sm:block">{user.name}</span>
              <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white/70 transition">Sign out</button>
            </div>
          </div>
        </header>
        <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 shrink-0 shadow-sm">
          <div className="max-w-5xl mx-auto">
            <ProgressBar currentStep={step} />
          </div>
        </div>
        <main className="flex-1">{renderStep()}</main>
        <footer className="shrink-0 py-4 text-center">
          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
            <span>7-Day Money-Back Guarantee</span>
            <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <span>150-Point Inspection</span>
            <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full hidden sm:block" />
            <span className="hidden sm:block">Free Delivery</span>
          </div>
        </footer>
      </div>
    );
  }

  // Post-onboarding: full app with navigation
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Search, label: 'Inventory' },
    { path: '/favorites', icon: Heart, label: 'Saved' },
    { path: '/compare', icon: GitCompareArrows, label: 'Compare', badge: compareIds.length || undefined },
    { path: '/sell', icon: DollarSign, label: 'Sell' },
    { path: '/delivery', icon: Truck, label: 'Delivery' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-slate-900 flex flex-col">
      {/* Skip to main content - Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[300] focus:bg-[#00aed9] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
        Skip to main content
      </a>

      {/* Top header */}
      <header role="banner" className="bg-gradient-to-r from-[#1b3a5c] via-[#1f4168] to-[#234a6e] dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 text-white px-4 sm:px-6 py-3.5 shrink-0 shadow-lg shadow-[#1b3a5c]/10 relative z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 hover:opacity-80 transition group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-lg flex items-center justify-center shadow-md shadow-[#00aed9]/20 group-hover:shadow-lg group-hover:shadow-[#00aed9]/30 transition-shadow">
              <Car size={16} className="text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">CARVANA</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-white/15 text-white shadow-sm shadow-white/5'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <item.icon size={16} />
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#00aed9] rounded-full" />
                )}
                {item.badge ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-[#00aed9]/30">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Cmd+K search hint */}
            <button
              onClick={() => triggerCommandPalette()}
              className="hidden lg:flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/10 rounded-lg px-3 py-1.5 transition-colors group"
            >
              <Search size={13} className="text-white/30 group-hover:text-white/50" />
              <span className="text-xs text-white/30 group-hover:text-white/50">Search...</span>
              <kbd className="text-[10px] text-white/20 bg-white/8 px-1.5 py-0.5 rounded font-mono ml-2">⌘K</kbd>
            </button>
            <NotificationBell onNavigate={(url) => navigate(url)} />
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold">
                {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <span className="text-sm text-white/50">{user.name.split(' ')[0]}</span>
            </div>
            <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white/70 transition ml-1">Sign out</button>
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette navigate={navigate} userName={user.name} />

      {/* Main content */}
      <main id="main-content" role="main" className="flex-1">
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/" element={<DashboardPage userName={user.name} />} />
            <Route path="/inventory" element={
              <InventoryPage
                onViewVehicle={(id) => navigate(`/vehicles/${id}`)}
                compareIds={compareIds}
                onToggleCompare={(id) => {
                  setCompareIds(prev =>
                    prev.includes(id) ? prev.filter(v => v !== id) : prev.length >= 3 ? prev : [...prev, id]
                  );
                }}
              />
            } />
            <Route path="/vehicles/:id" element={<VehicleDetailRoute navigate={navigate} />} />
            <Route path="/favorites" element={
              <FavoritesPage onViewVehicle={(id) => navigate(`/vehicles/${id}`)} />
            } />
            <Route path="/compare" element={
              <ComparePage
                compareIds={compareIds}
                onRemove={removeFromCompare}
                onClear={clearCompare}
                onViewVehicle={(id) => navigate(`/vehicles/${id}`)}
              />
            } />
            <Route path="/sell" element={<SellCarPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/profile" element={
              <ProfilePage user={user} onUserUpdate={handleUserUpdate} />
            } />
            <Route path="*" element={<NotFoundPage onHome={() => navigate('/')} />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-t border-gray-200/60 dark:border-slate-700/60 px-2 py-1.5 z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'text-[#00aed9]'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
              }`}
            >
              {isActive(item.path) && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#00aed9] rounded-full" />
              )}
              <item.icon size={20} className={isActive(item.path) ? 'drop-shadow-[0_0_4px_rgba(0,174,217,0.4)]' : ''} />
              <span className={`text-[10px] font-medium ${isActive(item.path) ? 'font-semibold' : ''}`}>{item.label}</span>
              {item.badge ? (
                <span className="absolute -top-0.5 right-0 w-4 h-4 bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom spacer for mobile nav */}
      <div className="md:hidden h-16" />

      {/* Footer - desktop only */}
      <footer className="hidden md:block shrink-0 py-4 text-center">
        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
          <span>7-Day Money-Back Guarantee</span>
          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span>150-Point Inspection</span>
          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span>Free Delivery</span>
        </div>
      </footer>
    </div>
  );
}

function VehicleDetailRoute({ navigate }: {
  navigate: (path: string) => void;
}) {
  const { id } = useParams();
  const vehicleId = Number(id);
  return (
    <VehicleDetailPage
      vehicleId={vehicleId}
      onBack={() => navigate('/inventory')}
      onViewVehicle={(vid) => navigate(`/vehicles/${vid}`)}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
