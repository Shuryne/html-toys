// Shared helpers for language, prompts, preview clips, and embedded works.
(() => {
  const KEY = 'html-toys:lang';
  const pick = () => {
    const saved = localStorage.getItem(KEY);
    if (saved === 'zh' || saved === 'en') return saved;
    return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  };
  let lang = pick();
  let dict = {};

  function apply() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-t]').forEach(el => {
      const v = dict[el.dataset.t];
      if (v) el.textContent = v[lang];
    });
    document.querySelectorAll('[data-t-attr]').forEach(el => {
      for (const pair of el.dataset.tAttr.split(';')) {
        const [attr, k] = pair.split(':');
        if (dict[k]) el.setAttribute(attr, dict[k][lang]);
      }
    });
    if (dict.docTitle) document.title = dict.docTitle[lang];
  }

  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');

  // Enough Markdown for the prompts: headings, paragraphs, lists, fenced code, inline code/bold/italic.
  function md(src) {
    const out = [];
    let para = [], list = null, fence = null;
    const flushPara = () => { if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`); para = []; };
    const flushList = () => { if (list) out.push(`<${list.tag}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; };
    for (const line of src.replace(/\r/g, '').split('\n')) {
      if (fence) {
        if (/^```/.test(line)) { out.push(`<pre><code>${esc(fence.join('\n'))}</code></pre>`); fence = null; }
        else fence.push(line);
        continue;
      }
      if (/^```/.test(line)) { flushPara(); flushList(); fence = []; continue; }
      let m;
      if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        flushPara(); flushList();
        const n = Math.min(6, m[1].length + 1); // prompt h2 -> h3 so it nests under the page's heading
        out.push(`<h${n}>${inline(m[2])}</h${n}>`);
      } else if ((m = line.match(/^\s*([-*]|\d+\.)\s+(.*)$/))) {
        flushPara();
        const tag = /\d/.test(m[1]) ? 'ol' : 'ul';
        if (!list || list.tag !== tag) { flushList(); list = { tag, items: [] }; }
        list.items.push(m[2]);
      } else if (!line.trim()) {
        flushPara(); flushList();
      } else if (list && /^\s{2,}/.test(line)) {
        list.items[list.items.length - 1] += ' ' + line.trim();
      } else {
        flushList();
        // Chinese lines join without a space; others with one.
        if (para.length && /[　-鿿＀-￯]$/.test(para[para.length - 1])) para[para.length - 1] += line.trim();
        else para.push(line.trim());
      }
    }
    flushPara(); flushList();
    return out.join('\n');
  }

  const cache = new Map();
  async function prompt(id, l = lang) {
    const k = `${l}/${id}`;
    if (!cache.has(k)) {
      cache.set(k, fetch(new URL(`prompts/${l}/${id}.md`, Home.base)).then(r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.text();
      }).then(text => ({ text: text.trim(), html: md(text) })).catch(e => { cache.delete(k); throw e; }));
    }
    return cache.get(k);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove(); return ok;
    }
  }

  function mountClip(host, src, { loop = true } = {}) {
    const video = document.createElement('video');
    video.preload = 'none';
    video.defaultMuted = video.muted = video.playsInline = true;
    video.loop = loop;
    video.setAttribute('aria-hidden', 'true');
    video.addEventListener('playing', () => video.classList.add('is-playing'));
    video.src = src;
    host.append(video);
    return video;
  }

  function playClip(video) {
    video.play().catch(() => {});
  }

  function removeClip(video) {
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.remove();
  }

  const embedWidth = 1440;
  const lives = new WeakMap();
  function mountLive(host, src, title) {
    const frame = document.createElement('iframe');
    frame.src = src;
    frame.title = title;
    frame.setAttribute('allow', 'autoplay; fullscreen');
    const live = { frame, active: true, width: 0 };
    lives.set(frame, live);
    sizeLive(live, host.clientWidth);
    host.append(frame);
    return live;
  }

  function sizeLive(live, width) {
    if (width <= 0 || live.width === width) return;
    const previous = live.width;
    live.width = width;
    live.frame.style.transform = `scale(${width / embedWidth})`;
    if (previous) live.resize?.();
  }

  // Works call this at the start of their scripts when framed by the gallery.
  function prepareWork(win) {
    const live = lives.get(win.frameElement);
    if (!live) return;
    const request = win.requestAnimationFrame.bind(win);
    const cancel = win.cancelAnimationFrame.bind(win);
    const now = win.performance.now.bind(win.performance);
    const pending = new Map();
    const audio = new Set();
    const suspendedAudio = new Set();
    let id = 0, pausedAt = live.active ? null : now(), pausedTime = 0;

    const schedule = (key, job) => {
      job.frame = request(timestamp => {
        pending.delete(key);
        job.callback(timestamp - pausedTime);
      });
    };
    win.requestAnimationFrame = callback => {
      const key = ++id, job = { callback };
      pending.set(key, job);
      if (live.active) schedule(key, job);
      return key;
    };
    win.cancelAnimationFrame = key => {
      const job = pending.get(key);
      if (job?.frame !== undefined) cancel(job.frame);
      pending.delete(key);
    };
    win.performance.now = () => (pausedAt ?? now()) - pausedTime;

    win.ToyEmbed = {
      get active() { return live.active; },
      get pixelRatio() { return Math.max(.25, (win.devicePixelRatio || 1) * live.width / embedWidth); },
      trackAudio(context) { audio.add(context); },
    };
    live.resize = () => win.dispatchEvent(new win.Event('resize'));
    live.setActive = active => {
      if (active) {
        pausedTime += now() - pausedAt;
        pausedAt = null;
        for (const [key, job] of pending) schedule(key, job);
        for (const context of suspendedAudio) context.resume().catch(() => {});
        suspendedAudio.clear();
      } else {
        pausedAt = now();
        for (const job of pending.values()) if (job.frame !== undefined) cancel(job.frame);
        for (const context of audio) if (context.state === 'running') {
          suspendedAudio.add(context);
          context.suspend().catch(() => {});
        }
      }
      win.dispatchEvent(new win.Event('toyvisibilitychange'));
    };
  }

  function activateLive(live, active) {
    if (live.active === active) return;
    live.active = active;
    live.setActive?.(active);
  }

  function removeLive(live) {
    activateLive(live, false);
    lives.delete(live.frame);
    live.frame.remove();
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const media = JSON.parse(document.getElementById('gallery-media').textContent);

  window.Home = {
    // Resolve works/prompts/covers relative to the site root, wherever this page sits.
    base: new URL(document.currentScript.src.replace(/assets\/home\.js.*$/, ''), location.href),
    get lang() { return lang; },
    set lang(v) {
      lang = v; localStorage.setItem(KEY, v); apply();
      document.dispatchEvent(new CustomEvent('langchange', { detail: v }));
    },
    toggle() { this.lang = lang === 'zh' ? 'en' : 'zh'; },
    strings(d) { dict = d; apply(); },
    t(k) { return dict[k] ? dict[k][lang] : k; },
    models: () => window.MODELS,
    prompts: () => window.PROMPTS,
    find: id => window.PROMPTS.find(p => p.id === id),
    model: id => window.MODELS.find(m => m.id === id),
    // Every model in MODELS order, with its run for this prompt or null.
    runs: id => { const p = window.PROMPTS.find(x => x.id === id); return window.MODELS.map(m => ({ model: m, run: (p && p.runs[m.id]) || null })); },
    cover: (id, model) => new URL(`covers/${id}/${model}.webp`, Home.base).href,
    covers: (id, model) => {
      const src = Home.cover(id, model), widths = media[id]?.[model]?.widths || [];
      return widths.map(w => `${src.replace(/\.webp$/, `-${w}.webp`)} ${w}w`).concat(`${src} 1200w`).join(', ');
    },
    preview: (id, model) => media[id]?.[model]?.preview ? new URL(`previews/${id}/${model}.mp4`, Home.base).href : '',
    href: (id, model) => new URL(`works/${id}/${model}.html`, Home.base).href,
    md, prompt, copy, mountClip, playClip, removeClip, mountLive, sizeLive, activateLive, removeLive, prepareWork,
    motion: reduced,
    get reducedMotion() { return reduced.matches; },
  };
})();
