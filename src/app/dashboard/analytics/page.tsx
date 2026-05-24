'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  TrendingUp,
  MousePointerClick,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  analyticsData,
  platformAnalytics,
  audienceDemographics,
  recentPosts,
} from '@/lib/mock-data';
import { formatNumber, platformColors, platformNames } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const dateRanges = ['Last 7 days', 'Last 30 days', 'Last 90 days'];



function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-card px-4 py-3 !rounded-xl" style={{ boxShadow: '0 0 30px rgba(124,58,237,0.2)' }}>
      <p className="text-xs text-[#9ca3af] mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.dataKey === 'reach' ? formatNumber(p.value) : p.value.toLocaleString()} {p.dataKey}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-card px-3 py-2 !rounded-lg" style={{ boxShadow: '0 0 30px rgba(124,58,237,0.2)' }}>
      <p className="text-xs font-semibold text-white">{payload[0].name}: {payload[0].value}%</p>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function AnalyticsPage() {
  const { posts } = useAuth();
  const [range, setRange] = useState(1);

  const totalPublishedPosts = useMemo(() => posts.filter((p) => p.status === 'published'), [posts]);

  const dynamicTotalReach = useMemo(() => 2840000 + totalPublishedPosts.reduce((acc, p) => acc + (p.engagement?.reach || 0), 0), [totalPublishedPosts]);
  
  const dynamicEngagement = useMemo(() => parseFloat(
    (
      4.8 +
      (totalPublishedPosts.length > 0
        ? totalPublishedPosts.reduce((acc, p) => acc + (p.engagement?.likes || 0) + (p.engagement?.comments || 0), 0) / 100000
        : 0)
    ).toFixed(2)
  ), [totalPublishedPosts]);

  const dynamicClicks = useMemo(() => 42800 + totalPublishedPosts.reduce((acc, p) => acc + (p.engagement?.clicks || 0), 0), [totalPublishedPosts]);
  
  const dynamicFollowerGrowth = useMemo(() => 8740 + totalPublishedPosts.length * 150, [totalPublishedPosts]);

  const statsCards = [
    { label: 'Total Reach', value: dynamicTotalReach, change: 18.2, icon: Eye, color: '#7c3aed' },
    { label: 'Engagement Rate', value: dynamicEngagement, change: 3.1, icon: TrendingUp, color: '#3b82f6', suffix: '%' },
    { label: 'Total Clicks', value: dynamicClicks, change: -2.4, icon: MousePointerClick, color: '#06b6d4' },
    { label: 'Follower Growth', value: dynamicFollowerGrowth, change: 12.5, icon: UserPlus, color: '#a78bfa', prefix: '+' },
  ];

  const allPosts = useMemo(() => {
    const mapped = totalPublishedPosts.map((p) => ({
      id: p.id,
      content: p.content,
      platforms: p.platforms,
      status: p.status,
      engagement: p.engagement || { reach: 0, likes: 0, comments: 0, shares: 0, clicks: 0 }
    }));
    return [...mapped, ...recentPosts];
  }, [totalPublishedPosts]);

  const chartData = useMemo(() => {
    const incrementReach = totalPublishedPosts.reduce((acc, p) => acc + (p.engagement?.reach || 0), 0) / 30;
    const incrementEngagement = totalPublishedPosts.reduce((acc, p) => acc + (p.engagement?.likes || 0) + (p.engagement?.comments || 0), 0) / 30;
    
    const mapped = analyticsData.map((d) => ({
      ...d,
      reach: d.reach + incrementReach,
      engagement: d.engagement + incrementEngagement
    }));
    
    return range === 0 ? mapped.slice(-7) : mapped;
  }, [totalPublishedPosts, range]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Track your content performance</p>
        </div>
        <div className="flex gap-2">
          {dateRanges.map((label, i) => (
            <button
              key={label}
              onClick={() => setRange(i)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                range === i
                  ? 'bg-[rgba(124,58,237,0.15)] text-[#a78bfa] border border-[rgba(124,58,237,0.3)]'
                  : 'text-[#6b7280] hover:text-white hover:bg-[rgba(124,58,237,0.06)] border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="dashboard-grid">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {stat.prefix || ''}{typeof stat.value === 'number' && stat.value >= 1000 ? formatNumber(stat.value) : stat.value}{stat.suffix || ''}
              </p>
              <p className="text-xs text-[#6b7280] mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Chart */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Performance Overview</h2>
            <p className="text-xs text-[#6b7280] mt-0.5">Reach &amp; engagement over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" /> Reach
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /> Engagement
            </span>
          </div>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
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
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="reach"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#reachGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#7c3aed', stroke: '#0d0d20', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#engagementGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#06b6d4', stroke: '#0d0d20', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Platform Breakdown</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformAnalytics}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <YAxis
                  type="category"
                  dataKey="platform"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#e0e0e5', fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    return (
                      <div className="glass-card px-3 py-2 !rounded-lg" style={{ boxShadow: '0 0 30px rgba(124,58,237,0.2)' }}>
                        <p className="text-xs font-semibold text-white">{formatNumber(payload[0].value as number)} reach</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="reach" radius={[0, 6, 6, 0]} barSize={20}>
                  {platformAnalytics.map((entry) => (
                    <Cell key={entry.platform} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Audience Demographics */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Audience Demographics</h2>
          <div className="flex items-center justify-center">
            <div className="relative w-[240px] h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={audienceDemographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {audienceDemographics.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-white">158K</p>
                <p className="text-[10px] text-[#6b7280]">Total Audience</p>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {audienceDemographics.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-[#9ca3af]">{d.name}</span>
                <span className="text-white font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Performing Posts */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Top Performing Posts</h2>
        <div className="space-y-3">
          {allPosts
            .sort((a, b) => b.engagement.reach - a.engagement.reach)
            .slice(0, 4)
            .map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(124,58,237,0.04)] hover:bg-[rgba(124,58,237,0.08)] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e0e0e5] line-clamp-1">{post.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {post.platforms.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: `${platformColors[p]}20`, color: platformColors[p] }}
                      >
                        {(platformNames[p] || p).split('/')[0].trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">{formatNumber(post.engagement.reach)}</p>
                  <p className="text-[10px] text-[#6b7280]">reach</p>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
