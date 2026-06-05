const data = window.PORTFOLIO_DATA;
const state = { filter: 'all', query: '' };
const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
function splitTags(keywords) {
  return keywords.split(/[?,?]/).map((item) => item.trim()).filter(Boolean).slice(0, 4);
}
function matches(caseItem) {
  const inCategory = state.filter === 'all' || caseItem.category === state.filter;
  const text = `${caseItem.category} ${caseItem.keywords} ${caseItem.structure} ${caseItem.prompt}`.toLowerCase();
  return inCategory && text.includes(state.query.toLowerCase());
}
function updateVisibleCards() {
  qsa('.case-card').forEach((card) => {
    const item = data.cases.find((entry) => entry.id === card.dataset.id);
    card.hidden = !matches(item);
  });
}
function openDialog(item) {
  qs('#dialogImage').src = item.image;
  qs('#dialogImage').alt = item.keywords;
  qs('#dialogTitle').textContent = item.keywords;
  qs('#dialogCategory').textContent = item.category;
  qs('#dialogStructure').textContent = item.structure;
  qs('#dialogPrompt').textContent = item.prompt;
  qs('#dialog').classList.add('is-open');
  qs('#dialog').setAttribute('aria-hidden', 'false');
  qs('#closeDialog').focus();
}
function closeDialog() {
  qs('#dialog').classList.remove('is-open');
  qs('#dialog').setAttribute('aria-hidden', 'true');
}
function cardTemplate(item, index) {
  const tags = splitTags(item.keywords).map((tag) => `<span class="tag">${tag}</span>`).join('');
  return `
    <article class="case-card" data-category="${item.category}" data-id="${item.id}">
      <div class="case-card__image"><img src="${item.image}" alt="${item.keywords}" loading="lazy"></div>
      <div class="case-card__body">
        <h3>${item.keywords}</h3>
        <div class="tags">${tags}</div>
        <div class="case-card__actions">
          <button class="detail-btn" type="button" data-open="${item.id}">${data.ui.viewPrompt}</button>
          <span class="case-index">${String(index + 1).padStart(2, '0')}</span>
        </div>
      </div>
    </article>`;
}
function render() {
  qs('#pageTitle').textContent = data.title;
  qs('#pageSubtitle').textContent = data.subtitle;
  qs('#searchInput').placeholder = data.ui.search;
  qs('#structureLabel').textContent = data.ui.structure;
  qs('#promptLabel').textContent = data.ui.fullPrompt;
  const heroImages = data.cases.filter((item) => item.image).slice(0, 2);
  qs('#heroVisual').innerHTML = heroImages.map((item) => `<img src="${item.image}" alt="${item.keywords}">`).join('');
  qs('#filters').innerHTML = [`<button class="filter-btn" type="button" aria-pressed="true" data-filter="all">${data.ui.all}</button>`, ...data.categories.map((cat) => `<button class="filter-btn" type="button" aria-pressed="false" data-filter="${cat}">${cat}</button>`)].join('');
  qs('#sections').innerHTML = data.categories.map((cat) => {
    const cases = data.cases.filter((item) => item.category === cat);
    return `<section class="section" id="${cat}"><div class="section__head"><h2>${cat}</h2><p>${data.categoryNotes[cat] || ''}</p></div><div class="case-grid">${cases.map((item) => cardTemplate(item, data.cases.indexOf(item))).join('')}</div></section>`;
  }).join('');
  qsa('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter;
      qsa('[data-filter]').forEach((other) => other.setAttribute('aria-pressed', String(other === btn)));
      updateVisibleCards();
    });
  });
  qs('#searchInput').addEventListener('input', (event) => {
    state.query = event.target.value.trim();
    updateVisibleCards();
  });
  qsa('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = data.cases.find((entry) => entry.id === btn.dataset.open);
      openDialog(item);
    });
  });
}
qs('#closeDialog').addEventListener('click', closeDialog);
qs('#dialog').addEventListener('click', (event) => { if (event.target.id === 'dialog') closeDialog(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDialog(); });
render();
