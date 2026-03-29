import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, Car, Heart, GitCompareArrows, DollarSign,
  Truck, User, Sun, Moon, ArrowRight, Keyboard,
} from 'lucide-react';

let openCommandPalette: (() => void) | null = null;

export function triggerCommandPalette() {
  openCommandPalette?.();
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  section: string;
}

interface CommandPaletteProps {
  navigate: (path: string) => void;
  userName?: string;
}

export default function CommandPalette({ navigate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    openCommandPalette = () => setOpen(true);
    return () => { openCommandPalette = null; };
  }, []);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = useMemo(() => [
    // Navigation
    { id: 'dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard size={16} />, action: () => navigate('/'), keywords: ['home', 'main'], section: 'Navigation' },
    { id: 'inventory', label: 'Browse Inventory', icon: <Car size={16} />, action: () => navigate('/inventory'), keywords: ['search', 'cars', 'vehicles', 'browse'], section: 'Navigation' },
    { id: 'favorites', label: 'View Saved Vehicles', icon: <Heart size={16} />, action: () => navigate('/favorites'), keywords: ['liked', 'saved', 'favorites'], section: 'Navigation' },
    { id: 'compare', label: 'Compare Vehicles', icon: <GitCompareArrows size={16} />, action: () => navigate('/compare'), keywords: ['compare', 'versus', 'side by side'], section: 'Navigation' },
    { id: 'sell', label: 'Sell or Trade-In', icon: <DollarSign size={16} />, action: () => navigate('/sell'), keywords: ['sell', 'trade', 'value'], section: 'Navigation' },
    { id: 'delivery', label: 'Track Delivery', icon: <Truck size={16} />, action: () => navigate('/delivery'), keywords: ['delivery', 'tracking', 'status', 'order'], section: 'Navigation' },
    { id: 'profile', label: 'Account Settings', icon: <User size={16} />, action: () => navigate('/profile'), keywords: ['profile', 'settings', 'account', 'edit'], section: 'Navigation' },
    // Actions
    { id: 'theme-light', label: 'Switch to Light Mode', icon: <Sun size={16} />, action: () => { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }, keywords: ['light', 'theme', 'bright'], section: 'Actions' },
    { id: 'theme-dark', label: 'Switch to Dark Mode', icon: <Moon size={16} />, action: () => { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }, keywords: ['dark', 'theme', 'night'], section: 'Actions' },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard size={16} />, action: () => {}, keywords: ['help', 'keys', 'shortcuts'], section: 'Actions' },
  ], [navigate]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    );
  }, [query, commands]);

  // Group by section
  const grouped = useMemo(() => {
    const map: Record<string, Command[]> = {};
    for (const cmd of filtered) {
      if (!map[cmd.section]) map[cmd.section] = [];
      map[cmd.section].push(cmd);
    }
    return map;
  }, [filtered]);

  // Keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
      setOpen(false);
    }
  };

  // Reset selection when query changes
  useEffect(() => { setSelectedIndex(0); }, [query]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Pre-compute flat index mapping for keyboard navigation
  const commandIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    for (const [, cmds] of Object.entries(grouped)) {
      for (const cmd of cmds) {
        map.set(cmd.id, idx++);
      }
    }
    return map;
  }, [grouped]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-slate-700">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[320px] overflow-y-auto scrollbar-hide py-2">
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No results found for "{query}"
                </div>
              )}

              {Object.entries(grouped).map(([section, cmds]) => (
                <div key={section}>
                  <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {section}
                  </div>
                  {cmds.map(cmd => {
                    const idx = commandIndexMap.get(cmd.id) ?? 0;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        data-index={idx}
                        onClick={() => { cmd.action(); setOpen(false); }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-[#00aed9]/10 dark:bg-[#00aed9]/15'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span className={`shrink-0 ${isSelected ? 'text-[#00aed9]' : 'text-gray-400'}`}>
                          {cmd.icon}
                        </span>
                        <span className={`text-sm font-medium flex-1 ${isSelected ? 'text-[#0090b3] dark:text-[#00aed9]' : 'text-gray-700 dark:text-gray-300'}`}>
                          {cmd.label}
                        </span>
                        {isSelected && (
                          <ArrowRight size={14} className="text-[#00aed9] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><kbd className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">↵</kbd> Select</span>
                <span className="flex items-center gap-1"><kbd className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">esc</kbd> Close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
