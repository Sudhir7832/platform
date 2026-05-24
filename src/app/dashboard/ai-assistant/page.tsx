'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Target,
  PenSquare,
  ArrowRight,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Search,
} from 'lucide-react';
import { aiChatMessages, trendingHashtags } from '@/lib/mock-data';
import type { AIChatMessage } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils';

const quickActions = [
  { label: 'Write a post', icon: PenSquare },
  { label: 'Repurpose content', icon: RefreshCw },
  { label: 'Find trends', icon: TrendingUp },
  { label: 'Analyze competitor', icon: Target },
];

const competitors = [
  { name: 'Buffer', followers: '245K', engagement: '3.2%', posts: '12/week' },
  { name: 'Hootsuite', followers: '189K', engagement: '2.8%', posts: '15/week' },
  { name: 'Later', followers: '320K', engagement: '4.1%', posts: '8/week' },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<AIChatMessage[]>(aiChatMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tools'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          "Great question! I've analyzed your recent content performance and here are my suggestions:\n\n1. **Focus on video content** — Your Reels get 3x more engagement\n2. **Post more on Tuesdays and Thursdays** — These are your peak days\n3. **Use more storytelling** — Posts with personal stories perform 40% better\n\nWould you like me to draft some content based on these insights?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
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
          <Bot className="w-7 h-7 text-[#a78bfa]" />
          AI Assistant
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white rounded-full">Beta</span>
        </h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Your AI-powered content co-pilot</p>
      </div>

      {/* Tab Toggle */}
      <div className="glass-card p-1 flex gap-1 w-fit">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-[rgba(124,58,237,0.15)] text-white'
              : 'text-[#6b7280] hover:text-white'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'tools'
              ? 'bg-[rgba(124,58,237,0.15)] text-white'
              : 'text-[#6b7280] hover:text-white'
          }`}
        >
          Tools
        </button>
      </div>

      {activeTab === 'chat' ? (
        <div className="glass-card overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i < aiChatMessages.length ? 0 : 0.1, duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] ${
                    msg.role === 'user'
                      ? 'glass-card p-4 !bg-[rgba(124,58,237,0.1)] !border-[rgba(124,58,237,0.2)]'
                      : 'glass-card p-4 !bg-[rgba(6,182,212,0.05)] !border-[rgba(6,182,212,0.12)]'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#a78bfa]">PulseSync AI</span>
                    </div>
                  )}
                  <div className="text-sm text-[#e0e0e5] whitespace-pre-wrap leading-relaxed">
                    {msg.content.split('**').map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="text-white font-semibold">{part}</strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[rgba(124,58,237,0.08)]">
                      <button className="p-1.5 rounded-lg hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-white transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-green-400 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-red-400 transition-colors">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-[#4a4a5a] ml-auto">
                        {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <p className="text-[10px] text-[#4a4a5a] mt-2 text-right">
                      {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="glass-card p-3 !bg-[rgba(6,182,212,0.05)] !border-[rgba(6,182,212,0.12)] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#a78bfa] animate-spin" />
                    <span className="text-sm text-[#6b7280]">AI is thinking...</span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions */}
          <div className="px-5 py-2 border-t border-[rgba(124,58,237,0.08)]">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(124,58,237,0.06)] text-[#9ca3af] border border-[rgba(124,58,237,0.1)] hover:bg-[rgba(124,58,237,0.12)] hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5" /> {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[rgba(124,58,237,0.1)]">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask AI anything about your content..."
                className="flex-1 bg-[#0a0a1a] border border-[rgba(124,58,237,0.15)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#6b7280] focus:border-[#7c3aed] transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className="btn-primary px-4 py-3 !rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* Tools Panel */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Repurposer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-[#06b6d4]" />
              <h3 className="text-base font-semibold text-white">Content Repurposer</h3>
            </div>
            <p className="text-xs text-[#6b7280] mb-4">Transform content from one format to another</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#9ca3af] font-medium mb-1.5 block">Source Format</label>
                <select className="w-full bg-[#0a0a1a] border border-[rgba(124,58,237,0.15)] rounded-xl px-3 py-2.5 text-sm text-white">
                  <option>Blog Post</option>
                  <option>Tweet Thread</option>
                  <option>LinkedIn Article</option>
                  <option>Video Script</option>
                </select>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-[#6b7280] rotate-90" />
              </div>
              <div>
                <label className="text-xs text-[#9ca3af] font-medium mb-1.5 block">Target Format</label>
                <select className="w-full bg-[#0a0a1a] border border-[rgba(124,58,237,0.15)] rounded-xl px-3 py-2.5 text-sm text-white">
                  <option>Instagram Caption</option>
                  <option>Twitter Thread</option>
                  <option>LinkedIn Post</option>
                  <option>TikTok Script</option>
                </select>
              </div>
              <button className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Repurpose Content
              </button>
            </div>
          </motion.div>

          {/* Trend Discovery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#a78bfa]" />
              <h3 className="text-base font-semibold text-white">Trend Discovery</h3>
            </div>
            <p className="text-xs text-[#6b7280] mb-4">Trending topics across platforms</p>
            <div className="space-y-2.5">
              {trendingHashtags.slice(0, 5).map((tag, i) => (
                <motion.div
                  key={tag.tag}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[rgba(124,58,237,0.05)] hover:bg-[rgba(124,58,237,0.1)] transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{tag.tag}</p>
                    <p className="text-[11px] text-[#6b7280]">{formatNumber(tag.posts)} posts</p>
                  </div>
                  <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2 py-1 rounded-full">
                    +{tag.growth}%
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Competitor Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#06b6d4]" />
              <h3 className="text-base font-semibold text-white">Competitor Tracker</h3>
            </div>
            <p className="text-xs text-[#6b7280] mb-4">Monitor competitor performance</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {competitors.map((comp, i) => (
                <motion.div
                  key={comp.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="p-4 rounded-xl bg-[rgba(124,58,237,0.04)] border border-[rgba(124,58,237,0.08)] hover:border-[rgba(124,58,237,0.2)] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed]/30 to-[#3b82f6]/30 flex items-center justify-center text-white text-sm font-bold">
                      {comp.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{comp.name}</p>
                      <p className="text-[11px] text-[#6b7280]">Competitor</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-[#6b7280]">Followers</p>
                      <p className="text-sm font-semibold text-white">{comp.followers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6b7280]">Eng. Rate</p>
                      <p className="text-sm font-semibold text-white">{comp.engagement}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6b7280]">Frequency</p>
                      <p className="text-sm font-semibold text-white">{comp.posts}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
