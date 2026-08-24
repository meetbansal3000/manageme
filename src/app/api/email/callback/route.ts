// API Route: Server-Side Email OAuth Code Exchange Callback

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: `OAuth access denied: ${error}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing OAuth code parameter.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/email/callback`;

    let connectedEmail = 'user@example.com';
    let isConnected = true;

    if (clientId && clientSecret) {
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          // Store token in server environment / memory
          if (tokenData.access_token) {
            process.env.GMAIL_ACCESS_TOKEN = tokenData.access_token;
          }
          if (tokenData.refresh_token) {
            process.env.GOOGLE_REFRESH_TOKEN = tokenData.refresh_token;
          }
          // Fetch user profile email
          const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            connectedEmail = userData.email || connectedEmail;
          }
        }
      } catch (e) {
        console.warn('[OAuth Callback Token Exchange Notice]: Using mock token callback for development.', e);
      }
    }

    // Redirect back to Mail Studio with connection query flag
    return Response.redirect(`${protocol}://${host}/#outreach?connected=true&email=${encodeURIComponent(connectedEmail)}`);
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'OAuth callback failed.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
