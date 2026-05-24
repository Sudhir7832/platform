'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Sparkles,
  Hash,
  Clock,
  Send,
  Save,
  X,
  Smile,
  AtSign,
  MapPin,
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Repeat2,
  Zap,
  Upload,
  Lock,
  Shield,
  Loader2,
  Check,
} from 'lucide-react';
import { platformColors, platformNames } from '@/lib/utils';

const platforms = [
  { id: 'twitter', name: 'X / Twitter', color: '#1DA1F2' },
];

const hashtagSuggestions = [
  '#AIContent', '#ContentCreator', '#DigitalMarketing', '#SocialMediaTips',
  '#CreatorEconomy', '#VideoMarketing', '#BrandStrategy', '#ViralContent',
];

const characterLimits: Record<string, number> = {
  twitter: 280,
};

export default function ComposePage() {
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);
  const [previewPlatform, setPreviewPlatform] = useState('twitter');
  const [showHashtags, setShowHashtags] = useState(false);

  const { connectedAccounts, publishPost, connectPlatform } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // OAuth Simulation state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectPlatformId, setConnectPlatformId] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [connectStep, setConnectStep] = useState<'details' | 'authenticating' | 'success'>('details');

  // Listen for secure OAuth popups message callbacks in Compose Page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOAuthMessage = async (e: MessageEvent) => {
      if (e.data?.type === 'oauth-success' && e.data?.platform === 'twitter') {
        const { platform, username } = e.data;
        try {
          await connectPlatform(platform, username);
          setPublishMessage({
            text: `Successfully connected X/Twitter account: ${username}!`,
            type: 'success'
          });
          setSelectedPlatforms([platform]);
        } catch (err: any) {
          setPublishMessage({ text: err.message || 'Connection failed', type: 'error' });
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [connectPlatform]);

  // Multi-platform publishing animation state
  const [publishingOverlayOpen, setPublishingOverlayOpen] = useState(false);
  const [publishingProgress, setPublishingProgress] = useState<Record<string, 'pending' | 'posting' | 'done'>>({});

  const handlePublish = async (isScheduled = false) => {
    if (!caption) return;
    
    // Filter out only connected selected platforms
    const activeConnected = selectedPlatforms.filter(p => connectedAccounts.find(a => a.platform === p)?.connected);
    
    if (activeConnected.length === 0) {
      setPublishMessage({
        text: 'None of the selected platforms are connected! Please connect accounts or click to attach them first.',
        type: 'error'
      });
      return;
    }

    if (isScheduled) {
      try {
        setPublishing(true);
        setPublishMessage(null);
        const scheduledTime = new Date(Date.now() + 24 * 3600000).toISOString();
        await publishPost(caption, activeConnected, scheduledTime);
        setPublishMessage({
          text: 'Post successfully scheduled across your connected channels!',
          type: 'success'
        });
        setCaption('');
      } catch (err: any) {
        setPublishMessage({ text: err.message || 'Publishing failed.', type: 'error' });
      } finally {
        setPublishing(false);
      }
      return;
    }

    // Dynamic simulated publishing overlay animation!
    try {
      setPublishing(true);
      setPublishMessage(null);
      
      const progressMap: Record<string, 'pending' | 'posting' | 'done'> = {};
      activeConnected.forEach(p => {
        progressMap[p] = 'pending';
      });
      setPublishingProgress(progressMap);
      setPublishingOverlayOpen(true);

      // Simulate sequential delivery to each platform
      for (const p of activeConnected) {
        setPublishingProgress(prev => ({ ...prev, [p]: 'posting' }));
        await new Promise(resolve => setTimeout(resolve, 1200));
        setPublishingProgress(prev => ({ ...prev, [p]: 'done' }));
      }

      await publishPost(caption, activeConnected);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublishingOverlayOpen(false);
      
      setPublishMessage({
        text: 'Post successfully published in a single click across all selected platforms!',
        type: 'success'
      });
      setCaption('');
    } catch (err: any) {
      setPublishingOverlayOpen(false);
      setPublishMessage({ text: err.message || 'Publishing failed.', type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  const executeConnect = async () => {
    if (!connectPlatformId || !usernameInput) return;
    try {
      setConnectStep('authenticating');
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      await connectPlatform(connectPlatformId, usernameInput);
      setConnectStep('success');
      
      setSelectedPlatforms((prev) => 
        prev.includes(connectPlatformId) ? prev : [...prev, connectPlatformId]
      );
      
      setTimeout(() => {
        setShowConnectModal(false);
        setConnectPlatformId(null);
        setConnectStep('details');
        setPublishMessage({
          text: `${platformNames[connectPlatformId] || connectPlatformId} account successfully connected and selected!`,
          type: 'success'
        });
      }, 1500);
    } catch (err: any) {
      setConnectStep('details');
      setPublishMessage({ text: err.message || 'Connection failed', type: 'error' });
    }
  };

  const togglePlatform = (id: string) => {
    const accountInfo = connectedAccounts.find((a) => a.platform === id);
    const isConnected = accountInfo?.connected;

    if (!isConnected) {
      if (id === 'twitter') {
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
      setConnectPlatformId(id);
      setUsernameInput(id === 'linkedin' ? 'PulseSync Inc.' : '@pulsesync');
      setConnectStep('details');
      setShowConnectModal(true);
      return;
    }

    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const addHashtag = (tag: string) => {
    setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const minLimit = selectedPlatforms.reduce(
    (min, p) => Math.min(min, characterLimits[p] || 9999),
    9999
  );

  const isOverLimit = caption.length > minLimit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Create Post</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Compose and publish across platforms</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Viral Score Mini */}
          <div className="glass-card px-3 py-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#a78bfa]" />
            <span className="text-sm font-semibold text-white">{Math.min(Math.floor(caption.length / 3), 100)}</span>
            <span className="text-[10px] text-[#6b7280]">/ 100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="space-y-5">
          {/* Caption Textarea */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Caption</h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-[#a78bfa] transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-[#a78bfa] transition-colors">
                  <AtSign className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-[#a78bfa] transition-colors">
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind? Write your caption here..."
              rows={6}
              className="w-full bg-[#0a0a1a]/60 border border-[rgba(124,58,237,0.1)] rounded-xl p-4 text-sm text-white placeholder:text-[#6b7280] resize-none focus:border-[#7c3aed] focus:ring-0 transition-colors"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                {selectedPlatforms.map((p) => (
                  <span
                    key={p}
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      caption.length > (characterLimits[p] || 9999) ? 'bg-red-500/15 text-red-400' : 'bg-[rgba(124,58,237,0.1)] text-[#9ca3af]'
                    }`}
                  >
                    {(platformNames[p] || p).slice(0, 2)} {caption.length}/{characterLimits[p]}
                  </span>
                ))}
              </div>
              {isOverLimit && (
                <span className="text-[11px] text-red-400 font-medium">Over character limit</span>
              )}
            </div>
          </div>

          {/* Media Upload */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Media</h3>
            <motion.div
              whileHover={{ borderColor: 'rgba(124,58,237,0.4)' }}
              className="border-2 border-dashed border-[rgba(124,58,237,0.15)] rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[rgba(124,58,237,0.04)] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[rgba(124,58,237,0.1)] flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#a78bfa]" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white font-medium">Drop files or click to upload</p>
                <p className="text-xs text-[#6b7280] mt-1">PNG, JPG, GIF, MP4 up to 50MB</p>
              </div>
              <div className="flex gap-2 mt-1">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.1)] text-[#a78bfa] text-xs font-medium hover:bg-[rgba(124,58,237,0.2)] transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> Photo
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(59,130,246,0.1)] text-[#3b82f6] text-xs font-medium hover:bg-[rgba(59,130,246,0.2)] transition-colors">
                  <Video className="w-3.5 h-3.5" /> Video
                </button>
              </div>
            </motion.div>
          </div>

          {/* Platform Selection */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Platforms</h3>
            <div className="grid grid-cols-1 gap-2">
              {platforms.map((platform) => {
                const selected = selectedPlatforms.includes(platform.id);
                const accountInfo = connectedAccounts.find((a) => a.platform === platform.id);
                const isConnected = accountInfo?.connected;
                return (
                  <motion.button
                    key={platform.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all relative ${
                      selected
                        ? 'border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.1)]'
                        : 'border-transparent bg-[rgba(124,58,237,0.03)] hover:bg-[rgba(124,58,237,0.06)]'
                    }`}
                    style={selected ? { boxShadow: `0 0 16px ${platform.color}25` } : {}}
                  >
                    {/* Connection indicator dot */}
                    <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-gray-600'}`} />

                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: selected ? platform.color : `${platform.color}30` }}
                    >
                      {platform.name[0]}
                    </div>
                    <span className={`text-[10px] font-medium ${selected ? 'text-white' : 'text-[#6b7280]'}`}>
                      {platform.name.split(' ')[0]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Hashtag Suggestions */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#06b6d4]" />
                <h3 className="text-sm font-semibold text-white">Hashtag Suggestions</h3>
              </div>
              <button onClick={() => setShowHashtags(!showHashtags)}>
                <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform ${showHashtags ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <AnimatePresence>
              {showHashtags && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 pt-1">
                    {hashtagSuggestions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addHashtag(tag)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(6,182,212,0.08)] text-[#06b6d4] border border-[rgba(6,182,212,0.15)] hover:bg-[rgba(6,182,212,0.15)] transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Rewrite + Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[rgba(124,58,237,0.2)] text-[#a78bfa] text-sm font-medium hover:border-[rgba(124,58,237,0.4)] transition-colors"
            >
              <Sparkles className="w-4 h-4" /> AI Rewrite
            </motion.button>
            <button
              onClick={() => alert('Draft saved successfully!')}
              className="btn-secondary text-sm py-2.5 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button
              onClick={() => handlePublish(true)}
              disabled={publishing || !caption}
              className="btn-secondary text-sm py-2.5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Clock className="w-4 h-4" /> Schedule
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePublish(false)}
              disabled={publishing || !caption}
              className="btn-primary text-sm py-2.5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Publish Now
            </motion.button>
          </div>

          {/* Toast Notification for publishing status */}
          <AnimatePresence>
            {publishMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
                  publishMessage.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{publishMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Side */}
        <div className="space-y-4">
          {/* Platform Tabs */}
          <div className="glass-card p-1.5 flex gap-1">
            {selectedPlatforms.map((p) => (
              <button
                key={p}
                onClick={() => setPreviewPlatform(p)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  previewPlatform === p
                    ? 'bg-[rgba(124,58,237,0.15)] text-white'
                    : 'text-[#6b7280] hover:text-white'
                }`}
              >
                {(platformNames[p] || p).split('/')[0].trim()}
              </button>
            ))}
          </div>

          {/* Preview Frame */}
          <AnimatePresence mode="wait">
            <motion.div
              key={previewPlatform}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {previewPlatform === 'instagram' && (
                <InstagramPreview caption={caption} />
              )}
              {previewPlatform === 'twitter' && (
                <TwitterPreview caption={caption} />
              )}
              {previewPlatform === 'linkedin' && (
                <LinkedInPreview caption={caption} />
              )}
              {!['instagram', 'twitter', 'linkedin'].includes(previewPlatform) && (
                <GenericPreview caption={caption} platform={previewPlatform} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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

      {/* Simulated High-Fidelity Single-Click Publishing Dispatcher Overlay */}
      <AnimatePresence>
        {publishingOverlayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#0a0a1a]/95 border border-[rgba(124,58,237,0.25)] rounded-2xl p-6 shadow-[0_0_60px_rgba(124,58,237,0.2)] text-center space-y-6"
            >
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.3)] mx-auto">
                  <Send className="w-7 h-7 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white">Publishing in Single Click...</h3>
                <p className="text-xs text-[#6b7280]">Dispatching API payloads simultaneously to selected platforms</p>
              </div>

              {/* Progress checklist */}
              <div className="space-y-2.5 max-w-sm mx-auto text-left bg-[#050510]/50 border border-[rgba(124,58,237,0.08)] rounded-xl p-4">
                {Object.entries(publishingProgress).map(([platform, status]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ background: platformColors[platform] || '#6b7280' }}
                      >
                        {(platformNames[platform] || platform)[0]}
                      </div>
                      <span className="text-xs font-medium text-[#e0e0e5]">
                        {platformNames[platform] || platform}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {status === 'pending' && (
                        <span className="text-[10px] text-[#6b7280]">Queued</span>
                      )}
                      {status === 'posting' && (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-[#06b6d4] animate-spin" />
                          <span className="text-[10px] text-[#06b6d4] font-medium">Publishing...</span>
                        </>
                      )}
                      {status === 'done' && (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-[10px] text-green-400 font-semibold">Live</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-[#6b7280] font-mono flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-[#7c3aed]" />
                <span>Encrypted delivery channels active</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InstagramPreview({ caption }: { caption: string }) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-[rgba(124,58,237,0.08)]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E4405F] to-[#F77737] flex items-center justify-center text-white text-xs font-bold">
          SJ
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">pulsesync</p>
          <p className="text-[10px] text-[#6b7280]">Sponsored</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-[#6b7280]" />
      </div>
      {/* Image placeholder */}
      <div className="aspect-square bg-[#12122a] flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 text-[#2a2a4a] mx-auto mb-2" />
          <p className="text-xs text-[#6b7280]">Image preview</p>
        </div>
      </div>
      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-[#e0e0e5] cursor-pointer hover:text-[#E4405F] transition-colors" />
            <MessageCircle className="w-6 h-6 text-[#e0e0e5] cursor-pointer" />
            <Send className="w-6 h-6 text-[#e0e0e5] cursor-pointer" />
          </div>
          <Bookmark className="w-6 h-6 text-[#e0e0e5] cursor-pointer" />
        </div>
        <p className="text-xs font-semibold text-white mb-1">1,247 likes</p>
        <p className="text-xs text-[#e0e0e5]">
          <span className="font-semibold">pulsesync</span>{' '}
          {caption || <span className="text-[#6b7280] italic">Your caption will appear here...</span>}
        </p>
        <p className="text-[10px] text-[#6b7280] mt-1">2 HOURS AGO</p>
      </div>
    </div>
  );
}

function TwitterPreview({ caption }: { caption: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white text-sm font-bold shrink-0">
          SJ
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-white">Sarah Johnson</span>
            <span className="text-sm text-[#6b7280]">@sarahjohnson</span>
            <span className="text-sm text-[#6b7280]">· 2h</span>
          </div>
          <p className="text-sm text-[#e0e0e5] mb-3 whitespace-pre-wrap">
            {caption || <span className="text-[#6b7280] italic">Your tweet will appear here...</span>}
          </p>
          {caption.length > 280 && (
            <p className="text-xs text-red-400 mb-2">⚠️ Exceeds 280 character limit</p>
          )}
          <div className="flex items-center justify-between text-[#6b7280] max-w-[320px]">
            <button className="flex items-center gap-1.5 text-xs hover:text-[#1DA1F2] transition-colors">
              <MessageCircle className="w-4 h-4" /> 42
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-green-400 transition-colors">
              <Repeat2 className="w-4 h-4" /> 128
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-[#E4405F] transition-colors">
              <Heart className="w-4 h-4" /> 847
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-[#1DA1F2] transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ caption }: { caption: string }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#3b82f6] flex items-center justify-center text-white font-bold">
            SJ
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Sarah Johnson</p>
            <p className="text-xs text-[#6b7280]">Product Marketing Manager at PulseSync</p>
            <p className="text-[11px] text-[#6b7280]">2h • 🌐</p>
          </div>
        </div>
        <p className="text-sm text-[#e0e0e5] whitespace-pre-wrap">
          {caption || <span className="text-[#6b7280] italic">Your LinkedIn post will appear here...</span>}
        </p>
      </div>
      {/* Engagement bar */}
      <div className="px-4 py-2 border-t border-[rgba(124,58,237,0.08)]">
        <div className="flex items-center gap-1 text-xs text-[#6b7280] mb-2">
          <span>👍💡 234</span>
          <span className="mx-auto" />
          <span>56 comments</span>
          <span>·</span>
          <span>12 reposts</span>
        </div>
        <div className="flex items-center justify-around pt-2 border-t border-[rgba(124,58,237,0.06)]">
          {[
            { icon: ThumbsUp, label: 'Like' },
            { icon: MessageCircle, label: 'Comment' },
            { icon: Repeat2, label: 'Repost' },
            { icon: Send, label: 'Send' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6b7280] hover:text-white hover:bg-[rgba(124,58,237,0.08)] rounded-lg transition-colors"
              >
                <Icon className="w-4 h-4" /> {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GenericPreview({ caption, platform }: { caption: string; platform: string }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: platformColors[platform] || '#6b7280' }}
        >
          {(platformNames[platform] || platform)[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{platformNames[platform] || platform} Preview</p>
          <p className="text-xs text-[#6b7280]">@pulsesync</p>
        </div>
      </div>
      <p className="text-sm text-[#e0e0e5] whitespace-pre-wrap">
        {caption || <span className="text-[#6b7280] italic">Your post will appear here...</span>}
      </p>
    </div>
  );
}
