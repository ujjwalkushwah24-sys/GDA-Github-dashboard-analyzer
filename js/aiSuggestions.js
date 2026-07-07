// aiSuggestions.js — calls Claude API for deep, personalized analysis

const AiSuggestions = (() => {

  async function analyse({ transformed, stats }) {
    const { user } = transformed;

    // Build a structured context string for Claude
    const context = `
GitHub Profile Analysis Request:

Username: ${user.username}
Name: ${user.name}
Bio: ${user.bio || 'MISSING'}
Location: ${user.location || 'MISSING'}
Website: ${user.blog || 'MISSING'}
Account age: ${stats.accountAgeYears} years
Followers: ${user.followers}
Following: ${user.following}

Repository stats:
- Public repos: ${stats.repoCount}
- Total stars: ${stats.totalStars}
- Total forks: ${stats.totalForks}
- Top language: ${stats.topLanguage}
- Languages used: ${stats.languages.map(l => l.name).join(', ')}
- Recent commits (30 days): ${stats.recentCommits}

Top repositories:
${stats.topRepos.map(r =>
  `- ${r.name}: ${r.stars} stars, ${r.forks} forks, ${r.language}, ${r.description ? `"${r.description}"` : 'NO DESCRIPTION'}`
).join('\n')}

Profile completeness:
- Has bio: ${user.hasBio}
- Has location: ${user.hasLocation}
- Has website: ${user.hasBlog}
- Has email: ${user.hasEmail}
    `.trim();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are a senior software engineer and technical recruiter reviewing a GitHub profile. 
Provide exactly 4 specific, actionable improvement suggestions for this developer.
Respond ONLY with a JSON array. No preamble, no markdown, no explanation outside the JSON.
Format:
[
  {
    "priority": "urgent" | "recommended" | "nice-to-have",
    "title": "Short title under 8 words",
    "detail": "1-2 sentences explaining why this matters to recruiters",
    "action": "Specific step the developer should take"
  }
]`,
        messages: [{ role: 'user', content: context }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content.map(b => b.text || '').join('');

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  return { analyse };
})();