import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileCheck, AlertTriangle, Check, ScanLine, Shield, FileText, CreditCard } from 'lucide-react';
import { api } from '../api/client';
import type { Document } from '../types';

interface DocumentsPageProps {
  onComplete: () => void;
}

const DOC_TYPES = [
  { id: 'drivers_license', label: "Driver's License", icon: <CreditCard size={20} />, desc: 'Front of your valid DL' },
  { id: 'insurance_card', label: 'Insurance Card', icon: <Shield size={20} />, desc: 'Proof of auto coverage' },
  { id: 'id_card', label: 'Other ID', icon: <FileText size={20} />, desc: 'Passport or state ID' },
];

export default function DocumentsPage({ onComplete }: DocumentsPageProps) {
  const [selectedType, setSelectedType] = useState('drivers_license');
  const [document, setDocument] = useState<Document | null>(null);
  const [editableData, setEditableData] = useState<Record<string, string>>({});
  const [scanning, setScanning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setScanning(true);
    setError('');
    try {
      const result = await api.uploadDocument(file, selectedType);
      setDocument(result);
      setEditableData(result.extracted_data || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setScanning(false);
    }
  }, [selectedType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleConfirm = async () => {
    if (!document) return;
    setConfirming(true);
    try {
      await api.confirmDocument(document.id, editableData);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm.');
    } finally {
      setConfirming(false);
    }
  };

  const confidenceColor = (s: number) => s >= 0.9 ? 'text-emerald-600' : s >= 0.7 ? 'text-amber-600' : 'text-red-500';
  const confidenceBg = (s: number) => s >= 0.9 ? 'bg-emerald-50 border-emerald-200' : s >= 0.7 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#00aed9]/10 rounded-full px-3 py-1 mb-2">
          <ScanLine size={12} className="text-[#00aed9]" />
          <span className="text-[11px] font-semibold text-[#00aed9]">AI-Powered OCR</span>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Verify your identity</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload a document and our AI reads it instantly. No manual typing needed.
        </p>
      </div>

      {/* Document type selector */}
      {!document && !scanning && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {DOC_TYPES.map(dt => (
            <button
              key={dt.id}
              onClick={() => setSelectedType(dt.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selectedType === dt.id
                  ? 'border-[#00aed9] bg-[#e0f7fc] dark:bg-[#00aed9]/10 shadow-sm'
                  : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
            >
              <div className={`mx-auto mb-1 ${selectedType === dt.id ? 'text-[#00aed9]' : 'text-gray-400'}`}>
                {dt.icon}
              </div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{dt.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{dt.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Upload area */}
      {!document && !scanning && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          {...(getRootProps() as Record<string, unknown>)}
          className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-[#00aed9] bg-[#e0f7fc] dark:bg-[#00aed9]/10 scale-[1.02] shadow-lg shadow-[#00aed9]/10'
              : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-[#00aed9]/50 hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-md'
          }`}
        >
          <input {...getInputProps()} />
          <motion.div
            animate={isDragActive ? { y: [0, -6, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 bg-gradient-to-br from-[#00aed9]/15 to-[#0090b3]/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Upload size={28} className="text-[#00aed9]" />
          </motion.div>
          <p className="text-gray-800 dark:text-white font-semibold">
            {isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WebP, or PDF up to 10 MB</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            {['DL', 'ID', 'PDF'].map(t => (
              <span key={t} className="text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">{t}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Scanning */}
      {scanning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-10 sm:p-14 text-center relative overflow-hidden"
        >
          {/* Animated scan line */}
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#00aed9] to-transparent rounded-full"
          />

          <div className="relative z-10">
            <motion.div
              animate={{ rotateY: [0, 180, 360] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="mb-5"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#00aed9]/15 to-[#0090b3]/10 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#00aed9]/10">
                <ScanLine size={36} className="text-[#00aed9]" />
              </div>
            </motion.div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">Reading your document...</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">AI is extracting information with computer vision</p>

            {/* Animated progress steps */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {['Detecting', 'Reading', 'Verifying'].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="w-1.5 h-1.5 bg-[#00aed9] rounded-full" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{step}</span>
                </motion.div>
              ))}
            </div>

            <div className="w-48 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00aed9] to-[#0090b3] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '85%' }}
                transition={{ duration: 4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {document && !scanning && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Confidence header */}
            <div className={`rounded-xl p-4 flex items-center gap-3 ${
              (document.overall_confidence || 0) >= 0.9
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              {(document.overall_confidence || 0) >= 0.9 ? (
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <FileCheck size={20} className="text-emerald-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-amber-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {Math.round((document.overall_confidence || 0) * 100)}% confidence
                </p>
                <p className="text-xs text-gray-500">
                  {(document.overall_confidence || 0) >= 0.9
                    ? 'Looking good! Please verify the details below.'
                    : 'Some fields need your attention — check highlighted items.'}
                </p>
              </div>
            </div>

            {/* Fields */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Extracted Information</h3>

              {Object.entries(editableData).map(([field, value]) => {
                const conf = document.confidence_scores?.[field] || 0;
                const label = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                return (
                  <div key={field} className={`p-3 rounded-xl border ${confidenceBg(conf)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-600">{label}</label>
                      <span className={`text-xs font-bold ${confidenceColor(conf)}`}>
                        {Math.round(conf * 100)}%
                      </span>
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setEditableData({ ...editableData, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none text-sm"
                    />
                    {conf < 0.8 && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle size={11} />
                        Please double-check this field
                      </p>
                    )}
                  </div>
                );
              })}

              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20 btn-press"
              >
                <Check size={18} />
                {confirming ? 'Saving...' : 'Confirm & continue'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip */}
      {!document && !scanning && (
        <button onClick={onComplete} className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition">
          Skip this step
        </button>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">
          {error}
        </motion.div>
      )}
    </div>
  );
}
