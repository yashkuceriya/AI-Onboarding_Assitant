import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MessageSquare, Save, Loader2, CheckCircle2, Shield, Clock } from 'lucide-react';
import { api } from '../api/client';

interface ProfilePageProps {
  user: { id: number; name: string; email: string; phone?: string; preferred_contact?: string };
  onUserUpdate: (user: any) => void;
}

export default function ProfilePage({ user, onUserUpdate }: ProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [preferredContact, setPreferredContact] = useState(user.preferred_contact || 'email');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState('');

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await api.updateProfile({
        name,
        phone,
        preferred_contact: preferredContact,
      });
      onUserUpdate(result.user);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    name !== user.name ||
    phone !== (user.phone || '') ||
    preferredContact !== (user.preferred_contact || 'email');

  return (
    <div className="animate-fadeIn">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-[#1b3a5c] via-[#1f4168] to-[#2a5080] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden"><div className="absolute top-0 right-0 w-80 h-80 bg-[#00aed9]/5 rounded-full blur-3xl" /></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00aed9] to-[#0090b3] rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-lg shadow-[#00aed9]/25 ring-2 ring-white/10">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{user.name}</h1>
              <p className="text-white/50 text-sm">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Edit Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] text-white px-4 py-3 flex items-center gap-2 text-sm font-bold">
            <User size={16} />
            Edit Profile
          </div>

          <div className="p-5 space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-gray-400" />
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition"
                placeholder="Your full name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                Email
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone size={14} className="text-gray-400" />
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition"
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Preferred Contact */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-gray-400" />
                Preferred Contact Method
              </label>
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-[#00aed9] focus:ring-2 focus:ring-[#00aed9]/10 outline-none transition appearance-none"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="text">Text Message</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="w-full py-2.5 bg-gradient-to-r from-[#00aed9] to-[#0090b3] hover:from-[#0090b3] hover:to-[#007a99] text-white font-bold rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#00aed9]/20 btn-press"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Account Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#1b3a5c] to-[#234a6e] text-white px-4 py-3 flex items-center gap-2 text-sm font-bold">
            <Shield size={16} />
            Account
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00aed9]/10 rounded-lg flex items-center justify-center">
                <Clock size={18} className="text-[#00aed9]" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Member Since</div>
                <div className="text-sm font-bold text-gray-900">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Onboarding Status</div>
                <div className="text-sm font-bold text-gray-900">Complete</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Success Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/25 backdrop-blur-md flex items-center gap-2 text-sm font-medium z-50"
        >
          <CheckCircle2 size={16} />
          Profile updated successfully
        </motion.div>
      )}
    </div>
  );
}
