'use client';

import { motion } from 'framer-motion';
import { Zap, Send } from 'lucide-react';
import { IconInstagram, IconTwitterX, IconLinkedin, IconFacebook, IconYoutube } from './SocialIcons';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Integrations', 'Changelog', 'API Docs', 'Status'],
  Company: ['About Us', 'Careers', 'Blog', 'Press Kit', 'Partners', 'Contact'],
  Resources: ['Help Center', 'Tutorials', 'Community', 'Templates', 'Webinars', 'Case Studies'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security', 'Licenses'],
};

const socialLinks = [
  { icon: IconInstagram, href: '#', label: 'Instagram', color: '#E4405F' },
  { icon: IconTwitterX, href: '#', label: 'Twitter', color: '#1DA1F2' },
  { icon: IconLinkedin, href: '#', label: 'LinkedIn', color: '#0A66C2' },
  { icon: IconFacebook, href: '#', label: 'Facebook', color: '#1877F2' },
  { icon: IconYoutube, href: '#', label: 'YouTube', color: '#FF0000' },
];

export default function FooterSection() {
  return (
    <footer className="relative pt-24 pb-8">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to <span className="gradient-text">supercharge</span> your socials?
          </h2>
          <p className="text-[#9ca3af] mb-8 max-w-lg mx-auto">
            Join 50,000+ creators and businesses growing their audience with PulseSync.
          </p>
          <a href="/signup" className="btn-primary text-base !px-8 !py-4 inline-flex items-center gap-2">
            Start Free Today
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </motion.div>

        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Brand column */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold gradient-text">PulseSync</span>
            </a>
            <p className="text-sm text-[#6b7280] mb-6 max-w-xs leading-relaxed">
              The all-in-one AI-powered social media publishing platform. Create, schedule, and optimize your content everywhere.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 glass rounded-lg flex items-center justify-center text-[#6b7280] hover:text-white hover:border-[rgba(124,58,237,0.3)] transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-[#6b7280] hover:text-[#a78bfa] transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="glass-card p-6 sm:p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Stay in the loop</h4>
              <p className="text-sm text-[#6b7280]">Get product updates, tips, and social media insights delivered weekly.</p>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 sm:w-64 glass !bg-[rgba(13,13,32,0.8)] !rounded-xl text-sm"
              />
              <button className="btn-primary !py-2.5 !px-5 flex items-center gap-2 text-sm shrink-0">
                <Send className="w-4 h-4" />
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(124,58,237,0.1)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6b7280]">
            © {new Date().getFullYear()} PulseSync. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-[#6b7280] hover:text-[#a78bfa] transition-colors">Privacy</a>
            <a href="#" className="text-xs text-[#6b7280] hover:text-[#a78bfa] transition-colors">Terms</a>
            <a href="#" className="text-xs text-[#6b7280] hover:text-[#a78bfa] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
