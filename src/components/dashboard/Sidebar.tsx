'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  LayoutDashboard,
  PenSquare,
  Calendar,
  BarChart3,
  Bot,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Create Post', href: '/dashboard/compose', icon: PenSquare },
  { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
  { label: 'Team', href: '/dashboard/team', icon: Users },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const { profile, workspaces, activeWorkspace, setActiveWorkspaceById, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="fixed left-0 top-0 h-screen w-[260px] z-40 flex flex-col bg-[#0a0a1a]/80 backdrop-blur-xl border-r border-[rgba(124,58,237,0.15)]"
    >
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#06b6d4] rounded-full animate-pulse-glow" />
        </div>
        <div>
          <h1 className="text-lg font-bold gradient-text">PulseSync</h1>
          <p className="text-[10px] text-[#6b7280] tracking-wider uppercase">
            {activeWorkspace ? activeWorkspace.workspace_name : 'Dashboard'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                  active
                    ? 'bg-[rgba(124,58,237,0.15)] text-white'
                    : 'text-[#9ca3af] hover:text-white hover:bg-[rgba(124,58,237,0.08)]'
                }`}
              >
                {/* Active indicator bar */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-gradient-to-b from-[#7c3aed] to-[#3b82f6]"
                    style={{
                      boxShadow: '0 0 12px rgba(124,58,237,0.6), 0 0 24px rgba(124,58,237,0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? 'text-[#a78bfa]' : 'text-[#6b7280] group-hover:text-[#a78bfa]'
                  }`}
                />
                <span>{item.label}</span>

                {/* AI sparkle on AI Assistant */}
                {item.label === 'AI Assistant' && (
                  <Sparkles className="w-3.5 h-3.5 text-[#06b6d4] ml-auto" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Pro Badge */}
      <div className="px-3 mb-3">
        <div className="glass-card p-3 cursor-pointer group">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              {profile?.plan_type ? `${profile.plan_type} Plan` : 'Free Plan'}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#1a1a2e] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: profile?.plan_type === 'agency' ? '100%' : profile?.plan_type === 'pro' ? '72%' : '15%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]"
            />
          </div>
          <p className="text-[10px] text-[#6b7280] mt-1.5">
            {profile?.plan_type === 'agency' ? 'Unlimited' : profile?.plan_type === 'pro' ? '847 / 1,000' : '15 / 50'} AI credits used
          </p>
        </div>
      </div>

      {/* Workspace Switcher & User profile */}
      <div className="px-3 pb-4 border-t border-[rgba(124,58,237,0.1)] pt-3">
        <motion.button
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[rgba(124,58,237,0.08)] transition-colors cursor-pointer"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'Avatar'}
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-[rgba(124,58,237,0.3)]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {getInitials(profile?.full_name)}
            </div>
          )}
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'PulseSync User'}</p>
            <p className="text-[11px] text-[#6b7280] truncate">{profile?.email || 'Active'}</p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#6b7280] transition-transform ${
              workspaceOpen ? 'rotate-180' : ''
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {workspaceOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-1.5 space-y-1 bg-[#0d0d20] border border-[rgba(124,58,237,0.15)] rounded-xl p-1.5"
            >
              <div className="text-[9px] font-semibold text-[#6b7280] uppercase tracking-wider px-2 py-1">
                Switch Workspaces
              </div>
              {workspaces.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setActiveWorkspaceById(w.id);
                    setWorkspaceOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                    activeWorkspace?.id === w.id
                      ? 'bg-[rgba(124,58,237,0.12)] text-[#a78bfa]'
                      : 'text-[#9ca3af] hover:text-white hover:bg-[rgba(124,58,237,0.06)]'
                  }`}
                >
                  <div className="w-5 h-5 rounded bg-[#161632] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {w.workspace_name[0].toUpperCase()}
                  </div>
                  <span className="truncate flex-1">{w.workspace_name}</span>
                  {activeWorkspace?.id === w.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
                  )}
                </button>
              ))}

              <div className="border-t border-[rgba(124,58,237,0.1)] my-1" />

              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left cursor-pointer mt-1"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
