'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Zap, ArrowRight, ArrowLeft, Sparkles, Check, Globe, HelpCircle, Users2 } from 'lucide-react';
import { platformColors, platformNames } from '@/lib/utils';
import Link from 'next/link';

const creatorTypes = [
  { value: 'personal', label: 'Solo Creator', desc: 'Independently scaling personal brands.' },
  { value: 'business', label: 'Business Brand', desc: 'Growing leads, products, and communities.' },
  { value: 'agency', label: 'Marketing Agency', desc: 'Managing multiple profiles for clients.' },
  { value: 'ecommerce', label: 'E-commerce Brand', desc: 'Driving online store sales and traffic.' },
];

const targetPlatforms = ['twitter'];

export default function OnboardingPage() {
  const { user, refreshProfile, refreshWorkspaces } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameErrorText, setUsernameErrorText] = useState<string | null>(null);

  const [creatorType, setCreatorType] = useState('personal');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [goals, setGoals] = useState('');

  const router = useRouter();
  const supabase = createClient();

  // Load existing profile full name as default
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  // Username uniqueness check (debounced)
  useEffect(() => {
    if (!username) {
      setUsernameValid(null);
      setUsernameErrorText(null);
      return;
    }

    if (username.length < 3) {
      setUsernameValid(false);
      setUsernameErrorText('Too short (min 3 characters)');
      return;
    }

    if (username.length > 50) {
      setUsernameValid(false);
      setUsernameErrorText('Too long (max 50 characters)');
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const { data, error: queryError } = await supabase
          .from('users')
          .select('username')
          .eq('username', username.toLowerCase())
          .maybeSingle();

        if (queryError) {
          console.warn('Database username check returned error:', queryError);
          // If the table is missing or RLS is blocking, treat as valid to not block onboarding
          setUsernameValid(true);
          setUsernameErrorText(null);
          return;
        }

        // Safe check: only invalid if we actually got a matching user row
        if (data && data.username && data.username.toLowerCase() === username.toLowerCase()) {
          setUsernameValid(false);
          setUsernameErrorText('Username is already taken');
        } else {
          setUsernameValid(true);
          setUsernameErrorText(null);
        }
      } catch (err) {
        console.warn('Database username check failed, falling back to local validation:', err);
        setUsernameValid(true); // Fallback to allow progress
        setUsernameErrorText(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Handle workspace name changes to generate slug
  useEffect(() => {
    if (workspaceName) {
      setWorkspaceSlug(
        workspaceName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  }, [workspaceName]);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!fullName || !username || !usernameValid) return;
    }
    if (step === 2) {
      if (!creatorType || selectedPlatforms.length === 0) return;
    }
    setStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!user || !workspaceName || !workspaceSlug) return;

    try {
      setLoading(true);
      setError(null);

      // 1. Ensure user profile exists in public.users (trigger may not have fired for existing users)
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          full_name: fullName || user.user_metadata?.full_name || '',
          email: user.email || '',
          onboarding_completed: false,
        }, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      // 2. Check workspace slug uniqueness
      const { data: existingWorkspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('workspace_slug', workspaceSlug)
        .maybeSingle();

      if (existingWorkspace) {
        setError('This workspace slug is already taken. Try a different workspace name.');
        setLoading(false);
        return;
      }

      // 3. Insert Workspace
      const { data: newWorkspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          owner_id: user.id,
          workspace_name: workspaceName,
          workspace_slug: workspaceSlug,
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // 4. Update User Profile Onboarding details
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          username: username.toLowerCase(),
          onboarding_completed: true,
          bio: `Creator type: ${creatorType}. Goals: ${goals}`,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 5. Force auth state context to refresh
      await refreshProfile();
      await refreshWorkspaces();

      // 6. Success redirect
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Onboarding submit failed:', err);
      setError(err.message || 'Onboarding failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-[#f0f0f5] flex flex-col justify-between p-6 relative font-sans overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.06),transparent_50%)] pointer-events-none" />

      {/* HEADER LOGO */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full relative z-10 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="text-base font-bold gradient-text">PulseSync</span>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-6 bg-gradient-to-r from-[#7c3aed] to-[#3b82f6]'
                  : s < step
                  ? 'w-1.5 bg-[#7c3aed]'
                  : 'w-1.5 bg-[#1a1a2e]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CORE CONTENT */}
      <div className="flex-1 flex items-center justify-center max-w-xl mx-auto w-full relative z-10 py-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-6"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[rgba(124,58,237,0.1)] text-[#a78bfa] border border-[rgba(124,58,237,0.15)]">
                  <Sparkles className="w-3 h-3" /> Step 1: Customize Profile
                </span>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Create your identity</h1>
                    <p className="text-sm text-[#9ca3af]">Let&apos;s build your custom public profile credentials.</p>
                  </div>

                </div>
              </div>

              <div className="space-y-4 glass-card p-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9ca3af]">Full name</label>
                  <input
                    type="text"
                    required
                    suppressHydrationWarning={true}
                    placeholder="Sarah Johnson"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0d0d20] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm outline-none text-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-[#6b7280]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#9ca3af]">Pick a username</label>
                    {username && (
                      <span className="text-[10px] font-medium leading-none">
                        {usernameChecking ? (
                          <span className="text-gray-500">Checking...</span>
                        ) : usernameValid === true ? (
                          <span className="text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Available</span>
                        ) : usernameValid === false ? (
                          <span className="text-red-400">{usernameErrorText || 'Unavailable'}</span>
                        ) : null}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-sm text-[#6b7280]">@</span>
                    <input
                      type="text"
                      required
                      suppressHydrationWarning={true}
                      placeholder="sarah_creator"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                      className="w-full pl-8 pr-4 py-3 bg-[#0d0d20] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm outline-none text-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-[#6b7280]"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                disabled={!fullName || !username || !usernameValid || usernameChecking}
                className="btn-primary w-full text-xs font-semibold py-3 flex.items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue Onboarding
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-6"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[rgba(6,182,212,0.1)] text-[#06b6d4] border border-[rgba(6,182,212,0.15)]">
                  <HelpCircle className="w-3 h-3" /> Step 2: Content Strategy
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">How do you create?</h1>
                <p className="text-sm text-[#9ca3af]">Describe your focus and target channels to adapt dashboards.</p>
              </div>

              {/* Creator Categories selection */}
              <div className="space-y-4">
                <label className="text-xs font-semibold text-[#9ca3af]">I represent myself as a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {creatorTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setCreatorType(type.value)}
                      className={`glass-card p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between min-h-[100px] ${
                        creatorType === type.value
                          ? 'border-[#7c3aed] bg-[rgba(124,58,237,0.06)] shadow-purple'
                          : 'border-[rgba(124,58,237,0.12)]'
                      }`}
                    >
                      <h3 className="text-sm font-bold text-white leading-normal">{type.label}</h3>
                      <p className="text-[10px] text-[#6b7280] leading-relaxed mt-1">{type.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Targets selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#9ca3af]">Selected platforms I post on (Select at least one)</label>
                <div className="flex flex-wrap gap-2">
                  {targetPlatforms.map((p) => {
                    const active = selectedPlatforms.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          active
                            ? 'text-white border-transparent'
                            : 'text-[#9ca3af] border-[rgba(124,58,237,0.15)] hover:border-[#7c3aed]'
                        }`}
                        style={{
                          background: active ? platformColors[p] || '#7c3aed' : 'transparent',
                        }}
                      >
                        {platformNames[p] || p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrevStep}
                  className="btn-secondary w-1/3 text-xs font-semibold py-3 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={selectedPlatforms.length === 0}
                  className="btn-primary flex-1 text-xs font-semibold py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  Configure Workspace
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-6"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[rgba(167,139,250,0.1)] text-[#a78bfa] border border-[rgba(167,139,250,0.15)]">
                  <Users2 className="w-3 h-3" /> Step 3: Establish Workspace
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Provision Workspace</h1>
                <p className="text-sm text-[#9ca3af]">Setup your brand domain container. We will deploy posts under it.</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs"
                  >
                    <span className="leading-normal">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4 glass-card p-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9ca3af]">Workspace Name</label>
                  <input
                    type="text"
                    required
                    suppressHydrationWarning={true}
                    placeholder="My Creative Studio"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-[#0d0d20] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm outline-none text-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-[#6b7280]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-[#9ca3af]">Workspace Domain URL Slug</label>
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 w-4 h-4 text-[#6b7280]" />
                    <input
                      type="text"
                      required
                      suppressHydrationWarning={true}
                      placeholder="my-creative-studio"
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 bg-[#0d0d20] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm outline-none text-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-[#6b7280]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#9ca3af]">Workspace Goals (Optional)</label>
                  <input
                    type="text"
                    suppressHydrationWarning={true}
                    placeholder="Schedule daily updates and track conversion clicks..."
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-[#0d0d20] border border-[rgba(124,58,237,0.15)] rounded-xl text-sm outline-none text-white focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-[#6b7280]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrevStep}
                  disabled={loading}
                  className="btn-secondary w-1/3 text-xs font-semibold py-3 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !workspaceName || !workspaceSlug}
                  className="btn-primary flex-1 text-xs font-semibold py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Deploying Setup...' : 'Finalize & Launch'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="text-center text-[10px] text-[#6b7280] py-4 relative z-10">
        Signed in as <span className="text-[#9ca3af]">{user?.email}</span>. Need assistance? <a href="#" className="hover:text-white transition-colors">Contact Creator Support</a>
      </div>
    </div>
  );
}
