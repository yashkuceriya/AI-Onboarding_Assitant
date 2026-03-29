import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Sparkles,
  FileCheck,
  TrendingDown,
  Truck,
  Car,
  CheckCircle,
} from 'lucide-react';
import { api } from '../api/client';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Notification {
  id: number;
  title: string;
  body: string;
  notification_type: string;
  icon: string;
  action_url: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function notificationIcon(type: string) {
  const className = 'h-5 w-5 shrink-0';
  switch (type) {
    case 'system':
      return <Sparkles className={`${className} text-purple-500`} />;
    case 'document_status':
      return <FileCheck className={`${className} text-emerald-500`} />;
    case 'price_drop':
      return <TrendingDown className={`${className} text-red-500`} />;
    case 'delivery_update':
      return <Truck className={`${className} text-[#00aed9]`} />;
    case 'recommendation':
      return <Car className={`${className} text-[#1b3a5c]`} />;
    default:
      return <Bell className={`${className} text-gray-400`} />;
  }
}

/* ------------------------------------------------------------------ */
/*  NotificationBell                                                   */
/* ------------------------------------------------------------------ */

export function NotificationBell({ onNavigate: externalNavigate }: { onNavigate?: (url: string) => void } = {}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    api
      .getNotifications()
      .then(({ unread_count }) => setUnreadCount(unread_count))
      .catch(() => {});
  }, []);

  const handleClose = useCallback(() => setPanelOpen(false), []);

  const handleNavigate = useCallback((url: string) => {
    setPanelOpen(false);
    if (externalNavigate) externalNavigate(url);
    else window.location.href = url;
  }, [externalNavigate]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setPanelOpen((prev) => !prev)}
        className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#00aed9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00aed9] dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-[#00aed9]"
      >
        <Bell className="h-6 w-6" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        open={panelOpen}
        onClose={handleClose}
        onNavigate={handleNavigate}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NotificationPanel                                                  */
/* ------------------------------------------------------------------ */

function NotificationPanel({ open, onClose, onNavigate, onUnreadCountChange }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Fetch notifications when panel opens */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api
      .getNotifications()
      .then(({ notifications: list }) => setNotifications(list))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    // Defer listener to avoid catching the click that opened the panel
    const id = setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  /* Mark single notification read */
  const markRead = useCallback(
    async (notification: Notification) => {
      if (!notification.read) {
        try {
          await api.markNotificationRead(notification.id);
          setNotifications((prev) => {
            const updated = prev.map((n) =>
              n.id === notification.id ? { ...n, read: true, read_at: new Date().toISOString() } : n,
            );
            onUnreadCountChange?.(updated.filter((n) => !n.read).length);
            return updated;
          });
        } catch {
          /* silent */
        }
      }

      if (notification.action_url) {
        onNavigate(notification.action_url);
      }
    },
    [onNavigate, onUnreadCountChange],
  );

  /* Mark all read */
  const markAllRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, read_at: n.read_at ?? new Date().toISOString() })),
      );
      onUnreadCountChange?.(0);
    } catch {
      /* silent */
    }
  }, [onUnreadCountChange]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-xl border border-gray-200 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-xl dark:border-slate-700"
        >
          {/* ---- Header ---- */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-[#1b3a5c] dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-[#00aed9] transition-colors hover:text-[#0090b3] focus:outline-none focus-visible:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* ---- List ---- */}
          <div className="max-h-[420px] overflow-y-auto overscroll-contain">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00aed9] border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              /* ---- Empty state ---- */
              <div className="flex flex-col items-center justify-center gap-2 py-14 text-gray-400 dark:text-gray-500">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
                <p className="text-sm font-medium">All caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markRead(n)}
                      className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        !n.read ? 'bg-[#00aed9]/[0.04] dark:bg-[#00aed9]/[0.06]' : ''
                      }`}
                    >
                      {/* Unread dot */}
                      <div className="flex pt-1">
                        <span
                          className={`inline-block h-2 w-2 shrink-0 rounded-full transition-opacity ${
                            n.read ? 'opacity-0' : 'bg-[#00aed9] opacity-100'
                          }`}
                        />
                      </div>

                      {/* Icon */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                        {notificationIcon(n.notification_type)}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm leading-snug ${
                            n.read
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'font-semibold text-[#1b3a5c] dark:text-white'
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs leading-snug text-gray-500 dark:text-gray-400">
                          {n.body}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ---- Footer ---- */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 text-center dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-[#00aed9] transition-colors hover:text-[#0090b3] focus:outline-none focus-visible:underline"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationPanel;
