'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  PenSquare,
  Calendar,
  BarChart3,
  Bot,
  Users,
  Settings,
  Hash,
  Sparkles,
  FileText,
  Zap,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: Command[] = [
    { id: 'nav-dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, shortcut: 'G D', action: () => router.push('/dashboard') },
    { id: 'nav-compose', label: 'Create New Post', category: 'Navigation', icon: PenSquare, shortcut: 'G C', action: () => router.push('/dashboard/compose') },
    { id: 'nav-calendar', label: 'View Calendar', category: 'Navigation', icon: Calendar, shortcut: 'G K', action: () => router.push('/dashboard/calendar') },
    { id: 'nav-analytics', label: 'View Analytics', category: 'Navigation', icon: BarChart3, shortcut: 'G A', action: () => router.push('/dashboard/analytics') },
    { id: 'nav-ai', label: 'AI Assistant', category: 'Navigation', icon: Bot, shortcut: 'G I', action: () => router.push('/dashboard/ai-assistant') },
    { id: 'nav-team', label: 'Team Management', category: 'Navigation', icon: Users, action: () => router.push('/dashboard/team') },
    { id: 'nav-settings', label: 'Settings', category: 'Navigation', icon: Settings, shortcut: 'G S', action: () => router.push('/dashboard/settings') },
    { id: 'act-generate', label: 'Generate AI Caption', category: 'Actions', icon: Sparkles, action: () => router.push('/dashboard/compose') },
    { id: 'act-hashtags', label: 'Find Trending Hashtags', category: 'Actions', icon: Hash, action: () => router.push('/dashboard/ai-assistant') },
    { id: 'act-drafts', label: 'View Drafts', category: 'Actions', icon: FileText, action: () => router.push('/dashboard/compose') },
    { id: 'act-viral', label: 'Check Viral Score', category: 'Actions', icon: Zap, action: () => router.push('/dashboard/compose') },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const categories = [...new Set(filtered.map((c) => c.category))];

  const handleSelect = useCallback((cmd: Command) => {
    cmd.action();
    onClose();
    setQuery('');
  }, [onClose]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    setSelectedIndex(0);
    setQuery('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex, onClose, handleSelect]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[560px] bg-[#0d0d20]/95 backdrop-blur-xl border border-[rgba(124,58,237,0.2)] rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(124,58,237,0.15), 0 25px 50px rgba(0,0,0,0.5)' }}
          >
            {/* Search */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(124,58,237,0.1)]">
              <Search className="w-5 h-5 text-[#6b7280]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-[#6b7280] p-0"
              />
              <kbd className="px-2 py-1 text-[10px] font-mono text-[#6b7280] bg-[rgba(124,58,237,0.1)] rounded-md border border-[rgba(124,58,237,0.15)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-[#6b7280]">No results found</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category}>
                    <p className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
                      {category}
                    </p>
                    {filtered
                      .filter((c) => c.category === category)
                      .map((cmd) => {
                        const globalIndex = filtered.indexOf(cmd);
                        const Icon = cmd.icon;
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => handleSelect(cmd)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                              globalIndex === selectedIndex
                                ? 'bg-[rgba(124,58,237,0.12)] text-white'
                                : 'text-[#9ca3af] hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="flex-1 text-sm">{cmd.label}</span>
                            {cmd.shortcut && (
                              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#6b7280] bg-[rgba(124,58,237,0.08)] rounded border border-[rgba(124,58,237,0.1)]">
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-[rgba(124,58,237,0.1)] flex items-center gap-4 text-[10px] text-[#6b7280]">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-[rgba(124,58,237,0.08)] rounded text-[9px] font-mono">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-[rgba(124,58,237,0.08)] rounded text-[9px] font-mono">↵</kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-[rgba(124,58,237,0.08)] rounded text-[9px] font-mono">ESC</kbd> Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
