'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import RightPanel from '@/components/dashboard/RightPanel';
import CommandPalette from '@/components/dashboard/CommandPalette';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const { loading } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col justify-center items-center font-sans">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.3)]">
            <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] font-mono">
            Synchronizing Workspace...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-[260px] mr-[320px] flex-1 min-h-screen overflow-y-auto">
        <div className="p-8 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>

      {/* Right Panel */}
      <RightPanel />

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
