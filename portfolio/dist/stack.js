// Searchable service directory; filtering preserves the server-rendered content.
(() => {
  const cards = [...document.querySelectorAll('.stack-card')];
  const search = document.querySelector('#stack-search');
  const category = document.querySelector('#stack-category');
  const count = document.querySelector('#stack-count');
  function filter() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      card.hidden = !(card.textContent.toLowerCase().includes(query) && (category.value === 'all' || card.dataset.stackCategory === category.value));
      if (!card.hidden) visible++;
    });
    count.textContent = visible ? `${visible} of ${cards.length} services` : 'No services found. Try another search or category.';
  }
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  document.querySelector('#stack-reset').addEventListener('click', () => {
    search.value = '';
    category.value = 'all';
    filter();
  });
  filter();
})();
