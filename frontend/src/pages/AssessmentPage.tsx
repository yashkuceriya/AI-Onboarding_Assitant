import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Shield, Car, Fuel, Star, Gauge, ChevronRight, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import type { Message, Conversation, VehicleRecommendation } from '../types';
import { fmt, fmtMiles, calcMonthly } from '../utils/format';
import VehicleImage from '../components/VehicleImage';

interface AssessmentPageProps {
  onComplete: () => void;
}


export default function AssessmentPage({ onComplete }: AssessmentPageProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'chat' | 'matches'>('chat');
  const [vehicles, setVehicles] = useState<VehicleRecommendation[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { startConversation(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const startConversation = async () => {
    try {
      const result = await api.createConversation();
      setConversation(result.conversation);
      setMessages(result.messages);
    } catch { setError('Failed to start. Please refresh.'); }
  };

  const sendMessage = async (content: string) => {
    if (!conversation || !content.trim() || loading) return;
    const text = content.trim();
    setInput('');
    setLoading(true);
    setError(null);
    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: text, created_at: new Date().toISOString() }]);
    try {
      const result = await api.sendMessage(conversation.id, text);
      setMessages(prev => [...prev.filter(m => m.id !== tempId), result.user_message, result.assistant_message]);
    } catch {
      setError('Message failed. Try again.');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const showMatches = async () => {
    if (!conversation) return;
    setLoadingVehicles(true);
    try {
      await api.completeConversation(conversation.id);
      const results = await api.getVehicleRecommendations({ budget: 40000 });
      setVehicles(results);
      setPhase('matches');
    } catch {
      setError('Failed to load matches. Try again.');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const userMsgCount = messages.filter(m => m.role === 'user').length;

  if (phase === 'matches') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
        <div className="text-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="w-14 h-14 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#00aed9]/20">
            <Sparkles size={24} className="text-white" />
          </motion.div>
          <h2 className="text-2xl font-extrabold text-gray-900">Your top matches</h2>
          <p className="text-sm text-gray-500 mt-1">Based on your preferences, here are vehicles we recommend</p>
        </div>

        <div className="space-y-3 mb-6">
          {vehicles.map((v, i) => {
            const monthly = calcMonthly(v.price, 5.9, 60);
            return (
              <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                transition={{ delay: i * 0.08 }}
                className="card-shine bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* Vehicle visual */}
                  <VehicleImage
                    imageUrl={v.image_url}
                    make={v.make}
                    model={v.model}
                    bodyType={v.type}
                    gradient={v.image_gradient || ['#ccc', '#999']}
                    className="sm:w-48 h-32 sm:h-auto shrink-0"
                    silhouetteSize="w-24"
                  >
                    <div className="absolute top-2 left-2 bg-black/40 backdrop-blur text-[10px] text-white px-2 py-0.5 rounded-full z-10">{v.color}</div>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded-full text-[#0090b3] z-10">{v.match_score.toFixed(0)}% match</div>
                  </VehicleImage>
                  {/* Info */}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{v.year} {v.make} {v.model}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Gauge size={11} /> {fmtMiles(v.mileage)}</span>
                          <span className="flex items-center gap-1"><Fuel size={11} /> {v.mpg} MPG</span>
                          <span className="flex items-center gap-1"><Star size={11} className="text-amber-500 fill-amber-500" /> {v.safety_rating}/5</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-extrabold text-gray-900">{fmt(v.price)}</div>
                        <div className="text-xs text-[#0090b3] font-semibold">est. {fmt(monthly)}/mo</div>
                      </div>
                    </div>
                    {v.match_reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {v.match_reasons.slice(0, 4).map((r, j) => (
                          <span key={j} className="text-[10px] bg-[#e0f7fc] text-[#0090b3] px-2 py-0.5 rounded-full font-medium">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {vehicles.length === 0 && !loadingVehicles && (
          <div className="text-center py-12 text-gray-400 text-sm">No matches found. Try adjusting your preferences.</div>
        )}

        <div className="space-y-3">
          <button onClick={onComplete}
            className="btn-press w-full py-3.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#00aed9]/20 flex items-center justify-center gap-2 relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2">Continue to verify identity <ChevronRight size={18} /></span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
          <button onClick={() => setPhase('chat')}
            className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition">
            Back to chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-2xl mx-auto animate-fadeIn bg-[#f9fafb] dark:bg-slate-900">
      {/* Header */}
      <div className="px-6 py-4 text-center shrink-0">
        <div className="inline-flex items-center gap-2 bg-[#00aed9]/10 rounded-full px-3 py-1 mb-2">
          <Sparkles size={12} className="text-[#00aed9]" />
          <span className="text-[11px] font-semibold text-[#00aed9]">AI-Powered Assessment</span>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Tell us about your ideal car</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Our AI will match you with the best vehicles and financing</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-3 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot size={15} className="text-white" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white rounded-br-sm shadow-md shadow-[#00aed9]/15'
                  : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm border border-gray-100 dark:border-slate-600'
              }`}>
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <Bot size={15} className="text-white" />
            </div>
            <div className="bg-white dark:bg-slate-700 shadow-sm border border-gray-100 dark:border-slate-600 rounded-2xl rounded-bl-sm px-4 py-3.5">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-2 h-2 bg-gray-300 rounded-full"
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {messages.length > 0 && messages[messages.length - 1]?.quick_replies && !loading && (
        <div className="px-4 sm:px-6 pb-2 flex flex-wrap gap-2 shrink-0">
          {messages[messages.length - 1].quick_replies!.map((reply) => (
            <motion.button key={reply} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => sendMessage(reply)}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-[#00aed9]/30 dark:border-[#00aed9]/40 text-[#0090b3] dark:text-[#00aed9] text-sm rounded-full hover:bg-[#e0f7fc] dark:hover:bg-[#00aed9]/15 hover:border-[#00aed9] transition-all font-medium shadow-sm">
              {reply}
            </motion.button>
          ))}
        </div>
      )}

      {error && (
        <div className="mx-4 sm:mx-6 mb-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center justify-between shrink-0">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 sm:px-6 pb-4 pt-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
        <div className="flex gap-2">
          <input ref={inputRef} type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Tell me what you're looking for..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition-all text-sm dark:text-white dark:placeholder:text-gray-400" />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
            className="px-4 py-3 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] active:scale-95 text-white rounded-xl transition-all disabled:opacity-30 shadow-md shadow-[#00aed9]/20">
            <Send size={18} />
          </button>
        </div>

        {userMsgCount >= 2 && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={showMatches} disabled={loadingVehicles}
            className="mt-3 w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-emerald-500/20 relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2">
              <Car size={18} />
              {loadingVehicles ? 'Finding your matches...' : 'Show me matching vehicles'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </motion.button>
        )}

        <div className="flex items-center justify-center gap-1 mt-3 text-[11px] text-gray-400 dark:text-gray-500">
          <Shield size={10} className="text-emerald-400" />
          Your data is encrypted and never shared
        </div>
      </div>
    </div>
  );
}
