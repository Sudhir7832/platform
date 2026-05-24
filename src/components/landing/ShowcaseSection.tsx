'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Sparkles, BarChart3, CalendarDays, Send, Hash, Clock, TrendingUp, Users, Eye, Heart, MessageCircle } from 'lucide-react';

const tabs = [
  { id: 'composer', label: 'Composer', icon: PenLine },
  { id: 'ai-captions', label: 'AI Captions', icon: Sparkles },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

function ComposerMockup() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-2">
          {['#E4405F', '#1DA1F2', '#0A66C2', '#1877F2'].map((c) => (
            <div key={c} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c}22`, border: `1px solid ${c}44` }}>
              <div className="w-3 h-3 rounded-full" style={{ background: c }} />
            </div>
          ))}
        </div>
        <span className="text-xs text-[#6b7280]">4 platforms selected</span>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="text-sm text-[#9ca3af] mb-3">
          🚀 Excited to announce our new AI-powered content optimization feature! Create better posts in half the time.
        </div>
        <div className="flex gap-2">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#7c3aed]/20 to-[#3b82f6]/20 border border-[rgba(124,58,237,0.2)] flex items-center justify-center">
            <span className="text-2xl">🖼️</span>
          </div>
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#06b6d4]/20 to-[#7c3aed]/20 border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
            <span className="text-2xl">📹</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-xs text-[#a78bfa] glass px-3 py-1.5 rounded-lg">
            <Hash className="w-3.5 h-3.5" />
            Hashtags
          </button>
          <button className="flex items-center gap-1.5 text-xs text-[#06b6d4] glass px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            Schedule
          </button>
        </div>
        <button className="flex items-center gap-2 btn-primary !py-2 !px-4 text-xs">
          <Send className="w-3.5 h-3.5" />
          Publish
        </button>
      </div>
    </div>
  );
}

function AICaptionsMockup() {
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#a78bfa]" />
          <span className="text-sm font-medium text-[#a78bfa]">AI Adaptation Engine</span>
        </div>
        <div className="text-sm text-[#9ca3af] mb-4">Original: &quot;Check out our new product launch!&quot;</div>
        <div className="space-y-3">
          {[
            { platform: 'Instagram', text: '🔥 NEW DROP ALERT! Our latest product just dropped and you DON\'T want to miss this. Link in bio! ✨ #NewLaunch #MustHave', color: '#E4405F' },
            { platform: 'LinkedIn', text: 'Thrilled to announce our latest product launch. After months of development and customer feedback, we\'ve built something truly transformative.', color: '#0A66C2' },
            { platform: 'X / Twitter', text: 'Just launched something big. 🚀\n\nOur new product is live — and it\'s going to change how you work.\n\nThread 🧵👇', color: '#1DA1F2' },
          ].map((item) => (
            <div key={item.platform} className="glass-card p-3 !rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-xs font-medium" style={{ color: item.color }}>{item.platform}</span>
              </div>
              <p className="text-xs text-[#9ca3af] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Reach', value: '2.8M', change: '+12.5%', icon: Eye, color: '#7c3aed' },
          { label: 'Engagement', value: '4.8%', change: '+2.1%', icon: Heart, color: '#E4405F' },
          { label: 'Followers', value: '158K', change: '+8.3%', icon: Users, color: '#3b82f6' },
          { label: 'Comments', value: '12.4K', change: '+15.7%', icon: MessageCircle, color: '#06b6d4' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 !rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-xs text-emerald-400 font-medium">{stat.change}</span>
            </div>
            <div className="text-lg font-bold text-white">{stat.value}</div>
            <div className="text-xs text-[#6b7280]">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white">Reach Over Time</span>
          <span className="text-xs text-[#6b7280]">Last 7 days</span>
        </div>
        {/* Mini chart bars */}
        <div className="flex items-end gap-2 h-24">
          {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[#7c3aed] to-[#3b82f6]" style={{ height: `${h}%`, opacity: 0.6 + (i * 0.05) }} />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d} className="text-[10px] text-[#6b7280] flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarMockup() {
  const days = Array.from({ length: 35 }, (_, i) => i - 3);
  const scheduled = [3, 5, 8, 12, 15, 19, 22, 25];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">May 2026</span>
        <div className="flex gap-1">
          <div className="w-6 h-6 glass rounded flex items-center justify-center text-[#9ca3af] text-xs cursor-pointer hover:text-white">‹</div>
          <div className="w-6 h-6 glass rounded flex items-center justify-center text-[#9ca3af] text-xs cursor-pointer hover:text-white">›</div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-[10px] text-[#6b7280] py-1">{d}</div>
        ))}
        {days.map((day, i) => {
          const isCurrentMonth = day >= 1 && day <= 31;
          const hasEvent = scheduled.includes(day);
          return (
            <div
              key={i}
              className={`text-xs py-1.5 rounded-md relative ${
                isCurrentMonth
                  ? hasEvent
                    ? 'bg-[#7c3aed]/20 text-[#a78bfa] font-semibold'
                    : day === 24
                    ? 'bg-[#7c3aed] text-white font-bold'
                    : 'text-[#9ca3af] hover:bg-[rgba(124,58,237,0.1)]'
                  : 'text-[#333]'
              } cursor-pointer transition-colors`}
            >
              {isCurrentMonth ? day : ''}
              {hasEvent && isCurrentMonth && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#06b6d4]" />
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        {[
          { time: '9:00 AM', title: 'Product Launch', platforms: ['Instagram', 'Twitter'], color: '#7c3aed' },
          { time: '2:00 PM', title: 'Weekly Tips Thread', platforms: ['Twitter', 'LinkedIn'], color: '#3b82f6' },
        ].map((event) => (
          <div key={event.title} className="glass-card p-2.5 !rounded-lg flex items-center gap-3">
            <div className="w-1 h-8 rounded-full" style={{ background: event.color }} />
            <div>
              <div className="text-xs font-medium text-white">{event.title}</div>
              <div className="text-[10px] text-[#6b7280]">{event.time} · {event.platforms.join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const tabContent: Record<string, React.FC> = {
  'composer': ComposerMockup,
  'ai-captions': AICaptionsMockup,
  'analytics': AnalyticsMockup,
  'calendar': CalendarMockup,
};

export default function ShowcaseSection() {
  const [activeTab, setActiveTab] = useState('composer');

  const ActiveComponent = tabContent[activeTab];

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything you need to{' '}
            <span className="gradient-text">dominate social media</span>
          </h2>
          <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
            A powerful, all-in-one dashboard designed to streamline your entire social media workflow.
          </p>
        </motion.div>

        {/* Tab Switcher & Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="glass inline-flex p-1.5 rounded-2xl gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-[#6b7280] hover:text-[#9ca3af]'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/30 to-[#3b82f6]/30 rounded-xl border border-[rgba(124,58,237,0.3)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="glass-card p-6 sm:p-8 group hover:glow-purple transition-shadow duration-500 relative overflow-hidden">
            {/* Glow on hover */}
            <div className="absolute -inset-px bg-gradient-to-r from-[#7c3aed]/0 via-[#7c3aed]/5 to-[#3b82f6]/0 group-hover:from-[#7c3aed]/10 group-hover:via-[#7c3aed]/5 group-hover:to-[#3b82f6]/10 transition-all duration-500 rounded-2xl" />

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ActiveComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
