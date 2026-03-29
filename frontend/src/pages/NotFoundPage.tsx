import { motion } from 'framer-motion';
import { Car, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onHome: () => void;
}

export default function NotFoundPage({ onHome }: NotFoundPageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 animate-fadeIn">
      <div className="text-center max-w-sm">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-gradient-to-br from-[#00aed9]/15 to-[#0090b3]/10 dark:from-[#00aed9]/20 dark:to-[#0090b3]/15 rounded-3xl flex items-center justify-center mx-auto mb-5"
        >
          <Car size={36} className="text-[#00aed9]" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-6xl font-extrabold text-gradient mb-2"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-gray-500 dark:text-gray-400 mb-8"
        >
          This page doesn't exist. Maybe the car drove off?
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={onHome}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white font-semibold rounded-xl shadow-lg shadow-[#00aed9]/20 hover:shadow-xl hover:shadow-[#00aed9]/30 transition-all btn-press group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </motion.button>
      </div>
    </div>
  );
}
