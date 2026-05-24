'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Zap, MailOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your inbox';

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
        className="w-full max-w-[400px] glass-card p-8 space-y-6 relative z-10 text-center"
        style={{ boxShadow: '0 0 50px rgba(124,58,237,0.1)' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.15)] flex items-center justify-center mx-auto text-[#a78bfa] mb-4">
          <MailOpen className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white tracking-tight">Check your email</h1>
          <p className="text-xs text-[#9ca3af] leading-relaxed">
            We sent a verification link to <span className="text-white font-medium">{email}</span>. Click the link to complete registration.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="btn-primary w-full text-xs font-semibold py-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            Return to Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-[10px] text-[#6b7280]">
          Didn&apos;t receive an email? Check your spam folder or try signing up again.
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050510] flex flex-col justify-center items-center font-sans">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] animate-pulse flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.2)]">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] font-mono mt-4">
          Loading...
        </span>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
