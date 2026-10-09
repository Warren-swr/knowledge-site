const base = document.body.dataset.base || '/';
const themeButton = document.querySelector('[data-theme-toggle]');
let storedTheme;
try { storedTheme = localStorage.getItem('knowledge-theme'); } catch {}
document.documentElement.dataset.theme = storedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
themeButton?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('knowledge-theme', theme); } catch {}
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); window.location.href = `${base}search/`; }
});

const form = document.querySelector('[data-search-form]');
if (form) {
  const input = form.elements.q;
  const status = document.querySelector('[data-search-status]');
  const results = document.querySelector('[data-search-results]');
  const params = new URLSearchParams(location.search);
  input.value = params.get('q') || '';
  form.elements.tag.value = params.get('tag') || '';
  form.elements.format.value = params.get('format') || '';
  let pagefind;
  let request = 0;
  let timer;
  async function search() {
    const current = ++request;
    const query = input.value.trim();
    const tag = form.elements.tag.value;
    const format = form.elements.format.value;
    const nextParams = new URLSearchParams();
    if (query) nextParams.set('q', query);
    if (tag) nextParams.set('tag', tag);
    if (format) nextParams.set('format', format);
    history.replaceState(null, '', location.pathname + (nextParams.size ? '?' + nextParams : ''));
    results.replaceChildren();
    if (!query) { status.textContent = '输入关键词，查找相关内容。'; return; }
    status.textContent = '正在查找…';
    try {
      pagefind ||= import(`${base}pagefind/pagefind.js`);
      const engine = await pagefind;
      const filters = {};
      if (tag) filters.tags = tag;
      if (format) filters.format = format;
      const response = await engine.search(query, { filters });
      const items = await Promise.all(response.results.slice(0, 40).map(result => result.data()));
      if (current !== request) return;
      status.textContent = items.length ? `找到 ${response.results.length} 条结果${response.results.length > 40 ? '，显示前 40 条' : ''}` : '没有找到相关内容，试试更短的关键词或调整筛选条件。';
      for (const item of items) {
        const article = document.createElement('article');
        article.className = 'search-result';
        const heading = document.createElement('h2');
        const link = document.createElement('a');
        link.href = item.url;
        link.textContent = item.meta.title || item.url;
        heading.append(link);
        const excerpt = document.createElement('p');
        const parsed = new DOMParser().parseFromString(item.excerpt, 'text/html');
        for (const node of parsed.body.childNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'MARK') { const mark = document.createElement('mark'); mark.textContent = node.textContent; excerpt.append(mark); }
          else excerpt.append(document.createTextNode(node.textContent));
        }
        article.append(heading, excerpt);
        results.append(article);
      }
    } catch {
      if (current === request) { status.textContent = '搜索索引暂时无法载入，请刷新后重试。'; status.setAttribute('role', 'alert'); }
    }
  }
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); search(); });
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 200); });
  form.addEventListener('change', () => { clearTimeout(timer); search(); });
  if (input.value) search();
}
