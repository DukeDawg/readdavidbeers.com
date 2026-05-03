const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_EMAIL_URL = 'https://api.resend.com/emails';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  }
});

const clean = (value, max = 2000) => String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
const escapeHtml = (value) => clean(value, 8000)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function verifyTurnstile(token, secret, ip) {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const response = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body });
  if (!response.ok) return false;
  const result = await response.json();
  return Boolean(result.success);
}

async function sendWithResend({ apiKey, from, to, replyTo, subject, html, text }) {
  const payload = {
    from,
    to: [to],
    subject,
    html,
    text,
    reply_to: replyTo ? [replyTo] : undefined
  };

  const response = await fetch(RESEND_EMAIL_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend failed: ${response.status} ${detail.slice(0, 300)}`);
  }

  return response.json();
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const form = await request.formData();

    const honeypot = clean(form.get('company'), 200);
    if (honeypot) return json({ ok: true });

    const name = clean(form.get('name'), 120);
    const email = clean(form.get('email'), 254);
    const subjectInput = clean(form.get('subject'), 160);
    const message = clean(form.get('message'), 6000);
    const brand = clean(form.get('brand'), 80) || env.CONTACT_SITE_NAME || 'Author site';
    const token = clean(form.get('cf-turnstile-response'), 4096);

    if (!name || !email || !message) return json({ ok: false, error: 'Name, email, and message are required.' }, 400);
    if (!looksLikeEmail(email)) return json({ ok: false, error: 'Please use a valid email address.' }, 400);
    if (!token) return json({ ok: false, error: 'Please complete the anti-spam check.' }, 400);

    const required = ['TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL'];
    const missing = required.filter((key) => !env[key]);
    if (missing.length) return json({ ok: false, error: `Server is missing configuration: ${missing.join(', ')}` }, 500);

    const ip = request.headers.get('CF-Connecting-IP') || '';
    const turnstileOk = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip);
    if (!turnstileOk) return json({ ok: false, error: 'Anti-spam check failed. Please try again.' }, 403);

    const subject = subjectInput || `Reader message from ${brand}`;
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
    const receivedFrom = new URL(request.url).hostname;

    const text = [
      `New reader message from ${brand}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      '',
      message,
      '',
      `Received from: ${receivedFrom}`
    ].join('\n');

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.55;color:#111">
        <h2>New reader message from ${escapeHtml(brand)}</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr>
        <p>${safeMessage}</p>
        <hr>
        <p style="color:#666;font-size:13px">Received from ${escapeHtml(receivedFrom)}.</p>
      </div>`;

    await sendWithResend({
      apiKey: env.RESEND_API_KEY,
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[${brand}] ${subject}`,
      html,
      text
    });

    return json({ ok: true, message: 'Message sent.' });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: 'Message could not be sent. Please try again or email directly.' }, 500);
  }
}

export async function onRequestGet() {
  return json({ ok: true, endpoint: 'author-contact' });
}
