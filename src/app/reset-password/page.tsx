'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const { error: authError } = await supabase.auth.updateUser({
        password,
      });

      if (authError) throw authError;

      setMessage('Password updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
          <h1 className="text-xl font-bold text-white tracking-tight">Create new password</h1>
          <p className="text-xs text-[#9ca3af]">
            Type in your new secure password below to regain full access to your account.
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

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#9ca3af]">New password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#6b7280]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-[#0d0d20] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm outline-none text-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-[#6b7280]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#9ca3af]">Confirm new password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#6b7280]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-[#0d0d20] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm outline-none text-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-[#6b7280]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="btn-primary w-full text-xs font-semibold py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
