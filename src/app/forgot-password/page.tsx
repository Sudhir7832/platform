'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Zap, Mail, AlertCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (authError) throw authError;

      setMessage('Reset link successfully sent! Please check your email inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-[#f0f0f5] flex flex-col justify-center items-center p-6 relative font-sans overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08),transparent_50%)] pointer-events-none" />

      {/* PulseSync Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" fill="currentColor" />
        </div>
        <span className="text-lg font-bold gradient-text">PulseSync</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="w-full max-w-[400px] glass-card p-8 space-y-6 relative z-10"
        style={{ boxShadow: '0 0 50px rgba(124,58,237,0.1)' }}
      >
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Reset password</h1>
          <p className="text-xs text-[#9ca3af]">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-normal">{error}</span>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs"
            >
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-normal">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#9ca3af]">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#6b7280]" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-[#0d0d20] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm outline-none text-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-[#6b7280]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="btn-primary w-full text-xs font-semibold py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
