'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Clock,
  Plus,
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';
import { calendarEvents } from '@/lib/mock-data';
import { useAuth } from '@/hooks/useAuth';
import { platformColors, platformNames } from '@/lib/utils';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { posts } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [direction, setDirection] = useState(0);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart.getTime(), calendarEnd.getTime()]
  );

  const dynamicEvents = useMemo(() => {
    const mapped = posts.map((p) => {
      const dateStr = p.scheduled_at || p.published_at || p.created_at;
      const date = new Date(dateStr);
      const colors = ["#7c3aed", "#3b82f6", "#06b6d4", "#a78bfa", "#6366f1"];
      const hashCode = p.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return {
        id: p.id,
        title: p.content.slice(0, 30) + (p.content.length > 30 ? '...' : ''),
        date,
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }),
        platforms: p.platforms,
        status: p.status,
        color: colors[hashCode % colors.length]
      };
    });
    return [...mapped, ...calendarEvents];
  }, [posts]);

  const navigateMonth = (dir: number) => {
    setDirection(dir);
    setCurrentMonth((prev) => (dir > 0 ? addMonths(prev, 1) : subMonths(prev, 1)));
    setSelectedDate(null);
  };

  const getEventsForDay = (day: Date) => {
    return dynamicEvents.filter((e) => isSameDay(e.date, day));
  };

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

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
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Plan and schedule your content</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="glass-card p-1 flex gap-1">
            <button
              onClick={() => setView('month')}
              className={`p-2 rounded-lg transition-all ${
                view === 'month'
                  ? 'bg-[rgba(124,58,237,0.15)] text-[#a78bfa]'
                  : 'text-[#6b7280] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('week')}
              className={`p-2 rounded-lg transition-all ${
                view === 'week'
                  ? 'bg-[rgba(124,58,237,0.15)] text-[#a78bfa]'
                  : 'text-[#6b7280] hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary text-sm py-2.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Post
          </motion.button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="glass-card p-4 flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-xl hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-xl hover:bg-[rgba(124,58,237,0.1)] text-[#6b7280] hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2">
          <div className="glass-card overflow-hidden">
            {/* Week day headers */}
            <div className="grid grid-cols-7 border-b border-[rgba(124,58,237,0.08)]">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-xs font-semibold text-[#6b7280] uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <AnimatePresence mode="wait">
              <motion.div
                key={format(currentMonth, 'yyyy-MM')}
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -50 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-7"
              >
                {days.map((day) => {
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const events = getEventsForDay(day);
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileHover={{ backgroundColor: 'rgba(124,58,237,0.08)' }}
                      onClick={() => setSelectedDate(day)}
                      className={`relative p-2 min-h-[90px] border-b border-r border-[rgba(124,58,237,0.05)] text-left transition-colors ${
                        !inMonth ? 'opacity-30' : ''
                      } ${isSelected ? 'bg-[rgba(124,58,237,0.1)]' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                            today
                              ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white'
                              : inMonth
                              ? 'text-[#e0e0e5]'
                              : 'text-[#4a4a5a]'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>
                      {/* Event dots / pills */}
                      <div className="space-y-1">
                        {events.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium truncate"
                            style={{
                              background: `${event.color}20`,
                              color: event.color,
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: event.color }}
                            />
                            <span className="truncate">{event.title}</span>
                          </div>
                        ))}
                        {events.length > 2 && (
                          <p className="text-[9px] text-[#6b7280] pl-1">+{events.length - 2} more</p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-4 h-4 text-[#a78bfa]" />
              <h3 className="text-sm font-semibold text-white">
                {selectedDate
                  ? format(selectedDate, 'EEEE, MMMM d')
                  : 'Select a date'}
              </h3>
            </div>

            {selectedDate && selectedEvents.length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="w-8 h-8 text-[#2a2a4a] mx-auto mb-2" />
                <p className="text-sm text-[#6b7280]">No posts scheduled</p>
                <button className="mt-3 text-xs text-[#a78bfa] font-medium hover:underline">
                  + Schedule a post
                </button>
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence>
                {selectedEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl bg-[rgba(124,58,237,0.05)] border-l-2 hover:bg-[rgba(124,58,237,0.08)] transition-colors cursor-pointer"
                    style={{ borderLeftColor: event.color }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-medium text-white">{event.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          event.status === 'published'
                            ? 'bg-green-500/10 text-green-400'
                            : event.status === 'scheduled'
                            ? 'bg-[rgba(6,182,212,0.12)] text-[#06b6d4]'
                            : 'bg-[rgba(124,58,237,0.12)] text-[#a78bfa]'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#6b7280]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.time}
                      </span>
                      <div className="flex -space-x-1">
                        {event.platforms.map((p) => (
                          <div
                            key={p}
                            className="w-5 h-5 rounded-full border border-[#0d0d20] flex items-center justify-center text-[7px] font-bold text-white"
                            style={{ background: platformColors[p] || '#6b7280' }}
                          >
                            {(platformNames[p] || p)[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Upcoming this week */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Upcoming This Week</h3>
            <div className="space-y-2">
              {dynamicEvents
                .filter((e) => e.status === 'scheduled')
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(124,58,237,0.06)] transition-colors cursor-pointer"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#e0e0e5] truncate">{event.title}</p>
                      <p className="text-[10px] text-[#6b7280]">
                        {format(event.date, 'MMM d')} at {event.time}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
