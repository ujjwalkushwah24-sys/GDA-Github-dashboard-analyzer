// chartHelpers.js — formats stats into Chart.js dataset objects

const ChartHelpers = (() => {

  // Reads CSS variables so charts respect the current theme
  function cssVar(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
  }

  // Bar chart — top repos by stars
  function topReposByStars(stats) {
    const repos = stats.topRepos.slice(0, 6);
    return {
      labels: repos.map(r => r.name),
      datasets: [{
        label: 'Stars',
        data: repos.map(r => r.stars),
        backgroundColor: cssVar('--chart-1'),
        borderRadius: 6,
        borderSkipped: false,
      }]
    };
  }

  // Doughnut chart — language distribution
  function languageDistribution(stats) {
    const langs = stats.languages.slice(0, 6); // top 6 languages
    const colors = ['--chart-1','--chart-2','--chart-3',
                    '--chart-4','--chart-5','--chart-6']
                    .map(v => cssVar(v));
    return {
      labels: langs.map(l => l.name),
      datasets: [{
        data: langs.map(l => l.count),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: cssVar('--bg-primary') ||
                     getComputedStyle(document.body).backgroundColor,
      }]
    };
  }

  // Line chart — activity over last 30 days grouped by week
  function activityTimeline(stats) {
    const { events } = stats;

    // Group push events by date (last 30 days)
    const days = {};
    const now = Date.now();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }

    // We don't have raw events in stats — we use commitsByDay as a proxy
    // Full event timeline needs raw events; we'll use commitsByDay for now
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    return {
      labels: dayNames,
      datasets: [{
        label: 'Commits by day of week',
        data: stats.commitsByDay,
        borderColor: cssVar('--chart-2'),
        backgroundColor: cssVar('--chart-2') + '22', // 22 = ~13% opacity in hex
        fill: true,
        tension: 0.4,   // makes the line curved
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    };
  }

  // Horizontal bar — repos by forks
  function reposByForks(stats) {
    const repos = [...stats.topRepos]
      .sort((a, b) => b.forks - a.forks)
      .slice(0, 5);
    return {
      labels: repos.map(r => r.name),
      datasets: [{
        label: 'Forks',
        data: repos.map(r => r.forks),
        backgroundColor: cssVar('--chart-3'),
        borderRadius: 6,
        borderSkipped: false,
      }]
    };
  }

  // Shared options used by all charts
  function baseOptions(overrides = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: 'easeInOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: cssVar('--bg-card'),
          titleColor: cssVar('--text-primary'),
          bodyColor: cssVar('--text-secondary'),
          borderColor: cssVar('--border-color'),
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          grid: { color: cssVar('--border-subtle') },
          ticks: { color: cssVar('--text-muted'), font: { size: 11 } }
        },
        y: {
          grid: { color: cssVar('--border-subtle') },
          ticks: { color: cssVar('--text-muted'), font: { size: 11 } }
        }
      },
      ...overrides  // merge any chart-specific overrides
    };
  }

  // Doughnut has no scales — separate options
  function doughnutOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            color: cssVar('--text-primary'),
            padding: 12,
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: cssVar('--bg-card'),
          titleColor: cssVar('--text-primary'),
          bodyColor: cssVar('--text-secondary'),
          borderColor: cssVar('--border-color'),
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
        }
      }
    };
  }

  return {
    topReposByStars,
    languageDistribution,
    activityTimeline,
    reposByForks,
    baseOptions,
    doughnutOptions,
  };
})();