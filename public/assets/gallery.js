Home.strings({
  docTitle: { zh: '网页小品 · HTML Toys', en: 'Web Miniatures · HTML Toys' },
  title: { zh: '网页小品', en: 'Web Miniatures' },
  lede: {
    zh: '看灯塔一笔笔成形，去池边喂几尾锦鲤。这里收藏着 Claude、GPT 和 Gemini 创作的互动网页。',
    en: 'Watch a lighthouse take shape, brushstroke by brushstroke, or stop to feed the koi. A collection of interactive web pieces by Claude, GPT and Gemini.',
  },
  hint: { zh: '悬停看动态', en: 'Hover to preview' },
  langBtn: { zh: 'EN', en: '中文' },
  langLabel: { zh: 'Switch to English', en: '切换到中文' },
  allWorks: { zh: '全部', en: 'All works' },
  modelFilter: { zh: '按模型筛选作品', en: 'Filter works by model' },
  filterModel: { zh: '筛选', en: 'Filter by' },
  compare: { zh: '并排看', en: 'View side by side' },
  notYet: { zh: '暂无作品', en: 'No work yet' },
  prev: { zh: '上一组', en: 'Previous' },
  next: { zh: '下一组', en: 'Next' },
  close: { zh: '返回', en: 'Back' },
  open: { zh: '打开', en: 'Open' },
  openNewTab: { zh: '在新标签页打开', en: 'Open in new tab' },
  play: { zh: '同步播放', en: 'Play together' },
  stop: { zh: '回到预览', en: 'Back to previews' },
  promptHead: { zh: '提示词', en: 'Prompt' },
  promptLang: { zh: '提示词语言', en: 'Prompt language' },
  copy: { zh: '复制', en: 'Copy' },
  copied: { zh: '已复制', en: 'Copied' },
  loadFail: { zh: '提示词没能加载。请通过本地服务器或线上地址打开本页。', en: 'The prompt didn’t load. Open this page through a web server.' },
});
const L = o => o[Home.lang];
const zh = () => Home.lang === 'zh';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const qt = s => zh() ? `《${s}》` : `“${s}”`;
const workName = (r, m) => zh() ? `${qt(L(r.title))}，${m.name}` : `${qt(L(r.title))} by ${m.name}`;
const coverObserver = new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) if (isIntersecting) {
    target.srcset = target.dataset.srcset;
    target.src = target.dataset.src;
    coverObserver.unobserve(target);
  }
}, { rootMargin: '160px 0px' });

function coverImage(id, model, sizes, { deferred = false, priority = 'auto' } = {}) {
  const src = Home.cover(id, model), sources = Home.covers(id, model);
  const prefix = deferred ? 'data-' : '';
  return `<img ${prefix}src="${src}" ${prefix}srcset="${sources}" sizes="${sizes}" fetchpriority="${priority}" alt="" decoding="async" width="1200" height="750">`;
}

function coverSizes(columns, mobileColumns) {
  const gaps = (columns - 1) * 20;
  const mobileGaps = (mobileColumns - 1) * 12;
  return `(max-width: 760px) calc(${100 / mobileColumns}vw - ${(32 + mobileGaps) / mobileColumns}px), min(calc(${92 / columns}vw - ${gaps / columns}px), ${(1440 - gaps) / columns}px)`;
}

let selectedModel = '';
const gallery = document.getElementById('gallery');
const modelFilter = document.getElementById('model-filter');
const groups = document.getElementById('gallery-groups');

function updateModelFilter() {
  for (const button of modelFilter.querySelectorAll('[data-model-filter]')) {
    button.setAttribute('aria-pressed', button.dataset.modelFilter === selectedModel);
  }
}

function renderModelFilter() {
  modelFilter.innerHTML = `<button class="model-choice" type="button" data-model-filter="">${Home.t('allWorks')}</button>` + Home.models().map(m =>
    `<button class="model-choice" type="button" data-model-filter="${esc(m.id)}" title="${esc(Home.t('filterModel') + ' ' + m.name)}">
      <span class="model-dot" aria-hidden="true" style="--model-color:${m.color}"></span>${esc(m.short || m.name)}</button>`
  ).join('');
  updateModelFilter();
}

function renderGallery() {
  const columns = Math.min(Home.models().length, 3), mobileColumns = Math.min(columns, 2);
  const sizes = coverSizes(columns, mobileColumns);
  const filtered = Boolean(selectedModel);
  const workGroups = Home.prompts().map(p => {
    const runs = Home.runs(p.id).filter(({ model, run }) => !filtered || (model.id === selectedModel && run));
    return { p, runs };
  }).filter(({ runs }) => runs.length);
  hoverCell = focusCell = null;
  stopPreview();
  coverObserver.disconnect();
  groups.classList.toggle('is-filtered', filtered);
  groups.style.setProperty('--columns', columns);
  groups.style.setProperty('--mobile-columns', mobileColumns);

  const firstRow = filtered ? columns : 1;
  groups.innerHTML = workGroups.map(({ p, runs }, ri) => {
    const hint = ri === 0 && !navigator.connection?.saveData
      ? `<span class="preview-hint">${Home.t('hint')}</span>` : '';
    const actions = filtered ? '' : `<div class="group-actions">${hint}<button class="text-button" type="button" data-open="${p.id}" aria-describedby="h-${p.id}">${Home.t('compare')}</button></div>`;
    const cards = runs.map(({ model: m, run: r }, ci) => {
      const credit = `<p class="credit">${esc(m.name)}</p>`;
      if (!r) return `<article class="work-card" data-model="${esc(m.id)}">
        <div class="work-media empty">${Home.t('notYet')}</div><div class="work-caption">${credit}</div></article>`;
      const image = coverImage(p.id, m.id, sizes, { deferred: ri >= firstRow, priority: ri === 0 && ci === 0 ? 'high' : 'auto' });
      return `<article class="work-card" data-model="${esc(m.id)}">
        <a class="work-link" href="${Home.href(p.id, m.id)}">
          <div class="work-media">${image}</div>
          <div class="work-caption"><h3 class="work-title">${esc(L(r.title))}</h3>${credit}</div>
        </a></article>`;
    }).join('');
    return `<section id="${p.id}" aria-labelledby="h-${p.id}">
      <div class="group-heading"><h2 id="h-${p.id}">${esc(L(p.brief))}</h2>${actions}</div>
      <div class="work-grid">${cards}</div>
    </section>`;
  }).join('') || `<p class="empty">${Home.t('notYet')}</p>`;
  groups.querySelectorAll('img[data-src]').forEach(img => coverObserver.observe(img));
}
gallery.addEventListener('click', e => {
  const filter = e.target.closest('[data-model-filter]');
  if (filter) {
    const model = filter.dataset.modelFilter;
    selectedModel = selectedModel === model ? '' : model;
    updateModelFilter();
    renderGallery();
    return;
  }
  const o = e.target.closest('[data-open]');
  if (o) openLoupe(o.dataset.open, true);
});

/* A sustained hover or keyboard focus can mount one passive work. */
const canHover = matchMedia('(hover: hover) and (pointer: fine)');
let timer = 0, hoverCell = null, focusCell = null, wanted = null, livePreview = null;
const allowAutoplay = () => !Home.reducedMotion && !navigator.connection?.saveData;
const playable = target => target?.closest?.('.work-link') ?? null;
const previewResize = new ResizeObserver(([entry]) => {
  if (entry.target === livePreview?.frame.parentElement) Home.sizeLive(livePreview, entry.contentRect.width);
});
const previewViewport = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.target !== wanted || entry.isIntersecting) continue;
    if (hoverCell === wanted) hoverCell = null;
    if (focusCell === wanted) focusCell = null;
    stopPreview();
  }
});
function stopPreview() {
  clearTimeout(timer);
  wanted = null;
  previewViewport.disconnect();
  if (!livePreview) return;
  previewResize.disconnect();
  Home.removeLive(livePreview);
  livePreview = null;
}
function updatePreview() {
  const allowed = !openId && !document.hidden && allowAutoplay();
  const next = allowed ? hoverCell || focusCell : null;
  if (wanted === next) return;
  stopPreview();
  if (!next) return;
  wanted = next;
  previewViewport.observe(next);
  timer = setTimeout(() => {
    const host = next.querySelector('.work-media');
    livePreview = Home.mountLive(host, next.href, next.innerText);
    previewResize.observe(host);
  }, 380);
}
gallery.addEventListener('pointerover', e => {
  if (!canHover.matches || e.pointerType === 'touch') return;
  hoverCell = playable(e.target);
  updatePreview();
});
gallery.addEventListener('pointerout', e => {
  if (!hoverCell || playable(e.relatedTarget) === hoverCell) return;
  hoverCell = null;
  updatePreview();
});
gallery.addEventListener('focusin', e => {
  focusCell = e.target.matches('.work-link:focus-visible') ? playable(e.target) : null;
  updatePreview();
});
gallery.addEventListener('focusout', e => {
  if (focusCell !== playable(e.target)) return;
  focusCell = null;
  updatePreview();
});

/* ---- the loupe ---- */
const page = document.getElementById('page'), loupe = document.getElementById('loupe'), spread = document.getElementById('spread'), promptEl = document.getElementById('prompt');
const playButton = document.getElementById('lplay');
let openId = null, pushed = false, promptLang = Home.lang, lastFocus = null;
let comparison = null, spreadVisible = false;

function updateComparisonActivity() {
  if (!comparison?.ready) return;
  const active = spreadVisible && !document.hidden;
  for (const live of comparison.lives.values()) Home.activateLive(live, active);
}
const spreadViewport = new IntersectionObserver(([entry]) => {
  spreadVisible = entry.isIntersecting;
  updateComparisonActivity();
}, { root: loupe });
spreadViewport.observe(spread);
const comparisonResize = new ResizeObserver(entries => {
  for (const { target, contentRect } of entries) {
    const live = comparison?.lives.get(target);
    if (live) Home.sizeLive(live, contentRect.width);
  }
});

function stopComparison() {
  if (!comparison) return;
  clearTimeout(comparison.timeout);
  comparisonResize.disconnect();
  for (const live of comparison.lives.values()) Home.removeLive(live);
  comparison = null;
  playButton.textContent = Home.t('play');
}

function startComparison() {
  const links = [...spread.querySelectorAll('.work-open')];
  if (!links.length) return;
  const state = { lives: new Map(), ready: false };
  comparison = state;
  playButton.textContent = Home.t('stop');
  const pending = links.map(link => new Promise(resolve => {
    const host = link.closest('article').querySelector('.work-media');
    const live = Home.mountLive(host, link.href, link.getAttribute('aria-label'), { active: false, onPrepare: resolve });
    state.lives.set(host, live);
    comparisonResize.observe(host);
  }));
  const start = () => {
    if (comparison !== state || state.ready) return;
    clearTimeout(state.timeout);
    state.ready = true;
    updateComparisonActivity();
  };
  // Release all animation loops together. Let the available works start if one is slow to load.
  state.timeout = setTimeout(start, 4000);
  Promise.all(pending).then(start);
}

playButton.onclick = () => {
  if (comparison) stopComparison();
  else startComparison();
};
document.addEventListener('visibilitychange', () => {
  updatePreview();
  updateComparisonActivity();
});
Home.motion.addEventListener('change', updatePreview);

function fillLoupe(play = Boolean(comparison)) {
  const p = Home.find(openId), runs = Home.runs(openId), all = Home.prompts(), i = all.indexOf(p);
  const columns = Math.min(runs.length, 3);
  const sizes = coverSizes(columns, 1);
  stopComparison();
  document.getElementById('lt').textContent = L(p.brief);
  document.getElementById('lprev').disabled = i === 0;
  document.getElementById('lnext').disabled = i === all.length - 1;
  spread.style.setProperty('--columns', columns);
  spread.innerHTML = runs.map(({ model: m, run: r }) => {
    if (!r) return `<article><div class="work-media empty">${Home.t('notYet')}</div>
      <div class="note"><h3 class="work-title">${esc(m.name)}</h3></div></article>`;
    const name = workName(r, m), href = Home.href(p.id, m.id);
    return `<article>
      <div class="work-media">${coverImage(p.id, m.id, sizes)}</div>
      <div class="note">
        <div class="note-heading">
          <div><h3 class="work-title">${esc(L(r.title))}</h3>
            <p class="credit">${esc(m.name)} / ${esc(L(r.medium))}</p></div>
          <a class="work-open" href="${href}" target="_blank" rel="noopener" aria-label="${esc(Home.t('openNewTab') + ' · ' + name)}">${Home.t('open')}</a>
        </div>
        <p class="description">${esc(L(r.blurb))}</p>
      </div>
    </article>`;
  }).join('');
  playButton.hidden = !runs.some(({ run }) => run);
  playButton.textContent = Home.t('play');
  if (play) startComparison();
}
async function showPrompt() {
  const id = openId, l = promptLang;
  loupe.querySelectorAll('[data-pl]').forEach(b => b.setAttribute('aria-pressed', b.dataset.pl === l));
  promptEl.lang = l === 'zh' ? 'zh-CN' : 'en';
  try { const { html } = await Home.prompt(id, l); if (id === openId && l === promptLang) promptEl.innerHTML = html; }
  catch { if (id === openId) promptEl.innerHTML = `<p class="err">${Home.t('loadFail')}</p>`; }
}
function show(id) {
  const opening = !openId;
  if (opening) {
    lastFocus = document.activeElement;
    hoverCell = focusCell = null;
    stopPreview();
    loupe.hidden = false;
    page.inert = true; document.body.style.overflow = 'hidden';
  }
  openId = id; promptLang = Home.lang; loupe.scrollTop = 0;
  fillLoupe(opening ? allowAutoplay() : Boolean(comparison)); showPrompt();
  if (opening) document.getElementById('lclose').focus({ preventScroll: true });
}
function hide() {
  if (!openId) return;
  stopComparison(); openId = null; pushed = false;
  loupe.hidden = true; page.inert = false; document.body.style.overflow = '';
  lastFocus && lastFocus.focus();
}
const url = id => location.pathname + location.search + (id ? '#' + id : '');
function openLoupe(id, push) {
  if (selectedModel || !Home.find(id)) return;
  if (push && !openId) { history.pushState({ loupe: true }, '', url(id)); pushed = true; }
  else history.replaceState(history.state, '', url(id));
  show(id);
}
function closeLoupe() {
  if (pushed) history.back(); // popstate does the rest
  else { history.replaceState(null, '', url()); hide(); }
}
function step(d) {
  const all = Home.prompts(), i = all.findIndex(p => p.id === openId), n = all[i + d];
  if (n) openLoupe(n.id, false);
}
addEventListener('popstate', () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const prompt = Home.find(id);
  if (prompt && !selectedModel) show(id);
  else {
    if (prompt) history.replaceState(null, '', url());
    hide();
  }
});
document.getElementById('lclose').onclick = closeLoupe;
document.getElementById('lprev').onclick = () => step(-1);
document.getElementById('lnext').onclick = () => step(1);
addEventListener('keydown', e => {
  if (!openId || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === 'Escape') closeLoupe();
  else if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'ArrowRight') step(1);
});
loupe.querySelectorAll('[data-pl]').forEach(b => b.onclick = () => { promptLang = b.dataset.pl; showPrompt(); });
document.getElementById('copy').onclick = async e => {
  const btn = e.currentTarget, note = document.getElementById('copied');
  try {
    if (await Home.copy((await Home.prompt(openId, promptLang)).text)) {
      btn.textContent = note.textContent = Home.t('copied');
      setTimeout(() => { btn.textContent = Home.t('copy'); note.textContent = ''; }, 1600);
    }
  } catch { promptEl.innerHTML = `<p class="err">${Home.t('loadFail')}</p>`; }
};

document.getElementById('lang').onclick = () => Home.toggle();
document.addEventListener('langchange', () => {
  renderModelFilter();
  renderGallery();
  if (openId) { fillLoupe(); promptLang = Home.lang; showPrompt(); }
});
renderModelFilter();
renderGallery();
const first = decodeURIComponent(location.hash.slice(1));
if (Home.find(first)) openLoupe(first, false);
