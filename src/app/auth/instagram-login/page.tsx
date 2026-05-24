'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Lock, Check, Loader2 } from 'lucide-react';

export default function InstagramLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'login' | 'authorize' | 'exchanging' | 'success'>('login');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('authorize');
    }, 1200);
  };

  const handleAuthorize = () => {
    setStep('exchanging');
    setTimeout(() => {
      setStep('success');
      
      // Communicate connection success back to the parent dashboard window
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth-success',
          platform: 'instagram',
          username: username.startsWith('@') ? username : `@${username}`
        }, '*');
      }
      
      setTimeout(() => {
        window.close();
      }, 1500);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#050510] text-[#f0f0f5] flex flex-col justify-center items-center p-6 font-sans select-none">
      {/* Dynamic Background Blurs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(228,64,95,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(124,58,237,0.08),transparent_50%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-[#0a0a1a]/95 border border-[rgba(228,64,95,0.25)] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(228,64,95,0.15)] glass-card flex flex-col"
      >
        {/* Instagram Branded Header */}
        <div className="p-6 border-b border-[rgba(228,64,95,0.1)] flex flex-col items-center text-center space-y-2 bg-[rgba(228,64,95,0.02)]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white text-base font-bold shadow-lg">
            I
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight font-serif italic">Instagram</h1>
            <p className="text-[10px] text-[#6b7280] uppercase tracking-wider font-semibold mt-0.5">Secure Application Link</p>
          </div>
        </div>

        {/* Steps Content */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 'login' && (
              <motion.form
                key="login-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="text-center space-y-1 mb-2">
                  <h3 className="text-sm font-bold text-white">Log in with your credentials</h3>
                  <p className="text-xs text-[#9ca3af]">to link your account to PulseSync dashboard</p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Phone number, username, or email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#050510] border border-[rgba(228,64,95,0.15)] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#ee2a7b] outline-none transition-colors"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#050510] border border-[rgba(228,64,95,0.15)] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#ee2a7b] outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ee2a7b] to-[#6228d7] text-white text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </motion.form>
            )}

            {step === 'authorize' && (
              <motion.div
                key="auth-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[rgba(124,58,237,0.05)] border border-[rgba(124,58,237,0.1)]">
                  <Zap className="w-5 h-5 text-[#a78bfa] shrink-0" />
                  <p className="text-xs text-[#e0e0e5] leading-relaxed">
                    <strong>PulseSync</strong> is requesting permission to access your Instagram profile data and media posts.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Required Permissions:</h4>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 text-xs text-[#9ca3af]">
                      <Shield className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Access Profile Info</p>
                        <p className="text-[10px] text-[#6b7280] mt-0.5">Read username, account type, and profile statistics.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-[#9ca3af]">
                      <Shield className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Publish Posts &amp; Captions</p>
                        <p className="text-[10px] text-[#6b7280] mt-0.5">Publish photos, videos, stories, and captions automatically in one click.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-[rgba(228,64,95,0.08)]">
                  <button
                    onClick={() => window.close()}
                    className="flex-1 py-2.5 rounded-xl border border-[rgba(228,64,95,0.15)] text-[#9ca3af] text-xs font-semibold hover:bg-[rgba(228,64,95,0.04)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAuthorize}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ee2a7b] to-[#6228d7] text-white text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Authorize App
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'exchanging' && (
              <motion.div
                key="exchanging-step"
                className="py-6 flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-[#ee2a7b]/10 animate-ping" />
                  <div className="w-16 h-16 rounded-full bg-[rgba(238,42,123,0.05)] border border-[rgba(238,42,123,0.2)] flex items-center justify-center relative">
                    <Loader2 className="w-8 h-8 text-[#ee2a7b] animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">Wired secure handshaking...</p>
                  <p className="text-xs text-[#6b7280] mt-1">Generating token credentials callback</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success-step"
                className="py-6 flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                  <Check className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Linked Successfully!</p>
                  <p className="text-xs text-[#6b7280] mt-1">Redirecting back to PulseSync dashboard</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[rgba(228,64,95,0.01)] border-t border-[rgba(228,64,95,0.06)] flex items-center justify-center gap-1.5 text-[10px] text-[#6b7280]">
          <Lock className="w-3 h-3 text-[#ee2a7b]" />
          <span>Meta API OAuth secure connection</span>
        </div>
      </motion.div>
    </div>
  );
}
