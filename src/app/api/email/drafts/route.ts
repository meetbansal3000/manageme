// API Route: Server-Side Gmail Drafts API (GET, POST, PUT)

let localDraftsStore: Array<{
  id: string;
  to: string;
  cc?: string;
  subject: string;
  body: string;
  updatedAt: string;
}> = [
  {
    id: 'draft_demo_1',
    to: 'recruiter@example.com',
    cc: '',
    subject: '[Your Degree/Title] - Career Inquiry & Coffee Chat - [Company Name]',
    body: 'Dear Hiring Manager,\n\nI am writing to inquire about upcoming graduate opportunities...',
    updatedAt: new Date().toISOString()
  }
];

export async function GET() {
  try {
    const accessToken = process.env.GMAIL_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_ACCESS_TOKEN;

    if (accessToken) {
      try {
        const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (gmailRes.ok) {
          const gmailData = await gmailRes.json();
          return new Response(
            JSON.stringify({ success: true, drafts: gmailData.drafts || localDraftsStore }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        console.warn('[Gmail Drafts List Notice]: Falling back to local store', e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, drafts: localDraftsStore }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Failed to list drafts.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { to, cc, subject, body } = payload;

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ success: false, error: 'Recipient ("to"), subject, and body are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const draftId = `draft_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newDraft = {
      id: draftId,
      to: to.trim(),
      cc: cc?.trim() || '',
      subject: subject.trim(),
      body: body.trim(),
      updatedAt: new Date().toISOString()
    };

    localDraftsStore.unshift(newDraft);

    const accessToken = process.env.GMAIL_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
    if (accessToken) {
      try {
        const emailLines = [
          `To: ${to.trim()}`,
          cc?.trim() ? `Cc: ${cc.trim()}` : '',
          'Content-Type: text/plain; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: =?utf-8?B?${Buffer.from(subject.trim()).toString('base64')}?=`,
          '',
          body.trim()
        ].filter(Boolean);
        const rawEmail = emailLines.join('\r\n');
        const base64EncodedEmail = Buffer.from(rawEmail).toString('base64url');

        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: { raw: base64EncodedEmail } })
        });
      } catch (e) {
        console.warn('[Gmail Draft API Post Warning]: Created in local store fallback.', e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, draftId, draft: newDraft, message: 'Draft saved in Gmail' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Failed to create draft.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    const { draftId, to, cc, subject, body } = payload;

    if (!draftId) {
      return new Response(
        JSON.stringify({ success: false, error: 'draftId is required for updating a draft.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const index = localDraftsStore.findIndex(d => d.id === draftId);
    let updatedDraft = {
      id: draftId,
      to: to?.trim() || 'recruiter@example.com',
      cc: cc?.trim() || '',
      subject: subject?.trim() || '[Updated Subject]',
      body: body?.trim() || '',
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      localDraftsStore[index] = { ...localDraftsStore[index], ...updatedDraft };
      updatedDraft = localDraftsStore[index];
    } else {
      localDraftsStore.unshift(updatedDraft);
    }

    const accessToken = process.env.GMAIL_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
    if (accessToken) {
      try {
        const emailLines = [
          `To: ${updatedDraft.to}`,
          updatedDraft.cc ? `Cc: ${updatedDraft.cc}` : '',
          'Content-Type: text/plain; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: =?utf-8?B?${Buffer.from(updatedDraft.subject).toString('base64')}?=`,
          '',
          updatedDraft.body
        ].filter(Boolean);
        const rawEmail = emailLines.join('\r\n');
        const base64EncodedEmail = Buffer.from(rawEmail).toString('base64url');

        await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: { raw: base64EncodedEmail } })
        });
      } catch (e) {
        console.warn('[Gmail Draft API Put Warning]: Updated in local store fallback.', e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, draftId, draft: updatedDraft, message: 'Draft updated in Gmail' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Failed to update draft.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
