'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { pricingPlans } from '@/lib/mock-data';

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.08),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-semibold text-[#a78bfa] tracking-wider uppercase mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Simple,{' '}
            <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto mb-8">
            Start free. Upgrade when you&apos;re ready. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors ${!annual ? 'text-white' : 'text-[#6b7280]'}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                annual
                  ? 'bg-gradient-to-r from-[#7c3aed] to-[#3b82f6]'
                  : 'bg-[rgba(124,58,237,0.2)]'
              }`}
              aria-label="Toggle annual pricing"
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  annual ? 'translate-x-7.5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${annual ? 'text-white' : 'text-[#6b7280]'}`}>
              Annual
            </span>
            {annual && (
              <span className="text-xs font-semibold text-[#06b6d4] glass px-2.5 py-1 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative glass-card p-8 flex flex-col ${
                plan.highlighted
                  ? 'gradient-border glow-purple md:-mt-4 md:mb-0 md:py-10'
                  : ''
              }`}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#3b82f6] text-white text-xs font-semibold shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                    <Star className="w-3 h-3" fill="currentColor" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-[#a78bfa]' : 'text-white'}`}>
                {plan.name}
              </h3>
              <p className="text-sm text-[#6b7280] mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ${annual ? plan.yearlyPrice : plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-[#6b7280]">/month</span>
                  )}
                </div>
                {annual && plan.price > 0 && (
                  <p className="text-xs text-[#6b7280] mt-1">
                    Billed annually · <span className="text-[#06b6d4]">${(plan.price - plan.yearlyPrice) * 12} saved/year</span>
                  </p>
                )}
              </div>

              {/* CTA */}
              <button
                className={`w-full mb-8 ${
                  plan.highlighted
                    ? 'btn-primary !py-3.5 text-base'
                    : 'btn-secondary !py-3.5 text-base'
                }`}
              >
                {plan.cta}
              </button>

              {/* Features */}
              <div className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      plan.highlighted
                        ? 'bg-[#7c3aed]/20 text-[#a78bfa]'
                        : 'bg-[rgba(124,58,237,0.1)] text-[#6b7280]'
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-[#9ca3af]">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
