// Shared helpers for the home page: language, prompt loading + tiny Markdown, live previews.
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

  // Live iframes, keyed by their host element. Hover previews are exclusive (one on the page);
  // the comparison view mounts one per model side by side.
  const lives = new Map();
  function mountLive(host, src, { exclusive = true, onload, title } = {}) {
    const have = lives.get(host);
    if (have && have.src === src) return have;
    if (exclusive) unmountLive(); else unmountLive(host);
    const f = document.createElement('iframe');
    f.src = src;
    f.title = title || src.split('/').slice(-2).join(' / ');
    f.setAttribute('allow', 'autoplay; fullscreen');
    f.tabIndex = -1;
    f.addEventListener('load', () => { f.classList.add('is-loaded'); onload && onload(f); }, { once: true });
    host.append(f);
    const live = { host, src, frame: f };
    lives.set(host, live);
    return live;
  }
  function unmountLive(host) {
    for (const [h, l] of lives) if (!host || h === host) { l.frame.remove(); lives.delete(h); }
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

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
    href: (id, model) => new URL(`works/${id}/${model}.html`, Home.base).href,
    md, prompt, copy, mountLive, unmountLive,
    get reducedMotion() { return reduced.matches; },
  };
})();
