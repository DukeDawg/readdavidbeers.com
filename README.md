# readdavidbeers.com

Official David Beers author site. Static-first build for Cloudflare Pages.

## Cloudflare Pages settings

- Framework preset: None
- Build command: leave blank
- Build output directory: `public`
- Production branch: `main`

## MailerLite reader-list signup

The homepage reader-list signup form posts directly to MailerLite's embedded webform endpoint:

- Form container: `mlb2-41523129`
- Account path: `2307208`
- Form ID: `187925613909116238`
- Action: `https://assets.mailerlite.com/jsonp/2307208/forms/187925613909116238/subscribe`

The public form intentionally keeps only the email field and MailerLite's required hidden fields: `ml-submit=1` and `anticsrf=true`. The site's own `script.js` submits the form with `fetch()`, displays MailerLite validation errors inline, and calls `ml_webform_success_41523129()` on success so the success state can use the site's own styling instead of MailerLite's bulky default embed CSS.

## Back-of-book reader page

The dedicated back-matter signup URL is:

- `https://www.readdavidbeers.com/readers/`

It uses the separate MailerLite form David supplied for readers coming from the back of a book:

- Form container: `mlb2-41626330`
- Account path: `2307208`
- Form ID: `188109623780181441`
- Action: `https://assets.mailerlite.com/jsonp/2307208/forms/188109623780181441/subscribe`

The page is static at `public/readers/index.html` and uses the same direct-submit handler in `public/script.js`, with `data-mailerlite-success="ml_webform_success_41626330"` selecting the page-specific success state.

## Contact form wiring

The reader contact form posts to the Cloudflare Pages Function at `/api/contact`.

Required Cloudflare Pages environment variables/secrets:

- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile secret key
- `RESEND_API_KEY` — Resend API key
- `CONTACT_TO_EMAIL` — destination inbox, e.g. `david@imperiumdominion.org`
- `CONTACT_FROM_EMAIL` — verified Resend sender, e.g. `Reader Mail <reader-mail@readdavidbeers.com>`
- `CONTACT_SITE_NAME` — optional label used in the email subject/body

Also replace `REPLACE_WITH_TURNSTILE_SITE_KEY` in the public HTML with the Turnstile site key for this domain.

Cloudflare Pages build remains static-first:

- Build command: leave blank
- Build output directory: `public`
- Functions directory: `functions`
