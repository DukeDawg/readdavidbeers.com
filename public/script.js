const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const contactForm = document.querySelector('[data-contact-form]');
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

  document.querySelectorAll('.feature-card, .mini-card, .series-card, .about-panel, .newsletter, .contact-card').forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}
