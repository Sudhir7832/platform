import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check if mock user cookie is active to support database-less Demo Mode
  const mockUserCookie = request.cookies.get('pulsesync_mock_user')?.value === 'true';
  let user = null;

  if (mockUserCookie) {
    user = {
      id: 'mock-user-id',
      email: 'demo@pulsesync.com',
      user_metadata: { full_name: 'Demo Creator' }
    } as any;
  } else {
    try {
      // IMPORTANT: Do not call supabase.auth.getSession() since it can be spoofed.
      // Use supabase.auth.getUser() as it makes a secure call to the API.
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      user = supabaseUser;
    } catch (err) {
      console.warn('Supabase auth getUser failed, checking mock cookies:', err);
    }
  }

  const nextUrl = request.nextUrl;
  const isDashboardPath = nextUrl.pathname.startsWith('/dashboard');
  const isOnboardingPath = nextUrl.pathname.startsWith('/onboarding');
  const isAuthPath =
    nextUrl.pathname === '/login' ||
    nextUrl.pathname === '/signup' ||
    nextUrl.pathname === '/forgot-password' ||
    nextUrl.pathname === '/reset-password';

  if (!user && (isDashboardPath || isOnboardingPath)) {
    // Redirect unauthenticated users to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (user) {
    const sandboxOnboarding =
      request.cookies.get('pulsesync_sandbox_onboarding')?.value === 'true' || mockUserCookie;

    let onboardingCompleted = sandboxOnboarding;

    if (!mockUserCookie) {
      try {
        // Query users profile using service definition or direct read
        // Note: We bypass strict RLS checking on reading public user profile if it's the owner reading their own record
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle();

        onboardingCompleted = profile?.onboarding_completed || sandboxOnboarding;
      } catch (err) {
        console.warn('Error reading user profile from Supabase in middleware:', err);
      }
    }

    if (!onboardingCompleted && !isOnboardingPath && isDashboardPath) {
      // User is authenticated but hasn't completed onboarding, direct to /onboarding
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    if (onboardingCompleted && isOnboardingPath) {
      // User completed onboarding, direct to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (isAuthPath) {
      // User is already logged in, bypass auth pages and redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }
  return supabaseResponse;
}
