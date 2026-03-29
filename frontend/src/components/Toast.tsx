import { createContext, useContext, useState, useCallback, useRef, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <AlertCircle size={18} className="text-red-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
  info: <Info size={18} className="text-[#00aed9]" />,
};

const bgColors: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800',
  info: 'bg-sky-50 border-sky-200 dark:bg-sky-950/50 dark:border-sky-800',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const contextValue: ToastContextType = useMemo(() => ({
    toast: addToast,
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    warning: (msg: string) => addToast(msg, 'warning'),
    info: (msg: string) => addToast(msg, 'info'),
  }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${bgColors[t.type]}`}
            >
              <span className="shrink-0 mt-0.5">{icons[t.type]}</span>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition mt-0.5"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
