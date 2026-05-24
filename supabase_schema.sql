-- PulseSync Supabase Database Schema
-- Run this script in the Supabase SQL Editor to set up tables, triggers, and Row Level Security (RLS) policies.

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES DEFINITIONS
-- ==========================================

-- Users Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'agency')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    workspace_name TEXT NOT NULL,
    workspace_slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Workspace Members Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (workspace_id, user_id)
);

-- Social Accounts Table
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter', 'facebook', 'linkedin', 'tiktok', 'pinterest', 'threads', 'telegram', 'youtube')),
    account_name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, platform, account_name)
);

-- Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    platforms TEXT[] DEFAULT '{}',
    scheduled_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    impressions INTEGER DEFAULT 0 NOT NULL,
    clicks INTEGER DEFAULT 0 NOT NULL,
    engagement NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    likes INTEGER DEFAULT 0 NOT NULL,
    comments INTEGER DEFAULT 0 NOT NULL,
    shares INTEGER DEFAULT 0 NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 2. AUTOMATIC USER REGISTRATION TRIGGER
-- ==========================================

-- Function to sync metadata from auth.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, avatar_url, onboarding_completed)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        new.email,
        COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute after signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security for all public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- 3a. public.users Policies
DROP POLICY IF EXISTS "Users can view all user profiles" ON public.users;
CREATE POLICY "Users can view all user profiles"
    ON public.users FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- 3b. public.workspaces Policies
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
CREATE POLICY "Users can view workspaces they are members of"
    ON public.workspaces FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workspaces.id
            AND workspace_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
CREATE POLICY "Users can create workspaces"
    ON public.workspaces FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON public.workspaces;
CREATE POLICY "Workspace owners can update their workspaces"
    ON public.workspaces FOR UPDATE
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON public.workspaces;
CREATE POLICY "Workspace owners can delete their workspaces"
    ON public.workspaces FOR DELETE
    USING (auth.uid() = owner_id);

-- 3c. public.workspace_members Policies
DROP POLICY IF EXISTS "Workspace members can view all workspace membership listings" ON public.workspace_members;
CREATE POLICY "Workspace members can view all workspace membership listings"
    ON public.workspace_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members AS current_members
            WHERE current_members.workspace_id = workspace_members.workspace_id
            AND current_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Workspace owners or admins can manage workspace members" ON public.workspace_members;
CREATE POLICY "Workspace owners or admins can manage workspace members"
    ON public.workspace_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members AS current_members
            WHERE current_members.workspace_id = workspace_members.workspace_id
            AND current_members.user_id = auth.uid()
            AND current_members.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members AS current_members
            WHERE current_members.workspace_id = workspace_members.workspace_id
            AND current_members.user_id = auth.uid()
            AND current_members.role IN ('owner', 'admin')
        )
    );

-- Automatically add owner as workspace member on workspace insert
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (new.id, new.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_workspace_created
    AFTER INSERT ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- 3d. public.social_accounts Policies
DROP POLICY IF EXISTS "Users can manage their own social accounts" ON public.social_accounts;
CREATE POLICY "Users can manage their own social accounts"
    ON public.social_accounts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3e. public.posts Policies
DROP POLICY IF EXISTS "Workspace members can view posts in their workspace" ON public.posts;
CREATE POLICY "Workspace members can view posts in their workspace"
    ON public.posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = posts.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Workspace members (except viewers) can create posts" ON public.posts;
CREATE POLICY "Workspace members (except viewers) can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = posts.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Workspace members (except viewers) can update posts" ON public.posts;
CREATE POLICY "Workspace members (except viewers) can update posts"
    ON public.posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = posts.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Workspace members (except viewers) can delete posts" ON public.posts;
CREATE POLICY "Workspace members (except viewers) can delete posts"
    ON public.posts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = posts.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role IN ('owner', 'admin', 'editor')
        )
    );

-- 3f. public.analytics Policies
DROP POLICY IF EXISTS "Workspace members can view analytics for posts in their workspace" ON public.analytics;
CREATE POLICY "Workspace members can view analytics for posts in their workspace"
    ON public.analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            JOIN public.workspace_members ON workspace_members.workspace_id = posts.workspace_id
            WHERE posts.id = analytics.post_id
            AND workspace_members.user_id = auth.uid()
        )
    );

-- ==========================================
-- 4. STORAGE BUCKETS CONFIGURATION
-- ==========================================
-- Create bucket definitions (avatars, logos, posts-media)
-- Note: Buckets can also be created manually via Supabase Console.
-- Run these insert statements to create secure storage buckets:
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);
