'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  PenSquare,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Mail,
  Activity,
} from 'lucide-react';
import { teamMembers } from '@/lib/mock-data';
import { getRelativeTime } from '@/lib/utils';

const roleConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  owner: { label: 'Owner', color: '#a78bfa', bg: 'rgba(124,58,237,0.12)', icon: ShieldCheck },
  admin: { label: 'Admin', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Shield },
  editor: { label: 'Editor', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', icon: PenSquare },
  viewer: { label: 'Viewer', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: Eye },
};

const pendingApprovals = [
  {
    id: '1',
    author: 'Maria Garcia',
    avatar: 'MG',
    content: '5 tips to boost your engagement rate this week...',
    submitted: new Date(Date.now() - 3600000),
    platforms: ['twitter'],
  },
  {
    id: '2',
    author: 'James Wilson',
    avatar: 'JW',
    content: 'Behind the scenes of our product development process...',
    submitted: new Date(Date.now() - 7200000),
    platforms: ['twitter'],
  },
];

const activityLog = [
  { action: 'Published a post to X / Twitter', user: 'Sarah Johnson', time: new Date(Date.now() - 1800000), type: 'publish' },
  { action: 'Approved post by Maria Garcia', user: 'Alex Chen', time: new Date(Date.now() - 3600000), type: 'approve' },
  { action: 'Uploaded 3 media files', user: 'James Wilson', time: new Date(Date.now() - 7200000), type: 'upload' },
  { action: 'Scheduled 5 posts for next week', user: 'Maria Garcia', time: new Date(Date.now() - 14400000), type: 'schedule' },
  { action: 'Updated workspace settings', user: 'Sarah Johnson', time: new Date(Date.now() - 28800000), type: 'settings' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function TeamPage() {
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#a78bfa]" />
            Team Management
          </h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Manage your team members and roles</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary text-sm py-2.5 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </motion.button>
      </motion.div>

      {/* Team Members Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-base font-semibold text-white mb-4">Members ({teamMembers.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teamMembers.map((member, i) => {
            const role = roleConfig[member.role];
            const RoleIcon = role.icon;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="glass-card p-5 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white font-bold text-sm">
                        {member.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0d0d20] ${
                          member.status === 'active' ? 'bg-green-400' : 'bg-amber-400'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{member.name}</p>
                      <p className="text-xs text-[#6b7280]">{member.email}</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: role.bg, color: role.color }}
                  >
                    <RoleIcon className="w-3.5 h-3.5" />
                    {role.label}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(member.lastActive)}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Invite Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-5 border-dashed !border-[rgba(124,58,237,0.2)] flex flex-col items-center justify-center gap-3 cursor-pointer hover:!border-[rgba(124,58,237,0.4)] transition-colors min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.1)] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#a78bfa]" />
            </div>
            <p className="text-sm text-[#9ca3af] font-medium">Invite a team member</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Pending Approvals</h2>
            <span className="w-5 h-5 rounded-full bg-[rgba(124,58,237,0.2)] flex items-center justify-center text-[10px] font-bold text-[#a78bfa]">
              {pendingApprovals.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-3 rounded-xl bg-[rgba(124,58,237,0.04)] border border-[rgba(124,58,237,0.08)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white text-[9px] font-bold">
                    {item.avatar}
                  </div>
                  <span className="text-xs font-medium text-white">{item.author}</span>
                  <span className="text-[10px] text-[#6b7280] ml-auto">{getRelativeTime(item.submitted)}</span>
                </div>
                <p className="text-xs text-[#9ca3af] line-clamp-2 mb-3">{item.content}</p>
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity Log */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#06b6d4]" />
            <h2 className="text-base font-semibold text-white">Activity Log</h2>
          </div>
          <div className="space-y-3">
            {activityLog.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-start gap-3 relative"
              >
                {/* Timeline line */}
                {i < activityLog.length - 1 && (
                  <div className="absolute left-[9px] top-5 w-[1px] h-[calc(100%+8px)] bg-[rgba(124,58,237,0.1)]" />
                )}
                <div className="w-[19px] h-[19px] rounded-full bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center shrink-0 mt-0.5 z-10">
                  <div className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#e0e0e5]">
                    <span className="font-medium text-white">{entry.user}</span> {entry.action.replace(entry.user, '').toLowerCase()}
                  </p>
                  <p className="text-[10px] text-[#6b7280] mt-0.5">{getRelativeTime(entry.time)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
