'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Eye,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dashboardStats, analyticsData } from '@/lib/mock-data';
import { useAuth } from '@/hooks/useAuth';
import { formatNumber, getRelativeTime, platformColors, platformNames } from '@/lib/utils';



function AnimatedCounter({ value, format, suffix }: { value: number; format: boolean; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const display = format ? formatNumber(count) : count.toLocaleString();
  return (
    <span>
      {display}
      {suffix || ''}
    </span>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-card px-4 py-3 !rounded-xl" style={{ boxShadow: '0 0 30px rgba(124,58,237,0.2)' }}>
      <p className="text-xs text-[#9ca3af] mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{formatNumber(payload[0].value)} reach</p>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function DashboardPage() {
  const { posts, profile } = useAuth();

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Creator';

  const totalPublishedPosts = posts.filter((p) => p.status === 'published');
  
  const dynamicTotalPosts = 24 + posts.length;
  
  const dynamicTotalReach = 2840000 + totalPublishedPosts.reduce((acc, p) => acc + (p.engagement?.reach || 0), 0);
  
  const dynamicEngagement = parseFloat(
    (
      4.8 +
      (totalPublishedPosts.length > 0
        ? totalPublishedPosts.reduce((acc, p) => acc + (p.engagement?.likes || 0) + (p.engagement?.comments || 0), 0) / 100000
        : 0)
    ).toFixed(2)
  );

  const dynamicFollowers = 84700 + totalPublishedPosts.length * 150;

  const statCards = [
    {
      label: 'Total Posts',
      value: dynamicTotalPosts,
      change: 12.5,
      icon: FileText,
      color: '#7c3aed',
      format: false,
    },
    {
      label: 'Total Reach',
      value: dynamicTotalReach,
      change: 18.2,
      icon: Eye,
      color: '#3b82f6',
      format: true,
    },
    {
      label: 'Engagement Rate',
      value: dynamicEngagement,
      change: 3.1,
      icon: TrendingUp,
      color: '#06b6d4',
      format: false,
      suffix: '%',
    },
    {
      label: 'Followers',
      value: dynamicFollowers,
      change: 8.7,
      icon: Users,
      color: '#a78bfa',
      format: true,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white mb-1">
          Good morning, <span className="gradient-text">{firstName}</span> ✨
        </h1>
        <p className="text-[#9ca3af] text-sm">
          Here&apos;s what&apos;s happening with your content today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="dashboard-grid">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              className="glass-card p-5 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isPositive
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                <AnimatedCounter value={stat.value} format={stat.format} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-[#6b7280]">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Performance Chart */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Performance Overview</h2>
            <p className="text-xs text-[#6b7280] mt-0.5">Reach over the last 30 days</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((period, i) => (
              <button
                key={period}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  i === 1
                    ? 'bg-[rgba(124,58,237,0.15)] text-[#a78bfa] border border-[rgba(124,58,237,0.3)]'
                    : 'text-[#6b7280] hover:text-white hover:bg-[rgba(124,58,237,0.08)]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={(v: number) => formatNumber(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="reach"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#reachGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#7c3aed',
                  stroke: '#0d0d20',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Posts & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Posts</h2>
            <Sparkles className="w-4 h-4 text-[#a78bfa]" />
          </div>
          <div className="space-y-3">
            {posts
              .filter((p) => p.status === 'published')
              .slice(0, 4)
              .map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex gap-3 p-3 rounded-xl bg-[rgba(124,58,237,0.04)] hover:bg-[rgba(124,58,237,0.08)] transition-colors group cursor-pointer"
                >
                  <div className="shrink-0 mt-0.5">
                    <div className="flex -space-x-1.5">
                      {post.platforms.slice(0, 3).map((p) => (
                        <div
                          key={p}
                          className="w-6 h-6 rounded-full border-2 border-[#0d0d20] flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ background: platformColors[p] || '#6b7280' }}
                        >
                          {(platformNames[p] || p)[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#e0e0e5] line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#6b7280]">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {formatNumber(post.engagement?.likes || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {formatNumber(post.engagement?.comments || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" /> {formatNumber(post.engagement?.shares || 0)}
                      </span>
                      <span className="ml-auto">
                        {post.published_at ? getRelativeTime(new Date(post.published_at)) : ''}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Upcoming Scheduled */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Upcoming Posts</h2>
            <Clock className="w-4 h-4 text-[#06b6d4]" />
          </div>
          <div className="space-y-3">
            {posts
              .filter((p) => p.status === 'scheduled' || p.status === 'draft')
              .map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex gap-3 p-3 rounded-xl bg-[rgba(124,58,237,0.04)] hover:bg-[rgba(124,58,237,0.08)] transition-colors cursor-pointer"
                >
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        post.status === 'scheduled'
                          ? 'bg-[rgba(6,182,212,0.15)]'
                          : 'bg-[rgba(124,58,237,0.15)]'
                      }`}
                    >
                      {post.status === 'scheduled' ? (
                        <Clock className="w-4 h-4 text-[#06b6d4]" />
                      ) : (
                        <FileText className="w-4 h-4 text-[#a78bfa]" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#e0e0e5] line-clamp-2 mb-1.5">{post.content}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          post.status === 'scheduled'
                            ? 'bg-[rgba(6,182,212,0.12)] text-[#06b6d4]'
                            : 'bg-[rgba(124,58,237,0.12)] text-[#a78bfa]'
                        }`}
                      >
                        {post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                      </span>
                      <div className="flex -space-x-1">
                        {post.platforms.slice(0, 3).map((p) => (
                          <div
                            key={p}
                            className="w-5 h-5 rounded-full border border-[#0d0d20] flex items-center justify-center text-[7px] font-bold text-white"
                            style={{ background: platformColors[p] || '#6b7280' }}
                          >
                            {(platformNames[p] || p)[0]}
                          </div>
                        ))}
                      </div>
                      {post.scheduled_at && (
                        <span className="text-[11px] text-[#6b7280] ml-auto flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            {posts.filter((p) => p.status === 'scheduled' || p.status === 'draft').length === 0 && (
              <p className="text-sm text-[#6b7280] text-center py-8">No upcoming posts</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
