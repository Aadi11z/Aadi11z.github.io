const root = document.documentElement;
const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

if (reveals.length && root.dataset.motion !== 'reduced' && 'IntersectionObserver' in window) {
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
