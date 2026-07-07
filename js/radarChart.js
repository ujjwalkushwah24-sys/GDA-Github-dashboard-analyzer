// radarChart.js — renders the comparison radar chart

const RadarChart = (() => {

  let _instance = null;

  function cssVar(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
  }

  // Colors for up to 3 users on the same chart
  const USER_COLORS = [
    { border: '#6366f1', bg: '#6366f120' },
    { border: '#06b6d4', bg: '#06b6d420' },
    { border: '#10b981', bg: '#10b98120' },
  ];

  function render(canvasId, comparisonResults) {
    if (_instance) {
      _instance.destroy();
      _instance = null;
    }

    const { successful } = comparisonResults;
    if (!successful.length) return;

    // All users share the same dimension labels
    const labels = Object.keys(successful[0].scores.dimensions);

    const datasets = successful.map((result, i) => ({
      label:           result.username,
      data:            Object.values(result.scores.dimensions),
      borderColor:     USER_COLORS[i].border,
      backgroundColor: USER_COLORS[i].bg,
      borderWidth:     2,
      pointRadius:     4,
      pointHoverRadius: 6,
    }));

    const ctx = document.getElementById(canvasId).getContext('2d');

    _instance = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              color: cssVar('--text-muted'),
              font: { size: 10 },
              backdropColor: 'transparent',
            },
            grid:        { color: cssVar('--border-color') },
            angleLines:  { color: cssVar('--border-color') },
            pointLabels: {
              color: cssVar('--text-primary'),
              font:  { size: 12, weight: '500' }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color:   cssVar('--text-primary'),
              padding: 16,
              usePointStyle: true,
            }
          },
          tooltip: {
            backgroundColor: cssVar('--bg-card'),
            titleColor:      cssVar('--text-primary'),
            bodyColor:       cssVar('--text-secondary'),
            borderColor:     cssVar('--border-color'),
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${Math.round(ctx.raw)}/100`
            }
          }
        }
      }
    });
  }

  return { render };
})();