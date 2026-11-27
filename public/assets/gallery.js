Home.strings({
  docTitle: { zh: '网页小品 · HTML Toys', en: 'Web Miniatures · HTML Toys' },
  title: { zh: '网页小品', en: 'Web Miniatures' },
  lede: {
    zh: '看灯塔一笔笔成形，去池边喂几尾锦鲤。这里收藏着 Claude、GPT 等模型创作的互动网页。',
    en: 'Watch a lighthouse take shape, brushstroke by brushstroke, or stop to feed the koi. A collection of interactive web pieces by Claude, GPT, and other AI models.',
  },
  hint: { zh: '悬停看动态', en: 'Hover to preview' },
  langBtn: { zh: 'EN', en: '中文' },
  langLabel: { zh: 'Switch to English', en: '切换到中文' },
  allWorks: { zh: '全部', en: 'All works' },
  modelFocus: { zh: '按模型聚焦作品', en: 'Highlight works by model' },
  focusModel: { zh: '聚焦', en: 'Highlight' },
  compare: { zh: '并排看', en: 'View side by side' },
  notYet: { zh: '暂无作品', en: 'No work yet' },
  prev: { zh: '上一组', en: 'Previous' },
  next: { zh: '下一组', en: 'Next' },
  close: { zh: '返回', en: 'Back' },
  open: { zh: '新标签页打开', en: 'Open in new tab' },
  run: { zh: '体验作品', en: 'Try it' },
  stop: { zh: '回到预览', en: 'Back to preview' },
  promptHead: { zh: '原始提示词', en: 'Original prompt' },
  promptOrigin: { zh: '这些作品从同一份提示词出发。', en: 'These works started with the same prompt.' },
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

let solo = '';
const gallery = document.getElementById('gallery');
const modelFocus = document.getElementById('model-focus');
const groups = document.getElementById('gallery-groups');

function updateSolo() {
  groups.classList.toggle('has-focus', Boolean(solo));
  for (const card of groups.querySelectorAll('[data-model]')) {
    card.classList.toggle('highlighted', card.dataset.model === solo);
  }
  for (const button of modelFocus.querySelectorAll('[data-solo]')) {
    button.setAttribute('aria-pressed', button.dataset.solo === solo);
  }
}

function render() {
  const models = Home.models(), prompts = Home.prompts();
  const columns = Math.min(models.length, 3), mobileColumns = Math.min(columns, 2);
  const sizes = coverSizes(columns, mobileColumns);
  coverObserver.disconnect();
  groups.style.setProperty('--columns', columns);
  groups.style.setProperty('--mobile-columns', mobileColumns);
  modelFocus.innerHTML = `<button class="model-choice" type="button" data-solo="">${Home.t('allWorks')}</button>` + models.map(m =>
    `<button class="model-choice" type="button" data-solo="${esc(m.id)}" title="${esc(Home.t('focusModel') + ' ' + m.name)}">
      <span class="model-dot" aria-hidden="true" style="--model-color:${m.color}"></span>${esc(m.short || m.name)}</button>`
  ).join('');

  groups.innerHTML = prompts.map((p, ri) => {
    const runs = Home.runs(p.id);
    const hint = ri === 0 && !navigator.connection?.saveData
      ? `<span class="preview-hint">${Home.t('hint')}</span>` : '';
    const cards = runs.map(({ model: m, run: r }, ci) => {
      const credit = `<p class="credit">${esc(m.name)}</p>`;
      if (!r) return `<article class="work-card" data-model="${esc(m.id)}">
        <div class="work-media empty">${Home.t('notYet')}</div><div class="work-caption">${credit}</div></article>`;
      const clip = Home.preview(p.id, m.id);
      const image = coverImage(p.id, m.id, sizes, { deferred: ri !== 0, priority: ri === 0 && ci === 0 ? 'high' : 'auto' });
      return `<article class="work-card" data-model="${esc(m.id)}">
        <a class="work-link" href="${Home.href(p.id, m.id)}"${clip ? ` data-clip="${clip}"` : ''}>
          <div class="work-media">${image}${clip ? '<div class="preview" aria-hidden="true"></div>' : ''}</div>
          <div class="work-caption"><h3 class="work-title">${esc(L(r.title))}</h3>${credit}</div>
        </a></article>`;
    }).join('');
    return `<section id="${p.id}" aria-labelledby="h-${p.id}">
      <div class="group-heading"><h2 id="h-${p.id}">${esc(L(p.brief))}</h2>
        <div class="group-actions">${hint}<button class="text-button" type="button" data-open="${p.id}" aria-describedby="h-${p.id}">${Home.t('compare')}</button></div>
      </div>
      <div class="work-grid">${cards}</div>
    </section>`;
  }).join('');
  updateSolo();
  groups.querySelectorAll('img[data-src]').forEach(img => coverObserver.observe(img));
}
gallery.addEventListener('click', e => {
  const s = e.target.closest('[data-solo]');
  if (s) {
    solo = solo === s.dataset.solo ? '' : s.dataset.solo;
    updateSolo();
    return;
  }
  const o = e.target.closest('[data-open]');
  if (o) openLoupe(o.dataset.open, true);
});

/* One clip can be playing or held ready for a second hover. */
const canHover = matchMedia('(hover: hover) and (pointer: fine)');
let timer = 0, hoverCell = null, focusCell = null, wanted = null, clip = null, clipCell = null;
const autoplayClips = () => !Home.reducedMotion && !document.hidden && !navigator.connection?.saveData;
const playable = target => target?.closest?.('.work-link[data-clip]') ?? null;
function stopPreview(release = false) {
  clearTimeout(timer);
  wanted = null;
  if (!clip) return;
  clipCell.classList.remove('is-live');
  if (release || clip.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    Home.removeClip(clip);
    clip = clipCell = null;
  } else {
    clip.pause();
  }
}
function updatePreview() {
  const next = !openId && autoplayClips() ? hoverCell || focusCell : null;
  if (wanted === next) return;
  stopPreview();
  if (!next) return;
  wanted = next;
  timer = setTimeout(() => {
    if (clipCell !== next) {
      if (clip) Home.removeClip(clip);
      clipCell = next;
      clip = Home.mountClip(next.querySelector('.preview'), next.dataset.clip);
    }
    next.classList.add('is-live');
    Home.playClip(clip);
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
let openId = null, pushed = false, promptLang = Home.lang, lastFocus = null;
const stages = new Map();
function updateStage(state) {
  const visible = state.visible && !document.hidden;
  if (state.live) {
    Home.activateLive(state.live, visible);
    state.live.frame.inert = !visible;
    return;
  }
  const play = visible && autoplayClips() && state.stage.dataset.clip;
  if (play && !state.clip) state.clip = Home.mountClip(state.stage, state.stage.dataset.clip, { loop: false });
  if (state.clip) {
    if (play && !state.clip.ended) Home.playClip(state.clip);
    else state.clip.pause();
  }
}
const io = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const state = stages.get(entry.target);
    if (!state) continue;
    state.visible = entry.isIntersecting && entry.intersectionRatio >= .15;
    updateStage(state);
  }
}, { root: loupe, threshold: .15 });
const ro = new ResizeObserver(entries => {
  for (const { target, contentRect } of entries) {
    const live = stages.get(target)?.live;
    if (live) Home.sizeLive(live, contentRect.width);
  }
});
function unwatch() {
  io.disconnect();
  ro.disconnect();
  for (const state of stages.values()) {
    if (state.live) Home.removeLive(state.live);
    if (state.clip) Home.removeClip(state.clip);
  }
  stages.clear();
}

spread.addEventListener('click', e => {
  const button = e.target.closest('[data-stage]');
  if (!button) return;
  const stage = document.getElementById(button.dataset.stage), state = stages.get(stage);
  if (!state) return;
  if (state.live) {
    ro.unobserve(stage);
    Home.removeLive(state.live);
    state.live = null;
    if (state.clip?.ended) state.clip.currentTime = 0;
  } else {
    if (state.clip && state.clip.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      Home.removeClip(state.clip);
      state.clip = null;
    } else {
      state.clip?.pause();
    }
    state.live = Home.mountLive(stage, stage.dataset.src, stage.dataset.title);
    ro.observe(stage);
    if (!state.visible) stage.scrollIntoView({ block: 'nearest' });
  }
  const label = Home.t(state.live ? 'stop' : 'run');
  button.textContent = label;
  button.setAttribute('aria-label', label + ' · ' + stage.dataset.title);
  updateStage(state);
});

function updatePlayback() {
  updatePreview();
  for (const state of stages.values()) updateStage(state);
}
document.addEventListener('visibilitychange', updatePlayback);
Home.motion.addEventListener('change', updatePlayback);

function fillLoupe() {
  const p = Home.find(openId), runs = Home.runs(openId), all = Home.prompts(), i = all.indexOf(p);
  const columns = Math.min(runs.length, 3);
  const sizes = coverSizes(columns, 1);
  unwatch();
  document.getElementById('lt').textContent = L(p.brief);
  document.getElementById('lprev').disabled = i === 0;
  document.getElementById('lnext').disabled = i === all.length - 1;
  spread.style.setProperty('--columns', columns);
  spread.innerHTML = runs.map(({ model: m, run: r }, c) => {
    if (!r) return `<article><div class="work-media empty">${Home.t('notYet')}</div>
      <div class="note"><h3 class="work-title">${esc(m.name)}</h3></div></article>`;
    const name = workName(r, m), href = Home.href(p.id, m.id);
    return `<article>
      <div class="work-media stage" id="stage-${c}" data-src="${href}" data-clip="${Home.preview(p.id, m.id)}" data-title="${esc(name)}">${coverImage(p.id, m.id, sizes)}</div>
      <div class="note">
        <div class="note-heading">
          <div><h3 class="work-title">${esc(L(r.title))}</h3>
            <p class="credit">${esc(m.name)} / ${esc(L(r.medium))}</p></div>
          <div class="work-controls">
            <button class="pill" type="button" data-stage="stage-${c}" aria-controls="stage-${c}" aria-label="${esc(Home.t('run') + ' · ' + name)}">${Home.t('run')}</button>
            <a href="${href}" target="_blank" rel="noopener" aria-label="${esc(Home.t('open') + (zh() ? '：' : ': ') + name)}">${Home.t('open')}</a>
          </div>
        </div>
        <p class="description">${esc(L(r.blurb))}</p>
      </div>
    </article>`;
  }).join('');
  for (const stage of spread.querySelectorAll('.stage')) {
    stages.set(stage, { stage, visible: false, clip: null, live: null });
    io.observe(stage);
  }
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
    stopPreview(true);
    loupe.hidden = false;
    page.inert = true; document.body.style.overflow = 'hidden';
  }
  openId = id; promptLang = Home.lang; loupe.scrollTop = 0;
  fillLoupe(); showPrompt();
  if (opening) document.getElementById('lclose').focus({ preventScroll: true });
}
function hide() {
  if (!openId) return;
  unwatch(); openId = null; pushed = false;
  loupe.hidden = true; page.inert = false; document.body.style.overflow = '';
  lastFocus && lastFocus.focus();
}
const url = id => location.pathname + location.search + (id ? '#' + id : '');
function openLoupe(id, push) {
  if (!Home.find(id)) return;
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
  if (Home.find(id)) show(id); else hide();
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
  hoverCell = focusCell = null;
  stopPreview(true);
  render();
  if (openId) { fillLoupe(); promptLang = Home.lang; showPrompt(); }
});
render();
const first = decodeURIComponent(location.hash.slice(1));
if (Home.find(first)) openLoupe(first, false);
