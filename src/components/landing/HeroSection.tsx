'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { IconInstagram, IconTwitterX, IconLinkedin, IconFacebook, IconYoutube } from './SocialIcons';

const floatingPlatforms = [
  { icon: IconInstagram, label: 'Instagram', color: '#E4405F', x: '10%', y: '20%', delay: 0 },
  { icon: IconTwitterX, label: 'X / Twitter', color: '#1DA1F2', x: '85%', y: '15%', delay: 0.2 },
  { icon: IconLinkedin, label: 'LinkedIn', color: '#0A66C2', x: '5%', y: '65%', delay: 0.4 },
  { icon: IconFacebook, label: 'Facebook', color: '#1877F2', x: '90%', y: '60%', delay: 0.6 },
  { icon: IconYoutube, label: 'YouTube', color: '#FF0000', x: '75%', y: '80%', delay: 0.8 },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

interface Particle {
  id: number;
  x: string;
  y: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function HeroSection() {
  const [particlesList, setParticlesList] = useState<Particle[]>([]);

  useEffect(() => {
    setParticlesList(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 4 + 4,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.5 + 0.1,
      }))
    );
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 aurora-bg" />

      {/* Radial gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1),transparent_50%)]" />

      {/* Floating particles */}
      {particlesList.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#a78bfa]"
          style={{
            left: p.x,
            top: p.y,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Floating platform cards */}
      {floatingPlatforms.map((platform) => (
        <motion.div
          key={platform.label}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: platform.delay + 0.8,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          className="absolute hidden lg:flex items-center gap-2 glass-card px-4 py-2.5 cursor-default"
          style={{
            left: platform.x,
            top: platform.y,
            animation: `float ${6 + platform.delay * 2}s ease-in-out ${platform.delay}s infinite`,
          }}
        >
          <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
          <span className="text-xs font-medium text-[#9ca3af]">{platform.label}</span>
        </motion.div>
      ))}

      {/* Hero Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse-glow" />
            <span className="text-[#9ca3af]">
              Now with <span className="text-[#a78bfa] font-semibold">AI-powered</span> content optimization
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6"
        >
          <span className="gradient-text">Post Everywhere.</span>
          <br />
          <span className="text-white">Grow Faster.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl md:text-2xl text-[#9ca3af] max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          One click publishing for every social platform. AI-powered content optimization
          for Instagram, X, LinkedIn, TikTok, and more.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="/signup" className="btn-primary text-base !px-8 !py-4 flex items-center gap-2 text-lg font-semibold">
            Start Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <button className="btn-secondary text-base !px-8 !py-4 flex items-center gap-2 text-lg">
            <Play className="w-5 h-5 text-[#a78bfa]" fill="currentColor" />
            Watch Demo
          </button>
        </motion.div>

        {/* Trust line */}
        <motion.div
          variants={itemVariants}
          className="mt-14 flex flex-col items-center gap-4"
        >
          <p className="text-sm text-[#6b7280]">Trusted by 50,000+ creators and businesses</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-[#9ca3af] ml-2">4.9/5 from 3,000+ reviews</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050510] to-transparent" />
    </section>
  );
}
