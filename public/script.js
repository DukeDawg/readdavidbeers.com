const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

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

  document.querySelectorAll('.feature-card, .mini-card, .series-card, .about-panel, .newsletter').forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}
