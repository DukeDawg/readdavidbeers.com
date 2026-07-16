const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

const header = document.querySelector('[data-scroll-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const siteNav = document.querySelector('[data-site-nav]');
const contactForm = document.querySelector('[data-contact-form]');
const mailerLiteForms = document.querySelectorAll('[data-mailerlite-form]');

if (header) {
  const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 18);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
}

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
  };

  menuToggle.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(opening));
    siteNav.classList.toggle('is-open', opening);
  });

  siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

if (contactForm) {
  const status = contactForm.querySelector('[data-contact-status]');
  const button = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (status) status.textContent = 'Sending message…';
    if (button) button.disabled = true;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: new FormData(contactForm)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'Message failed.');

      contactForm.reset();
      if (window.turnstile) window.turnstile.reset();
      if (status) status.textContent = 'Message sent. David has it.';
    } catch (error) {
      if (status) status.textContent = error.message || 'Message could not be sent. Please email David directly.';
    } finally {
      if (button) button.disabled = false;
    }
  });
}

const showMailerLiteSuccess = (form) => {
  const container = form.closest('.ml-subscribe-form') || form.parentElement;
  if (!container) return;

  const success = container.querySelector('.row-success');
  const rowForm = container.querySelector('.row-form');

  if (success) success.hidden = false;
  if (rowForm) rowForm.hidden = true;
};

mailerLiteForms.forEach((mailerLiteForm) => {
  const status = mailerLiteForm.querySelector('[data-mailerlite-status]');
  const button = mailerLiteForm.querySelector('button[type="submit"]');
  const successHandler = mailerLiteForm.dataset.mailerliteSuccess;

  mailerLiteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (status) {
      status.textContent = 'Joining the list...';
      status.classList.remove('is-error');
    }
    if (button) button.disabled = true;

    try {
      const payload = new FormData(mailerLiteForm);
      payload.set('ajax', '1');

      const response = await fetch(mailerLiteForm.action, {
        method: 'POST',
        body: payload
      });
      const result = await response.json().catch(() => ({}));

      if (result.success) {
        mailerLiteForm.reset();
        if (successHandler && typeof window[successHandler] === 'function') {
          window[successHandler]();
        } else {
          showMailerLiteSuccess(mailerLiteForm);
        }
        return;
      }

      const emailErrors = result.errors?.fields?.email || result.errors?.fields?.['fields.email'];
      const errorText = Array.isArray(emailErrors) && emailErrors.length
        ? emailErrors.join(' ')
        : 'Signup did not go through. Please check the email address and try again.';
      throw new Error(errorText);
    } catch (error) {
      if (status) {
        status.textContent = error.message || 'Signup did not go through. Please try again.';
        status.classList.add('is-error');
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.14 });

  document.querySelectorAll('.path-card, .campaign-file, .archive-card, .about-frame, .newsletter-shell, .reader-card, .contact-card').forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}
