const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const form = new FormData(contactForm);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const subject = String(form.get('subject') || 'Reader message for David Beers').trim();
    const message = String(form.get('message') || '').trim();

    const body = [
      message,
      '',
      name ? `Name: ${name}` : '',
      email ? `Reply-to: ${email}` : ''
    ].filter(Boolean).join('\n');

    const params = new URLSearchParams({
      subject: subject || 'Reader message for David Beers',
      body
    });

    window.location.href = `mailto:david@imperiumdominion.org?${params.toString()}`;
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
