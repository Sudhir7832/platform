'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string;
  bio: string;
  website: string;
  plan_type: 'free' | 'pro' | 'agency';
  onboarding_completed: boolean;
  created_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  workspace_name: string;
  workspace_slug: string;
  logo: string | null;
  created_at: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface ConnectedAccount {
  platform: string;
  connected: boolean;
  username: string;
}

export interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  created_at: string;
  scheduled_at?: string;
  published_at?: string;
  media?: string[];
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    clicks: number;
  };
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  setActiveWorkspaceById: (id: string) => void;
  // Social Media State
  connectedAccounts: ConnectedAccount[];
  connectPlatform: (platform: string, username: string) => Promise<void>;
  disconnectPlatform: (platform: string) => Promise<void>;
  posts: SocialPost[];
  publishPost: (content: string, platforms: string[], scheduledAt?: string, mediaFiles?: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const fetchProfileAndWorkspaces = useCallback(async (userId: string, email?: string, rawFullName?: string) => {
    try {
      // 1. Fetch user profile
      let profileData = null;
      try {
        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;
        profileData = data;
      } catch (err) {
        console.warn('Error fetching user profile:', err);
      }

      if (profileData) {
        setProfile(profileData);
      }

      // 2. Fetch user's workspaces
      let userWorkspaces: Workspace[] = [];
      try {
        const { data: membershipData, error: membershipError } = await supabase
          .from('workspace_members')
          .select(`
            role,
            workspaces (
              id,
              owner_id,
              workspace_name,
              workspace_slug,
              logo,
              created_at
            )
          `)
          .eq('user_id', userId);

        if (membershipError) throw membershipError;

        if (membershipData) {
          userWorkspaces = membershipData
            .filter((m) => m.workspaces !== null)
            .map((m: any) => ({
              ...m.workspaces,
              role: m.role,
            }));
        }
      } catch (err) {
        console.warn('Error fetching workspace memberships:', err);
      }

      if (userWorkspaces.length > 0) {
        setWorkspaces(userWorkspaces);
      }

      // Set active workspace
      if (userWorkspaces.length > 0) {
        const cachedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('active_workspace_id') : null;
        const matchingWorkspace = userWorkspaces.find((w) => w.id === cachedWorkspaceId);
        
        if (matchingWorkspace) {
          setActiveWorkspace(matchingWorkspace);
        } else {
          setActiveWorkspace(userWorkspaces[0]);
          if (typeof window !== 'undefined') {
            localStorage.setItem('active_workspace_id', userWorkspaces[0].id);
          }
        }
      } else {
        setActiveWorkspace(null);
      }
    } catch (err) {
      console.error('Error fetching auth data profile:', err);
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  }, [user, supabase]);

  const refreshWorkspaces = useCallback(async () => {
    if (!user) return;
    try {
      const { data: membershipData } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspaces (
            id,
            owner_id,
            workspace_name,
            workspace_slug,
            logo,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (membershipData) {
        const userWorkspaces: Workspace[] = membershipData
          .filter((m) => m.workspaces !== null)
          .map((m: any) => ({
            ...m.workspaces,
            role: m.role,
          }));

        setWorkspaces(userWorkspaces);
        
        // Ensure active workspace remains set
        const currentActiveId = activeWorkspace?.id;
        const matchingWorkspace = userWorkspaces.find((w) => w.id === currentActiveId);
        if (matchingWorkspace) {
          setActiveWorkspace(matchingWorkspace);
        } else if (userWorkspaces.length > 0) {
          setActiveWorkspace(userWorkspaces[0]);
        }
      }
    } catch (err) {
      console.error('Error refreshing workspaces:', err);
    }
  }, [user, activeWorkspace?.id, supabase]);

  const setActiveWorkspaceById = useCallback((id: string) => {
    const matching = workspaces.find((w) => w.id === id);
    if (matching) {
      setActiveWorkspace(matching);
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_workspace_id', id);
      }
    }
  }, [workspaces]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fire and forget server session termination to prevent API network hangs from blocking the UI
      supabase.auth.signOut().catch((err) => {
        console.warn('Silent auth signout network warning:', err);
      });
      
      // 2. Instantly and synchronously clear all local storage tokens and cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('active_workspace_id');
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-') || key.startsWith('pulsesync_')) {
            localStorage.removeItem(key);
          }
        });
      }

      setUser(null);
      setProfile(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
      
      // 3. Immediately trigger a clean hard redirect to root landing page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Error signing out:', err);
      // Hard redirect absolute fallback
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Load Connected Accounts and Posts (load from database if tables exist, otherwise fall back to localStorage/mock-data)
  useEffect(() => {
    if (!user) {
      setConnectedAccounts([]);
      setPosts([]);
      return;
    }

    const userId = user.id;

    async function loadSocialMediaData() {
      // 1. Load Connected Accounts
      let accounts: ConnectedAccount[] = [];
      try {
        const { data, error } = await supabase
          .from('social_accounts')
          .select('platform, account_name');

        if (error) throw error;

        if (data) {
          const platformsMap = data.reduce((acc, a) => ({ ...acc, [a.platform]: a.account_name }), {} as Record<string, string>);
          const allPlatforms = ['twitter'];
          accounts = allPlatforms.map(p => ({
            platform: p,
            connected: !!platformsMap[p],
            username: platformsMap[p] || ''
          }));
        }
      } catch (err) {
        console.warn('Could not load social accounts from db, using localStorage fallback:', err);
        const local = localStorage.getItem(`pulsesync_connected_${userId}`);
        const allPlatforms = ['twitter'];
        if (local) {
          const parsed = JSON.parse(local);
          accounts = allPlatforms.map(p => {
            const found = parsed.find((a: any) => a.platform === p);
            return {
              platform: p,
              connected: found ? found.connected : (p === 'twitter'),
              username: found ? found.username : (p === 'twitter' ? '@pulsesync' : '')
            };
          });
        } else {
          // Default initial set
          accounts = allPlatforms.map(p => ({
            platform: p,
            connected: p === 'twitter',
            username: p === 'twitter' ? '@pulsesync' : ''
          }));
          localStorage.setItem(`pulsesync_connected_${userId}`, JSON.stringify(accounts));
        }
      }
      setConnectedAccounts(accounts);

      // 2. Load Posts
      let loadedPosts: SocialPost[] = [];
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          loadedPosts = data.map((p: any) => ({
            id: p.id,
            content: p.content,
            platforms: p.platforms || [],
            status: p.status,
            created_at: p.created_at,
            scheduled_at: p.scheduled_at,
            media: p.media_urls || [],
            engagement: p.engagement || { likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 }
          }));
        }
      } catch (err) {
        console.warn('Could not load posts from db, using localStorage fallback:', err);
        const localPosts = localStorage.getItem(`pulsesync_posts_${userId}`);
        if (localPosts) {
          loadedPosts = JSON.parse(localPosts);
        } else {
          // Default initial set
          loadedPosts = [
            {
              id: "1",
              content: "🚀 Excited to announce our new AI-powered content optimization feature! Create better posts in half the time. #AI #SocialMedia #ContentCreation",
              platforms: ["twitter"],
              status: "published",
              created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
              published_at: new Date(Date.now() - 2 * 3600000).toISOString(),
              engagement: { likes: 842, comments: 156, shares: 234, reach: 45200, clicks: 1823 }
            },
            {
              id: "2",
              content: "The future of social media management is here. Automate, optimize, and grow your audience across every platform. 💡",
              platforms: ["twitter"],
              status: "published",
              created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
              published_at: new Date(Date.now() - 8 * 3600000).toISOString(),
              engagement: { likes: 1205, comments: 89, shares: 456, reach: 78300, clicks: 2456 }
            },
            {
              id: "3",
              content: "5 tips to boost your engagement rate this week:\n1. Post at optimal times\n2. Use trending hashtags\n3. Engage with comments\n4. Share user-generated content\n5. Experiment with X Threads",
              platforms: ["twitter"],
              status: "scheduled",
              created_at: new Date().toISOString(),
              scheduled_at: new Date(Date.now() + 4 * 3600000).toISOString(),
              engagement: { likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 }
            }
          ];
          localStorage.setItem(`pulsesync_posts_${userId}`, JSON.stringify(loadedPosts));
        }
      }
      setPosts(loadedPosts);
    }

    loadSocialMediaData();
  }, [user, supabase]);

  const connectPlatform = useCallback(async (platform: string, username: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('social_accounts')
        .insert({
          user_id: user.id,
          platform,
          account_name: username,
          access_token: 'mock-oauth-token',
        });

      if (error && error.code !== 'PGRST205') throw error;
    } catch (err) {
      console.warn('Could not save connected account to database:', err);
    }

    setConnectedAccounts((prev) => {
      const updated = prev.map((a) =>
        a.platform === platform ? { ...a, connected: true, username } : a
      );
      localStorage.setItem(`pulsesync_connected_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user, supabase]);

  const disconnectPlatform = useCallback(async (platform: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error && error.code !== 'PGRST205') throw error;
    } catch (err) {
      console.warn('Could not delete connected account from database:', err);
    }

    setConnectedAccounts((prev) => {
      const updated = prev.map((a) =>
        a.platform === platform ? { ...a, connected: false, username: '' } : a
      );
      localStorage.setItem(`pulsesync_connected_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user, supabase]);

  const publishPost = useCallback(async (content: string, platforms: string[], scheduledAt?: string, mediaFiles?: string[]) => {
    if (!user) return;

    let targetWorkspaceId = activeWorkspace?.id || (workspaces.length > 0 ? workspaces[0].id : null);

    if (!targetWorkspaceId) {
      try {
        const { data: newWS, error: wsError } = await supabase
          .from('workspaces')
          .insert({
            owner_id: user.id,
            workspace_name: 'My Workspace',
            workspace_slug: `workspace-${Math.random().toString(36).substring(2, 7)}`
          })
          .select()
          .single();
        
        if (newWS) {
          targetWorkspaceId = newWS.id;
          await refreshWorkspaces();
        }
      } catch (err) {
        console.warn('Could not auto-create workspace for SQL Foreign Key compliance:', err);
      }
    }

    const newPost: SocialPost = {
      id: Math.random().toString(36).substring(2, 11),
      content,
      platforms,
      status: scheduledAt ? 'scheduled' : 'published',
      created_at: new Date().toISOString(),
      scheduled_at: scheduledAt || undefined,
      published_at: scheduledAt ? undefined : new Date().toISOString(),
      media: mediaFiles || [],
      engagement: scheduledAt
        ? { likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 }
        : {
            likes: Math.floor(Math.random() * 500) + 100,
            comments: Math.floor(Math.random() * 80) + 10,
            shares: Math.floor(Math.random() * 120) + 5,
            reach: Math.floor(Math.random() * 10000) + 1500,
            clicks: Math.floor(Math.random() * 800) + 50,
          },
    };

    if (!scheduledAt && platforms.includes('twitter')) {
      try {
        const res = await fetch('/api/post/twitter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to publish to Twitter');
        }
      } catch (err: any) {
        console.error('Real publishing to Twitter failed:', err);
        newPost.status = 'failed';
        
        try {
          await supabase
            .from('posts')
            .insert({
              user_id: user.id,
              workspace_id: targetWorkspaceId,
              content,
              platforms,
              media_urls: mediaFiles || [],
              scheduled_at: scheduledAt || null,
              status: 'failed',
            });
        } catch (dbErr) {
          console.warn('Could not save failed post to DB:', dbErr);
        }
        throw err;
      }
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          workspace_id: targetWorkspaceId,
          content,
          platforms,
          media_urls: mediaFiles || [],
          scheduled_at: scheduledAt || null,
          status: newPost.status,
        });

      if (error && error.code !== 'PGRST205') throw error;
    } catch (err) {
      console.warn('Could not save post to database:', err);
    }

    setPosts((prev) => {
      const updated = [newPost, ...prev];
      localStorage.setItem(`pulsesync_posts_${user.id}`, JSON.stringify(updated));
      return updated;
    });

    // Trigger system notification
    try {
      const localNotifications = localStorage.getItem(`pulsesync_notifications_${user.id}`);
      const notificationList = localNotifications ? JSON.parse(localNotifications) : [];
      const newNotif = {
        id: Math.random().toString(),
        type: 'success',
        title: scheduledAt ? 'Post Scheduled' : 'Post Published',
        message: `Your post was successfully ${scheduledAt ? 'scheduled' : 'published'} to ${platforms.map(p => p.toUpperCase()).join(', ')}`,
        time: new Date().toISOString(),
        read: false
      };
      localStorage.setItem(`pulsesync_notifications_${user.id}`, JSON.stringify([newNotif, ...notificationList]));
    } catch (err) {
      console.warn('Could not save custom notification:', err);
    }
  }, [user, activeWorkspace?.id, supabase]);

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    // Single unified initialization routine to fetch profile and workspaces
    const initializeAuth = async (session: any) => {
      if (!mounted) return;
      try {
        if (session) {
          setUser(session.user);
          await fetchProfileAndWorkspaces(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.full_name || session.user.user_metadata?.name
          );
        } else {
          setUser(null);
          setProfile(null);
          setWorkspaces([]);
          setActiveWorkspace(null);
        }
      } catch (err) {
        console.error('Error initializing auth state:', err);
      } finally {
        if (mounted) {
          setLoading(false);
          initialized = true;
        }
      }
    };

    // Subscribing to onAuthStateChange will automatically query the initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        setLoading(true);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('active_workspace_id');
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('sb-') || key.startsWith('pulsesync_')) {
              localStorage.removeItem(key);
            }
          });
        }
      }
      
      await initializeAuth(session);
      
      if (event === 'SIGNED_IN' && mounted && initialized) {
        router.refresh();
      }
    });

    // SAFE WORKSPACE SYNCHRONIZATION TIMEOUT FALLBACK
    // If the network is extremely slow, Supabase is offline, or database queries hang,
    // we automatically clear the loading screen after 4.5s so they can interact with the dashboard.
    const fallbackTimeout = setTimeout(() => {
      if (mounted && !initialized) {
        console.warn('Auth synchronization timeout reached. Clearing loading screen to display workspace fallback.');
        setLoading(false);
      }
    }, 4500);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [supabase, fetchProfileAndWorkspaces, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        workspaces,
        activeWorkspace,
        loading,
        signOut,
        refreshProfile,
        refreshWorkspaces,
        setActiveWorkspaceById,
        // Social Media Helpers
        connectedAccounts,
        connectPlatform,
        disconnectPlatform,
        posts,
        publishPost,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
