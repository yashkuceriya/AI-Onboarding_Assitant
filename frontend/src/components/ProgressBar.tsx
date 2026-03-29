import { motion } from 'framer-motion';
import { Check, User, FileText, Truck, PartyPopper } from 'lucide-react';
import type { OnboardingStep } from '../types';

const visualSteps = [
  { key: 'assessment' as OnboardingStep, label: 'Profile', icon: User },
  { key: 'documents' as OnboardingStep, label: 'Documents', icon: FileText },
  { key: 'scheduling' as OnboardingStep, label: 'Delivery', icon: Truck },
  { key: 'complete' as OnboardingStep, label: 'Done', icon: PartyPopper },
];

const stepOrder: OnboardingStep[] = ['welcome', 'assessment', 'documents', 'scheduling', 'complete'];

export default function ProgressBar({ currentStep }: { currentStep: OnboardingStep }) {
  const rawIndex = stepOrder.indexOf(currentStep);
  const vi = currentStep === 'welcome' ? 0 : Math.max(0, rawIndex - 1);
  const pct = Math.round((vi / (visualSteps.length - 1)) * 100);

  return (
    <div className="py-4 px-6">
      {/* Mobile: compact bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            Step {vi + 1} of {visualSteps.length}: {visualSteps[vi]?.label}
          </span>
          <span className="text-xs font-bold text-[#00aed9]">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00aed9] to-[#0090b3] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Desktop: step indicators */}
      <div className="hidden sm:flex items-center justify-between max-w-lg mx-auto">
        {visualSteps.map((step, i) => {
          const done = i < vi;
          const active = i === vi;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-[56px]">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: done ? '#10b981' : active ? '#00aed9' : '#e5e7eb',
                    scale: active ? 1.15 : 1,
                    boxShadow: active
                      ? '0 0 0 4px rgba(0,174,217,0.15), 0 4px 12px rgba(0,174,217,0.2)'
                      : done
                        ? '0 0 0 0 transparent, 0 2px 6px rgba(16,185,129,0.15)'
                        : '0 0 0 0 transparent, 0 0 0 transparent',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                >
                  {done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                </motion.div>
                <span className={`text-[11px] font-semibold transition-colors ${
                  active ? 'text-[#00aed9]' : done ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < visualSteps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 mb-5 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: i < vi ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
