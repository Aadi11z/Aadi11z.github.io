const filterRoot = document.querySelector<HTMLElement>('[data-project-filters]');

if (filterRoot) {
  const buttons = Array.from(filterRoot.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-project-card]'));
  const status = document.querySelector<HTMLElement>('[data-filter-status]');

  const applyFilter = (filter: string) => {
    let visible = 0;
    cards.forEach((card) => {
      const categories = (card.dataset.categories ?? '').split('|');
      const matches = filter === 'all' || categories.includes(filter);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    if (status) status.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown`;
  };

  buttons.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter ?? 'all')));
}
