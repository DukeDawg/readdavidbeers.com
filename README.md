# readdavidbeers.com

Official David Beers author site. Static-first build for Cloudflare Pages.

## Cloudflare Pages settings

- Framework preset: None
- Build command: leave blank
- Build output directory: `public`
- Production branch: `main`


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
