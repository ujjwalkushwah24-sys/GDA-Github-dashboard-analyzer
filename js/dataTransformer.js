// dataTransformer.js — converts raw GitHub API responses into clean objects

const DataTransformer = (() => {

  function transformUser(rawUser) {
    return {
      username:    rawUser.login,
      name:        rawUser.name || rawUser.login,
      avatar:      rawUser.avatar_url,
      bio:         rawUser.bio || '',
      location:    rawUser.location || '',
      company:     rawUser.company || '',
      blog:        rawUser.blog || '',
      email:       rawUser.email || '',
      twitterUser: rawUser.twitter_username || '',
      publicRepos: rawUser.public_repos,
      followers:   rawUser.followers,
      following:   rawUser.following,
      createdAt:   new Date(rawUser.created_at),
      profileUrl:  rawUser.html_url,
      // Profile completeness flags — used by the suggestion engine later
      hasBio:      Boolean(rawUser.bio),
      hasLocation: Boolean(rawUser.location),
      hasBlog:     Boolean(rawUser.blog),
      hasEmail:    Boolean(rawUser.email),
    };
  }

  function transformRepo(rawRepo) {
    return {
      id:          rawRepo.id,
      name:        rawRepo.name,
      fullName:    rawRepo.full_name,
      description: rawRepo.description || '',
      url:         rawRepo.html_url,
      language:    rawRepo.language || 'Unknown',
      stars:       rawRepo.stargazers_count,
      forks:       rawRepo.forks_count,
      watchers:    rawRepo.watchers_count,
      openIssues:  rawRepo.open_issues_count,
      isFork:      rawRepo.fork,
      isArchived:  rawRepo.archived,
      createdAt:   new Date(rawRepo.created_at),
      updatedAt:   new Date(rawRepo.updated_at),
      pushedAt:    new Date(rawRepo.pushed_at),
      topics:      rawRepo.topics || [],
      license:     rawRepo.license?.name || null,
      size:        rawRepo.size, // in KB
    };
  }

  function transformRepos(rawRepos) {
    return rawRepos
      .map(transformRepo)
      .filter(repo => !repo.isFork); // exclude forks by default — own work only
  }

  function transformEvent(rawEvent) {
    return {
      type:      rawEvent.type,        // 'PushEvent', 'PullRequestEvent', etc.
      repoName:  rawEvent.repo?.name,
      createdAt: new Date(rawEvent.created_at),
      // For PushEvents, count the commits
      commitCount: rawEvent.type === 'PushEvent'
        ? (rawEvent.payload?.commits?.length || 0)
        : 0,
    };
  }

  function transformEvents(rawEvents) {
    return rawEvents.map(transformEvent);
  }

  // Transform a full user data bundle at once
  function transformAll({ user, repos, events }) {
    return {
      user:   transformUser(user),
      repos:  transformRepos(repos),
      events: transformEvents(events),
    };
  }

  return { transformUser, transformRepo, transformRepos, transformEvent, transformEvents, transformAll };
})();