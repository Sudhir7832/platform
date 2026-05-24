import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User is not authenticated' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
    }

    // Retrieve Twitter connection details
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .maybeSingle();

    if (accountError) {
      console.error('Database query for Twitter account failed:', accountError);
      return NextResponse.json({ error: 'Database search error for connected account.' }, { status: 500 });
    }

    if (!account) {
      return NextResponse.json({ error: 'Please connect your Twitter/X account first in settings.' }, { status: 400 });
    }

    let accessToken = account.access_token;

    // Check if token has expired or is expiring soon (within 60 seconds)
    const isExpired = account.expires_at && new Date(account.expires_at).getTime() <= (Date.now() + 60000);
    
    if (isExpired && account.refresh_token) {
      try {
        console.log('Refreshing expired Twitter/X OAuth access token...');
        const refreshResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: account.refresh_token,
          }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access_token;
          const newExpiresAt = refreshData.expires_in
            ? new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
            : null;

          // Update database with refreshed credentials
          const { error: updateError } = await supabase
            .from('social_accounts')
            .update({
              access_token: accessToken,
              refresh_token: refreshData.refresh_token || account.refresh_token,
              expires_at: newExpiresAt,
            })
            .eq('id', account.id);

          if (updateError) {
            console.error('Failed to save refreshed token in DB:', updateError);
          } else {
            console.log('Twitter access token successfully refreshed.');
          }
        } else {
          console.error('Twitter OAuth refresh failed:', await refreshResponse.text());
        }
      } catch (refreshErr) {
        console.error('Token refresh error:', refreshErr);
      }
    }

    // Call X API v2 tweets endpoint to post the status update
    const xResponse = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content,
      }),
    });

    if (!xResponse.ok) {
      const errBody = await xResponse.json();
      console.error('X/Twitter API post failed:', errBody);
      
      let errorMsg = 'Failed to publish tweet to X/Twitter';
      if (errBody?.detail) errorMsg = errBody.detail;
      else if (errBody?.errors?.[0]?.message) errorMsg = errBody.errors[0].message;

      return NextResponse.json({ error: errorMsg }, { status: xResponse.status });
    }

    const responseData = await xResponse.json();
    return NextResponse.json({ success: true, data: responseData.data });
  } catch (err: any) {
    console.error('X/Twitter publish endpoint error:', err);
    return NextResponse.json({ error: err.message || 'Internal posting server error' }, { status: 500 });
  }
}
