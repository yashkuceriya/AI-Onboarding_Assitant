import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingDown, Calculator, Loader2, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import type { WhatIfResult } from '../types';

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function calcMonthly(principal: number, apr: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (apr <= 0) return principal / months;
  const r = apr / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// Animated SVG donut chart
function DonutChart({ principal, interest, monthly, size = 140 }: { principal: number; interest: number; monthly: number; size?: number }) {
  const total = principal + interest;
  if (total <= 0) return null;

  const principalPct = principal / total;
  const radius = 50;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  const principalArc = circumference * principalPct;
  const interestArc = circumference * (1 - principalPct);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        {/* Interest (amber) */}
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={stroke}
          strokeDasharray={`${interestArc} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${interestArc} ${circumference}` }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Principal (brand blue) */}
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="#00aed9"
          strokeWidth={stroke}
          strokeDasharray={`${principalArc} ${circumference}`}
          strokeDashoffset={-interestArc}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${principalArc} ${circumference}` }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Monthly</div>
        <motion.div
          className="text-lg font-extrabold text-gray-900 dark:text-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          {fmt(monthly)}
        </motion.div>
      </div>
    </div>
  );
}

export default function FinancialExplainer() {
  const [principal, setPrincipal] = useState(28000);
  const [apr, setApr] = useState(5.9);
  const [termMonths, setTermMonths] = useState(60);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [whatIf, setWhatIf] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);

  const calc = useMemo(() => {
    const monthly = calcMonthly(principal, apr, termMonths);
    const total = monthly * termMonths;
    const interest = total - principal;
    return { monthly, total, interest };
  }, [principal, apr, termMonths]);

  const getAiInsight = async () => {
    setLoading(true);
    try {
      const [explainRes, whatIfRes] = await Promise.all([
        api.explainFinancing({ principal, apr, term_months: termMonths }),
        api.whatIfScenarios({ principal, apr, term_months: termMonths }),
      ]);
      setAiExplanation(explainRes.explanation);
      setWhatIf(whatIfRes);
    } catch {
      setAiExplanation("Couldn't load AI explanation. The numbers above are accurate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] text-white px-5 py-3.5 font-bold text-sm flex items-center gap-2">
        <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
          <Calculator size={15} />
        </div>
        Payment Calculator
      </div>

      <div className="p-5 space-y-5">
        {/* Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Vehicle Price</span>
              <span className="font-bold text-gray-900 dark:text-white">{fmt(principal)}</span>
            </div>
            <div className="relative">
              <input type="range" min={5000} max={80000} step={500} value={principal}
                onChange={e => setPrincipal(Number(e.target.value))} className="w-full" />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>$5,000</span><span>$80,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">APR</span>
              <span className="font-bold text-gray-900 dark:text-white">{apr.toFixed(1)}%</span>
            </div>
            <input type="range" min={0} max={20} step={0.1} value={apr}
              onChange={e => setApr(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0%</span><span>20%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Loan Term</span>
              <span className="font-bold text-gray-900 dark:text-white">{termMonths} months</span>
            </div>
            <input type="range" min={12} max={84} step={6} value={termMonths}
              onChange={e => setTermMonths(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>12 mo</span><span>84 mo</span>
            </div>
          </div>
        </div>

        {/* Results with donut chart */}
        <div className="flex items-center gap-5">
          <div className="shrink-0 hidden sm:block">
            <DonutChart principal={principal} interest={calc.interest} monthly={calc.monthly} size={130} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="bg-[#00aed9]/10 dark:bg-[#00aed9]/5 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#00aed9] rounded-full" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Monthly Payment</span>
                </div>
                <span className="text-xl font-extrabold text-[#0090b3] dark:text-[#00aed9]">{fmt(calc.monthly)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 bg-[#00aed9] rounded-full" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Principal</span>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">{fmt(principal)}</span>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Interest</span>
                </div>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{fmt(calc.interest)}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Cost</span>
              <span className="text-sm font-bold text-gray-800 dark:text-white">{fmt(calc.total)}</span>
            </div>
          </div>
        </div>

        {/* Legend for mobile donut */}
        <div className="sm:hidden flex items-center justify-center gap-5">
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 bg-[#00aed9] rounded-full" /> Principal</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Interest</span>
        </div>

        {/* AI Explain button */}
        {!aiExplanation && (
          <button onClick={getAiInsight} disabled={loading}
            className="w-full py-2.5 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Getting AI insight...</>
            ) : (
              <><Sparkles size={14} className="text-[#00aed9]" /> Explain in plain English</>
            )}
          </button>
        )}

        {/* AI explanation */}
        {aiExplanation && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#00aed9]/5 dark:bg-[#00aed9]/10 rounded-xl p-3.5 border border-[#00aed9]/10 dark:border-[#00aed9]/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={12} className="text-[#00aed9]" />
              <span className="text-[10px] font-bold text-[#0090b3] dark:text-[#00aed9] uppercase tracking-wider">AI Insight</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{aiExplanation}</p>
          </motion.div>
        )}

        {/* What-if scenarios */}
        {whatIf && (
          <>
            <button onClick={() => setShowScenarios(!showScenarios)}
              className="flex items-center gap-2 text-sm text-[#00aed9] hover:text-[#0090b3] font-medium transition">
              <TrendingDown size={14} />
              {showScenarios ? 'Hide' : 'Compare'} scenarios
            </button>
            <AnimatePresence>
              {showScenarios && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                  {whatIf.scenarios.map((s, i) => (
                    <div key={i} className="bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl p-3 flex items-center justify-between hover:shadow-sm transition">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-white">{s.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{fmt(s.monthly_payment)}/mo</div>
                      </div>
                      <div className={`text-sm font-bold ${s.savings_vs_base > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {s.savings_vs_base > 0 ? (
                          <span className="flex items-center gap-1"><DollarSign size={12} />Save {fmt(s.savings_vs_base)}</span>
                        ) : (
                          <span>+{fmt(Math.abs(s.savings_vs_base))}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
