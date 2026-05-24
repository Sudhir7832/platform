'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Zap,
  Clock,
  TrendingUp,
  Hash,
  PenSquare,
  Image,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { trendingHashtags } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils';

const bestTimes = [
  { day: 'Today', time: '2:00 PM', score: 94 },
  { day: 'Today', time: '6:30 PM', score: 87 },
  { day: 'Tomorrow', time: '9:00 AM', score: 82 },
  { day: 'Tomorrow', time: '1:00 PM', score: 78 },
];

const quickActions = [
  { label: 'New Post', icon: PenSquare, color: '#7c3aed' },
  { label: 'Upload Media', icon: Image, color: '#3b82f6' },
  { label: 'View Analytics', icon: BarChart3, color: '#06b6d4' },
  { label: 'AI Generate', icon: Sparkles, color: '#a78bfa' },
];

export default function RightPanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-[#0a0a1a]/90 backdrop-blur-sm border border-[rgba(124,58,237,0.2)] border-r-0 rounded-l-lg flex items-center justify-center text-[#6b7280] hover:text-[#a78bfa] transition-colors"
        style={{ right: collapsed ? 0 : 320 }}
      >
        {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="fixed right-0 top-0 h-screen w-[320px] z-40 bg-[#0a0a1a]/80 backdrop-blur-xl border-l border-[rgba(124,58,237,0.15)] overflow-y-auto"
          >
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a78bfa]" />
                <h2 className="text-sm font-semibold text-white">AI Insights</h2>
              </div>

              {/* Viral Score Gauge */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Viral Score</h3>
                  <Zap className="w-4 h-4 text-[#a78bfa]" />
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    {/* Background circle */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke="rgba(124,58,237,0.1)"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - 0.78) }}
                        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                      />
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Score text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-3xl font-bold text-white"
                      >
                        78
                      </motion.span>
                      <span className="text-[10px] text-[#6b7280] uppercase tracking-wider">/ 100</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-[#9ca3af] mt-3">
                  <span className="text-[#06b6d4] font-medium">Good</span> — Add trending hashtags to boost to 85+
                </p>
              </div>

              {/* Best Time to Post */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#06b6d4]" />
                  <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Best Time to Post</h3>
                </div>
                <div className="space-y-2">
                  {bestTimes.map((slot, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[rgba(124,58,237,0.05)] hover:bg-[rgba(124,58,237,0.1)] transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">{slot.time}</p>
                        <p className="text-[11px] text-[#6b7280]">{slot.day}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-[#1a1a2e] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${slot.score}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]"
                          />
                        </div>
                        <span className="text-[11px] text-[#a78bfa] font-medium w-7 text-right">{slot.score}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trending Hashtags */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-[#a78bfa]" />
                  <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Trending Hashtags</h3>
                </div>
                <div className="space-y-2">
                  {trendingHashtags.slice(0, 6).map((tag, i) => (
                    <motion.div
                      key={tag.tag}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(124,58,237,0.08)] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Hash className="w-3.5 h-3.5 text-[#6b7280] group-hover:text-[#a78bfa] shrink-0" />
                        <span className="text-sm text-[#e0e0e5] truncate">{tag.tag.replace('#', '')}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-[#6b7280]">{formatNumber(tag.posts)}</span>
                        <span className="text-[11px] text-green-400 font-medium">+{tag.growth}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.label}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[rgba(124,58,237,0.05)] hover:bg-[rgba(124,58,237,0.12)] border border-transparent hover:border-[rgba(124,58,237,0.2)] transition-all cursor-pointer"
                      >
                        <Icon className="w-5 h-5" style={{ color: action.color }} />
                        <span className="text-[11px] text-[#9ca3af] font-medium">{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
