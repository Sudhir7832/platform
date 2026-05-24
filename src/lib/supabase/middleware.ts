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

  let user = null;
  try {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    user = supabaseUser;
  } catch (err) {
    console.warn('Supabase auth getUser failed:', err);
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
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (user) {
    let onboardingCompleted = false;
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();
      onboardingCompleted = profile?.onboarding_completed || false;
    } catch (err) {
      console.warn('Error reading user profile from Supabase in middleware:', err);
    }

    if (!onboardingCompleted && !isOnboardingPath && isDashboardPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    if (onboardingCompleted && isOnboardingPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (isAuthPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }
  return supabaseResponse;
}
