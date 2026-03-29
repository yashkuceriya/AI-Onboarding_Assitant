import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Loader2, ArrowRightLeft } from 'lucide-react';
import { api } from '../api/client';
import type { TradeInEstimate } from '../types';

const fmt = (n: number) => '$' + n.toLocaleString('en-US');

const MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'Subaru', 'Mazda', 'Nissan', 'Tesla', 'BMW', 'Mercedes-Benz', 'Jeep', 'RAM', 'GMC'];
const MODELS: Record<string, string[]> = {
  Toyota: ['Camry', 'RAV4', 'Corolla', 'Highlander', 'Tacoma', 'Tundra'],
  Honda: ['Civic', 'CR-V', 'Accord'],
  Ford: ['F-150', 'Escape', 'Bronco', 'Maverick'],
  Chevrolet: ['Silverado', 'Equinox', 'Malibu'],
  Hyundai: ['Tucson', 'Sonata', 'Elantra'],
  Kia: ['Telluride', 'Sportage', 'K5'],
  Subaru: ['Outback', 'Forester'],
  Mazda: ['CX-5', 'Mazda3'],
  Nissan: ['Altima', 'Rogue'],
  Tesla: ['Model 3', 'Model Y'],
  BMW: ['3 Series'],
  'Mercedes-Benz': ['C-Class'],
  Jeep: ['Grand Cherokee', 'Wrangler'],
  RAM: ['1500'],
  GMC: ['Sierra'],
};

const YEARS = Array.from({ length: 11 }, (_, i) => 2025 - i);
const CONDITIONS = [
  { value: 'excellent', label: 'Excellent', desc: 'Like new, no issues' },
  { value: 'good', label: 'Good', desc: 'Minor wear' },
  { value: 'fair', label: 'Fair', desc: 'Some repairs needed' },
  { value: 'poor', label: 'Poor', desc: 'Significant issues' },
];

export default function TradeInEstimator() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2021);
  const [mileage, setMileage] = useState(45000);
  const [condition, setCondition] = useState('good');
  const [result, setResult] = useState<TradeInEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  const estimate = async () => {
    if (!make || !model) return;
    setLoading(true);
    try {
      const res = await api.estimateTradeIn({ make, model, year, mileage, condition });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition text-sm appearance-none dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:bg-slate-600";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] text-white px-5 py-3.5 font-bold text-sm flex items-center gap-2">
        <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
          <ArrowRightLeft size={15} />
        </div>
        Trade-In Estimator
      </div>

      <div className="p-5 space-y-3">
        {/* Make + Model */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">Make</label>
            <select value={make} onChange={e => { setMake(e.target.value); setModel(''); setResult(null); }} className={selectClass}>
              <option value="">Select</option>
              {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">Model</label>
            <select value={model} onChange={e => { setModel(e.target.value); setResult(null); }} className={selectClass} disabled={!make}>
              <option value="">Select</option>
              {(MODELS[make] || []).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Year + Mileage */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">Year</label>
            <select value={year} onChange={e => { setYear(Number(e.target.value)); setResult(null); }} className={selectClass}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">Mileage</label>
            <input type="number" value={mileage} onChange={e => { setMileage(Number(e.target.value)); setResult(null); }}
              className={selectClass} placeholder="e.g. 45000" min={0} max={300000} step={1000} />
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5">Condition</label>
          <div className="grid grid-cols-4 gap-1.5">
            {CONDITIONS.map(c => (
              <button key={c.value} onClick={() => { setCondition(c.value); setResult(null); }}
                className={`p-2 rounded-lg text-center transition-all border ${
                  condition === c.value
                    ? 'border-[#00aed9] bg-[#e0f7fc] dark:bg-[#00aed9]/10 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
                }`}>
                <div className={`text-xs font-bold ${condition === c.value ? 'text-[#0090b3]' : 'text-gray-700 dark:text-gray-200'}`}>{c.label}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={estimate} disabled={loading || !make || !model}
          className="w-full py-2.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] shadow-lg shadow-[#00aed9]/20 btn-press active:scale-[0.98] text-white font-bold rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm">
          {loading ? <><Loader2 size={14} className="animate-spin" /> Estimating...</> : <><DollarSign size={14} /> Get Estimate</>}
        </button>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
              <div className="text-[10px] text-emerald-600 uppercase font-semibold tracking-wider">Estimated Value</div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">{fmt(result.estimated_value)}</div>
              <div className="text-xs text-emerald-600/60 mt-1">
                Range: {fmt(result.range_low)} – {fmt(result.range_high)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                <div className="text-[9px] text-gray-400 uppercase font-semibold">Age</div>
                <div className="text-sm font-bold text-gray-800 dark:text-white">{result.factors.age_years}yr</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                <div className="text-[9px] text-gray-400 uppercase font-semibold">Depreciation</div>
                <div className="text-sm font-bold text-gray-800 dark:text-white">{result.factors.depreciation_pct}%</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                <div className="text-[9px] text-gray-400 uppercase font-semibold">Mile Adj.</div>
                <div className="text-sm font-bold text-gray-800 dark:text-white">-{fmt(result.factors.mileage_penalty)}</div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
              Apply this toward your new Carvana purchase to lower your monthly payment.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
