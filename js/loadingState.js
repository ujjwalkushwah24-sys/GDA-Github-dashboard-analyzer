// loadingState.js — skeleton screens and loading states

const LoadingState = (() => {

  function _skeletonCard(lines = 2) {
    const lineHTML = Array(lines).fill(0).map((_, i) => `
      <div class="skeleton skeleton-text"
           style="width:${i === 0 ? '60%' : '90%'};margin-bottom:6px">
      </div>
    `).join('');
    return `
      <div class="skeleton-card">
        ${lineHTML}
      </div>
    `;
  }

  function showDashboardSkeleton() {
    const main = document.getElementById('mainContent');

    main.innerHTML = `
      <div class="container">

        <!-- Profile skeleton -->
        <div class="profile-card" style="margin-bottom:24px">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex:1">
            <div class="skeleton skeleton-text" style="width:40%;margin-bottom:8px"></div>
            <div class="skeleton skeleton-text" style="width:25%;margin-bottom:8px"></div>
            <div class="skeleton skeleton-text" style="width:70%"></div>
          </div>
        </div>

        <!-- Stat cards skeleton -->
        <div class="stats-grid" style="margin-bottom:24px">
          ${Array(6).fill(0).map(() => `
            <div class="stat-card">
              <div class="skeleton skeleton-text" style="width:50%;margin:0 auto 8px"></div>
              <div class="skeleton skeleton-text" style="width:70%;margin:0 auto"></div>
            </div>
          `).join('')}
        </div>

        <!-- Charts skeleton -->
        <div class="charts-grid" style="margin-bottom:24px">
          ${Array(4).fill(0).map(() => `
            <div class="chart-card">
              <div class="skeleton skeleton-text" style="width:50%;margin-bottom:12px"></div>
              <div class="skeleton skeleton-chart"></div>
            </div>
          `).join('')}
        </div>

        <!-- Repo cards skeleton -->
        <div class="repos-grid">
          ${Array(6).fill(0).map(() => _skeletonCard(3)).join('')}
        </div>

      </div>
    `;
  }

  function hide() {
    // DomRenderer.render() replaces innerHTML — nothing extra needed
    // This is here for explicit control if needed
  }

  return { showDashboardSkeleton };
})();