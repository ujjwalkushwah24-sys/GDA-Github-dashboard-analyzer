// stats.js — computes derived metrics from transformed data

const Stats = (() => {

  function compute(transformedData) {
    const { user, repos, events } = transformedData;

    // ── REPO METRICS ──
    const totalStars   = repos.reduce((sum, r) => sum + r.stars, 0);
    const totalForks   = repos.reduce((sum, r) => sum + r.forks, 0);
    const totalWatchers = repos.reduce((sum, r) => sum + r.watchers, 0);

    // Language distribution — count repos per language
    const languageMap = {};
    repos.forEach(repo => {
      if (repo.language && repo.language !== 'Unknown') {
        languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
      }
    });

    // Sort languages by usage count
    const languages = Object.entries(languageMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const topLanguage = languages[0]?.name || 'N/A';

    // Most starred repos (top 5)
    const topRepos = [...repos]
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 5);

    // Most recently active repos (top 6 for the card grid)
    const recentRepos = [...repos]
      .sort((a, b) => b.pushedAt - a.pushedAt)
      .slice(0, 6);

    // ── ACTIVITY METRICS ──
    const pushEvents   = events.filter(e => e.type === 'PushEvent');
    const totalCommits = pushEvents.reduce((sum, e) => sum + e.commitCount, 0);

    // Activity over the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents  = events.filter(e => e.createdAt > thirtyDaysAgo);
    const recentCommits = recentEvents
      .filter(e => e.type === 'PushEvent')
      .reduce((sum, e) => sum + e.commitCount, 0);

    // Commit frequency by day of week (0=Sun, 6=Sat)
    const commitsByDay = Array(7).fill(0);
    pushEvents.forEach(event => {
      const day = event.createdAt.getDay();
      commitsByDay[day] += event.commitCount;
    });

    // ── ACCOUNT METRICS ──
    const accountAgeMs   = Date.now() - user.createdAt.getTime();
    const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));
    const accountAgeYears = (accountAgeDays / 365).toFixed(1);

    return {
      // Totals
      totalStars,
      totalForks,
      totalWatchers,
      totalCommits,
      repoCount: repos.length,

      // Languages
      languages,
      topLanguage,
      languageCount: languages.length,

      // Repos
      topRepos,
      recentRepos,

      // Activity
      recentCommits,
      recentEvents: recentEvents.length,
      commitsByDay,

      // Account
      accountAgeDays,
      accountAgeYears,
      followerRatio: user.following > 0
        ? (user.followers / user.following).toFixed(2)
        : user.followers,
    };
  }

  return { compute };
})();