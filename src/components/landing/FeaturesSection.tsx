'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Clock,
  Repeat,
  Send,
  MessageCircle,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { features } from '@/lib/mock-data';

const iconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  zap: Zap,
  clock: Clock,
  repeat: Repeat,
  send: Send,
  'message-circle': MessageCircle,
  target: Target,
  'trending-up': TrendingUp,
};

const gradients = [
  'from-[#7c3aed] to-[#3b82f6]',
  'from-[#3b82f6] to-[#06b6d4]',
  'from-[#06b6d4] to-[#7c3aed]',
  'from-[#a78bfa] to-[#7c3aed]',
  'from-[#7c3aed] to-[#06b6d4]',
  'from-[#3b82f6] to-[#a78bfa]',
  'from-[#06b6d4] to-[#3b82f6]',
  'from-[#a78bfa] to-[#06b6d4]',
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-[#a78bfa] tracking-wider uppercase mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Supercharge your{' '}
            <span className="gradient-text">social presence</span>
          </h2>
          <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
            AI-powered tools designed to help you create, schedule, and optimize content across every platform.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Sparkles;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="glass-card p-6 group cursor-default"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center mb-5 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-shadow duration-300`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#a78bfa] transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
