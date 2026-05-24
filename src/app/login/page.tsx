'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const [activeTab, setActiveTab] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get('next') || '/dashboard';
  const supabase = createClient();

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`,
        },
      });

      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleLaunchDemoMode = () => {
    // Set cookies to trigger mock database-less auth
    document.cookie = "pulsesync_mock_user=true; path=/; max-age=31536000; SameSite=Lax";
    document.cookie = "pulsesync_sandbox_onboarding=true; path=/; max-age=31536000; SameSite=Lax";
    
    // Redirect to dashboard
    router.push(nextRoute);
    router.refresh();
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      router.push(nextRoute);
      router.refresh();
    } catch (err: any) {
      console.warn('Password login failed, proposing sandbox mode fallback:', err);
      setError(
        `${err.message || 'Invalid email or password'}. If your Supabase database is not configured yet, you can use Demo/Sandbox Mode below.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`,
        },
      });

      if (authError) throw authError;

      setMessage('Magic Link sent! Please check your email inbox.');
    } catch (err: any) {
      console.warn('Magic link login failed, proposing sandbox mode fallback:', err);
      setError(
        `${err.message || 'Failed to send Magic Link'}. If your Supabase database is not configured yet, you can use Demo/Sandbox Mode below.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-[#f0f0f5] flex font-sans overflow-hidden relative">
      {/* Dynamic Background Blur Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.08),transparent_40%)] pointer-events-none" />

      {/* LEFT COLUMN: Premium SaaS Showcase Panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] bg-[#0a0a1a]/40 border-r border-[rgba(124,58,237,0.15)] flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold gradient-text">PulseSync</span>
        </Link>

        {/* Dynamic Card Display */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="space-y-4"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
              Connect. Adapt.<br />
              <span className="gradient-text">Publish Everywhere.</span>
            </h2>
            <p className="text-base text-[#9ca3af] leading-relaxed">
              Unlock a single centralized dashboard loaded with real-time adaptation algorithms, predicting viral metrics, and automated replies tailored for creators.
            </p>
          </motion.div>

          {/* Testimonial Glass Overlay Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card p-6"
          >
            <p className="text-sm italic text-[#e0e0e5] mb-4">
              &ldquo;The AI adaptor translates my X threads into perfect LinkedIn updates in a single click. PulseSync literally bought me back 15 hours a week!&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#7c3aed] flex items-center justify-center font-bold text-xs">
                AW
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Aria Williams</p>
                <p className="text-[10px] text-[#6b7280]">Social Strategist · Bloom Studio</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-xs text-[#6b7280] relative z-10 flex items-center gap-4">
          <span>© 2026 PulseSync Inc.</span>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Login Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="text-lg font-bold gradient-text">PulseSync</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="w-full max-w-[420px] space-y-6"
        >
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-sm text-[#9ca3af]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#a78bfa] hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Switch Tab Trigger */}
          <div className="glass p-1 rounded-xl flex gap-1">
            <button
              onClick={() => { setActiveTab('password'); setError(null); setMessage(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'password' ? 'bg-[rgba(124,58,237,0.15)] text-white border border-[rgba(124,58,237,0.25)]' : 'text-[#6b7280] hover:text-[#9ca3af]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('magic'); setError(null); setMessage(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'magic' ? 'bg-[rgba(124,58,237,0.15)] text-white border border-[rgba(124,58,237,0.25)]' : 'text-[#6b7280] hover:text-[#9ca3af]'
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Social Auth triggers */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="btn-secondary text-xs !py-3 flex items-center justify-center gap-2 cursor-pointer font-medium hover:bg-[rgba(124,58,237,0.06)]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
              className="btn-secondary text-xs !py-3 flex items-center justify-center gap-2 cursor-pointer font-medium hover:bg-[rgba(124,58,237,0.06)]"
            >
              <svg className="w-4 h-4 shrink-0 text-white fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(124,58,237,0.1)]" />
            </div>
            <span className="relative px-3 text-[10px] uppercase font-semibold text-[#6b7280] bg-[#050510]">
              Or continue with
            </span>
          </div>

          {/* Form panels */}
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

            {activeTab === 'password' ? (
              <motion.form
                key="password-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handlePasswordLogin}
                className="space-y-4"
              >
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

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#9ca3af]">Password</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-[#a78bfa] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
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

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      disabled={loading}
                      className="w-4 h-4 rounded bg-[#0d0d20] border-[rgba(124,58,237,0.15)] text-[#7c3aed] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-[#6b7280] font-medium">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="btn-primary w-full text-xs font-semibold py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="magic-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleMagicLinkLogin}
                className="space-y-4"
              >
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
                  {loading ? 'Sending link...' : 'Send Magic Link'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(124,58,237,0.1)]" />
            </div>
            <span className="relative px-3 text-[10px] uppercase font-semibold text-[#6b7280] bg-[#050510]">
              Or try locally
            </span>
          </div>

          <button
            onClick={handleLaunchDemoMode}
            type="button"
            className="w-full py-3 px-4 rounded-xl border border-[rgba(124,58,237,0.3)] bg-gradient-to-r from-[#7c3aed]/10 to-[#3b82f6]/10 text-xs font-semibold text-[#a78bfa] hover:text-white hover:border-[#7c3aed] hover:from-[#7c3aed]/20 hover:to-[#3b82f6]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(124,58,237,0.05)]"
          >
            <Sparkles className="w-4 h-4 text-[#a78bfa] animate-pulse" />
            Try in Demo / Sandbox Mode
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050510] flex flex-col justify-center items-center font-sans">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] animate-pulse flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.2)]">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] font-mono mt-4">
          Loading authentication...
        </span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
