// domRenderer.js — builds and injects all dashboard HTML

// Prevents XSS — escapes HTML special characters in user data
function _sanitize(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

const DomRenderer = (() => {

  // Track Chart.js instances so we can destroy them before re-rendering
  // (Chart.js throws an error if you create a chart on a canvas that
  //  already has one)
  const _charts = {};

  function _destroyCharts() {
    Object.values(_charts).forEach(chart => chart.destroy());
    Object.keys(_charts).forEach(key => delete _charts[key]);
  }

  // ── PROFILE SECTION ──
  function _renderProfile(user) {
    return `
    <div class="profile-card">
      <img
        class="profile-avatar"
        src="${user.avatar}"
        alt="${_sanitize(user.name)}'s GitHub avatar"
        width="80" height="80" />

      <div class="profile-info">
        <h2 class="profile-name">${_sanitize(user.name)}</h2>

        <p class="profile-username">@${user.username}</p>

        ${
          user.bio
            ? `<p class="profile-bio">${_sanitize(user.bio)}</p>`
            : ''
        }

        <div class="profile-meta">
          ${
            user.location
              ? `<span>📍 ${_sanitize(user.location)}</span>`
              : ''
          }

          ${
            user.blog
              ? `<span>🔗 <a href="${user.blog}" target="_blank" rel="noopener">Website</a></span>`
              : ''
          }

          <span>👥 ${user.followers} followers · ${user.following} following</span>

          <span>🗓 Joined ${user.createdAt.getFullYear()}</span>
        </div>
      </div>
    </div>
     `;
  }

  // ── HERO STATS ──
  function _renderStats(user, stats) {
    const items = [
      { value: stats.repoCount,    label: 'Repositories' },
      { value: stats.totalStars,   label: 'Total Stars' },
      { value: stats.totalForks,   label: 'Total Forks' },
      { value: stats.totalCommits, label: 'Commits (public)' },
      { value: user.followers,     label: 'Followers' },
      { value: stats.languageCount,label: 'Languages' },
    ];

    const cards = items.map(item => `
      <div class="stat-card">
        <div class="stat-value">${item.value.toLocaleString()}</div>
        <div class="stat-label">${item.label}</div>
      </div>
    `).join('');

    return `<div class="stats-grid">${cards}</div>`;
  }

  // ── REPO CARDS ──
  function _renderRepos(repos) {
    const cards = repos.map(repo => `
      <a class="repo-card" href="${repo.url}" target="_blank" rel="noopener noreferrer">
        <div class="repo-name">${_sanitize(repo.name)}</div>
        ${repo.description
          ? `<div class="repo-desc">${_sanitize(repo.description)}</div>`
          : '<div class="repo-desc" style="color:var(--text-muted);font-style:italic">No description</div>'
        }
        <div class="repo-meta">
          ${repo.language !== 'Unknown'
            ? `<span><span class="lang-dot"></span>${repo.language}</span>`
            : ''}
          <span>⭐ ${repo.stars}</span>
          <span>🍴 ${repo.forks}</span>
          ${repo.isArchived ? '<span>📦 Archived</span>' : ''}
        </div>
      </a>
    `).join('');

    return `
      <div class="section">
        <h3 class="section-title">Recent repositories</h3>
        <div class="repos-grid">${cards}</div>
      </div>
    `;
  }

  // ── CHARTS SECTION ──
  function _renderChartSection() {
    return `
      <div class="section">
        <h3 class="section-title">Analytics</h3>
        <div class="charts-grid">

          <div class="chart-card">
            <div class="chart-title">Stars per repository</div>
            <div class="chart-wrapper">
              <canvas id="chartStars"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-title">Language distribution</div>
            <div class="chart-wrapper">
              <canvas id="chartLanguages"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-title">Commit activity by day</div>
            <div class="chart-wrapper">
              <canvas id="chartActivity"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-title">Top repositories by forks</div>
            <div class="chart-wrapper">
              <canvas id="chartForks"></canvas>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // ── INITIALISE CHARTS (called AFTER HTML is injected) ──
  function _initCharts(stats) {
    // Stars bar chart
    _charts.stars = new Chart(
      document.getElementById('chartStars').getContext('2d'),
      { type: 'bar',
        data: ChartHelpers.topReposByStars(stats),
        options: ChartHelpers.baseOptions() }
    );

    // Language doughnut
    _charts.langs = new Chart(
      document.getElementById('chartLanguages').getContext('2d'),
      { type: 'doughnut',
        data: ChartHelpers.languageDistribution(stats),
        options: ChartHelpers.doughnutOptions() }
    );

    // Activity line
    _charts.activity = new Chart(
      document.getElementById('chartActivity').getContext('2d'),
      { type: 'line',
        data: ChartHelpers.activityTimeline(stats),
        options: ChartHelpers.baseOptions() }
    );

    // Forks horizontal bar
    _charts.forks = new Chart(
      document.getElementById('chartForks').getContext('2d'),
      { type: 'bar',
        data: ChartHelpers.reposByForks(stats),
        options: ChartHelpers.baseOptions({
          indexAxis: 'y', // this one line makes it horizontal
          scales: {
            x: { grid: { color: 'transparent' },
                 ticks: { color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--text-muted') } },
            y: { grid: { color: 'transparent' },
                 ticks: { color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--text-muted') } }
          }
        }) }
    );
  }

  function _renderCompareColumn(result) {
  const { transformed, stats, scores } = result;
  const { user } = transformed;

  const rank = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return `
    <div class="compare-col">
      <div class="compare-header">
        <img src="${user.avatar}" alt="${user.name}" class="compare-avatar" />
        <div>
          <div class="compare-name">${user.name}</div>
          <div class="compare-username">@${user.username}</div>
        </div>
        <div class="compare-score">${scores.total}<span>/100</span></div>
      </div>

      <div class="compare-dims">
        ${Object.entries(scores.dimensions).map(([dim, val]) => `
          <div class="dim-row">
            <span class="dim-label">${dim}</span>
            <div class="dim-bar-wrap">
              <div class="dim-bar" style="width:${val}%"></div>
            </div>
            <span class="dim-val">${Math.round(val)}</span>
          </div>
        `).join('')}
      </div>

      <div class="compare-stats">
        <div class="cs-item">
          <span class="cs-val">${stats.totalStars.toLocaleString()}</span>
          <span class="cs-lbl">Stars</span>
        </div>
        <div class="cs-item">
          <span class="cs-val">${stats.repoCount}</span>
          <span class="cs-lbl">Repos</span>
        </div>
        <div class="cs-item">
          <span class="cs-val">${stats.recentCommits}</span>
          <span class="cs-lbl">Recent commits</span>
        </div>
        <div class="cs-item">
          <span class="cs-val">${stats.topLanguage}</span>
          <span class="cs-lbl">Top language</span>
        </div>
      </div>
    </div>
  `;
}

function renderComparison(comparisonResults) {
  const { successful, failed } = comparisonResults;
  const main = document.getElementById('mainContent');

  const columns = successful.map(_renderCompareColumn).join('');

  const failedMsg = failed.length
    ? `<p style="color:var(--danger);text-align:center;margin-bottom:16px">
         Could not load: ${failed.map(f => f.username).join(', ')}
       </p>`
    : '';

  main.innerHTML = `
    <div class="container">
      <div class="section">
        <h3 class="section-title">Profile comparison</h3>
        ${failedMsg}
        <div class="compare-grid"
             style="grid-template-columns:repeat(${successful.length},1fr)">
          ${columns}
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Skill radar</h3>
        <div class="chart-card" style="max-width:500px;margin:0 auto">
          <div class="chart-wrapper" style="height:320px">
            <canvas id="radarCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  RadarChart.render('radarCanvas', comparisonResults);
}

  // ── MAIN RENDER FUNCTION ──
  function render(transformedData, stats) {
    _destroyCharts(); // always clean up before re-rendering

    const { user, repos } = transformedData;
    const main = document.getElementById('mainContent');

    // Build all HTML at once and inject — one DOM operation
     main.innerHTML = `
    <div class="container">
      ${_renderProfile(user)}
      ${_renderStats(user, stats)}
      ${_renderChartSection()}
      ${_renderRepos(stats.recentRepos)}

      <!-- ── ADD THIS BLOCK (Phase 5 suggestions section) ── -->
      <div class="section">
        <h3 class="section-title">Profile improvement tips</h3>
        <div class="tips-grid" id="suggestionsContainer"></div>
      </div>

    </div>
  `;

    // Charts must init AFTER innerHTML is set
    // because canvas elements need to exist in the DOM first
    _initCharts(stats);

    // Hide empty state
    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'none';
  }

  function renderError(message) {
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="container">
        <div style="text-align:center;padding:60px 0;color:var(--danger)">
          <p style="font-size:1.1rem;font-weight:600">Something went wrong</p>
          <p style="color:var(--text-muted);margin-top:8px">${message}</p>
        </div>
      </div>
    `;
  }

  return { render, renderError };
})();