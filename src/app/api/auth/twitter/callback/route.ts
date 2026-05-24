import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const cookieStore = await cookies();
  const savedState = cookieStore.get('twitter_oauth_state')?.value;
  const codeVerifier = cookieStore.get('twitter_oauth_verifier')?.value;

  // Clean up cookies
  cookieStore.delete('twitter_oauth_state');
  cookieStore.delete('twitter_oauth_verifier');

  const url = new URL(request.url);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
  const redirectUri = `${siteUrl}/api/auth/twitter/callback`;

  // Helper function to return HTML to communicating parent page and close popup
  const renderPopupMessage = (data: { type: 'oauth-success' | 'oauth-error'; platform: string; username?: string; error?: string }) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitter Authentication</title>
          <style>
            body {
              background-color: #0b0f19;
              color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .spinner {
              border: 3px solid rgba(255, 255, 255, 0.1);
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border-left-color: #1d9bf0;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h2>${data.type === 'oauth-success' ? 'Connection Successful!' : 'Connection Failed'}</h2>
          <p>${data.type === 'oauth-success' ? `Linked account: ${data.username}` : data.error}</p>
          <script>
            setTimeout(() => {
              if (window.opener) {
                window.opener.postMessage(${JSON.stringify(data)}, window.location.origin);
                window.close();
              } else {
                window.location.href = '/dashboard/settings?${data.type === 'oauth-success' ? `success=twitter_connected&username=${encodeURIComponent(data.username || '')}` : `error=${encodeURIComponent(data.error || '')}`}'
              }
            }, 1000);
          </script>
        </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  };

  if (error) {
    return renderPopupMessage({ type: 'oauth-error', platform: 'twitter', error: error || 'Authorization rejected' });
  }

  if (!code || !state || !savedState || state !== savedState || !codeVerifier) {
    return renderPopupMessage({ type: 'oauth-error', platform: 'twitter', error: 'Authentication state mismatch or timed out.' });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Twitter token exchange error:', errText);
      return renderPopupMessage({ type: 'oauth-error', platform: 'twitter', error: 'Failed to exchange token with Twitter API.' });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch user details from Twitter API
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Twitter user profile query failed:', await userResponse.text());
      return renderPopupMessage({ type: 'oauth-error', platform: 'twitter', error: 'Could not fetch user details from Twitter.' });
    }

    const userData = await userResponse.json();
    const twitterUsername = `@${userData.data.username}`;

    // Store details in Supabase if logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null;

      // Upsert the social account connection
      const { error: dbError } = await supabase
        .from('social_accounts')
        .upsert({
          user_id: user.id,
          platform: 'twitter',
          account_name: twitterUsername,
          access_token,
          refresh_token,
          expires_at: expiresAt,
          connected_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,platform,account_name'
        });

      if (dbError) {
        console.error('Database connection save error:', dbError);
        return renderPopupMessage({ type: 'oauth-error', platform: 'twitter', error: 'Could not save credentials to database.' });
      }
    }

    return renderPopupMessage({ type: 'oauth-success', platform: 'twitter', username: twitterUsername });
  } catch (err: any) {
    console.error('Twitter OAuth callback internal error:', err);
    return renderPopupMessage({ type: 'oauth-error', platform: 'twitter', error: err.message || 'Callback connection failed.' });
  }
}
