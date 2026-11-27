Home.strings({
  docTitle: { zh: '同题印样 · HTML Toys', en: 'Proof Sheet · HTML Toys' },
  title: { zh: '同题印样', en: 'Proof Sheet' },
  lede: {
    zh: '同一段提示词交给不同的模型，各写成一个网页。每一行是一道题，每一列是一个模型，像一张冲洗出来的印样。',
    en: 'One prompt, handed to different models, each answering with a web page. Each row is a prompt, each column a model, laid out like a developed proof sheet.',
  },
  hint: {
    zh: '悬停播放动态预览，点击打开作品。点列头只看一个模型，点「放大对比」并排查看。',
    en: 'Hover to preview a piece, click to open it. Pick a model above to highlight its work, or choose “Compare” to see both versions side by side.',
  },
  foot: { zh: '每件作品都可以独立运行。空帧表示这个模型还没交这道题。', en: 'Each piece runs on its own. A blank frame means that model hasn’t answered yet.' },
  langBtn: { zh: 'EN', en: '中文' },
  langLabel: { zh: 'Switch to English', en: '切换到中文' },
  corner: { zh: '题目 ↓  模型 →', en: 'Prompts ↓  Models →' },
  compare: { zh: '放大对比', en: 'Compare' },
  unexposed: { zh: '未曝光', en: 'Unexposed' },
  notYet: { zh: '还没交卷。', en: 'Not answered yet.' },
  prev: { zh: '上一题', en: 'Previous' },
  next: { zh: '下一题', en: 'Next' },
  close: { zh: '回到印样', en: 'Back to the sheet' },
  open: { zh: '新标签页打开', en: 'Open in new tab' },
  run: { zh: '运行作品', en: 'Run piece' },
  stop: { zh: '回到预览', en: 'Back to preview' },
  promptHead: { zh: '提示词', en: 'The prompt' },
  promptLang: { zh: '提示词语言', en: 'Prompt language' },
  copy: { zh: '复制', en: 'Copy' },
  copied: { zh: '已复制', en: 'Copied' },
  loadFail: { zh: '提示词没能加载。请通过本地服务器或线上地址打开本页。', en: 'The prompt didn’t load. Open this page through a web server.' },
});
const L = o => o[Home.lang];
const zh = () => Home.lang === 'zh';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const qt = s => zh() ? `《${s}》` : `“${s}”`;
const pad = n => String(n).padStart(2, '0');
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

function sheetCoverSizes(columns) {
  const mobile = Math.min(columns, 2.3);
  return `(max-width: 760px) calc(${100 / mobile}vw - ${16 / mobile + 10}px), (max-width: 1600px) calc(${92 / columns}vw - ${208 / columns + 16}px), calc(${100 / columns}vw - ${336 / columns + 16}px)`;
}
// a loose hand-drawn ellipse, different for every frame
function circlePath(seed) {
  let r = seed * 9301 + 49297; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const pts = [], turns = 1.12, n = 40;
  for (let i = 0; i <= n; i++) {
    const a = -2.2 + i / n * Math.PI * 2 * turns, w = 1 + (rnd() - .5) * .05;
    pts.push([50 + 50.5 * w * Math.cos(a), 50 + 51 * w * Math.sin(a)]);
  }
  return 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L');
}

/* ---- the sheet ---- */
let solo = null;
const matrix = document.getElementById('matrix');
function render() {
  const models = Home.models(), prompts = Home.prompts();
  const sizes = sheetCoverSizes(models.length);
  coverObserver.disconnect();
  matrix.style.setProperty('--n', models.length);
  matrix.classList.toggle('soloing', !!solo);
  let html = `<div class="heads"><div class="colhead corner" aria-hidden="true">${Home.t('corner')}</div>` + models.map(m => {
    const have = prompts.filter(p => p.runs[m.id]).length;
    return `<div class="colhead ${solo === m.id ? 'on' : ''}"><button class="solo" type="button" data-solo="${m.id}" aria-pressed="${solo === m.id}" style="--mc:${m.color}">
      <b><i></i><span class="full">${esc(m.name)}</span><span class="abbr" aria-hidden="true">${esc(m.short || m.name)}</span></b>
      <span>${m.vendor ? esc(m.vendor) + (zh() ? '，' : ', ') : ''}${have} / ${prompts.length}</span>
      <svg viewBox="0 0 336 12" preserveAspectRatio="none" aria-hidden="true"><use href="#scribble" fill="none" stroke="#d7262e" stroke-width="3" stroke-linecap="round"/></svg>
    </button></div>`;
  }).join('') + `</div>`;
  let frameNo = 0;
  prompts.forEach((p, ri) => {
    const runs = Home.runs(p.id), have = runs.filter(x => x.run).length;
    html += `<section class="row" id="${p.id}" aria-labelledby="h-${p.id}"><div class="rowhead"><h2 id="h-${p.id}">${esc(L(p.brief))}</h2>
      <span class="tally">${zh() ? `${have} 个模型交卷` : `${have} of ${models.length} answered`}</span>
      <button type="button" data-open="${p.id}" aria-describedby="h-${p.id}">${Home.t('compare')}</button></div><div class="reel">`;
    runs.forEach(({ model: m, run: r }, ci) => {
      frameNo++;
      const on = !solo || solo === m.id;
      const clip = r ? Home.preview(p.id, m.id) : '';
      html += `<div class="cell ${on ? 'on' : ''}" data-model="${m.id}"${clip ? ` data-clip="${clip}"` : ''}><span class="no" aria-hidden="true">${pad(ri + 1)}${String.fromCharCode(65 + ci)}</span>`;
      if (r) html += `<a class="frame" href="${Home.href(p.id, m.id)}" aria-label="${esc(workName(r, m))}">
          ${coverImage(p.id, m.id, sizes, { deferred: ri !== 0, priority: ri === 0 && ci === 0 ? 'high' : 'auto' })}<div class="preview"></div>
          <span class="cap" aria-hidden="true">${esc(qt(L(r.title)))}</span></a>
          <svg class="mark" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${circlePath(frameNo)}" vector-effect="non-scaling-stroke" pathLength="1400"/></svg>`;
      else html += `<div class="unexposed"><b>${Home.t('unexposed')}</b><span>${esc(m.short || m.name)}</span></div>`;
      html += `</div>`;
    });
    html += `</div></section>`;
  });
  matrix.innerHTML = html;
  matrix.querySelectorAll('img[data-src]').forEach(img => coverObserver.observe(img));
  const works = prompts.reduce((n, p) => n + Object.keys(p.runs).filter(id => Home.model(id)).length, 0);
  document.getElementById('stats').textContent = zh()
    ? `现在有 ${prompts.length} 道题、${models.length} 个模型、${works} 件作品。`
    : `${prompts.length} prompts, ${models.length} models, ${works} pieces so far.`;
}
matrix.addEventListener('click', e => {
  const s = e.target.closest('[data-solo]');
  if (s) {
    solo = solo === s.dataset.solo ? null : s.dataset.solo;
    matrix.classList.toggle('soloing', !!solo);
    matrix.querySelectorAll('[data-model]').forEach(el => el.classList.toggle('on', !solo || el.dataset.model === solo));
    matrix.querySelectorAll('[data-solo]').forEach(button => {
      const on = button.dataset.solo === solo;
      button.parentElement.classList.toggle('on', on);
      button.setAttribute('aria-pressed', on);
    });
    return;
  }
  const o = e.target.closest('[data-open]');
  if (o) openLoupe(o.dataset.open, true);
});

/* One clip can be playing or held ready for a second hover. */
const canHover = matchMedia('(hover: hover) and (pointer: fine)');
let timer = 0, hoverCell = null, focusCell = null, wanted = null, clip = null, clipCell = null;
const autoplayClips = () => !Home.reducedMotion && !document.hidden && !navigator.connection?.saveData;
const playable = target => target?.closest?.('.cell[data-clip]') ?? null;
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
matrix.addEventListener('pointerover', e => {
  if (!canHover.matches || e.pointerType === 'touch') return;
  hoverCell = playable(e.target);
  updatePreview();
});
matrix.addEventListener('pointerout', e => {
  if (!hoverCell || playable(e.relatedTarget) === hoverCell) return;
  hoverCell = null;
  updatePreview();
});
matrix.addEventListener('focusin', e => {
  focusCell = e.target.matches('.frame:focus-visible') ? playable(e.target) : null;
  updatePreview();
});
matrix.addEventListener('focusout', e => {
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
  unwatch();
  document.getElementById('lt').textContent = L(p.brief);
  document.getElementById('lcount').textContent = `${i + 1} / ${all.length}`;
  document.getElementById('lprev').disabled = i === 0;
  document.getElementById('lnext').disabled = i === all.length - 1;
  spread.style.setProperty('--n', runs.length);
  const sizes = `(max-width: 400px) calc(100vw - 56px), (max-width: 760px) calc(92vw - 24px), (max-width: 1600px) calc(${92 / runs.length}vw - ${12 / runs.length + 16}px), calc(${100 / runs.length}vw - ${140 / runs.length + 16}px)`;
  spread.innerHTML = runs.map(({ model: m, run: r }, c) => `
    <div class="shot film" style="--c:${c + 1}">${r
      ? `<div class="stage" id="stage-${c}" data-src="${Home.href(p.id, m.id)}" data-clip="${Home.preview(p.id, m.id)}" data-title="${esc(workName(r, m))}">${coverImage(p.id, m.id, sizes)}</div>`
      : `<div class="unexposed"><b>${Home.t('unexposed')}</b><span>${esc(m.name)}</span></div>`}</div>
    <div class="note" style="--c:${c + 1};--mc:${m.color}">
      <h3><i></i>${esc(m.name)}${r ? `<span class="work-controls">
        <button class="pill" type="button" data-stage="stage-${c}" aria-controls="stage-${c}" aria-label="${esc(Home.t('run') + ' · ' + workName(r, m))}">${Home.t('run')}</button>
        <a href="${Home.href(p.id, m.id)}" target="_blank" rel="noopener" aria-label="${esc(Home.t('open') + (zh() ? '：' : ': ') + workName(r, m))}">${Home.t('open')}</a></span>` : ''}</h3>
      <p>${r ? `${esc(qt(L(r.title)))} ${esc(L(r.medium))}${zh() ? '。' : '. '}${esc(L(r.blurb))}` : Home.t('notYet')}</p></div>`).join('');
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
  if (!openId) {
    lastFocus = document.activeElement;
    hoverCell = focusCell = null;
    stopPreview(true);
    loupe.hidden = false; loupe.classList.add('open');
    page.inert = true; document.body.style.overflow = 'hidden';
    document.getElementById('lclose').focus({ preventScroll: true });
  }
  openId = id; promptLang = Home.lang; loupe.scrollTop = 0;
  fillLoupe(); showPrompt();
}
function hide() {
  if (!openId) return;
  unwatch(); openId = null; pushed = false;
  loupe.classList.remove('open'); page.inert = false; document.body.style.overflow = '';
  setTimeout(() => { if (!openId) loupe.hidden = true; }, 300);
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
