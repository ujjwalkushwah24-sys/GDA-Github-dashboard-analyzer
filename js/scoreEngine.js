// scoreEngine.js — scores a GitHub profile across 6 dimensions

const ScoreEngine = (() => {

  // These weights must add up to 1.0
  // We weight activity and stars highest — they reflect
  // consistent work and community recognition
  const WEIGHTS = {
    stars:      0.25,
    activity:   0.25,
    forks:      0.15,
    diversity:  0.15,
    repos:      0.10,
    completeness: 0.10,
  };

  // Clamp a value between 0 and 100
  function clamp(val) {
    return Math.min(100, Math.max(0, Math.round(val)));
  }

  // Score one dimension using a logarithmic scale
  // Why log? Because the difference between 0 and 10 stars matters more
  // than the difference between 990 and 1000 stars.
  // Math.log1p(x) = Math.log(1 + x) — handles 0 safely (log(0) = -Infinity)
  function logScore(value, max) {
    return clamp((Math.log1p(value) / Math.log1p(max)) * 100);
  }

  function score(transformedData, stats) {
    const { user } = transformedData;

    // ── 1. STARS (0–100) ──
    // Benchmark: 1000 stars = excellent for most developers
    const starsScore = logScore(stats.totalStars, 1000);

    // ── 2. ACTIVITY (0–100) ──
    // Based on recent commits (last 30 days)
    // Benchmark: 30 commits/month = very active
    const activityScore = logScore(stats.recentCommits, 30);

    // ── 3. FORKS (0–100) ──
    const forksScore = logScore(stats.totalForks, 500);

    // ── 4. LANGUAGE DIVERSITY (0–100) ──
    // More languages = broader skill set
    // Benchmark: 8+ languages = highly diverse
    const diversityScore = clamp((stats.languageCount / 8) * 100);

    // ── 5. REPO COUNT (0–100) ──
    // Benchmark: 20+ public repos = strong portfolio
    const reposScore = clamp((stats.repoCount / 20) * 100);

    // ── 6. PROFILE COMPLETENESS (0–100) ──
    // Each completed field = 20 points
    const fields = [
      user.hasBio,
      user.hasLocation,
      user.hasBlog,
      user.hasEmail,
      Boolean(user.twitterUser),
    ];
    const completenessScore = clamp(
      (fields.filter(Boolean).length / fields.length) * 100
    );

    // ── WEIGHTED TOTAL ──
    const total = clamp(
      starsScore      * WEIGHTS.stars +
      activityScore   * WEIGHTS.activity +
      forksScore      * WEIGHTS.forks +
      diversityScore  * WEIGHTS.diversity +
      reposScore      * WEIGHTS.repos +
      completenessScore * WEIGHTS.completeness
    );

    return {
      total,
      dimensions: {
        Stars:       starsScore,
        Activity:    activityScore,
        Forks:       forksScore,
        Diversity:   diversityScore,
        Repos:       reposScore,
        Completeness: completenessScore,
      }
    };
  }

  return { score };
})();