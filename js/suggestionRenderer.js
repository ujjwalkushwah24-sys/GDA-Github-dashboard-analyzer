// suggestionRenderer.js — renders both rule-based and AI tips

const SuggestionRenderer = (() => {

  const PRIORITY_CONFIG = {
    urgent:        { emoji: '🔴', label: 'Urgent',        color: 'var(--danger)' },
    recommended:   { emoji: '🟡', label: 'Recommended',   color: 'var(--warning)' },
    'nice-to-have':{ emoji: '🟢', label: 'Nice to have',  color: 'var(--success)' },
  };

  function _tipCard(tip) {
    const cfg = PRIORITY_CONFIG[tip.priority];
    return `
      <div class="tip-card tip-${tip.priority}">
        <div class="tip-header">
          <span class="tip-badge" style="color:${cfg.color}">
            ${cfg.emoji} ${cfg.label}
          </span>
          <span class="tip-title">${tip.title}</span>
        </div>
        <p class="tip-detail">${tip.detail}</p>
        <p class="tip-action">→ ${tip.action}</p>
      </div>
    `;
  }

  function render(containerId, ruleTips, aiTips = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Merge and de-duplicate by title
    const allTips = [...ruleTips];
    if (aiTips) {
      aiTips.forEach(aiTip => {
        const isDuplicate = allTips.some(
          t => t.title.toLowerCase() === aiTip.title.toLowerCase()
        );
        if (!isDuplicate) allTips.push(aiTip);
      });
    }

    // Sort by priority
    const order = { urgent: 0, recommended: 1, 'nice-to-have': 2 };
    allTips.sort((a, b) => order[a.priority] - order[b.priority]);

    if (!allTips.length) {
      container.innerHTML = `
        <div class="tip-card" style="text-align:center;color:var(--success)">
          ✅ Your profile looks strong. No major issues found.
        </div>
      `;
      return;
    }

    container.innerHTML = allTips.map(_tipCard).join('');
  }

  // Renders a loading skeleton while AI analysis runs
  function renderLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
      <div class="tip-card" style="opacity:0.5">
        <div class="tip-header">
          <span class="tip-badge">⏳ AI analysis running…</span>
        </div>
        <p class="tip-detail">Instant tips are shown above. Deep AI analysis is loading.</p>
      </div>
    `;
  }

  return { render, renderLoading };
})();