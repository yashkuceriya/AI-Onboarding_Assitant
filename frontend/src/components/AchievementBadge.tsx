import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, FileCheck, Calendar, Zap, CheckCircle, MessageCircle, Sparkles, Award } from 'lucide-react';
import type { Achievement } from '../types';

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  first_login: <Star size={20} className="text-amber-500" />,
  profile_complete: <CheckCircle size={20} className="text-blue-500" />,
  first_document: <FileCheck size={20} className="text-emerald-500" />,
  all_documents: <FileCheck size={20} className="text-emerald-600" />,
  appointment_booked: <Calendar size={20} className="text-purple-500" />,
  speed_demon: <Zap size={20} className="text-orange-500" />,
  checklist_hero: <Trophy size={20} className="text-amber-600" />,
  chat_explorer: <MessageCircle size={20} className="text-indigo-500" />,
  onboarding_complete: <Sparkles size={20} className="text-pink-500" />,
};

interface AchievementBadgeProps {
  achievement: Achievement;
  isNew?: boolean;
}

export function AchievementBadge({ achievement, isNew }: AchievementBadgeProps) {
  return (
    <motion.div
      initial={isNew ? { scale: 0, rotate: -180 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5"
    >
      <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm shrink-0">
        {ACHIEVEMENT_ICONS[achievement.achievement_type] || <Award size={20} className="text-slate-400" />}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{achievement.title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{achievement.description}</div>
      </div>
      {isNew && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold shrink-0"
        >
          NEW
        </motion.span>
      )}
    </motion.div>
  );
}

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60]"
      >
        <div className="bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 rounded-2xl shadow-2xl dark:shadow-black/30 px-6 py-4 flex items-center gap-4 min-w-[300px]">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center"
          >
            {ACHIEVEMENT_ICONS[achievement.achievement_type] || <Trophy size={24} className="text-amber-500" />}
          </motion.div>
          <div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">Achievement Unlocked!</div>
            <div className="text-base font-bold text-slate-800 dark:text-slate-200">{achievement.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{achievement.description}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 ml-2" aria-label="Dismiss">&times;</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? achievements : achievements.slice(0, 4);

  if (achievements.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden"
    >
      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-4 py-3 font-bold text-sm flex items-center gap-2">
        <Trophy size={18} />
        Achievements ({achievements.length})
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {displayed.map(a => (
          <AchievementBadge key={a.id} achievement={a} />
        ))}
      </div>
      {achievements.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium border-t border-amber-100 dark:border-amber-800"
        >
          {showAll ? 'Show less' : `Show all ${achievements.length} achievements`}
        </button>
      )}
    </motion.div>
  );
}
