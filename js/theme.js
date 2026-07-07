// theme.js — runs first, before anything renders

const Theme = (() => {
  const STORAGE_KEY = 'gh-dashboard-theme';
  const root = document.documentElement;

  // Read saved preference, fall back to OS preference, then 'light'
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggle() {
    const current = root.getAttribute('data-theme');
    apply(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    // Apply theme immediately — before page paints — prevents flash
    apply(getInitialTheme());

    // Wire up the button
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  // Public API
  return { init, toggle, apply };
})();

// Run immediately
Theme.init();