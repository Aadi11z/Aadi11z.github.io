const root = document.documentElement;
const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reveals.length && !reducedMotion && 'IntersectionObserver' in window) {
  root.classList.add('effects-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8%', threshold: 0.08 });
  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('is-visible'));
}
