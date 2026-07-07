// ruleEngine.js — instant rule-based profile tips, no API needed

const RuleEngine = (() => {

  // Each rule: a condition function + tip object
  const RULES = [
    {
      check: ({ user }) => !user.hasBio,
      tip: {
        priority: 'urgent',
        title:    'Add a profile bio',
        detail:   'Your bio is the first thing recruiters read. Without it, your profile looks abandoned.',
        action:   'Go to github.com/settings/profile and fill in the Bio field.',
      }
    },
    {
      check: ({ user }) => !user.hasBlog,
      tip: {
        priority: 'recommended',
        title:    'Add a portfolio or LinkedIn URL',
        detail:   'The website field lets recruiters find your work immediately.',
        action:   'Add your portfolio, LinkedIn, or any professional link to your GitHub profile.',
      }
    },
    {
      check: ({ stats }) => stats.repoCount < 6,
      tip: {
        priority: 'urgent',
        title:    'You need more public repositories',
        detail:   `Only ${0} public repos is too few to demonstrate consistent work.`,
        action:   'Push at least 5 projects — they do not need to be big, just complete and documented.',
      }
    },
    {
      check: ({ stats }) => stats.recentCommits < 5,
      tip: {
        priority: 'urgent',
        title:    'No recent activity visible',
        detail:   'Less than 5 commits in the last 30 days signals inactivity to recruiters.',
        action:   'Commit something every week — even documentation improvements count.',
      }
    },
    {
      check: ({ stats }) => {
        const noDesc = stats.recentRepos.filter(r => !r.description).length;
        return noDesc > 2;
      },
      tip: {
        priority: 'recommended',
        title:    'Several repos are missing descriptions',
        detail:   'A recruiter browsing your repos has no idea what they do without descriptions.',
        action:   'Add a one-line description to every repo you want recruiters to see.',
      }
    },
    {
      check: ({ stats }) => stats.topRepos.every(r => !r.topics || r.topics.length === 0),
      tip: {
        priority: 'recommended',
        title:    'Add topics/tags to your repositories',
        detail:   'GitHub topics make your repos discoverable and signal your tech stack at a glance.',
        action:   'Add 3–5 topics to each major repo (e.g. "react", "portfolio", "open-source").',
      }
    },
    {
      check: ({ stats }) => stats.languageCount < 2,
      tip: {
        priority: 'nice-to-have',
        title:    'Broaden your visible language diversity',
        detail:   'Only one language across all repos suggests limited versatility.',
        action:   'Build one small project in a second language — even a simple CLI tool counts.',
      }
    },
    {
      check: ({ user }) => !user.hasLocation,
      tip: {
        priority: 'nice-to-have',
        title:    'Add your location',
        detail:   'Recruiters often filter by region. Not having a location makes you invisible to local searches.',
        action:   'Add your city or country to your GitHub profile.',
      }
    },
  ];

  function analyse({ transformed, stats }) {
    const context = { user: transformed.user, stats };

    const tips = RULES
      .filter(rule => rule.check(context))
      .map(rule => {
        // Fix the dynamic detail that referenced 0 above
        const tip = { ...rule.tip };
        if (tip.title === 'You need more public repositories') {
          tip.detail = `Only ${stats.repoCount} public repos is too few to demonstrate consistent work.`;
        }
        return tip;
      });

    // Sort: urgent first, then recommended, then nice-to-have
    const order = { urgent: 0, recommended: 1, 'nice-to-have': 2 };
    tips.sort((a, b) => order[a.priority] - order[b.priority]);

    return tips;
  }

  return { analyse };
})();