import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    // Generate random state and verifier
    const state = crypto.randomBytes(16).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    
    // Hash verifier using SHA-256 for PKCE challenge
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = hash.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const cookieStore = await cookies();
    cookieStore.set('twitter_oauth_state', state, { 
      httpOnly: true, 
      secure: true, 
      path: '/', 
      maxAge: 600,
      sameSite: 'lax'
    });
    cookieStore.set('twitter_oauth_verifier', codeVerifier, { 
      httpOnly: true, 
      secure: true, 
      path: '/', 
      maxAge: 600,
      sameSite: 'lax'
    });

    const url = new URL(request.url);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
    const redirectUri = `${siteUrl}/api/auth/twitter/callback`;

    const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize');
    twitterAuthUrl.searchParams.append('response_type', 'code');
    twitterAuthUrl.searchParams.append('client_id', process.env.TWITTER_CLIENT_ID || '');
    twitterAuthUrl.searchParams.append('redirect_uri', redirectUri);
    twitterAuthUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access');
    twitterAuthUrl.searchParams.append('state', state);
    twitterAuthUrl.searchParams.append('code_challenge', codeChallenge);
    twitterAuthUrl.searchParams.append('code_challenge_method', 'S256');

    return NextResponse.redirect(twitterAuthUrl.toString());
  } catch (err: any) {
    console.error('Twitter OAuth initiate error:', err);
    return NextResponse.json({ error: err.message || 'OAuth initiation failed' }, { status: 500 });
  }
}
