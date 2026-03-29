import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export const APP_SHORTCUTS: Omit<Shortcut, 'action'>[] = [
  { key: 'k', meta: true, description: 'Open command palette' },
  { key: '/', description: 'Focus search' },
  { key: 'g', description: 'Go to... (then: d=Dashboard, i=Inventory, f=Favorites, s=Sell)' },
  { key: 'Escape', description: 'Close dialog / Go back' },
];

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire shortcuts when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      for (const s of shortcuts) {
        const metaMatch = s.meta ? (e.metaKey || e.ctrlKey) : true;
        const ctrlMatch = s.ctrl ? e.ctrlKey : true;
        const shiftMatch = s.shift ? e.shiftKey : true;

        if (e.key === s.key && metaMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          s.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
