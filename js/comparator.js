// comparator.js — orchestrates multi-user fetching, scoring, and ranking

const Comparator = (() => {

  // Fetch, transform, and score up to 3 users
  // Uses Promise.allSettled — if one user fails, others still load
  async function compare(usernames) {
    const results = await Promise.allSettled(
      usernames.map(async username => {
        const raw         = await API.getAllUserData(username);
        const transformed = DataTransformer.transformAll(raw);
        const stats       = Stats.compute(transformed);
        const scores      = ScoreEngine.score(transformed, stats);
        return { username, transformed, stats, scores };
      })
    );

    // Separate successes from failures
    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    const failed = results
      .filter(r => r.status === 'rejected')
      .map((r, i) => ({ username: usernames[i], error: r.reason.message }));

    // Rank by total score descending
    successful.sort((a, b) => b.scores.total - a.scores.total);

    return { successful, failed };
  }

  return { compare };
})();