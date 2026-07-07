// main.js — app entry point, orchestrates everything

const App = (() => {

async function handleSearch() {
  const input    = document.getElementById('usernameInput');
  const username = input.value.trim();
  if (!username) { alert('Please enter a GitHub username'); return; }

  const btn = document.getElementById('searchBtn');
  btn.disabled = true;
  btn.textContent = 'Loading…';

  try {
    const rawData     = await API.getAllUserData(username);
    const transformed = DataTransformer.transformAll(rawData);
    const stats       = Stats.compute(transformed);

    // Render dashboard immediately
    DomRenderer.render(transformed, stats);
    animateStats();

    // Step 1: instant rule-based tips
    const ruleTips = RuleEngine.analyse({ transformed, stats });
    SuggestionRenderer.render('suggestionsContainer', ruleTips);

    // Step 2: AI tips load in background — don't await before rendering
    SuggestionRenderer.renderLoading('suggestionsContainer');

    // Show rule tips immediately while AI loads
    SuggestionRenderer.render('suggestionsContainer', ruleTips);

    // Then fetch AI tips and merge
    AiSuggestions.analyse({ transformed, stats })
      .then(aiTips => {
        SuggestionRenderer.render('suggestionsContainer', ruleTips, aiTips);
      })
      .catch(() => {
        // AI failed silently — rule tips already showing, that's fine
        console.warn('AI suggestions unavailable');
      });

  } catch (error) {
    DomRenderer.renderError(error.message);
  } finally {
    btn.disabled  = false;
    btn.textContent = 'Analyze';
  }
}


  function handleCompareToggle() {
    const btn = document.getElementById('compareToggle');
    const inputs = document.getElementById('compareInputs');
    const isOpen = inputs.classList.toggle('visible');
    btn.textContent = isOpen ? '− Hide compare' : '+ Compare profiles';
    btn.setAttribute('aria-expanded', isOpen);
  }

  function init() {
    const searchBtn = document.getElementById('searchBtn');
    const compareToggle = document.getElementById('compareToggle');
    const input = document.getElementById('usernameInput');
    

    searchBtn.addEventListener('click', handleSearch);

    initShareButton();
    initFromURL();
    initExportButton();
    initKeyboardNav();
    const swPath = window.location.pathname.includes('github-dashboard')
    ? '/github-dashboard/service-worker.js'
    : '/service-worker.js';
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(swPath)
      .catch(err => console.warn('SW failed:', err));
    }

    // Also search when user presses Enter in the input
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });

    compareToggle.addEventListener('click', handleCompareToggle);

    console.log('GitHub Analytics Dashboard initialised');
    // If compare inputs are visible and have values, run compare instead of single search
    document.getElementById('searchBtn').addEventListener('click', () => {
      const compareInputs = document.querySelectorAll('.compare-input');
      const hasCompare = Array.from(compareInputs).some(i => i.value.trim());
      if (hasCompare) handleCompare();
      else handleSearch();
    });
  }

  return { init };
})();

// Start the app
document.addEventListener('DOMContentLoaded', App.init);

async function handleCompare() {
  const mainInput = document.getElementById('usernameInput');
  const compareInputs = document.querySelectorAll('.compare-input');

  const usernames = [
    mainInput.value.trim(),
    ...Array.from(compareInputs).map(i => i.value.trim())
  ].filter(Boolean); // remove empty strings

  if (usernames.length < 2) {
    alert('Enter at least 2 usernames to compare');
    return;
  }

  if (usernames.length > 3) {
    alert('Maximum 3 profiles can be compared');
    return;
  }

  const btn = document.getElementById('searchBtn');
  btn.disabled = true;
  btn.textContent = 'Comparing…';

  try {
    const results = await Comparator.compare(usernames);
    DomRenderer.renderComparison(results);
  } catch (err) {
    DomRenderer.renderError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Analyze';
  }
}

// Animates a number counting up from 0 to target
function animateCounter(element, target, duration = 800) {
  const start = performance.now();
  const isLarge = target > 999;

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out: starts fast, slows at the end
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    element.textContent = current.toLocaleString();

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Call after DomRenderer.render() to animate all stat values
function animateStats() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const raw = parseInt(el.textContent.replace(/,/g, ''), 10);
    if (!isNaN(raw) && raw > 0) animateCounter(el, raw);
  });
}

function showToast(message, type = 'success', duration = 2500) {
  // Remove existing toast if any
  document.querySelector('.toast')?.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── SHAREABLE LINK ──
function buildShareURL(usernames) {
  const url = new URL(window.location.href);
  url.searchParams.set('users', usernames.join(','));
  return url.toString();
}

function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const users  = params.get('users');
  return users ? users.split(',').filter(Boolean) : [];
}

function initShareButton() {
  // Add share button to header-right in the DOM
  const headerRight = document.querySelector('.header-right');
  const btn = document.createElement('button');
  btn.className = 'btn btn-secondary';
  btn.id = 'shareBtn';
  btn.style.fontSize = '0.8rem';
  btn.style.padding  = '6px 12px';
  btn.textContent    = '🔗 Share';
  btn.setAttribute('aria-label', 'Copy shareable link');
  headerRight.prepend(btn);

  btn.addEventListener('click', () => {
    const input    = document.getElementById('usernameInput').value.trim();
    const compares = Array.from(document.querySelectorAll('.compare-input'))
                         .map(i => i.value.trim()).filter(Boolean);
    const all = [input, ...compares].filter(Boolean);

    if (!all.length) {
      showToast('Search for a profile first', 'error');
      return;
    }

    const url = buildShareURL(all);
    navigator.clipboard.writeText(url)
      .then(() => showToast('Link copied to clipboard!'))
      .catch(() => showToast('Could not copy link', 'error'));
  });
}

// Auto-load from URL on page open
function initFromURL() {
  const usernames = readURLParams();
  if (!usernames.length) return;

  if (usernames.length === 1) {
    document.getElementById('usernameInput').value = usernames[0];
    handleSearch();
  } else {
    document.getElementById('usernameInput').value = usernames[0];
    const compareInputs = document.querySelectorAll('.compare-input');
    usernames.slice(1).forEach((u, i) => {
      if (compareInputs[i]) compareInputs[i].value = u;
    });
    // Show compare inputs
    document.getElementById('compareInputs').classList.add('visible');
    handleCompare();
  }
}

// ── EXPORT TO PNG ──
function initExportButton() {
  const headerRight = document.querySelector('.header-right');
  const btn = document.createElement('button');
  btn.className = 'btn btn-secondary';
  btn.id = 'exportBtn';
  btn.style.fontSize = '0.8rem';
  btn.style.padding  = '6px 12px';
  btn.textContent    = '📥 Export PNG';
  btn.setAttribute('aria-label', 'Export dashboard as PNG image');
  headerRight.prepend(btn);

  btn.addEventListener('click', async () => {
    const main = document.getElementById('mainContent');
    if (!main || main.querySelector('.empty-state')) {
      showToast('Nothing to export yet', 'error');
      return;
    }

    btn.textContent  = 'Capturing…';
    btn.disabled     = true;

    try {
      const canvas = await html2canvas(main, {
        useCORS: true,           // needed for avatar images from github
        backgroundColor: getComputedStyle(document.body)
                          .getPropertyValue('background-color'),
        scale: 2,                // 2x resolution — crisp on retina screens
        logging: false,
      });

      // Convert canvas to blob and trigger download
      canvas.toBlob(blob => {
        const url      = URL.createObjectURL(blob);
        const link     = document.createElement('a');
        link.download  = `github-dashboard-${Date.now()}.png`;
        link.href      = url;
        link.click();
        URL.revokeObjectURL(url); // clean up memory
        showToast('Dashboard exported!');
      }, 'image/png');

    } catch (err) {
      showToast('Export failed', 'error');
      console.error(err);
    } finally {
      btn.textContent = '📥 Export PNG';
      btn.disabled    = false;
    }
  });
}

// ── KEYBOARD SHORTCUTS ──
function initKeyboardNav() {
  document.addEventListener('keydown', e => {

    // Don't intercept if user is typing in an input
    if (['INPUT','TEXTAREA'].includes(e.target.tagName)) {
      // Only intercept Escape inside inputs
      if (e.key === 'Escape') {
        e.target.blur();
        e.target.value = '';
      }
      return;
    }

    switch (e.key) {
      case '/':
        // Focus search input
        e.preventDefault();
        document.getElementById('usernameInput').focus();
        break;

      case 'd':
      case 'D':
        // Toggle dark mode
        Theme.toggle();
        showToast(
          document.documentElement.getAttribute('data-theme') === 'dark'
            ? 'Dark mode on'
            : 'Light mode on'
        );
        break;

      case 'Enter':
        // If search input has value and is focused, search
        break;
    }
  });
}