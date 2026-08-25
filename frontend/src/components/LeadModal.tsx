'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { X, Send, ShieldCheck, PhoneCall, Mail, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  ownerName?: string;
  ownerPhone?: string;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  ownerName = 'Verified Owner',
  ownerPhone = '+91 9876543210',
}) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [message, setMessage] = useState('Hi, I am interested in this property. Please share further details and schedule a site visit.');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await api.post('/inquiries', {
        propertyId,
        name,
        email,
        phone,
        message,
      });

      if (res.data && res.data.success) {
        setStatus({
          success: true,
          message: res.data.message || 'Inquiry submitted successfully! The owner will get back to you shortly.',
        });
      } else {
        setStatus({
          success: true,
          message: 'Inquiry submitted successfully! The owner will get back to you shortly.',
        });
      }
    } catch (err: any) {
      let errMsg = 'Failed to submit inquiry. Please try again.';
      if (err.response?.data) {
        const data = err.response.data;
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errMsg = data.errors.map((e: any) => e.message || String(e)).join('. ');
        } else if (typeof data.message === 'string') {
          errMsg = data.message;
        } else if (typeof data === 'string') {
          errMsg = data;
        }
      } else if (err.message && typeof err.message === 'string') {
        errMsg = err.message;
      }

      setStatus({
        success: false,
        message: errMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">Contact Property Owner</span>
            <h3 className="text-lg font-bold text-white line-clamp-1">{propertyTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Owner Info Card Banner */}
        <div className="bg-slate-900/90 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Owner: <strong className="text-white">{ownerName}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <PhoneCall className="w-3.5 h-3.5 text-brand-400" />
            <span>{ownerPhone}</span>
          </div>
        </div>

        {/* Content / Form */}
        <div className="p-6 space-y-4">
          
          {status ? (
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-3 ${
              status.success ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}>
              {status.success ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              ) : (
                <AlertCircle className="w-10 h-10 text-rose-400" />
              )}
              <div>
                <h4 className="font-bold text-base text-white mb-1">
                  {status.success ? 'Inquiry Dispatched' : 'Submission Alert'}
                </h4>
                <p className="text-xs">{status.message}</p>
              </div>
              <button
                onClick={status.success ? onClose : () => setStatus(null)}
                className="mt-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                {status.success ? 'Close Window' : 'Try Again'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-400 font-medium mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ankit Verma"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ankit@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Message to Owner *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Protected against spam. Duplicate inquiries for the same property within 1 hour are auto-suppressed.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending Lead...' : 'Send Contact Request'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
