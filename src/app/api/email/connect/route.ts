// API Route: Server-Side Email OAuth Consent Initiator
// Scopes: gmail.compose, gmail.send, gmail.readonly

export async function GET(req: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'mock_google_client_id.apps.googleusercontent.com';
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/email/callback`;

    const scopes = [
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return new Response(
      JSON.stringify({
        success: true,
        authUrl,
        scopes,
        redirectUri
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Failed to generate OAuth URL'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
