import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck, CheckCircle2,
  MessageSquare, X, Send, Bot,
  ClipboardCheck, Sparkles, Shield, Truck,
  ChevronRight, PartyPopper
} from 'lucide-react';
import { api } from '../api/client';
import type { DashboardData, ChecklistItemData, Message, Achievement } from '../types';
import FinancialExplainer from '../components/FinancialExplainer';
import AchievementsSection, { AchievementToast } from '../components/AchievementBadge';
import VehicleRecommendations from '../components/VehicleRecommendations';
import TradeInEstimator from '../components/TradeInEstimator';
import ScrollReveal from '../components/ScrollReveal';

interface Props {
  userName: string;
}

export default function DashboardPage({ userName }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
    api.getProgress().then(p => setAchievements(p.achievements)).catch(console.error);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const toggleChecklist = async (item: ChecklistItemData) => {
    if (!data) return;
    try {
      const result = await api.toggleChecklist(item.id);
      setData({
        ...data,
        checklist: data.checklist.map(c =>
          c.id === item.id ? { ...c, completed: result.completed, completed_at: result.completed_at } : c
        ),
        progress: {
          ...data.progress,
          checklist_completed: data.progress.checklist_completed + (result.completed ? 1 : -1),
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const startChat = useCallback(async () => {
    setChatOpen(true);
    if (conversationId) return;
    try {
      const res = await api.createConversation();
      setConversationId(res.conversation.id);
      setChatMessages(res.messages);
    } catch (e) {
      console.error(e);
    }
  }, [conversationId]);

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || !conversationId || chatLoading) return;
    const content = chatInput.trim();
    setChatInput('');
    const tempId = Date.now();
    setChatMessages(prev => [...prev, { id: tempId, role: 'user', content, created_at: new Date().toISOString() }]);
    setChatLoading(true);
    try {
      const res = await api.sendMessage(conversationId, content);
      setChatMessages(prev => [...prev.filter(m => m.id !== tempId), res.user_message, res.assistant_message]);
    } catch {
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, conversationId, chatLoading]);

  const handleQuickReply = useCallback((reply: string) => {
    if (!conversationId || chatLoading) return;
    const tempId = Date.now();
    setChatMessages(prev => [...prev, { id: tempId, role: 'user', content: reply, created_at: new Date().toISOString() }]);
    setChatLoading(true);
    api.sendMessage(conversationId, reply).then(res => {
      setChatMessages(prev => [...prev.filter(m => m.id !== tempId), res.user_message, res.assistant_message]);
    }).catch(() => {
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
    }).finally(() => setChatLoading(false));
  }, [conversationId, chatLoading]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00aed9]/25">
            <PartyPopper size={22} className="text-white" />
          </div>
          <div className="absolute inset-0 w-12 h-12 bg-[#00aed9]/20 rounded-2xl animate-ping" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00aed9]/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00aed9]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-[#00aed9]/15 rounded-xl flex items-center justify-center">
                <PartyPopper size={20} className="text-[#00aed9]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Welcome back, {userName}!</h1>
                <p className="text-white/50 text-sm">Your purchase is confirmed. Here's your dashboard.</p>
              </div>
            </div>
          </motion.div>

          {/* Status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 stagger-children">
            <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/12 transition-colors">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <FileCheck size={18} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-white/50">Documents</div>
                <div className="text-sm font-bold flex items-center gap-1.5">Verified <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /></div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/12 transition-colors">
              <div className="w-10 h-10 bg-[#00aed9]/20 rounded-lg flex items-center justify-center">
                <Truck size={18} className="text-[#00aed9]" />
              </div>
              <div>
                <div className="text-xs text-white/50">Delivery</div>
                <div className="text-sm font-bold flex items-center gap-1.5">Scheduled <span className="w-1.5 h-1.5 bg-[#00aed9] rounded-full animate-pulse" /></div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/12 transition-colors">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Shield size={18} className="text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-white/50">Guarantee</div>
                <div className="text-sm font-bold">7-Day Return</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Tools */}
          <div className="lg:col-span-2 space-y-4">
            <ScrollReveal>
              <FinancialExplainer />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <VehicleRecommendations />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <TradeInEstimator />
            </ScrollReveal>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-4">
            {/* Checklist */}
            {data && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <ClipboardCheck size={16} />
                    Purchase Checklist
                  </div>
                  <span className="text-xs text-white/60 bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                    {data.progress.checklist_completed}/{data.progress.checklist_total}
                  </span>
                </div>
                <div className="p-3 space-y-0.5">
                  {data.checklist.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklist(item)}
                      className={`w-full rounded-lg px-3 py-2.5 flex items-center gap-2.5 text-sm text-left transition-all ${
                        item.completed ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                      }`}>
                        {item.completed && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className={item.completed ? 'line-through opacity-50' : ''}>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <AchievementsSection achievements={achievements} />

            {/* AI Help */}
            <button
              onClick={startChat}
              className="w-full bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-2xl p-4 text-left text-white shadow-md shadow-[#00aed9]/15 hover:shadow-lg hover:shadow-[#00aed9]/25 transition-all btn-press relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">Ask AI anything</div>
                  <div className="text-xs text-white/70">Financing, delivery, returns, vehicle info</div>
                </div>
                <ChevronRight size={16} className="text-white/40 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Chat FAB */}
      <button
        onClick={startChat}
        className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] text-white rounded-2xl shadow-lg shadow-[#00aed9]/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40 animate-glow"
        aria-label="Open AI assistant"
      >
        <MessageSquare size={22} />
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[520px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#00aed9] rounded-lg flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm">Carvana AI</div>
                  <div className="text-[10px] text-white/40">Always here to help</div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="hover:bg-white/10 rounded-lg p-1.5 transition" aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role !== 'user' && (
                    <div className="w-6 h-6 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={11} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#00aed9] text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatMessages.length > 0 && chatMessages[chatMessages.length - 1].quick_replies && !chatLoading && (
                <div className="flex flex-wrap gap-1.5 ml-8">
                  {chatMessages[chatMessages.length - 1].quick_replies!.map((r, i) => (
                    <button key={i} onClick={() => handleQuickReply(r)}
                      className="text-xs bg-white dark:bg-slate-700 border border-[#00aed9]/20 dark:border-[#00aed9]/30 text-[#0090b3] dark:text-[#00aed9] px-3 py-1.5 rounded-full hover:bg-[#e0f7fc] dark:hover:bg-[#00aed9]/15 hover:border-[#00aed9] transition font-medium">
                      {r}
                    </button>
                  ))}
                </div>
              )}
              {chatLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-full flex items-center justify-center shrink-0">
                    <Bot size={11} className="text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-gray-100 dark:border-slate-700 px-3 py-2.5 flex gap-2 shrink-0 bg-white dark:bg-slate-800">
              <input
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask anything..."
                className="flex-1 text-sm border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600 focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition"
              />
              <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                className="bg-gradient-to-r from-[#00aed9] to-[#0090b3] text-white rounded-xl px-3 py-2.5 hover:from-[#0090b3] hover:to-[#007a99] disabled:opacity-30 transition active:scale-95" aria-label="Send">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {newAchievement && (
        <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      )}
    </div>
  );
}
