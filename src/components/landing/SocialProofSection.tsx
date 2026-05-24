'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';
import { IconInstagram, IconTwitterX, IconLinkedin, IconFacebook, IconYoutube } from './SocialIcons';
import { landingStats, testimonials } from '@/lib/mock-data';

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return n.toString();
  };

  return (
    <div ref={ref}>
      <span className="text-4xl sm:text-5xl font-extrabold gradient-text">
        {formatCount(count)}{suffix}
      </span>
    </div>
  );
}

const platformLogos = [
  { icon: IconInstagram, name: 'Instagram', color: '#E4405F' },
  { icon: IconTwitterX, name: 'X / Twitter', color: '#1DA1F2' },
  { icon: IconLinkedin, name: 'LinkedIn', color: '#0A66C2' },
  { icon: IconFacebook, name: 'Facebook', color: '#1877F2' },
  { icon: IconYoutube, name: 'YouTube', color: '#FF0000' },
];

export default function SocialProofSection() {
  return (
    <section id="testimonials" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.06),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-[#06b6d4] tracking-wider uppercase mb-4">
            Social Proof
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Trusted by{' '}
            <span className="gradient-text">50,000+ creators</span>{' '}
            worldwide
          </h2>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {landingStats.map((stat) => (
            <div key={stat.label} className="glass-card p-6 text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-[#6b7280] mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 sm:p-8 group"
            >
              <Quote className="w-8 h-8 text-[#7c3aed]/30 mb-4" />
              <p className="text-[#9ca3af] leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-[#6b7280]">
                    {testimonial.role} · {testimonial.company}
                  </div>
                </div>
                <div className="ml-auto text-xs text-[#6b7280] glass px-2.5 py-1 rounded-full">
                  {testimonial.followers} followers
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Platform Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-center text-sm text-[#6b7280] mb-8">Works with all your favorite platforms</p>
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050510] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050510] to-transparent z-10" />

            <div className="flex animate-marquee">
              {[...platformLogos, ...platformLogos, ...platformLogos, ...platformLogos].map((platform, i) => (
                <div
                  key={`${platform.name}-${i}`}
                  className="flex items-center gap-3 mx-8 shrink-0"
                >
                  <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                  <span className="text-sm font-medium text-[#6b7280] whitespace-nowrap">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
