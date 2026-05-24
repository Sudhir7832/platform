'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  CreditCard,
  Keyboard,
  Link2,
  Check,
  Crown,
  Sparkles,
  ExternalLink,
  User as UserIcon,
  Upload,
  Link as WebsiteIcon,
  BookOpen,
  X,
  Lock,
  Shield,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { platformColors, platformNames } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

const tabs = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'general', label: 'General', icon: Globe },
  { id: 'accounts', label: 'Accounts', icon: Link2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
];


const notificationSettings = [
  { id: 'post-published', label: 'Post Published', description: 'When your post is published to platforms', enabled: true },
  { id: 'post-failed', label: 'Post Failed', description: 'When a post fails to publish', enabled: true },
  { id: 'ai-suggestions', label: 'AI Suggestions', description: 'AI-powered content recommendations', enabled: true },
  { id: 'engagement-alerts', label: 'Engagement Alerts', description: 'When posts reach engagement milestones', enabled: false },
  { id: 'team-activity', label: 'Team Activity', description: 'When team members take actions', enabled: true },
  { id: 'weekly-report', label: 'Weekly Report', description: 'Automated weekly performance summary', enabled: true },
];

const shortcuts = [
  { keys: ['Ctrl', 'K'], action: 'Open Command Palette' },
  { keys: ['Ctrl', 'N'], action: 'New Post' },
  { keys: ['Ctrl', 'S'], action: 'Save Draft' },
  { keys: ['Ctrl', 'Enter'], action: 'Publish Post' },
  { keys: ['Ctrl', 'Shift', 'S'], action: 'Schedule Post' },
  { keys: ['G', 'D'], action: 'Go to Dashboard' },
  { keys: ['G', 'C'], action: 'Go to Compose' },
  { keys: ['G', 'A'], action: 'Go to Analytics' },
  { keys: ['G', 'K'], action: 'Go to Calendar' },
  { keys: ['Esc'], action: 'Close Modal / Panel' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const {
    profile,
    activeWorkspace,
    refreshProfile,
    refreshWorkspaces,
    connectedAccounts,
    connectPlatform,
    disconnectPlatform,
  } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  
  // Workspace field
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.workspace_name || '');

  // Operation states
  const [updating, setUpdating] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [notifications, setNotifications] = useState(
    notificationSettings.reduce((acc, n) => ({ ...acc, [n.id]: n.enabled }), {} as Record<string, boolean>)
  );

  // OAuth Simulation state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectPlatformId, setConnectPlatformId] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [connectStep, setConnectStep] = useState<'details' | 'authenticating' | 'success'>('details');

  // Disconnect Confirmation state
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [disconnectPlatformId, setDisconnectPlatformId] = useState<string | null>(null);

  // Listen for secure OAuth popups message callbacks
  useState(() => {
    if (typeof window === 'undefined') return;
    const handleOAuthMessage = async (e: MessageEvent) => {
      if (e.data?.type === 'oauth-success') {
        const { platform, username } = e.data;
        try {
          setUpdating(true);
          await connectPlatform(platform, username);
          setMessage({
            text: `Successfully linked ${platform === 'twitter' ? 'Twitter/X' : platform} account: ${username}!`,
            type: 'success'
          });
        } catch (err: any) {
          setMessage({ text: err.message || 'Connection failed', type: 'error' });
        } finally {
          setUpdating(false);
        }
      } else if (e.data?.type === 'oauth-error') {
        setMessage({ text: e.data.error || 'Connection failed', type: 'error' });
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  });

  const toggleNotification = (id: string) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConnect = (platform: string) => {
    if (platform === 'twitter') {
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(
        '/api/auth/twitter',
        'Twitter Authorization',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=no`
      );
      return;
    }

    setConnectPlatformId(platform);
    setUsernameInput(platform === 'linkedin' ? 'PulseSync Inc.' : '@pulsesync');
    setConnectStep('details');
    setShowConnectModal(true);
  };

  const handleDisconnect = (platform: string) => {
    setDisconnectPlatformId(platform);
    setShowDisconnectModal(true);
  };

  const executeConnect = async () => {
    if (!connectPlatformId || !usernameInput) return;
    try {
      setConnectStep('authenticating');
      
      // Simulate real OAuth authorization handshaking
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      await connectPlatform(connectPlatformId, usernameInput);
      setConnectStep('success');
      
      setTimeout(() => {
        setShowConnectModal(false);
        setConnectPlatformId(null);
        setConnectStep('details');
        setMessage({
          text: `Successfully authorized and connected ${platformNames[connectPlatformId] || connectPlatformId}!`,
          type: 'success'
        });
      }, 1500);
    } catch (err: any) {
      setConnectStep('details');
      setMessage({ text: err.message || 'Connection failed', type: 'error' });
    }
  };

  const executeDisconnect = async () => {
    if (!disconnectPlatformId) return;
    try {
      setUpdating(true);
      setShowDisconnectModal(false);
      await disconnectPlatform(disconnectPlatformId);
      setMessage({
        text: `Successfully disconnected ${platformNames[disconnectPlatformId] || disconnectPlatformId} account!`,
        type: 'success'
      });
      setDisconnectPlatformId(null);
    } catch (err: any) {
      setMessage({ text: err.message || 'Disconnection failed', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  // Profile completion percentage
  const getCompletionPercentage = () => {
    let score = 0;
    if (profile?.avatar_url) score += 20;
    if (profile?.full_name) score += 25;
    if (profile?.username) score += 25;
    if (profile?.bio) score += 15;
    if (profile?.website) score += 15;
    return score;
  };

  // Edit profile submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setUpdating(true);
      setMessage(null);

      try {
        const { error } = await supabase
          .from('users')
          .update({
            full_name: fullName,
            bio,
            website,
          })
          .eq('id', profile.id);

        if (error) throw error;
      } catch (dbErr) {
        console.warn('Database profile update failed, falling back to local storage:', dbErr);
      }

      // Sync local storage profile edit
      const updatedProfile = {
        ...profile,
        full_name: fullName,
        bio,
        website,
      };
      localStorage.setItem(`pulsesync_profile_${profile.id}`, JSON.stringify(updatedProfile));

      await refreshProfile();
      setMessage({ text: 'Profile successfully updated!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Profile update failed', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  // Edit workspace name submit
  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !profile) return;

    try {
      setUpdating(true);
      setMessage(null);

      try {
        const { error } = await supabase
          .from('workspaces')
          .update({
            workspace_name: workspaceName,
          })
          .eq('id', activeWorkspace.id);

        if (error) throw error;
      } catch (dbErr) {
        console.warn('Database workspace update failed, falling back to local storage:', dbErr);
      }

      // Sync local storage workspace edit
      const updatedWorkspace = {
        ...activeWorkspace,
        workspace_name: workspaceName,
      };
      localStorage.setItem(`pulsesync_workspace_${profile.id}`, JSON.stringify(updatedWorkspace));

      await refreshWorkspaces();
      setMessage({ text: 'Workspace successfully updated!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Workspace update failed', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  // Avatar file upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setAvatarLoading(true);
      setMessage(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file directly to Supabase storage bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Save public URL in profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: publicUrl,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setMessage({ text: 'Avatar successfully uploaded!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Avatar upload failed', type: 'error' });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-[#a78bfa]" />
          Settings
        </h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Manage your workspace profiles and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="glass-card p-1.5 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[rgba(124,58,237,0.15)] text-white border border-[rgba(124,58,237,0.1)]'
                  : 'text-[#6b7280] hover:text-white hover:bg-[rgba(124,58,237,0.06)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Toaster Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* USER PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile card & completion status */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6 flex flex-col items-center text-center space-y-4">
                  {/* Profile Picture Upload Zone */}
                  <div className="relative group">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-2 border-[rgba(124,58,237,0.3)] group-hover:opacity-70 transition-opacity"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white text-3xl font-bold border-2 border-[rgba(124,58,237,0.3)] group-hover:opacity-70 transition-opacity">
                        {fullName[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarLoading}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                    >
                      <Upload className="w-6 h-6 animate-pulse" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-lg">{fullName || 'PulseSync User'}</h3>
                    <p className="text-xs text-[#a78bfa] font-mono mt-0.5">@{profile?.username || 'user'}</p>
                  </div>

                  {/* Profile Completion percentage */}
                  <div className="w-full bg-[#1a1a2e] rounded-xl p-4 text-left">
                    <div className="flex justify-between items-center text-xs font-semibold text-white mb-2">
                      <span>Profile Completion</span>
                      <span className="text-[#06b6d4]">{getCompletionPercentage()}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#050510] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getCompletionPercentage()}%` }}
                        className="h-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]"
                      />
                    </div>
                    <p className="text-[10px] text-[#6b7280] mt-2 leading-relaxed">
                      Complete your profile parameters to optimize viral prediction scores on your compose tabs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form editing container */}
              <div className="lg:col-span-2">
                <form onSubmit={handleUpdateProfile} className="glass-card p-6 space-y-5">
                  <h2 className="text-base font-semibold text-white">Profile Details</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs text-[#9ca3af] font-semibold">Full name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-[#0a0a1a] border border-[rgba(124,58,237,0.15)] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#7c3aed]"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs text-[#9ca3af] font-semibold">Username (read-only)</label>
                      <input
                        type="text"
                        value={profile?.username || ''}
                        disabled
                        className="w-full bg-[#050510] border border-[rgba(124,58,237,0.08)] rounded-xl px-4 py-2.5 text-sm text-[#6b7280] cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9ca3af] font-semibold">Website</label>
                    <div className="relative">
                      <WebsiteIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-[#6b7280]" />
                      <input
                        type="url"
                        placeholder="https://mywebsite.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a1a] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm text-white focus:border-[#7c3aed]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#9ca3af] font-semibold">Bio</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-[#6b7280]" />
                      <textarea
                        rows={3}
                        placeholder="Write a short summary about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a1a] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm text-white focus:border-[#7c3aed] resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[rgba(124,58,237,0.08)] flex justify-end">
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn-primary text-xs font-semibold py-2.5 px-6 disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <form onSubmit={handleUpdateWorkspace} className="glass-card p-6 space-y-5">
                <h2 className="text-base font-semibold text-white">Workspace Settings</h2>

                <div>
                  <label className="text-xs text-[#9ca3af] font-semibold mb-1.5 block">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                    className="w-full max-w-md bg-[#0a0a1a] border border-[rgba(124,58,237,0.15)] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#9ca3af] font-semibold mb-1.5 block">Timezone</label>
                  <select className="w-full max-w-md bg-[#0a0a1a] border border-[rgba(124,58,237,0.15)] rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                    <option>UTC-05:00 Eastern Time (US &amp; Canada)</option>
                    <option>UTC-08:00 Pacific Time (US &amp; Canada)</option>
                    <option>UTC+00:00 Greenwich Mean Time</option>
                    <option>UTC+05:30 India Standard Time</option>
                    <option>UTC+09:00 Japan Standard Time</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#9ca3af] font-semibold mb-1.5 block">Language</label>
                  <select className="w-full max-w-md bg-[#0a0a1a] border border-[rgba(124,58,237,0.15)] rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-[rgba(124,58,237,0.08)]">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-primary text-xs font-semibold py-2.5 px-6 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Workspace Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Connected Accounts */}
          {activeTab === 'accounts' && (
            <div className="glass-card p-6">
              <h2 className="text-base font-semibold text-white mb-5">Connected Accounts</h2>
              <div className="space-y-3">
                {connectedAccounts.map((account, i) => (
                  <motion.div
                    key={account.platform}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(124,58,237,0.03)] border border-[rgba(124,58,237,0.06)] hover:border-[rgba(124,58,237,0.15)] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: platformColors[account.platform] || '#6b7280' }}
                    >
                      {(platformNames[account.platform] || account.platform)[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {platformNames[account.platform] || account.platform}
                      </p>
                      {account.connected ? (
                        <p className="text-xs text-[#6b7280]">{account.username}</p>
                      ) : (
                        <p className="text-xs text-[#6b7280]">Not connected</p>
                      )}
                    </div>
                    {account.connected ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-green-400">
                          <Check className="w-3.5 h-3.5" /> Connected
                        </div>
                        <button
                          onClick={() => handleDisconnect(account.platform)}
                          disabled={updating}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(account.platform)}
                        disabled={updating}
                        className="btn-primary text-xs py-2 px-4 cursor-pointer disabled:opacity-50"
                      >
                        Connect
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6">
              <h2 className="text-base font-semibold text-white mb-5">Notification Preferences</h2>
              <div className="space-y-1">
                {notificationSettings.map((setting, i) => (
                  <motion.div
                    key={setting.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-[rgba(124,58,237,0.04)] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{setting.label}</p>
                      <p className="text-xs text-[#6b7280] mt-0.5">{setting.description}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(setting.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        notifications[setting.id]
                          ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6]'
                          : 'bg-[#2a2a3e]'
                      }`}
                    >
                      <motion.div
                        animate={{ x: notifications[setting.id] ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (
            <div className="space-y-5">
              <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#7c3aed]/20 to-transparent rounded-bl-full" />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-[#a78bfa]" />
                      <h2 className="text-lg font-bold text-white">
                        {profile?.plan_type ? `${profile.plan_type.toUpperCase()} Plan` : 'FREE Plan'}
                      </h2>
                    </div>
                    <p className="text-sm text-[#6b7280]">
                      {profile?.plan_type === 'agency' ? '$99/month' : profile?.plan_type === 'pro' ? '$29/month' : '$0/month'} · Renews on Dec 24, 2026
                    </p>
                  </div>
                  <button className="btn-secondary text-xs py-2 px-4 cursor-pointer">Manage Plan</button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: 'Social Accounts', used: 6, total: 15 },
                    { label: 'Posts This Month', used: 87, total: 999, totalLabel: 'Unlimited' },
                    { label: 'AI Credits', used: profile?.plan_type === 'agency' ? 2450 : profile?.plan_type === 'pro' ? 847 : 15, total: profile?.plan_type === 'agency' ? 10000 : profile?.plan_type === 'pro' ? 1000 : 50 },
                    { label: 'Team Members', used: 5, total: 5 },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-xs text-[#6b7280] mb-1">{stat.label}</p>
                      <p className="text-lg font-bold text-white">
                        {stat.used}
                        <span className="text-xs text-[#6b7280] font-normal">
                          /{stat.totalLabel || stat.total}
                        </span>
                      </p>
                      <div className="w-full h-1.5 rounded-full bg-[#1a1a2e] mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6]"
                          style={{ width: `${Math.min((stat.used / stat.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          {activeTab === 'shortcuts' && (
            <div className="glass-card p-6">
              <h2 className="text-base font-semibold text-white mb-5">Keyboard Shortcuts</h2>
              <div className="overflow-hidden rounded-xl border border-[rgba(124,58,237,0.08)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(124,58,237,0.08)]">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Action</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Shortcut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortcuts.map((shortcut, i) => (
                      <motion.tr
                        key={shortcut.action}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-[rgba(124,58,237,0.05)] last:border-0 hover:bg-[rgba(124,58,237,0.04)] transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm text-[#e0e0e5]">{shortcut.action}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {shortcut.keys.map((key, j) => (
                              <span key={j}>
                                <kbd className="px-2 py-1 text-[11px] font-mono bg-[rgba(124,58,237,0.08)] text-[#a78bfa] rounded-md border border-[rgba(124,58,237,0.15)]">
                                  {key}
                                </kbd>
                                {j < shortcut.keys.length - 1 && (
                                  <span className="text-[#4a4a5a] mx-0.5">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Simulated OAuth 2.0 Connection Modal */}
      <AnimatePresence>
        {showConnectModal && connectPlatformId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0a0a1a]/95 border border-[rgba(124,58,237,0.2)] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.15)] glass-card"
            >
              {/* Top platform bar */}
              <div className="relative p-5 border-b border-[rgba(124,58,237,0.1)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md"
                    style={{ background: platformColors[connectPlatformId] || '#7c3aed' }}
                  >
                    {(platformNames[connectPlatformId] || connectPlatformId)[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      Connect {platformNames[connectPlatformId] || connectPlatformId}
                    </h3>
                    <p className="text-[10px] text-[#6b7280]">Simulated OAuth 2.0 Secure Authorization</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="p-1 rounded-lg hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps */}
              <div className="p-6">
                {connectStep === 'details' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                      <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                      <p className="text-xs text-[#9ca3af] leading-relaxed">
                        PulseSync utilizes official API integrations. We will never see your password or post unverified content.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#9ca3af]">
                        {connectPlatformId === 'linkedin' ? 'Profile Name / Organization' : 'Account Handle / Username'}
                      </label>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder={connectPlatformId === 'linkedin' ? 'Sarah Johnson' : '@sarah_creates'}
                        className="w-full bg-[#050510] border border-[rgba(124,58,237,0.15)] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#7c3aed] focus:ring-0 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#6b7280]">
                      <Lock className="w-3 h-3 text-[#06b6d4]" />
                      <span>End-to-end sandbox token handshaking enabled</span>
                    </div>

                    <button
                      onClick={executeConnect}
                      disabled={!usernameInput}
                      className="w-full btn-primary text-xs py-3 font-semibold mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" /> Authorize &amp; Link Account
                    </button>
                  </div>
                )}

                {connectStep === 'authenticating' && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <span className="absolute inset-0 rounded-full bg-[#7c3aed]/10 animate-ping" />
                      <div className="w-16 h-16 rounded-full bg-[rgba(124,58,237,0.05)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center relative">
                        <Loader2 className="w-8 h-8 text-[#a78bfa] animate-spin" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">Handshaking securely...</p>
                      <p className="text-xs text-[#6b7280] mt-1">Requesting permissions from {platformNames[connectPlatformId] || connectPlatformId}</p>
                    </div>
                  </div>
                )}

                {connectStep === 'success' && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
                    >
                      <Check className="w-8 h-8" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Connection Successful!</p>
                      <p className="text-xs text-[#6b7280] mt-1">@{usernameInput} is now fully bound to PulseSync</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Disconnect Confirmation Dialog */}
      <AnimatePresence>
        {showDisconnectModal && disconnectPlatformId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0a0a1a]/95 border border-red-500/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] glass-card"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Disconnect Channel?</h3>
                  <p className="text-xs text-[#9ca3af] mt-1.5 leading-relaxed">
                    Are you sure you want to disconnect your <strong>{platformNames[disconnectPlatformId] || disconnectPlatformId}</strong> account? You won&apos;t be able to publish posts here with one click.
                  </p>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setShowDisconnectModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(124,58,237,0.15)] text-[#e0e0e5] text-xs font-semibold hover:bg-[rgba(124,58,237,0.06)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDisconnect}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shadow-md shadow-red-500/15 cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
