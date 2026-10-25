(() => {
  'use strict';
  const prefix = 'mt-public:';
  const read = (key) => {
    try { return JSON.parse(localStorage.getItem(prefix + key) || 'null'); }
    catch { return null; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(prefix + key, JSON.stringify(value)); }
    catch {}
  };
  const stored = read('settings');
  const settings = stored && typeof stored === 'object' ? stored : {};
  const themes = ['auto', 'light', 'dark'];
  const sizes = ['100', '112', '125', '140'];
  const theme = document.getElementById('theme');
  const size = document.getElementById('font-size');
  theme.value = themes.includes(settings.theme) ? settings.theme : 'auto';
  size.value = sizes.includes(settings.size) ? settings.size : '100';
  const apply = () => {
    document.documentElement.dataset.theme = theme.value;
    document.documentElement.style.setProperty('--reader-size', size.value + '%');
  };
  const saveSettings = () => {
    write('settings', {theme: theme.value, size: size.value});
    apply();
  };
  theme.addEventListener('change', saveSettings);
  size.addEventListener('change', saveSettings);
  apply();
  const validChapter = (chapter) => typeof chapter === 'string' && /^ch(?:0[0-9]|1[0-2])$/.test(chapter);
  const validId = (chapter, id) => typeof id === 'string' &&
    /^v01\.c(?:0[0-9]|1[0-2])\.p[0-9]{4}$/.test(id) && id.slice(5, 7) === chapter.slice(2);
  const chapter = document.body.dataset.chapter;
  if (validChapter(chapter)) {
    const rows = [...document.querySelectorAll('.prose-row[id]')];
    const saved = read('position:' + chapter);
    if (!location.hash && validId(chapter, saved)) {
      requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(saved)?.scrollIntoView()));
    }
    const remember = () => {
      const threshold = document.querySelector('.toolbar').getBoundingClientRect().bottom + 20;
      let current = rows[0];
      for (const row of rows) {
        if (row.getBoundingClientRect().top > threshold) break;
        current = row;
      }
      if (current) {
        write('position:' + chapter, current.id);
        write('last', {chapter, id: current.id, title: document.body.dataset.title});
      }
    };
    let timer;
    addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(remember, 200); }, {passive:true});
    addEventListener('pagehide', remember);
    document.addEventListener('visibilitychange', () => { if (document.hidden) remember(); });
  }
  const continuation = document.getElementById('continue');
  const last = read('last');
  if (continuation && last && validChapter(last.chapter) && validId(last.chapter, last.id)) {
    continuation.href = 'vol01/' + last.chapter + '.html#' + last.id;
    continuation.textContent = 'Continue reading: ' + (typeof last.title === 'string' ? last.title : 'Volume 1');
    continuation.hidden = false;
  }
})();
