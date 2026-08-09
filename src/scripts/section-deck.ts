const deck = document.querySelector<HTMLElement>('[data-section-deck]');

if (deck) {
  const panels = Array.from(deck.querySelectorAll<HTMLElement>('[data-deck-panel]'));
  const panelsById = new Map(panels.map((panel) => [panel.id, panel]));
  const sectionLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'));
  const defaultSection = deck.dataset.defaultSection ?? panels[0]?.id;
  const legacySections = new Map([
    ['work', 'projects'],
    ['about', 'overview'],
    ['contact', 'overview'],
  ]);

  const sectionFromHash = () => {
    const requestedId = decodeURIComponent(window.location.hash.slice(1));
    const id = legacySections.get(requestedId) ?? requestedId;
    if (id !== requestedId) window.history.replaceState({ section: id }, '', `#${id}`);
    return panelsById.has(id) ? id : defaultSection;
  };

  const setActiveSection = (id: string | undefined, updateHistory = false) => {
    if (!id || !panelsById.has(id)) return;

    const previousPanel = panels.find((panel) => !panel.hidden);
    const focusWasInsidePanel = previousPanel?.contains(document.activeElement) ?? false;

    panels.forEach((panel) => {
      const active = panel.id === id;
      panel.hidden = !active;
      panel.setAttribute('aria-hidden', String(!active));
      if (active) panel.scrollTop = 0;
    });

    sectionLinks.forEach((link) => {
      if (link.dataset.sectionLink === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    deck.dataset.activeSection = id;
    if (updateHistory && window.location.hash !== `#${id}`) {
      window.history.pushState({ section: id }, '', `#${id}`);
    }

    if (focusWasInsidePanel) {
      const activePanel = panelsById.get(id);
      const heading = activePanel?.querySelector<HTMLElement>('h1, h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
  };

  document.documentElement.classList.add('deck-ready');
  setActiveSection(sectionFromHash());

  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link) return;

    const url = new URL(link.href, window.location.href);
    const currentPath = window.location.pathname.replace(/\/+$/, '');
    const targetPath = url.pathname.replace(/\/+$/, '');
    const requestedId = decodeURIComponent(url.hash.slice(1));
    const id = legacySections.get(requestedId) ?? requestedId;
    if (url.origin !== window.location.origin || targetPath !== currentPath || !panelsById.has(id)) return;

    event.preventDefault();
    setActiveSection(id, true);
  });

  window.addEventListener('popstate', () => setActiveSection(sectionFromHash()));
  window.addEventListener('hashchange', () => setActiveSection(sectionFromHash()));
}
